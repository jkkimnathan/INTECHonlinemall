-- ============================================================
-- payment_hardening_migration.sql 사후 검증 (실행해도 아무것도 바꾸지 않음)
-- Supabase SQL Editor에서 실행 → 결과에 'FAIL' 행이 하나라도 있으면
-- 마이그레이션이 불완전한 것이므로 원인을 확인해야 한다.
-- ============================================================

-- 1) 제약조건 존재 확인
select 'constraint' as kind, e.name,
       case when c.conname is not null then 'OK' else 'FAIL: 없음' end as result
from (values
  ('orders_payment_status_check'),
  ('orders_subtotal_nonneg'),
  ('orders_shipping_fee_nonneg'),
  ('orders_discount_nonneg')
) as e(name)
left join pg_constraint c on c.conname = e.name

union all

-- 2) unique / 일반 인덱스 확인
select 'index', e.name,
       case when i.indexname is not null then 'OK' else 'FAIL: 없음' end
from (values
  ('orders_payment_key_uniq'),
  ('payment_events_transmission_uniq'),
  ('orders_status_created_idx')
) as e(name)
left join pg_indexes i on i.schemaname = 'public' and i.indexname = e.name

union all

-- 3) RPC 존재 + anon/authenticated 실행 불가 확인
select 'function', p.proname,
       case
         when has_function_privilege('anon', p.oid, 'execute')
           or has_function_privilege('authenticated', p.oid, 'execute')
         then 'FAIL: anon/authenticated 실행 가능'
         else 'OK'
       end
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'finalize_order_payment_v2', 'restore_order_cancellation',
    'expire_pending_orders', 'claim_order_confirm', 'release_order_confirm',
    'ensure_cancel_key', 'hit_rate_limit', 'cleanup_rate_limits'
  )

union all

-- 3-1) RPC가 아예 없는 경우 감지
select 'function-missing', e.name,
       case when exists (
         select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname = e.name
       ) then 'OK' else 'FAIL: 함수 없음' end
from (values
  ('finalize_order_payment_v2'), ('restore_order_cancellation'),
  ('expire_pending_orders'), ('claim_order_confirm'), ('release_order_confirm'),
  ('ensure_cancel_key'), ('hit_rate_limit'), ('cleanup_rate_limits')
) as e(name)

union all

-- 4) RLS 활성 확인 (payment_events, rate_limits는 service_role 전용이어야 함)
select 'rls', t.tablename,
       case when t.rowsecurity then 'OK' else 'FAIL: RLS 꺼짐' end
from pg_tables t
where t.schemaname = 'public' and t.tablename in ('payment_events', 'rate_limits', 'orders')

union all

-- 5) 관리자 브라우저 직접 변경 정책이 제거됐는지
select 'policy-removed', e.name,
       case when p.policyname is null then 'OK' else 'FAIL: 아직 존재' end
from (values ('orders_admin_update'), ('orders_admin_delete')) as e(name)
left join pg_policies p on p.schemaname = 'public' and p.tablename = 'orders' and p.policyname = e.name

union all

-- 6) 불량 데이터 확인 (음수 금액 — 있으면 제약이 건너뛰어졌을 수 있음)
select 'data', 'orders 음수 금액',
       case when count(*) = 0 then 'OK' else 'FAIL: ' || count(*) || '건' end
from public.orders
where subtotal < 0 or shipping_fee < 0 or discount < 0 or total < 0

union all

-- 7) payment_key 중복 확인 (unique 인덱스가 정상이면 0이어야 함)
select 'data', 'payment_key 중복',
       case when count(*) = 0 then 'OK' else 'FAIL: ' || count(*) || '건' end
from (
  select payment_key from public.orders
  where payment_key is not null
  group by payment_key having count(*) > 1
) d

union all

-- 8) 과거 확정 주문 approved_at 백필 확인 (취소 복구 판정의 기준값)
select 'data', 'approved_at 백필 누락',
       case when count(*) = 0 then 'OK' else 'FAIL: ' || count(*) || '건' end
from public.orders
where approved_at is null
  and status in ('결제완료','배송준비','배송중','배송완료')

order by 3 desc, 1, 2;
