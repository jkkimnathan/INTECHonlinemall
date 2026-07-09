-- ============================================================
-- 리뷰: 실구매자만 작성 가능 정책 켜기
-- Supabase Dashboard → SQL Editor에서 1회 실행
-- 선행: security_migration.sql (reviews 테이블 RLS + reviews_insert_own 존재)
--
-- 효과: 로그인 + 본인 + "취소 아닌 주문에 해당 상품이 포함된" 사용자만 리뷰 작성 가능.
--       (읽기/삭제 정책은 기존 그대로 유지 — 이 파일은 insert 정책만 교체)
-- 안전성: 실제 주문 items 구조 [{ "product": { "id": ... }, ... }] 와 containment(@>)
--         매칭이 라이브 데이터에서 정상 동작함을 확인함(2026-07-09).
-- ============================================================

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
