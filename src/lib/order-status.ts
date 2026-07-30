import { OrderStatus } from "@/types/order";

/**
 * 주문 상태 머신 (서버 검증용).
 *
 * 주문 상태(한글)와 결제 상태(payment_status, 영문)는 분리해서 다룬다.
 * 여기서는 주문 상태 전이만 정의한다. 결제와 얽힌 전이(결제완료, 취소)는
 * 반드시 전용 API(결제 승인 / 취소)를 거쳐야 하며, 단순 상태 변경 API로는 불가능하다.
 */

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  // 취소처리중: 토스 승인은 됐는데 내부 미확정인 주문을 관리자가 취소하는 경로
  결제대기: ["결제완료", "만료", "취소", "취소처리중"],
  결제완료: ["배송준비", "취소처리중"],
  배송준비: ["배송중", "취소처리중"],
  배송중: ["배송완료"],
  배송완료: ["교환/반품"],
  취소처리중: ["취소", "환불확인필요"],
  환불확인필요: ["취소", "결제완료"],
  취소: [],
  만료: [],
  "교환/반품": [],
};

/** 해당 전이가 허용되는지 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return (TRANSITIONS[from] ?? []).includes(to);
}

/**
 * 관리자 "단순 상태 변경" API에서 허용하는 목적지 상태.
 * 결제/환불 정합성이 걸린 상태는 제외한다:
 *  - 결제완료: 결제 승인 API만 가능
 *  - 취소/취소처리중/환불확인필요: 취소 API만 가능
 *  - 만료: 만료 배치만 가능
 */
export const ADMIN_SIMPLE_STATUSES: OrderStatus[] = [
  "배송준비",
  "배송중",
  "배송완료",
  "교환/반품",
];

export function isAdminSimpleTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ADMIN_SIMPLE_STATUSES.includes(to) && canTransition(from, to);
}

/** 취소 API가 취소 절차를 시작할 수 있는 상태 */
export const CANCELABLE_STATUSES: OrderStatus[] = [
  "결제대기",
  "결제완료",
  "배송준비",
  "취소처리중",
  "환불확인필요",
];

export function isCancelable(status: OrderStatus): boolean {
  return CANCELABLE_STATUSES.includes(status);
}
