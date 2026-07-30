import { describe, it, expect } from "vitest";
import {
  validateApprovedPayment,
  mapTossMethod,
  isValidPaymentKey,
  isValidOrderId,
  TossPayment,
} from "./toss";

const base: TossPayment = {
  paymentKey: "pk_abc123",
  orderId: "ORD-11111111-2222-3333-4444-555555555555",
  status: "DONE",
  totalAmount: 612980,
  currency: "KRW",
  method: "카드",
};

const expected = {
  paymentKey: base.paymentKey,
  orderId: base.orderId,
  amount: base.totalAmount,
};

describe("승인 응답 검증", () => {
  it("정상 승인 응답을 통과시킨다", () => {
    expect(validateApprovedPayment(base, expected)).toBeNull();
  });

  it("금액이 다르면 거부한다 (클라이언트 금액 조작 방어)", () => {
    expect(validateApprovedPayment({ ...base, totalAmount: 1 }, expected)).toBe("AMOUNT_MISMATCH");
    expect(validateApprovedPayment(base, { ...expected, amount: 999999999 })).toBe("AMOUNT_MISMATCH");
  });

  it("주문번호/결제키가 다르면 거부한다", () => {
    expect(validateApprovedPayment({ ...base, orderId: "ORD-other" }, expected)).toBe("ORDER_ID_MISMATCH");
    expect(validateApprovedPayment({ ...base, paymentKey: "pk_other" }, expected)).toBe("PAYMENT_KEY_MISMATCH");
  });

  it("KRW가 아니면 거부한다", () => {
    expect(validateApprovedPayment({ ...base, currency: "USD" }, expected)).toBe("CURRENCY_NOT_KRW");
  });

  it("가상계좌(WAITING_FOR_DEPOSIT)를 결제완료로 취급하지 않는다", () => {
    expect(validateApprovedPayment({ ...base, status: "WAITING_FOR_DEPOSIT" }, expected))
      .toBe("VIRTUAL_ACCOUNT_NOT_SUPPORTED");
    expect(validateApprovedPayment({ ...base, method: "가상계좌" }, expected))
      .toBe("VIRTUAL_ACCOUNT_NOT_SUPPORTED");
  });

  it("DONE이 아닌 상태를 거부한다", () => {
    expect(validateApprovedPayment({ ...base, status: "CANCELED" }, expected)).toBe("STATUS_NOT_DONE:CANCELED");
    expect(validateApprovedPayment({ ...base, status: "IN_PROGRESS" }, expected)).toBe("STATUS_NOT_DONE:IN_PROGRESS");
  });

  it("허용 목록 밖의 결제수단을 거부한다", () => {
    expect(validateApprovedPayment({ ...base, method: "상품권" }, expected)).toBe("METHOD_NOT_ALLOWED:상품권");
  });
});

describe("입력 형식 검증", () => {
  it("paymentKey 형식", () => {
    expect(isValidPaymentKey("tviva20260730abcDEF_-123")).toBe(true);
    expect(isValidPaymentKey("")).toBe(false);
    expect(isValidPaymentKey("has space")).toBe(false);
    expect(isValidPaymentKey("한글키")).toBe(false);
    expect(isValidPaymentKey("a".repeat(201))).toBe(false);
    expect(isValidPaymentKey(123)).toBe(false);
    expect(isValidPaymentKey(null)).toBe(false);
  });

  it("orderId 형식", () => {
    expect(isValidOrderId("ORD-11111111-2222-3333-4444-555555555555")).toBe(true);
    expect(isValidOrderId("ORD-abc")).toBe(true);
    expect(isValidOrderId("XXX-abc")).toBe(false);
    expect(isValidOrderId("ORD-" + "a".repeat(100))).toBe(false);
    expect(isValidOrderId("ORD-abc; drop table")).toBe(false);
    expect(isValidOrderId(undefined)).toBe(false);
  });
});

describe("결제수단 매핑", () => {
  it("기본 수단", () => {
    expect(mapTossMethod({ method: "카드" })).toBe("card");
    expect(mapTossMethod({ method: "계좌이체" })).toBe("transfer");
    expect(mapTossMethod({ method: "가상계좌" })).toBe("virtual");
  });
  it("간편결제 provider", () => {
    expect(mapTossMethod({ method: "간편결제", easyPay: { provider: "카카오페이" } })).toBe("kakaopay");
    expect(mapTossMethod({ method: "간편결제", easyPay: { provider: "네이버페이" } })).toBe("naverpay");
    expect(mapTossMethod({ method: "간편결제", easyPay: { provider: "토스페이" } })).toBe("tosspay");
    expect(mapTossMethod({ method: "간편결제" })).toBe("card");
  });
});
