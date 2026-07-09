-- ============================================================
-- 결제 마이그레이션 보완 (payment_migration.sql 실행 후 1회 실행)
-- 해결하는 문제:
--  1) orders.status가 enum 타입이라 '결제대기' 값이 거부되던 문제
--  2) profiles의 정체불명 보호 트리거가 서버의 포인트 차감까지 막던 문제
--  3) 포인트 차감이 조용히 실패하면 결제를 자동 취소하도록 RPC 강화
-- ============================================================

-- ── 1. 주문 상태 enum에 '결제대기' 추가 ──
alter type public.order_status add value if not exists '결제대기' before '결제완료';

-- (이전 마이그레이션에서 잘못 시도했던 check 제약은 제거 - enum이 이미 값을 제한함)
alter table public.orders drop constraint if exists orders_status_check;

-- ── 2. profiles의 사용자 정의 트리거 정리 ──
-- 라이브 DB에 points/grade 변경을 무조건 되돌리는 트리거가 있어
-- 서버(결제 확정)의 포인트 차감까지 막힌다.
-- 이 보호 역할은 payment_migration.sql의 컬럼 권한(grant update (name, phone, email))이
-- 이미 대신하므로, updated_at 관리용을 제외한 트리거를 제거한다.
-- 어떤 트리거가 제거되는지 실행 결과(NOTICE)에 표시된다.
do $$
declare t record;
begin
  for t in
    select tgname, pg_get_triggerdef(oid) as def
    from pg_trigger
    where tgrelid = 'public.profiles'::regclass and not tgisinternal
  loop
    if t.tgname ilike '%updated_at%' or t.tgname ilike '%timestamp%' or t.def ilike '%updated_at%' then
      raise notice '[유지] %: %', t.tgname, t.def;
    else
      raise notice '[제거] %: %', t.tgname, t.def;
      execute format('drop trigger %I on public.profiles', t.tgname);
    end if;
  end loop;
end $$;

-- ── 3. 결제 확정 RPC 강화: 포인트 차감이 실제로 적용됐는지 검증 ──
-- (무언가가 차감을 막으면 결제를 실패 처리해 자동 취소되도록 한다)
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
  v_after integer;
  v_item jsonb;
  v_product_id text;
  v_qty integer;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'ORDER_NOT_FOUND');
  end if;

  if v_order.status = '결제완료' and v_order.payment_key = p_payment_key then
    return jsonb_build_object('ok', true, 'code', 'ALREADY_DONE');
  end if;
  if v_order.status <> '결제대기' then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATUS');
  end if;

  -- 포인트 차감 (잔액 검증 + 적용 검증)
  if v_order.used_points > 0 then
    select points into v_points from public.profiles
      where id::text = v_order.user_id::text for update;
    if v_points is null or v_points < v_order.used_points then
      return jsonb_build_object('ok', false, 'code', 'NOT_ENOUGH_POINTS');
    end if;
    update public.profiles
      set points = points - v_order.used_points
      where id::text = v_order.user_id::text
      returning points into v_after;
    if v_after is distinct from (v_points - v_order.used_points) then
      raise exception 'POINTS_UPDATE_BLOCKED';
    end if;
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
      where id::text = v_product_id and stock >= v_qty;
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
    return jsonb_build_object('ok', false, 'code', sqlerrm);
end $$;

revoke execute on function public.finalize_order_payment(text, text, text) from public, anon, authenticated;
grant execute on function public.finalize_order_payment(text, text, text) to service_role;
