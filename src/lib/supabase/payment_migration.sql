-- ============================================================
-- 결제 마이그레이션 (토스페이먼츠 연동 + 주문 서버 재설계)
-- Supabase Dashboard → SQL Editor에서 1회 실행
-- 실행 직후 새 코드를 배포할 것 (주문 생성이 서버 API로 이동함)
-- 선행 조건: security_migration.sql이 먼저 실행되어 있어야 함
-- ============================================================

-- ── 1. orders 테이블 확장 ──
alter table public.orders add column if not exists payment_key text;
alter table public.orders add column if not exists used_points integer not null default 0;

-- 주문 상태에 '결제대기' 추가 (허용 값 제약)
do $$ begin
  alter table public.orders drop constraint if exists orders_status_check;
  alter table public.orders add constraint orders_status_check
    check (status in ('결제대기','결제완료','배송준비','배송중','배송완료','취소','교환/반품'));
exception when others then null; end $$;

-- 금액/수량 기본 제약
do $$ begin
  alter table public.orders add constraint orders_total_nonneg check (total >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.orders add constraint orders_used_points_nonneg check (used_points >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.products add constraint products_stock_nonneg check (stock >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.products add constraint products_price_nonneg check (price >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.profiles add constraint profiles_points_nonneg check (points >= 0);
exception when duplicate_object then null; end $$;

-- ── 2. 주문 생성은 서버 전용으로 (브라우저 직접 INSERT 금지) ──
-- 서버 API가 service_role 키로 생성하므로 클라이언트 INSERT 정책을 제거한다.
drop policy if exists orders_insert_own on public.orders;

-- ── 3. profiles 민감 컬럼 보호 ──
-- 사용자는 자기 행의 name/phone/email만 수정 가능. points/grade/is_admin은 서버 전용.
revoke update on public.profiles from authenticated;
revoke update on public.profiles from anon;
grant update (name, phone, email) on public.profiles to authenticated;

-- ── 4. 결제 확정 RPC (하나의 트랜잭션으로 처리) ──
-- 토스 승인 성공 직후 서버(service_role)만 호출.
-- 주문을 결제완료로 바꾸고, 포인트와 재고를 함께 차감한다. 중간에 실패하면 전부 되돌아간다.
create or replace function public.finalize_order_payment(
  p_order_id text,
  p_payment_key text,
  p_payment_method text default null
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_points integer;
  v_item jsonb;
  v_product_id text;
  v_qty integer;
begin
  -- 주문 행 잠금 (동시 승인 요청 방지)
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'ORDER_NOT_FOUND');
  end if;

  -- 이미 같은 결제로 확정된 주문이면 성공으로 간주 (중복 호출 안전)
  if v_order.status = '결제완료' and v_order.payment_key = p_payment_key then
    return jsonb_build_object('ok', true, 'code', 'ALREADY_DONE');
  end if;
  if v_order.status <> '결제대기' then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATUS');
  end if;

  -- 포인트 차감 (잔액 검증 포함)
  if v_order.used_points > 0 then
    select points into v_points from public.profiles
      where id::text = v_order.user_id::text for update;
    if v_points is null or v_points < v_order.used_points then
      return jsonb_build_object('ok', false, 'code', 'NOT_ENOUGH_POINTS');
    end if;
    update public.profiles
      set points = points - v_order.used_points
      where id::text = v_order.user_id::text;
  end if;

  -- 재고 차감 (부족하면 전체 롤백)
  for v_item in select * from jsonb_array_elements(v_order.items) loop
    v_product_id := v_item->'product'->>'id';
    v_qty := coalesce((v_item->>'quantity')::integer, 0);
    if v_qty <= 0 then
      raise exception 'INVALID_QUANTITY';
    end if;
    update public.products
      set stock = stock - v_qty
      where id = v_product_id and stock >= v_qty;
    if not found then
      raise exception 'NOT_ENOUGH_STOCK';
    end if;
  end loop;

  -- 주문 확정
  update public.orders
    set status = '결제완료',
        payment_key = p_payment_key,
        payment_method = coalesce(p_payment_method, payment_method)
    where id = p_order_id;

  return jsonb_build_object('ok', true, 'code', 'DONE');
exception
  when others then
    -- raise exception 경로: 트랜잭션 롤백 후 코드 반환
    return jsonb_build_object('ok', false, 'code', sqlerrm);
end $$;

-- 서버 전용: 브라우저(anon/authenticated)에서는 호출 불가
revoke execute on function public.finalize_order_payment(text, text, text) from public, anon, authenticated;
grant execute on function public.finalize_order_payment(text, text, text) to service_role;
