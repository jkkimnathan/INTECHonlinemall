-- ============================================================
-- 주문 무결성 마이그레이션 v2
-- Supabase Dashboard → SQL Editor에서 1회 실행
-- (security_migration.sql 실행 이후에 실행할 것)
--
-- 포함 내용:
--   1. create_order RPC — 금액/재고/포인트를 전부 서버에서 재계산·검증
--      (기존에 대시보드에서 수동 작성돼 있던 함수를 저장소로 편입·표준화)
--   2. orders 직접 INSERT 정책 제거 — 주문 생성은 RPC 전용
--      (클라이언트가 total/discount/status를 위조해 직접 INSERT하는 경로 차단)
--   3. qna_unlock 브루트포스 완화 (실패 시 지연)
--   4. reviews 구매자 검증 — 취소되지 않은 주문에 해당 상품이 있어야 작성 가능
-- ============================================================

-- ── 0. orders 테이블 (없으면 생성 — 기존 환경에서는 no-op) ──
create table if not exists public.orders (
  id text primary key,
  user_id uuid not null,
  items jsonb not null default '[]'::jsonb,
  shipping jsonb not null default '{}'::jsonb,
  payment_method text not null default 'card',
  subtotal integer not null default 0,
  shipping_fee integer not null default 0,
  discount integer not null default 0,
  total integer not null default 0,
  status text not null default '결제완료',
  tracking_number text,
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;

-- ── 1. 주문 생성 RPC ──
-- 클라이언트는 상품 id/수량/배송지/결제수단/사용 포인트만 보낸다.
-- 단가·합계·배송비·재고·포인트는 전부 서버에서 재계산/검증한다.
create or replace function public.create_order(
  p_items jsonb,            -- [{ "product": { "id": "..." }, "quantity": n }, ...]
  p_shipping jsonb,         -- { name, phone, zipcode, address, addressDetail, memo }
  p_payment_method text default 'card',
  p_use_points integer default 0
)
returns jsonb
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := auth.uid();
  v_item jsonb;
  v_product_id text;
  v_qty integer;
  v_product public.products%rowtype;
  v_unit_price integer;
  v_deal record;
  v_subtotal integer := 0;
  v_shipping_fee integer;
  v_discount integer := 0;
  v_points integer;
  v_snapshot jsonb := '[]'::jsonb;
  v_order public.orders%rowtype;
  v_order_id text;
begin
  -- 인증 필수
  if v_uid is null then
    raise exception '로그인이 필요합니다.';
  end if;

  -- 항목 검증
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception '주문할 상품이 없습니다.';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception '한 번에 주문 가능한 상품 종류는 50개 이하입니다.';
  end if;

  -- 배송지 필수값
  if length(trim(coalesce(p_shipping->>'name', ''))) = 0
     or length(trim(coalesce(p_shipping->>'phone', ''))) = 0
     or length(trim(coalesce(p_shipping->>'address', ''))) = 0 then
    raise exception '배송 정보가 누락되었습니다.';
  end if;

  -- 상품별: 행 잠금 → 재고 확인 → 서버 가격 결정 → 재고 차감 → 스냅샷 구성
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_product_id := v_item->'product'->>'id';
    v_qty := coalesce((v_item->>'quantity')::integer, 0);

    if v_product_id is null then
      raise exception '상품 정보가 올바르지 않습니다.';
    end if;
    if v_qty < 1 or v_qty > 999 then
      raise exception '상품 수량이 유효하지 않습니다.';
    end if;

    -- 동시 주문 경쟁을 막기 위해 행 잠금
    select * into v_product
    from public.products
    where id = v_product_id
    for update;

    if not found then
      raise exception '존재하지 않는 상품입니다: %', v_product_id;
    end if;
    if coalesce(v_product.stock, 0) < v_qty then
      raise exception '재고가 부족합니다: % (남은 수량 %개)', v_product.name, coalesce(v_product.stock, 0);
    end if;

    -- 서버 기준 단가: 세일가 우선
    v_unit_price := coalesce(v_product.sale_price, v_product.price);

    -- 진행 중 타임딜이 있고 딜 수량이 남아 있으면 딜가 적용 + 판매수 반영
    select tdi.id, tdi.deal_price, tdi.deal_quantity, tdi.sold_count
      into v_deal
    from public.time_deal_items tdi
    join public.time_deals td on td.id = tdi.deal_id
    where tdi.product_id = v_product_id
      and td.is_active = true
      and td.end_time >= now()
      and tdi.deal_price < v_unit_price
      and (coalesce(tdi.deal_quantity, 0) = 0
           or coalesce(tdi.sold_count, 0) + v_qty <= tdi.deal_quantity)
    order by tdi.deal_price asc
    limit 1
    for update;

    if found then
      v_unit_price := v_deal.deal_price;
      update public.time_deal_items
      set sold_count = coalesce(sold_count, 0) + v_qty
      where id = v_deal.id;
    end if;

    if v_unit_price is null or v_unit_price < 0 then
      raise exception '상품 가격 정보가 올바르지 않습니다: %', v_product.name;
    end if;

    -- 재고 차감
    update public.products
    set stock = stock - v_qty
    where id = v_product_id;

    v_subtotal := v_subtotal + v_unit_price * v_qty;

    -- 프론트 렌더링과 호환되는 camelCase 스냅샷 (서버 검증값만 사용)
    v_snapshot := v_snapshot || jsonb_build_array(jsonb_build_object(
      'product', jsonb_build_object(
        'id', v_product.id,
        'name', v_product.name,
        'slug', v_product.slug,
        'brand', v_product.brand,
        'category', v_product.category,
        'condition', v_product.condition,
        'price', v_product.price,
        'salePrice', case when v_unit_price < v_product.price then v_unit_price else null end,
        'images', coalesce(to_jsonb(v_product.images), '[]'::jsonb),
        'stock', v_product.stock - v_qty
      ),
      'quantity', v_qty
    ));
  end loop;

  -- 배송비: 5만원 이상 무료 (프론트 표시 로직과 동일)
  v_shipping_fee := case when v_subtotal >= 50000 then 0 else 3000 end;

  -- 포인트: 보유량/상품금액 한도 내에서만 차감 (행 잠금으로 동시 사용 방지)
  v_points := greatest(0, coalesce(p_use_points, 0));
  if v_points > 0 then
    declare
      v_available integer := 0;
    begin
      select coalesce(points, 0) into v_available
      from public.profiles
      where id = v_uid
      for update;

      v_discount := least(v_points, coalesce(v_available, 0), v_subtotal);
      if v_discount > 0 then
        update public.profiles
        set points = points - v_discount
        where id = v_uid;
      end if;
    end;
  end if;

  -- 주문 저장
  v_order_id := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-'
                || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  insert into public.orders
    (id, user_id, items, shipping, payment_method,
     subtotal, shipping_fee, discount, total, status)
  values
    (v_order_id, v_uid, v_snapshot, p_shipping, coalesce(p_payment_method, 'card'),
     v_subtotal, v_shipping_fee, v_discount,
     v_subtotal + v_shipping_fee - v_discount, '결제완료')
  returning * into v_order;

  return to_jsonb(v_order);
end $$;

grant execute on function public.create_order(jsonb, jsonb, text, integer) to authenticated;

-- ── 2. orders 직접 INSERT 경로 차단 — 주문 생성은 create_order RPC 전용 ──
-- (qna_create와 동일한 패턴: SECURITY DEFINER RPC가 RLS를 우회하므로 INSERT 정책 불필요)
drop policy if exists orders_insert_own on public.orders;

-- 조회/관리 정책은 security_migration.sql과 동일하게 보장 (미적용 환경 대비 재생성)
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders for select
  using (user_id::text = auth.uid()::text or public.is_admin());
drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders for update
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists orders_admin_delete on public.orders;
create policy orders_admin_delete on public.orders for delete
  using (public.is_admin());

-- ── 3. qna_unlock 브루트포스 완화: 실패 시 0.5초 지연 ──
-- (stable → volatile 전환: pg_sleep 사용을 위해)
create or replace function public.qna_unlock(p_id text, p_password text)
returns jsonb
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  v_row public.qna%rowtype;
begin
  select * into v_row from public.qna where id::text = p_id;
  if not found then
    perform pg_sleep(0.5);
    return null;
  end if;
  if coalesce(v_row.is_secret, false) = false then
    return jsonb_build_object('content', v_row.content, 'answer_content', v_row.answer_content);
  end if;
  if v_row.password is not null
     and v_row.password = extensions.crypt(p_password, v_row.password) then
    return jsonb_build_object('content', v_row.content, 'answer_content', v_row.answer_content);
  end if;
  -- 실패: 지연 후 반환 (무제한 고속 대입 방지)
  perform pg_sleep(0.5);
  return null;
end $$;

grant execute on function public.qna_unlock(text, text) to anon, authenticated;

-- ── 4. reviews: 실제 구매자(취소 제외 주문 보유)만 작성 가능 ──
drop policy if exists reviews_insert_own on public.reviews;
drop policy if exists reviews_insert_verified on public.reviews;
create policy reviews_insert_verified on public.reviews for insert
  with check (
    auth.uid() is not null
    and user_id::text = auth.uid()::text
    and exists (
      select 1 from public.orders o
      where o.user_id::text = auth.uid()::text
        and o.status <> '취소'
        and o.items @> jsonb_build_array(
              jsonb_build_object('product', jsonb_build_object('id', reviews.product_id::text)))
    )
  );
