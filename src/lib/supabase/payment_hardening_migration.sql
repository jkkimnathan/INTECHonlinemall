-- ============================================================
-- 결제 안정화 마이그레이션 (payment_migration.sql, payment_migration_fix.sql 이후 1회 실행)
-- Supabase Dashboard → SQL Editor에서 실행
--
-- 추가되는 것:
--  1) 주문 상태 확장: 취소처리중 / 환불확인필요 / 만료
--  2) orders 결제 추적 컬럼 (payment_status, 멱등키, 처리 시각)
--  3) payment_key unique 제약
--  4) payment_events 감사 테이블 (웹훅 transmission id unique 포함)
--  5) rate_limits 테이블 + hit_rate_limit RPC (서버리스 공유 rate limit)
--  6) finalize_order_payment_v2 (상품 ID 합산 + 정렬 잠금으로 deadlock 방지)
--  7) restore_order_cancellation (취소 시 포인트/재고 멱등 복구)
--  8) expire_pending_orders (오래된 결제대기 주문 만료)
-- ============================================================

-- ── 1. 주문 상태 enum 확장 ──
alter type public.order_status add value if not exists '취소처리중' before '취소';
alter type public.order_status add value if not exists '환불확인필요';
alter type public.order_status add value if not exists '만료';

-- ── 2. orders 결제 추적 컬럼 ──
alter table public.orders add column if not exists payment_status text not null default 'NONE';
alter table public.orders add column if not exists toss_status text;
alter table public.orders add column if not exists confirm_key uuid not null default gen_random_uuid();
alter table public.orders add column if not exists cancel_key uuid;
alter table public.orders add column if not exists confirm_claimed_at timestamptz;
alter table public.orders add column if not exists approved_at timestamptz;
alter table public.orders add column if not exists canceled_at timestamptz;
alter table public.orders add column if not exists last_reconciled_at timestamptz;
alter table public.orders add column if not exists cancel_reason text;

-- 과거(v1 RPC) 확정 주문 백필: approved_at은 "포인트/재고가 실제 차감된 주문"의 단일 기준이다.
-- 취소 복구(restore_order_cancellation)가 이 값으로 복구 여부를 판정하므로 반드시 백필한다.
update public.orders
  set approved_at = created_at
  where approved_at is null
    and status in ('결제완료','배송준비','배송중','배송완료');

do $$ begin
  alter table public.orders add constraint orders_payment_status_check
    check (payment_status in (
      'NONE','READY','IN_PROGRESS','WAITING_FOR_DEPOSIT','DONE',
      'CANCELED','PARTIAL_CANCELED','ABORTED','EXPIRED',
      'ZERO_AMOUNT','RECONCILIATION_REQUIRED'
    ));
exception when duplicate_object then null; end $$;

-- 기존 데이터가 제약을 위반하면 건너뛰고 NOTICE만 남긴다 (마이그레이션 전체 실패 방지)
do $$ begin
  alter table public.orders add constraint orders_subtotal_nonneg check (subtotal >= 0);
exception when duplicate_object then null;
  when others then raise notice 'orders_subtotal_nonneg 추가 실패: % (기존 데이터 확인 필요)', sqlerrm;
end $$;
do $$ begin
  alter table public.orders add constraint orders_shipping_fee_nonneg check (shipping_fee >= 0);
exception when duplicate_object then null;
  when others then raise notice 'orders_shipping_fee_nonneg 추가 실패: % (기존 데이터 확인 필요)', sqlerrm;
end $$;
do $$ begin
  alter table public.orders add constraint orders_discount_nonneg check (discount >= 0);
exception when duplicate_object then null;
  when others then raise notice 'orders_discount_nonneg 추가 실패: % (기존 데이터 확인 필요)', sqlerrm;
end $$;

-- ── 3. 결제키 unique (같은 결제가 두 주문에 붙는 것 방지) ──
-- 사전 점검: 중복이 있으면 인덱스 생성이 실패한다. 아래 쿼리로 먼저 확인할 것.
--   select payment_key, count(*) from public.orders
--   where payment_key is not null group by 1 having count(*) > 1;
create unique index if not exists orders_payment_key_uniq
  on public.orders (payment_key) where payment_key is not null;

create index if not exists orders_status_created_idx
  on public.orders (status, created_at desc);
create index if not exists orders_payment_status_idx
  on public.orders (payment_status)
  where payment_status in ('RECONCILIATION_REQUIRED','IN_PROGRESS');

-- ── 3-1. 관리자 브라우저의 주문 직접 변경/삭제 차단 ──
-- 주문 상태 변경은 서버 API(/api/admin/orders/*)만 수행한다.
-- (서버는 service_role 키를 쓰므로 RLS 정책이 필요 없다)
drop policy if exists orders_admin_update on public.orders;
drop policy if exists orders_admin_delete on public.orders;

-- ── 4. 결제 이벤트 감사 테이블 ──
create table if not exists public.payment_events (
  id bigint generated always as identity primary key,
  order_id text,
  event_type text not null,          -- confirm_ok / confirm_fail / cancel_request / cancel_ok / cancel_fail / webhook / reconcile / expire / zero_amount ...
  source text not null default 'server',  -- server | webhook | cron | admin
  toss_status text,
  http_status integer,
  detail jsonb,
  transmission_id text,
  created_at timestamptz not null default now()
);

create unique index if not exists payment_events_transmission_uniq
  on public.payment_events (transmission_id) where transmission_id is not null;
create index if not exists payment_events_order_idx
  on public.payment_events (order_id, created_at desc);

-- service_role 전용 (정책 없이 RLS만 켜서 anon/authenticated 접근 차단)
alter table public.payment_events enable row level security;

-- ── 5. 공유 저장소 기반 rate limit ──
create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count integer not null
);
alter table public.rate_limits enable row level security;

create or replace function public.hit_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_count integer;
begin
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, v_now, 1)
  on conflict (key) do update set
    count = case
      when r.window_start < v_now - make_interval(secs => p_window_seconds) then 1
      else r.count + 1
    end,
    window_start = case
      when r.window_start < v_now - make_interval(secs => p_window_seconds) then v_now
      else r.window_start
    end
  returning count into v_count;

  return v_count <= p_limit;
end $$;

revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- 오래된 rate limit 키 정리 (대사 크론에서 주기적으로 호출)
create or replace function public.cleanup_rate_limits()
returns integer
language sql security definer
set search_path = public
as $$
  with deleted as (
    delete from public.rate_limits
    where window_start < now() - interval '1 day'
    returning 1
  )
  select count(*)::integer from deleted;
$$;

revoke execute on function public.cleanup_rate_limits() from public, anon, authenticated;
grant execute on function public.cleanup_rate_limits() to service_role;

-- ── 6. 결제 확정 RPC v2 ──
-- v1과 차이:
--  * 같은 상품이 여러 줄로 들어와도 상품 ID 기준으로 수량을 합산
--  * 항상 상품 ID 정렬 순서로 잠금 → 서로 다른 주문 간 deadlock 방지
--  * payment_status / toss_status / approved_at 기록
--  * p_payment_key가 null이면 0원(전액 포인트) 주문으로 처리
create or replace function public.finalize_order_payment_v2(
  p_order_id text,
  p_payment_key text,
  p_payment_method text default null,
  p_toss_status text default 'DONE'
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_points integer;
  v_after integer;
  v_item record;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'ORDER_NOT_FOUND');
  end if;

  -- 같은 결제로 이미 확정 → 성공 (중복 호출 안전)
  if v_order.status = '결제완료'
     and (v_order.payment_key = p_payment_key
          or (v_order.payment_key is null and p_payment_key is null)) then
    return jsonb_build_object('ok', true, 'code', 'ALREADY_DONE');
  end if;
  if v_order.status <> '결제대기' then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATUS');
  end if;

  -- 0원 주문 검증: 결제키 없이 확정하려면 total이 정확히 0이어야 함
  if p_payment_key is null and v_order.total <> 0 then
    return jsonb_build_object('ok', false, 'code', 'NOT_ZERO_AMOUNT');
  end if;

  -- 포인트 차감 (잔액 검증 + 실제 적용 검증)
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

  -- 재고 차감: 상품 ID 합산 + 정렬 순서 잠금
  for v_item in
    select item->'product'->>'id' as product_id,
           sum(coalesce((item->>'quantity')::integer, 0)) as qty
    from jsonb_array_elements(v_order.items) as item
    group by 1
    order by 1
  loop
    if v_item.product_id is null or v_item.qty <= 0 then
      raise exception 'INVALID_QUANTITY';
    end if;
    update public.products
      set stock = stock - v_item.qty
      where id::text = v_item.product_id and stock >= v_item.qty;
    if not found then
      raise exception 'NOT_ENOUGH_STOCK';
    end if;
  end loop;

  update public.orders
    set status = '결제완료',
        payment_key = p_payment_key,
        payment_method = coalesce(p_payment_method, payment_method),
        payment_status = case when p_payment_key is null then 'ZERO_AMOUNT' else 'DONE' end,
        toss_status = p_toss_status,
        approved_at = now(),
        confirm_claimed_at = null
    where id = p_order_id;

  return jsonb_build_object('ok', true, 'code', 'DONE');
exception
  when others then
    return jsonb_build_object('ok', false, 'code', sqlerrm);
end $$;

revoke execute on function public.finalize_order_payment_v2(text, text, text, text) from public, anon, authenticated;
grant execute on function public.finalize_order_payment_v2(text, text, text, text) to service_role;

-- ── 7. 취소 확정 RPC (포인트/재고 멱등 복구) ──
-- 토스 취소가 "성공 확인"된 뒤에만 호출한다.
-- 행 잠금 + 최종 상태 검사로 여러 번 호출해도 복구는 정확히 한 번만 적용된다.
create or replace function public.restore_order_cancellation(
  p_order_id text,
  p_payment_status text default 'CANCELED',
  p_toss_status text default null,
  p_reason text default null
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_need_restore boolean;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'ORDER_NOT_FOUND');
  end if;

  -- 이미 취소 완료 → 재복구 없이 성공 (멱등)
  if v_order.status = '취소' or v_order.status = '만료' then
    return jsonb_build_object('ok', true, 'code', 'ALREADY_CANCELED');
  end if;

  if v_order.status not in ('결제대기','결제완료','배송준비','취소처리중','환불확인필요') then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATUS');
  end if;

  -- 사용자의 결제 승인(confirm)이 진행 중인 결제대기 주문은 취소하지 않는다.
  -- (승인 완료/실패 후 claim이 풀리면 그때 취소 가능 — 과금 추적 유실 방지)
  if v_order.status = '결제대기'
     and v_order.confirm_claimed_at is not null
     and v_order.confirm_claimed_at > now() - interval '90 seconds' then
    return jsonb_build_object('ok', false, 'code', 'CONFIRM_IN_PROGRESS');
  end if;

  -- 포인트/재고가 실제로 차감된 주문에만 복구를 적용한다.
  -- approved_at이 단일 기준: v2 확정 시 기록되고, 과거(v1) 확정 주문은
  -- 마이그레이션에서 백필된다. 확정 실패 주문(환불확인필요 경로)은
  -- payment_key가 저장돼 있어도 approved_at이 없으므로 복구하지 않는다.
  v_need_restore := v_order.approved_at is not null;

  if v_need_restore then
    if v_order.used_points > 0 then
      update public.profiles
        set points = points + v_order.used_points
        where id::text = v_order.user_id::text;
    end if;

    for v_item in
      select item->'product'->>'id' as product_id,
             sum(coalesce((item->>'quantity')::integer, 0)) as qty
      from jsonb_array_elements(v_order.items) as item
      group by 1
      order by 1
    loop
      if v_item.product_id is not null and v_item.qty > 0 then
        update public.products
          set stock = stock + v_item.qty
          where id::text = v_item.product_id;
      end if;
    end loop;
  end if;

  update public.orders
    set status = '취소',
        payment_status = p_payment_status,
        toss_status = coalesce(p_toss_status, toss_status),
        canceled_at = now(),
        cancel_reason = coalesce(p_reason, cancel_reason),
        confirm_claimed_at = null
    where id = p_order_id;

  return jsonb_build_object('ok', true, 'code', 'CANCELED', 'restored', v_need_restore);
exception
  when others then
    return jsonb_build_object('ok', false, 'code', sqlerrm);
end $$;

revoke execute on function public.restore_order_cancellation(text, text, text, text) from public, anon, authenticated;
grant execute on function public.restore_order_cancellation(text, text, text, text) to service_role;

-- ── 8. 오래된 결제대기 주문 만료 ──
-- 결제키가 없고(승인 시도 흔적 없음) 오래된 결제대기 주문만 만료한다.
-- 결제키가 있거나 IN_PROGRESS인 주문은 대사(cron reconcile)가 토스 조회로 판단한다.
create or replace function public.expire_pending_orders(
  p_older_than_minutes integer default 60,
  p_limit integer default 200
)
returns integer
language plpgsql security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  with target as (
    select id from public.orders
    where status = '결제대기'
      and payment_key is null
      and payment_status in ('NONE','READY')
      and created_at < now() - make_interval(mins => p_older_than_minutes)
      and (confirm_claimed_at is null
           or confirm_claimed_at < now() - interval '30 minutes')
    order by created_at
    limit p_limit
    for update skip locked
  )
  update public.orders o
    set status = '만료', payment_status = 'EXPIRED'
    from target t
    where o.id = t.id;

  get diagnostics v_count = row_count;
  return v_count;
end $$;

revoke execute on function public.expire_pending_orders(integer, integer) from public, anon, authenticated;
grant execute on function public.expire_pending_orders(integer, integer) to service_role;

-- ── 9. confirm 단일 처리 claim ──
-- 같은 주문에 confirm이 동시에 들어와도 토스 승인 호출은 한 요청만 수행하게 한다.
-- 90초가 지나면 죽은 claim으로 보고 다른 요청이 이어받는다.
create or replace function public.claim_order_confirm(p_order_id text)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_row public.orders%rowtype;
begin
  update public.orders
    set confirm_claimed_at = now(),
        payment_status = case when payment_status in ('NONE','READY') then 'IN_PROGRESS' else payment_status end
    where id = p_order_id
      and status = '결제대기'
      and (confirm_claimed_at is null or confirm_claimed_at < now() - interval '90 seconds')
    returning * into v_row;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'CLAIM_BUSY');
  end if;

  return jsonb_build_object(
    'ok', true,
    'confirm_key', v_row.confirm_key,
    'cancel_key', v_row.cancel_key,
    'total', v_row.total
  );
end $$;

revoke execute on function public.claim_order_confirm(text) from public, anon, authenticated;
grant execute on function public.claim_order_confirm(text) to service_role;

-- claim 해제 (승인이 "확정적으로 실패"해 사용자가 재시도할 수 있게 되돌릴 때만 호출)
-- confirm_key를 회전한다: 재시도 결제는 새 paymentKey로 오므로 이전 멱등키를
-- 재사용하면 토스가 이전(실패) 응답을 재생해 재결제가 영구 실패할 수 있다.
-- 승인 결과가 "불명확"한 경우에는 이 함수를 호출하지 말 것 (IN_PROGRESS 유지 → 대사가 판단).
create or replace function public.release_order_confirm(p_order_id text, p_payment_status text default 'READY')
returns void
language sql security definer
set search_path = public
as $$
  update public.orders
    set confirm_claimed_at = null,
        confirm_key = gen_random_uuid(),
        payment_status = p_payment_status
    where id = p_order_id and status = '결제대기';
$$;

revoke execute on function public.release_order_confirm(text, text) from public, anon, authenticated;
grant execute on function public.release_order_confirm(text, text) to service_role;

-- ── 10. 취소 멱등키 발급 (주문당 1회 고정) ──
create or replace function public.ensure_cancel_key(p_order_id text)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_key uuid;
begin
  update public.orders
    set cancel_key = coalesce(cancel_key, gen_random_uuid())
    where id = p_order_id
    returning cancel_key into v_key;
  return v_key;
end $$;

revoke execute on function public.ensure_cancel_key(text) from public, anon, authenticated;
grant execute on function public.ensure_cancel_key(text) to service_role;
