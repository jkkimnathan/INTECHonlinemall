-- ============================================================
-- 보안 마이그레이션 (SECURITY_REVIEW.md 조치: SEC-02/03/04/10)
-- Supabase Dashboard → SQL Editor에서 1회 실행
-- 실행 직후 새 코드를 배포할 것 (Q&A가 새 RPC 함수를 사용함)
-- ============================================================

-- ── 0. 준비: pgcrypto(비밀번호 해시) + 관리자 판별 함수 ──
create extension if not exists pgcrypto with schema extensions;

create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select coalesce((auth.jwt()->'app_metadata'->>'is_admin')::boolean, false)
$$;

-- ── 1. 모든 운영 테이블: RLS 활성화 + 기존 정책 전부 제거 ──
-- (정책 이름이 제각각일 수 있어 동적으로 모두 삭제 후 아래에서 재생성)
do $$
declare
  t text;
  p record;
begin
  foreach t in array array[
    'products','banners','events','notices','page_banners',
    'main_image_banners','time_deals','time_deal_items',
    'home_sections','orders','qna','reviews','profiles'
  ] loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      execute format('alter table public.%I enable row level security', t);
      for p in
        select policyname from pg_policies
        where schemaname = 'public' and tablename = t
      loop
        execute format('drop policy %I on public.%I', p.policyname, t);
      end loop;
    end if;
  end loop;
end $$;

-- ── 2. 공개 콘텐츠 테이블: 누구나 읽기, 관리자만 쓰기 (SEC-04) ──
do $$
declare t text;
begin
  foreach t in array array[
    'products','banners','events','notices','page_banners',
    'main_image_banners','time_deals','time_deal_items','home_sections'
  ] loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      execute format(
        'create policy %I on public.%I for select using (true)',
        t || '_public_read', t);
      execute format(
        'create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())',
        t || '_admin_write', t);
    end if;
  end loop;
end $$;

-- ── 3. orders: 본인 주문만 조회/생성, 변경·삭제는 관리자만 (SEC-02) ──
create policy orders_select_own on public.orders for select
  using (user_id::text = auth.uid()::text or public.is_admin());
create policy orders_insert_own on public.orders for insert
  with check (auth.uid() is not null and user_id::text = auth.uid()::text);
create policy orders_admin_update on public.orders for update
  using (public.is_admin()) with check (public.is_admin());
create policy orders_admin_delete on public.orders for delete
  using (public.is_admin());

-- ── 4. profiles: 본인 행만 읽기/쓰기, 관리자는 전체 조회 ──
create policy profiles_select_own on public.profiles for select
  using (id::text = auth.uid()::text or public.is_admin());
create policy profiles_insert_own on public.profiles for insert
  with check (id::text = auth.uid()::text);
create policy profiles_update_own on public.profiles for update
  using (id::text = auth.uid()::text or public.is_admin())
  with check (id::text = auth.uid()::text or public.is_admin());

-- ── 5. reviews: 누구나 읽기, 본인만 작성(1상품 1리뷰), 본인/관리자만 삭제 (SEC-10) ──
create policy reviews_public_read on public.reviews for select
  using (true);
create policy reviews_insert_own on public.reviews for insert
  with check (auth.uid() is not null and user_id::text = auth.uid()::text);
create policy reviews_delete_own on public.reviews for delete
  using (user_id::text = auth.uid()::text or public.is_admin());

-- 이미 존재하면 건너뜀 (재실행 안전).
-- unique 제약은 내부적으로 인덱스를 만들어 42P07(duplicate_table)로 실패할 수 있고,
-- check 제약은 42710(duplicate_object)로 실패하므로 두 경우 모두 무시한다.
do $$ begin
  alter table public.reviews add constraint reviews_rating_range check (rating between 1 and 5);
exception when duplicate_object or duplicate_table then null; end $$;

do $$ begin
  alter table public.reviews add constraint reviews_one_per_product unique (user_id, product_id);
exception when duplicate_object or duplicate_table then null; end $$;

-- ── 6. qna: 비밀글 보호 (SEC-03) ──
-- 행 정책: 비밀글이 아닌 글, 본인 글, 관리자만 직접 조회 가능
create policy qna_select on public.qna for select
  using (coalesce(is_secret, false) = false
         or user_id::text = auth.uid()::text
         or public.is_admin());
-- 작성은 RPC(qna_create)로만 (SECURITY DEFINER가 RLS 우회하므로 직접 INSERT 정책 없음)
create policy qna_admin_update on public.qna for update
  using (public.is_admin()) with check (public.is_admin());
create policy qna_delete_own on public.qna for delete
  using (user_id::text = auth.uid()::text or public.is_admin());

-- 6-a. 목록 조회 RPC: 비밀글은 본문/답변을 제거하고 반환 (비밀번호는 절대 반환 안 함)
create or replace function public.qna_list()
returns setof jsonb
language sql stable security definer
set search_path = public, extensions
as $$
  select jsonb_build_object(
    'id', q.id,
    'author_name', q.author_name,
    'category', q.category,
    'title', q.title,
    'content', case when coalesce(q.is_secret, false) = false
                      or q.user_id::text = auth.uid()::text
                      or public.is_admin()
                    then q.content else null end,
    'is_answered', q.is_answered,
    'answer_content', case when coalesce(q.is_secret, false) = false
                             or q.user_id::text = auth.uid()::text
                             or public.is_admin()
                           then q.answer_content else null end,
    'answer_date', q.answer_date,
    'is_secret', coalesce(q.is_secret, false),
    'created_at', q.created_at,
    'is_mine', (q.user_id::text = auth.uid()::text)
  )
  from public.qna q
  order by q.created_at desc;
$$;

-- 6-b. 작성 RPC: 비밀글 비밀번호를 bcrypt 해시로만 저장
create or replace function public.qna_create(
  p_author_name text,
  p_category text,
  p_title text,
  p_content text,
  p_is_secret boolean default false,
  p_password text default null
)
returns jsonb
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.qna%rowtype;
begin
  if v_uid is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if length(trim(coalesce(p_title, ''))) = 0 or length(trim(coalesce(p_content, ''))) = 0 then
    raise exception '제목과 내용을 입력해주세요.';
  end if;
  if coalesce(p_is_secret, false) and length(coalesce(p_password, '')) < 4 then
    raise exception '비밀글 비밀번호는 4자 이상이어야 합니다.';
  end if;

  insert into public.qna (user_id, author_name, category, title, content, is_secret, password)
  values (
    v_uid,
    p_author_name,
    p_category,
    p_title,
    p_content,
    coalesce(p_is_secret, false),
    case when coalesce(p_is_secret, false)
         then extensions.crypt(p_password, extensions.gen_salt('bf'))
         else null end
  )
  returning * into v_row;

  return jsonb_build_object('id', v_row.id, 'created_at', v_row.created_at);
end $$;

-- 6-c. 비밀글 열람 RPC: 서버에서 비밀번호 검증 후에만 본문 반환
create or replace function public.qna_unlock(p_id text, p_password text)
returns jsonb
language plpgsql stable security definer
set search_path = public, extensions
as $$
declare
  v_row public.qna%rowtype;
begin
  select * into v_row from public.qna where id::text = p_id;
  if not found then
    return null;
  end if;
  -- 비밀글이 아니면 그대로 반환
  if coalesce(v_row.is_secret, false) = false then
    return jsonb_build_object('content', v_row.content, 'answer_content', v_row.answer_content);
  end if;
  -- 해시 비교 (평문 저장 금지)
  if v_row.password is not null
     and v_row.password = extensions.crypt(p_password, v_row.password) then
    return jsonb_build_object('content', v_row.content, 'answer_content', v_row.answer_content);
  end if;
  return null;
end $$;

-- RPC 실행 권한
grant execute on function public.qna_list() to anon, authenticated;
grant execute on function public.qna_create(text, text, text, text, boolean, text) to authenticated;
grant execute on function public.qna_unlock(text, text) to anon, authenticated;

-- ── 7. Storage: 이미지 버킷 읽기 공개, 쓰기는 관리자만 (SEC-08 일부) ──
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;

create policy storage_public_read on storage.objects for select
  using (bucket_id in ('product-images', 'banner-images'));
create policy storage_admin_insert on storage.objects for insert
  with check (bucket_id in ('product-images', 'banner-images') and public.is_admin());
create policy storage_admin_update on storage.objects for update
  using (bucket_id in ('product-images', 'banner-images') and public.is_admin())
  with check (bucket_id in ('product-images', 'banner-images') and public.is_admin());
create policy storage_admin_delete on storage.objects for delete
  using (bucket_id in ('product-images', 'banner-images') and public.is_admin());

-- ── 8. 기존 비밀글 평문 비밀번호 정리 (현재 운영 데이터 0건이지만 안전장치) ──
update public.qna
set password = extensions.crypt(password, extensions.gen_salt('bf'))
where coalesce(is_secret, false) = true
  and password is not null
  and password not like '$2%'; -- 이미 bcrypt 해시면 건너뜀
