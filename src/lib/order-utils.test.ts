import { describe, it, expect } from "vitest";
import {
  aggregateQuantities,
  evaluatePayableAmount,
  calcShippingFee,
  MIN_PAYMENT_AMOUNT,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
} from "./order-utils";

describe("상품 수량 합산", () => {
  it("같은 상품이 여러 줄이면 수량을 합산한다", () => {
    const result = aggregateQuantities([
      { productId: "p1", quantity: 2 },
      { productId: "p2", quantity: 1 },
      { productId: "p1", quantity: 3 },
      { productId: "p1", quantity: 1 },
    ]);
    expect(result.get("p1")).toBe(6);
    expect(result.get("p2")).toBe(1);
    expect(result.size).toBe(2);
  });

  it("빈 목록은 빈 결과", () => {
    expect(aggregateQuantities([]).size).toBe(0);
  });
});

describe("결제 금액 경계값", () => {
  it("0원은 서버 전용 완료 흐름(ZERO)", () => {
    expect(evaluatePayableAmount(0)).toBe("ZERO");
  });

  it("0원 초과 최소금액 미만은 BELOW_MIN", () => {
    expect(evaluatePayableAmount(1)).toBe("BELOW_MIN");
    expect(evaluatePayableAmount(MIN_PAYMENT_AMOUNT - 1)).toBe("BELOW_MIN");
  });

  it("최소금액 이상은 PAYABLE", () => {
    expect(evaluatePayableAmount(MIN_PAYMENT_AMOUNT)).toBe("PAYABLE");
    expect(evaluatePayableAmount(612980)).toBe("PAYABLE");
  });

  it("음수/비정수는 결제 불가", () => {
    expect(evaluatePayableAmount(-1)).toBe("BELOW_MIN");
    expect(evaluatePayableAmount(100.5)).toBe("BELOW_MIN");
    expect(evaluatePayableAmount(NaN)).toBe("BELOW_MIN");
  });
});

describe("배송비", () => {
  it("임계값 이상 무료", () => {
    expect(calcShippingFee(FREE_SHIPPING_THRESHOLD)).toBe(0);
    expect(calcShippingFee(FREE_SHIPPING_THRESHOLD + 1)).toBe(0);
  });
  it("임계값 미만 유료", () => {
    expect(calcShippingFee(FREE_SHIPPING_THRESHOLD - 1)).toBe(SHIPPING_FEE);
    expect(calcShippingFee(0)).toBe(SHIPPING_FEE);
  });
});
