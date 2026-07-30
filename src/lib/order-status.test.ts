import { describe, it, expect } from "vitest";
import {
  canTransition,
  isAdminSimpleTransition,
  isCancelable,
  ADMIN_SIMPLE_STATUSES,
} from "./order-status";
import { OrderStatus } from "@/types/order";

describe("주문 상태 머신", () => {
  it("정상 전이를 허용한다", () => {
    expect(canTransition("결제대기", "결제완료")).toBe(true);
    expect(canTransition("결제대기", "만료")).toBe(true);
    expect(canTransition("결제완료", "배송준비")).toBe(true);
    expect(canTransition("결제완료", "취소처리중")).toBe(true);
    expect(canTransition("배송준비", "배송중")).toBe(true);
    expect(canTransition("배송중", "배송완료")).toBe(true);
    expect(canTransition("취소처리중", "취소")).toBe(true);
    expect(canTransition("취소처리중", "환불확인필요")).toBe(true);
    expect(canTransition("환불확인필요", "취소")).toBe(true);
  });

  it("허용되지 않은 전이를 거부한다", () => {
    // 결제 확정 없이 임의로 결제완료로 만들 수 없는 상태들
    expect(canTransition("취소", "결제완료")).toBe(false);
    expect(canTransition("만료", "결제완료")).toBe(false);
    expect(canTransition("배송완료", "결제완료")).toBe(false);
    // 배송 중에는 단순 취소 불가 (교환/반품 절차)
    expect(canTransition("배송중", "취소")).toBe(false);
    expect(canTransition("배송중", "취소처리중")).toBe(false);
    // 최종 상태에서는 전이 불가
    expect(canTransition("취소", "배송준비")).toBe(false);
    expect(canTransition("만료", "결제대기")).toBe(false);
    // 결제대기에서 배송 상태로 건너뛰기 불가
    expect(canTransition("결제대기", "배송준비")).toBe(false);
    expect(canTransition("결제대기", "배송완료")).toBe(false);
  });

  it("관리자 단순 상태 변경은 배송 관련 전이만 허용한다", () => {
    expect(isAdminSimpleTransition("결제완료", "배송준비")).toBe(true);
    expect(isAdminSimpleTransition("배송준비", "배송중")).toBe(true);
    expect(isAdminSimpleTransition("배송중", "배송완료")).toBe(true);
    expect(isAdminSimpleTransition("배송완료", "교환/반품")).toBe(true);

    // 결제/취소 상태는 단순 변경 API로 만들 수 없다
    const forbidden: OrderStatus[] = ["결제완료", "취소", "취소처리중", "환불확인필요", "만료", "결제대기"];
    for (const to of forbidden) {
      expect(ADMIN_SIMPLE_STATUSES.includes(to)).toBe(false);
    }
    // 순서 건너뛰기 불가
    expect(isAdminSimpleTransition("결제완료", "배송완료")).toBe(false);
    expect(isAdminSimpleTransition("결제대기", "배송준비")).toBe(false);
    expect(isAdminSimpleTransition("취소", "배송준비")).toBe(false);
  });

  it("취소 가능 상태를 정확히 판정한다", () => {
    expect(isCancelable("결제대기")).toBe(true);
    expect(isCancelable("결제완료")).toBe(true);
    expect(isCancelable("배송준비")).toBe(true);
    expect(isCancelable("취소처리중")).toBe(true);
    expect(isCancelable("환불확인필요")).toBe(true);

    expect(isCancelable("배송중")).toBe(false);
    expect(isCancelable("배송완료")).toBe(false);
    expect(isCancelable("취소")).toBe(false);
    expect(isCancelable("만료")).toBe(false);
  });
});
