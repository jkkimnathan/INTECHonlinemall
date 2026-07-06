-- ============================================================
-- 보안 하드닝 마이그레이션 v2 (security_migration.sql 실행 이후 1회 실행)
-- Supabase Dashboard → SQL Editor 에 붙여넣고 "Run"
--
-- 목적 (모두 서버/DB 레벨에서 강제 — 클라이언트 우회 불가):
--   A. 주문: 가격·배송비·적립금을 서버가 재계산 (클라 금액 신뢰 안 함)
--   B. 주문: 재고 행 잠금(FOR UPDATE)으로 동시주문 초과판매 방지
--   C. 프로필: 일반 사용자의 points/grade/is_admin 자가수정 원천 차단(트리거)
--   D. 리뷰: 구매자만 작성(서버 검증), 작성자명 서버 지정
--   E. 비회원 주문조회: 주문번호+전화번호 서버 검증 RPC
--   F. 성능/동시성: 자주 쓰는 컬럼 인덱스 + 검색용 트라이그램 인덱스
-- 이 파일은 idempotent — 여러 번 실행해도 안전합니다.
-- ============================================================

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- 트라이그램 opclass 등을 스키마 한정 없이 참조할 수 있도록
set search_path = public, extensions;

-- is_admin() 보장 (v1에서 생성했더라도 안전하게 재정의)
create or replace function public.is_admin()
returns boolean
language sql stable
set search_path = public, extensions
as $$
  select coalesce((auth.jwt()->'app_metadata'->>'is_admin')::boolean, false)
$$;

-- ============================================================
-- C. 프로필 민감 컬럼 보호 트리거 (자가 위조 차단)
--    일반 사용자는 name/phone 만 바꿀 수 있고
--    points/grade/is_admin/email/created_at 은 변경 불가.
--    create_order 내부의 적립금 차감은 트랜잭션-로컬 GUC 로만 허용.
-- ============================================================
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  -- 관리자는 제한 없음
  if public.is_admin() then
    return new;
  end if;

  -- 신뢰된 서버 함수(create_order)가 명시적으로 허용한 경우:
  -- points 변경만 허용하고 나머지 민감 컬럼은 여전히 보호(우회 범위 최소화)
  if coalesce(current_setting('app.allow_points_write', true), '') = '1'
     and tg_op = 'UPDATE' then
    new.grade := old.grade;
    new.is_admin := old.is_admin;
    new.email := old.email;
    new.created_at := old.created_at;
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- 가입 시 최초 프로필: 민감값은 서버 기본값으로 강제
    new.points := 0;
    new.grade := '일반';
    new.is_admin := false;
    return new;
  else
    -- 수정 시: 민감 컬럼은 기존 값 유지
    new.points := old.points;
    new.grade := old.grade;
    new.is_admin := old.is_admin;
    new.email := old.email;
    new.created_at := old.created_at;
    return new;
  end if;
end $$;

drop trigger if exists trg_protect_profile_columns on public.profiles;
create trigger trg_protect_profile_columns
  before insert or update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ============================================================
-- A + B. 주문 생성 RPC — 서버가 금액/재고/적립금을 완전 검증
-- ============================================================
-- 직접 INSERT 정책 제거: 주문은 create_order RPC로만 생성 가능.
-- (이 정책이 남아 있으면 클라이언트가 RPC를 우회해 0원 주문을
--  직접 삽입할 수 있어 서버 검증 전체가 무력화된다.)
drop policy if exists orders_insert_own on public.orders;

create or replace function public.create_order(
  p_items jsonb,
  p_shipping jsonb,
  p_payment_method text,
  p_use_points integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := auth.uid();
  v_item jsonb;
  v_pid text;
  v_qty int;
  v_prod public.products%rowtype;
  v_unit numeric;
  v_subtotal numeric := 0;
  v_shipping_fee numeric;
  v_points_balance numeric;
  v_discount numeric;
  v_total numeric;
  v_id text;
  v_row public.orders%rowtype;
  v_norm_items jsonb := '[]'::jsonb;
begin
  if v_uid is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception '주문 상품이 없습니다.';
  end if;
  if jsonb_array_length(p_items) > 100 then
    raise exception '한 번에 주문 가능한 상품 종류를 초과했습니다.';
  end if;
  if p_shipping is null
     or coalesce(p_shipping->>'name','') = ''
     or coalesce(p_shipping->>'phone','') = ''
     or coalesce(p_shipping->>'address','') = '' then
    raise exception '배송 정보가 누락되었습니다.';
  end if;

  -- 각 상품을 서버 DB 기준으로 검증 + 재고 차감(행 잠금으로 초과판매 방지)
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid := coalesce(v_item->'product'->>'id', v_item->>'productId', v_item->>'product_id');
    v_qty := coalesce((v_item->>'quantity')::int, 0);

    if v_pid is null then
      raise exception '상품 정보가 올바르지 않습니다.';
    end if;
    if v_qty < 1 or v_qty > 999 then
      raise exception '상품 수량이 올바르지 않습니다.';
    end if;

    select * into v_prod from public.products where id = v_pid for update;
    if not found then
      raise exception '존재하지 않는 상품입니다.';
    end if;
    if coalesce(v_prod.stock, 0) < v_qty then
      raise exception '재고가 부족합니다: %', v_prod.name;
    end if;

    v_unit := coalesce(v_prod.sale_price, v_prod.price);
    v_subtotal := v_subtotal + (v_unit * v_qty);

    update public.products set stock = stock - v_qty where id = v_pid;

    -- 서버가 신뢰하는 값으로 아이템 재구성(가격 위변조 무력화)
    v_norm_items := v_norm_items || jsonb_build_array(jsonb_build_object(
      'product', jsonb_build_object(
        'id', v_prod.id,
        'name', v_prod.name,
        'slug', v_prod.slug,
        'brand', v_prod.brand,
        'price', v_prod.price,
        'salePrice', v_prod.sale_price,
        'images', to_jsonb(v_prod.images)
      ),
      'quantity', v_qty
    ));
  end loop;

  -- 배송비: 서버 규칙 (5만원 이상 무료)
  v_shipping_fee := case when v_subtotal >= 50000 then 0 else 3000 end;

  -- 적립금: 서버 보유 잔액 기준으로 사용액 제한
  select coalesce(points, 0) into v_points_balance from public.profiles where id = v_uid;
  v_discount := greatest(0, least(coalesce(p_use_points, 0)::numeric, coalesce(v_points_balance, 0), floor(v_subtotal)));

  v_total := v_subtotal + v_shipping_fee - v_discount;
  -- 같은 밀리초 동시주문 시 PK 충돌을 피하기 위해 랜덤 접미사 부여
  v_id := 'ORD-' || (extract(epoch from clock_timestamp()) * 1000)::bigint::text
          || '-' || substr(md5(random()::text || v_uid::text), 1, 4);

  insert into public.orders
    (id, user_id, items, shipping, payment_method, subtotal, shipping_fee, discount, total, status)
  values
    (v_id, v_uid, v_norm_items, p_shipping, coalesce(p_payment_method, 'card'),
     v_subtotal, v_shipping_fee, v_discount, v_total, '결제완료')
  returning * into v_row;

  -- 사용한 적립금 차감 (트리거 우회 허용 플래그를 트랜잭션 로컬로 설정)
  if v_discount > 0 then
    perform set_config('app.allow_points_write', '1', true);
    update public.profiles set points = coalesce(points, 0) - v_discount where id = v_uid;
    perform set_config('app.allow_points_write', '0', true);
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'user_id', v_row.user_id,
    'items', v_row.items,
    'shipping', v_row.shipping,
    'payment_method', v_row.payment_method,
    'subtotal', v_row.subtotal,
    'shipping_fee', v_row.shipping_fee,
    'discount', v_row.discount,
    'total', v_row.total,
    'status', v_row.status,
    'created_at', v_row.created_at,
    'tracking_number', v_row.tracking_number
  );
end $$;

grant execute on function public.create_order(jsonb, jsonb, text, integer) to authenticated;

-- ============================================================
-- D. 리뷰 작성 RPC — 구매자만, 작성자명은 서버가 프로필에서 지정
-- ============================================================
-- 직접 INSERT 정책 제거: 리뷰는 RPC(review_create)로만 작성 가능
drop policy if exists reviews_insert_own on public.reviews;

create or replace function public.review_create(
  p_product_id text,
  p_rating int,
  p_content text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := auth.uid();
  v_name text;
  v_purchased boolean;
  v_row public.reviews%rowtype;
begin
  if v_uid is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception '평점은 1~5 사이여야 합니다.';
  end if;
  if length(trim(coalesce(p_content, ''))) = 0 then
    raise exception '리뷰 내용을 입력해주세요.';
  end if;
  if length(p_content) > 2000 then
    raise exception '리뷰는 2000자 이내로 작성해주세요.';
  end if;

  -- 구매 검증: 내 주문 항목 중 해당 상품이 있는가
  -- (items 가 배열이 아닌 비정상/구버전 데이터가 있어도 오류 없이 건너뜀)
  select exists(
    select 1
    from public.orders o,
         jsonb_array_elements(
           case when jsonb_typeof(o.items) = 'array' then o.items else '[]'::jsonb end
         ) it
    where o.user_id = v_uid
      and coalesce(it->'product'->>'id', it->>'productId', it->>'product_id') = p_product_id
  ) into v_purchased;

  if not v_purchased then
    raise exception '구매한 상품에만 리뷰를 작성할 수 있습니다.';
  end if;

  select coalesce(nullif(trim(name), ''), '구매자') into v_name
  from public.profiles where id = v_uid;

  begin
    insert into public.reviews (product_id, user_id, user_name, rating, content)
    values (p_product_id, v_uid, coalesce(v_name, '구매자'), p_rating, p_content)
    returning * into v_row;
  exception when unique_violation then
    raise exception '이미 이 상품에 리뷰를 작성하셨습니다.';
  end;

  return jsonb_build_object(
    'id', v_row.id,
    'product_id', v_row.product_id,
    'user_id', v_row.user_id,
    'user_name', v_row.user_name,
    'rating', v_row.rating,
    'content', v_row.content,
    'created_at', v_row.created_at
  );
end $$;

grant execute on function public.review_create(text, int, text) to authenticated;

-- ============================================================
-- E. 비회원 주문조회 RPC — 주문번호 + 전화번호 서버 검증
-- ============================================================
create or replace function public.order_lookup(p_id text, p_phone text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_row public.orders%rowtype;
begin
  if coalesce(p_id, '') = '' or coalesce(p_phone, '') = '' then
    return null;
  end if;

  select * into v_row from public.orders where id = p_id;
  if not found then
    return null;
  end if;
  -- 전화번호 하이픈 유무 무관하게 비교
  if replace(coalesce(v_row.shipping->>'phone', ''), '-', '') <> replace(p_phone, '-', '') then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'user_id', v_row.user_id,
    'items', v_row.items,
    'shipping', v_row.shipping,
    'payment_method', v_row.payment_method,
    'subtotal', v_row.subtotal,
    'shipping_fee', v_row.shipping_fee,
    'discount', v_row.discount,
    'total', v_row.total,
    'status', v_row.status,
    'created_at', v_row.created_at,
    'tracking_number', v_row.tracking_number
  );
end $$;

grant execute on function public.order_lookup(text, text) to anon, authenticated;

-- ============================================================
-- F. 성능/동시성 인덱스 (수백~수천 동시접속 대비)
-- ============================================================
create index if not exists idx_reviews_product_id on public.reviews (product_id);
create index if not exists idx_reviews_user_id on public.reviews (user_id);
create index if not exists idx_orders_user_created on public.orders (user_id, created_at desc);
create index if not exists idx_orders_created on public.orders (created_at desc);
create index if not exists idx_products_created on public.products (created_at desc);
create index if not exists idx_products_brand on public.products (brand);
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_flags on public.products (is_featured, is_sale, is_new);
create index if not exists idx_qna_created on public.qna (created_at desc);

-- 검색(ILIKE '%...%') 가속용 트라이그램 인덱스
-- pg_trgm 설치 스키마 차이로 실패해도 나머지가 중단되지 않도록 예외 처리
do $$
begin
  create index if not exists idx_products_name_trgm on public.products using gin (name gin_trgm_ops);
  create index if not exists idx_products_brand_trgm on public.products using gin (brand gin_trgm_ops);
  create index if not exists idx_products_desc_trgm on public.products using gin (description gin_trgm_ops);
exception when others then
  raise notice '트라이그램 인덱스 생성 건너뜀 (pg_trgm opclass 미해결): %', sqlerrm;
end $$;

-- 통계 갱신
analyze public.products;
analyze public.orders;
analyze public.reviews;
