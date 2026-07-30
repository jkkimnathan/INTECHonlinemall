/**
 * 주문 금액/수량 공통 로직 (서버·클라이언트·테스트 공용, 부수효과 없음)
 */

/** 토스 결제 최소 금액. 결제수단별 계약 금액이 다르면 운영자가 조정한다. */
export const MIN_PAYMENT_AMOUNT = 100;

export const FREE_SHIPPING_THRESHOLD = 50000;
export const SHIPPING_FEE = 3000;

/** 같은 상품이 여러 줄로 들어와도 상품 ID 기준으로 수량을 합산한다 */
export function aggregateQuantities(
  items: { productId: string; quantity: number }[]
): Map<string, number> {
  const byProduct = new Map<string, number>();
  for (const item of items) {
    byProduct.set(item.productId, (byProduct.get(item.productId) || 0) + item.quantity);
  }
  return byProduct;
}

/**
 * 결제 금액 경계 판정:
 *  - ZERO: 0원(전액 포인트) → 토스 없이 서버 전용 완료 흐름
 *  - BELOW_MIN: 0원 초과 최소금액 미만 → 포인트 사용량 조정 안내
 *  - PAYABLE: 토스 결제 진행
 */
export function evaluatePayableAmount(total: number): "ZERO" | "BELOW_MIN" | "PAYABLE" {
  if (!Number.isInteger(total) || total < 0) return "BELOW_MIN";
  if (total === 0) return "ZERO";
  if (total < MIN_PAYMENT_AMOUNT) return "BELOW_MIN";
  return "PAYABLE";
}

/** 배송비 계산 (서버 기준과 동일) */
export function calcShippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
