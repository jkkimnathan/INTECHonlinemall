-- ============================================================
-- 데이터 무결성 제약 + Q&A 비밀글 열람 시도 제한
-- Supabase Dashboard → SQL Editor에서 1회 실행
-- 선행: security_migration.sql, payment_migration.sql, payment_migration_fix.sql
-- 주의: 아래 CHECK 제약 추가 시 "기존 데이터가 조건을 위반"하면 에러가 납니다.
--       그 경우 해당 데이터를 먼저 정리한 뒤 다시 실행하세요(어떤 제약인지 에러에 표시됨).
-- ============================================================

-- ── 1. products: 할인가 범위 (0 이상, 정가 이하) ──
do $$ begin
  alter table public.products add constraint products_sale_price_range
    check (sale_price is null or (sale_price >= 0 and sale_price <= price));
exception when duplicate_object then null; end $$;

-- ── 2. time_deal_items: 딜가/수량/판매량 범위 ──
do $$ begin
  alter table public.time_deal_items add constraint tdi_deal_price_nonneg
    check (deal_price >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.time_deal_items add constraint tdi_deal_quantity_pos
    check (deal_quantity > 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.time_deal_items add constraint tdi_sold_count_range
    check (sold_count >= 0 and sold_count <= deal_quantity);
exception when duplicate_object then null; end $$;

-- ── 3. Q&A 비밀글 열람 시도 제한 (brute-force 완화) ──
-- 시도 기록 테이블: 같은 글에 대해 (사용자 or 익명) 기준 실패 횟수를 시간창으로 제한
create table if not exists public.qna_unlock_attempts (
  id bigserial primary key,
  qna_id text not null,
  actor text not null,          -- auth.uid() 또는 'anon'
  ok boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists qna_unlock_attempts_lookup
  on public.qna_unlock_attempts (qna_id, actor, created_at);

alter table public.qna_unlock_attempts enable row level security;
-- 브라우저 직접 접근 차단 (RPC/SECURITY DEFINER로만 기록)
do $$
declare p record;
begin
  for p in select policyname from pg_policies
    where schemaname = 'public' and tablename = 'qna_unlock_attempts'
  loop
    execute format('drop policy %I on public.qna_unlock_attempts', p.policyname);
  end loop;
end $$;

-- 비밀글 열람 RPC 재정의: 10분 내 실패 5회 이상이면 잠금
-- 반환 형식:
--   성공        → { "ok": true,  "content": ..., "answer_content": ... }
--   비번틀림    → { "ok": false, "code": "WRONG" }
--   잠김        → { "ok": false, "code": "LOCKED", "retry_after": <초> }
create or replace function public.qna_unlock(p_id text, p_password text)
returns jsonb
language plpgsql volatile security definer
set search_path = public, extensions
as $$
declare
  v_row public.qna%rowtype;
  v_actor text := coalesce(auth.uid()::text, 'anon');
  v_window interval := interval '10 minutes';
  v_max int := 5;
  v_fail_count int;
  v_oldest timestamptz;
begin
  select * into v_row from public.qna where id::text = p_id;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'WRONG');
  end if;

  -- 비밀글이 아니면 그대로 반환 (제한 불필요)
  if coalesce(v_row.is_secret, false) = false then
    return jsonb_build_object('ok', true, 'content', v_row.content, 'answer_content', v_row.answer_content);
  end if;

  -- 작성자 본인/관리자는 제한 없이 열람
  if v_row.user_id::text = v_actor or public.is_admin() then
    return jsonb_build_object('ok', true, 'content', v_row.content, 'answer_content', v_row.answer_content);
  end if;

  -- 시간창 내 실패 횟수 확인
  select count(*), min(created_at) into v_fail_count, v_oldest
  from public.qna_unlock_attempts
  where qna_id = p_id and actor = v_actor and ok = false
    and created_at > now() - v_window;

  if v_fail_count >= v_max then
    return jsonb_build_object(
      'ok', false, 'code', 'LOCKED',
      'retry_after', greatest(1, ceil(extract(epoch from (v_oldest + v_window - now()))))::int
    );
  end if;

  -- 비밀번호 검증
  if v_row.password is not null
     and v_row.password = extensions.crypt(p_password, v_row.password) then
    -- 성공: 이 사용자/글의 실패 기록 정리
    delete from public.qna_unlock_attempts where qna_id = p_id and actor = v_actor;
    return jsonb_build_object('ok', true, 'content', v_row.content, 'answer_content', v_row.answer_content);
  end if;

  -- 실패 기록
  insert into public.qna_unlock_attempts (qna_id, actor, ok) values (p_id, v_actor, false);
  return jsonb_build_object('ok', false, 'code', 'WRONG');
end $$;

grant execute on function public.qna_unlock(text, text) to anon, authenticated;
