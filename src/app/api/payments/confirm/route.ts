import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

const TOSS_API = "https://api.tosspayments.com/v1/payments";

function tossAuthHeader(): string {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) throw new Error("TOSS_SECRET_KEY가 설정되지 않았습니다 (.env.local 확인)");
  return `Basic ${Buffer.from(`${secret}:`).toString("base64")}`;
}

/** 토스 응답의 결제수단을 기존 payment_method 값으로 변환 */
function mapMethod(toss: { method?: string; easyPay?: { provider?: string } }): string {
  switch (toss.method) {
    case "카드": return "card";
    case "계좌이체": return "transfer";
    case "가상계좌": return "virtual";
    case "간편결제": {
      const provider = toss.easyPay?.provider || "";
      if (provider.includes("카카오")) return "kakaopay";
      if (provider.includes("네이버")) return "naverpay";
      if (provider.includes("토스")) return "tosspay";
      return "card";
    }
    default: return "card";
  }
}

/**
 * 결제 승인: 결제대기 주문의 금액과 대조한 뒤 토스 승인 API를 호출하고,
 * 성공한 경우에만 주문을 결제완료로 확정한다 (포인트·재고 차감 포함).
 */
export async function POST(req: NextRequest) {
  let body: { paymentKey?: string; orderId?: string; amount?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { paymentKey, orderId } = body;
  const amount = Number(body.amount);
  if (!paymentKey || !orderId || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "필수 값이 누락되었습니다." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
    tossAuthHeader();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 설정 오류입니다. 관리자에게 문의해주세요." }, { status: 500 });
  }

  // 1. 결제대기 주문 조회 + 금액 대조 (조작 방어의 핵심)
  const { data: order } = await admin
    .from("orders")
    .select("id, status, total, payment_key")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }
  // 같은 결제로 이미 확정됨 → 성공 응답 (새로고침 등 중복 호출 안전)
  if (order.status === "결제완료" && order.payment_key === paymentKey) {
    return NextResponse.json({ ok: true, orderId });
  }
  if (order.status !== "결제대기") {
    return NextResponse.json({ error: "결제할 수 없는 주문 상태입니다." }, { status: 409 });
  }
  if (order.total !== amount) {
    return NextResponse.json({ error: "결제 금액이 주문 금액과 일치하지 않습니다." }, { status: 400 });
  }

  // 2. 토스 승인 API 호출 (서버 → 토스, 시크릿 키 사용)
  const confirmRes = await fetch(`${TOSS_API}/confirm`, {
    method: "POST",
    headers: { Authorization: tossAuthHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const confirmData = await confirmRes.json();

  if (!confirmRes.ok) {
    console.error("toss confirm failed:", confirmData);
    return NextResponse.json(
      { error: confirmData.message || "결제 승인에 실패했습니다.", code: confirmData.code },
      { status: 402 }
    );
  }

  // 3. 주문 확정 (하나의 트랜잭션: 상태 변경 + 포인트 차감 + 재고 차감)
  const { data: result, error: rpcError } = await admin.rpc("finalize_order_payment", {
    p_order_id: orderId,
    p_payment_key: paymentKey,
    p_payment_method: mapMethod(confirmData),
  });

  if (rpcError || !result?.ok) {
    const code = result?.code || rpcError?.message || "UNKNOWN";
    console.error("finalize failed, canceling payment:", code);

    // 결제는 됐는데 주문 확정이 실패한 경우 → 토스 결제를 자동 취소해 돈이 빠져나가지 않게 한다
    try {
      await fetch(`${TOSS_API}/${paymentKey}/cancel`, {
        method: "POST",
        headers: { Authorization: tossAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason: `주문 확정 실패 (${code})` }),
      });
    } catch (cancelErr) {
      console.error("toss auto-cancel failed:", cancelErr);
    }

    const message =
      code === "NOT_ENOUGH_STOCK"
        ? "재고가 부족하여 결제가 취소되었습니다."
        : code === "NOT_ENOUGH_POINTS"
        ? "포인트 잔액이 부족하여 결제가 취소되었습니다."
        : "주문 확정에 실패하여 결제가 취소되었습니다.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  return NextResponse.json({ ok: true, orderId });
}
