import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { tossGetPayment, isValidPaymentKey, isValidOrderId } from "@/lib/toss";
import { applyVerifiedPaymentState } from "@/lib/payment-reconcile";
import { logPaymentEvent } from "@/lib/payment-events";
import { bodyTooLarge, hitRateLimit, clientIp } from "@/lib/rate-limit";

/**
 * 토스 웹훅 수신 (PAYMENT_STATUS_CHANGED).
 *
 * 일반 결제 웹훅에는 서명 헤더가 없으므로 본문을 신뢰하지 않는다.
 * 본문의 paymentKey로 토스 결제 조회 API를 다시 호출해 검증된 상태만 반영한다.
 *
 * 중복 방지: tosspayments-webhook-transmission-id를 payment_events에
 * unique로 저장 — 이미 처리한 전송이면 곧바로 200.
 *
 * 10초 안에 200을 응답해야 하므로 처리량은 최소화한다
 * (조회 1회 + 상태 반영, 무거운 작업은 대사 크론에 맡긴다).
 */
export async function POST(req: NextRequest) {
  if (bodyTooLarge(req, 64 * 1024)) {
    return NextResponse.json({ ok: true }); // 웹훅은 재시도 폭주를 막기 위해 200
  }

  let body: {
    eventType?: string;
    data?: { paymentKey?: string; orderId?: string; status?: string };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error(e);
    // 설정 오류는 500 → 토스가 재시도하도록
    return NextResponse.json({ error: "server config" }, { status: 500 });
  }

  // 무인증 공개 엔드포인트이므로 IP 기준 rate limit (정상 웹훅에는 넉넉한 한도)
  const allowed = await hitRateLimit(admin, `webhook:ip:${clientIp(req)}`, 240, 60);
  if (!allowed) {
    return NextResponse.json({ ok: true }); // 재시도 폭주 방지를 위해 200
  }

  const transmissionId = req.headers.get("tosspayments-webhook-transmission-id")?.slice(0, 128) || undefined;
  const eventType = String(body.eventType || "").slice(0, 64);
  const paymentKey = body.data?.paymentKey;
  const orderId = body.data?.orderId;

  // 형식이 유효한 이벤트만 DB에 기록한다 (스팸으로 인한 로그 폭증 방지)
  const KNOWN_EVENTS = ["PAYMENT_STATUS_CHANGED", "DEPOSIT_CALLBACK", "CANCEL_STATUS_CHANGED"];
  if (!KNOWN_EVENTS.includes(eventType) || !isValidPaymentKey(paymentKey) || !isValidOrderId(orderId)) {
    return NextResponse.json({ ok: true });
  }

  // 중복 웹훅 차단: transmission id를 unique 로그로 먼저 기록
  if (transmissionId) {
    const { duplicate } = await logPaymentEvent(admin, {
      orderId,
      eventType: `webhook:${eventType}`,
      source: "webhook",
      tossStatus: typeof body.data?.status === "string" ? body.data.status.slice(0, 40) : undefined,
      transmissionId,
    });
    if (duplicate) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  } else {
    await logPaymentEvent(admin, {
      orderId,
      eventType: `webhook:${eventType}`,
      source: "webhook",
      detail: { noTransmissionId: true },
    });
  }

  if (eventType !== "PAYMENT_STATUS_CHANGED") {
    // DEPOSIT_CALLBACK 등 — 가상계좌 미지원(선택 A)이므로 기록만 하고 종료
    return NextResponse.json({ ok: true });
  }

  // 웹훅 본문이 아니라 "조회 API로 재검증한 상태"만 신뢰한다
  try {
    const res = await tossGetPayment(paymentKey);
    if (!res.ok) {
      await logPaymentEvent(admin, {
        orderId, eventType: "webhook_verify_fail", source: "webhook", httpStatus: res.status,
      });
      return NextResponse.json({ ok: true });
    }
    await applyVerifiedPaymentState(admin, orderId, res.data, "webhook");
  } catch (e) {
    console.error("webhook verify error:", e);
    // 조회 실패 → 대사 크론이 다시 확인하므로 200으로 종료
  }

  return NextResponse.json({ ok: true });
}
