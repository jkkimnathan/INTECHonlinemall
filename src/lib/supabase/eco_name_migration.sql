-- ============================================================
-- 상품 ECO명 (ERP 품목명) 컬럼 추가
-- 실행: Supabase SQL Editor 에서 1회
-- ============================================================

-- 관리자 전용 필드. ERP(이카운트 등)의 품목명과 몰 상품을 대조하기 위한 값으로,
-- 고객 화면에는 노출하지 않는다. 관리자 상품 목록 검색에 포함된다.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS eco_name text;

COMMENT ON COLUMN public.products.eco_name IS
  'ERP(ECO) 품목명 — 관리자 전용, 고객 화면 미노출. 상품 목록 검색 대상';

CREATE INDEX IF NOT EXISTS products_eco_name_idx
  ON public.products (eco_name);
