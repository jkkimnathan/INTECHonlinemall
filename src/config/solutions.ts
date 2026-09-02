/**
 * AI 솔루션 전용관 설정
 *
 * 전용관 제품은 직접 구매가 아닌 "견적 요청" 방식으로 판매한다.
 * 견적은 인텍 B2B몰(ipcb2bmall.com)에서 처리하며, 도메인은 환경변수로 교체 가능.
 */
export const B2B_QUOTE_BASE =
  process.env.NEXT_PUBLIC_B2B_QUOTE_URL || "https://ipcb2bmall.com";

// B2B몰의 거래처 견적 요청(RFQ) 화면. ?product= 로 전용관 상품을 넘기면 폼이 프리필된다.
// 비로그인 시 B2B몰 로그인 → 동일 URL로 복귀.
export const solutions = {
  "proart-gr1x": {
    name: "ASUS ProArt GR1X",
    quoteUrl: `${B2B_QUOTE_BASE}/dealer/quotes/new?product=proart-gr1x`,
  },
  "arc-pro-b70": {
    name: "Intel Arc Pro B70 32GB",
    quoteUrl: `${B2B_QUOTE_BASE}/dealer/quotes/new?product=arc-pro-b70`,
  },
} as const;

export type SolutionSlug = keyof typeof solutions;

/** ProArt GR1X 견적 요청 링크 */
export const QUOTE_URL = solutions["proart-gr1x"].quoteUrl;

/** 출시 시 CMS/상수만 교체하면 되도록 분리 */
export const PROART_GR1X_PRICE_LABEL = "가격 미정";
export const PROART_GR1X_CTA_LABEL = "견적 요청";

/** Intel Arc Pro B70 견적 요청 링크 */
export const ARC_PRO_B70_QUOTE_URL = solutions["arc-pro-b70"].quoteUrl;

/** B70 라인업 가격은 확정 전까지 "가격 문의" — 상수/CMS 교체 지점 */
export const ARC_PRO_B70_PRICE_LABEL = "가격 문의";
export const ARC_PRO_B70_CTA_LABEL = "견적 요청";
