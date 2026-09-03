-- ============================================================
-- 상품 상세페이지 HTML 등록 (이미지 방식과 병행)
-- 실행: Supabase SQL Editor 에서 1회
-- ============================================================

-- 관리자 화면에서 붙여넣은 벤더 상세 HTML 원문을 저장한다.
-- 표시 시점에 서버에서 sanitize(script/iframe/이벤트 속성 제거) 후 렌더링하므로
-- 이 컬럼의 값을 그대로 브라우저에 내보내지 않는다. (src/lib/detail-html.server.ts)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS detail_html text;

COMMENT ON COLUMN public.products.detail_html IS
  '상세페이지 HTML 원문 (관리자 붙여넣기). 표시 시 서버에서 sanitize 후 렌더. detail_images 와 병행 — HTML 이 먼저, 이미지가 그 아래 표시됨';

-- 과도한 크기 방지 (벤더 상세 HTML 은 보통 수십 KB, 이미지 data URI 포함 시에도 2MB 이내)
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_detail_html_size;
ALTER TABLE public.products
  ADD CONSTRAINT products_detail_html_size
  CHECK (detail_html IS NULL OR length(detail_html) <= 2000000);
