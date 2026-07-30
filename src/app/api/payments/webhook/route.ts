import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { tossGetPayment, isValidPaymentKey, isValidOrderId } from "@/lib/toss";
import { applyVerifiedPaymentState } from "@/lib/payment-reconcile";
import { logPaymentEvent } from "@/lib/payment-events";
import { hitRateLimit, clientIp, readJsonLimited } from "@/lib/rate-limit";

/**
 * 토스 웹훅 수신 (PAYMENT_STATUS_CHANGED).
 *
 * 신뢰 원칙: 일반 결제 웹훅에는 서명 헤더가 없으므로 본문을 신뢰하지 않는다.
 * 본문의 paymentKey로 토스 결제 조회 API를 다시 호출해 검증된 상태만 반영한다.
 *
 * 멱등성/재시도 (토스는 실패 시 최대 7회 재전송):
 *  1. transmission ID를 unique insert로 "수신 claim"한다.
 *  2. 처리(조회+반영)가 성공하면 claim을 유지 → 이후 재전송은 중복으로 즉시 200.
 *  3. 일시 오류(조회 실패, DB 오류)면 claim을 삭제하고 500을 반환 →
 *     토스 재전송이 다시 처리한다. (처리 전에 완료 확정하지 않는다)
 *  4. 처리 도중 프로세스가 죽으면 claim이 남는 극단 케이스는 대사 크론이 백스톱.
 *
 * 증폭 방어: IP+전역 rate limit, transmission ID 필수, 알려진 이벤트/형식만,
 * 그리고 토스 조회 전에 주문이 실제 존재하는지 DB에서 먼저 확인한다.
 */
export async function POST(req: NextRequest) {
  const body = await readJsonLimited<{
    eventType?: string;
    data?: { paymentKey?: string; orderId?: string; status?: string };
  }>(req, 64 * 1024);
  if (!body) {
    return NextResponse.json({ ok: true }); // 형식 불량 → 재시도 무의미, 200
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server config" }, { status: 500 });
  }

  // 증폭 방어 1: IP + 전역 rate limit (정상 웹훅에는 넉넉한 한도, fail-open)
  const [byIp, global] = await Promise.all([
    hitRateLimit(admin, `webhook:ip:${clientIp(req)}`, 240, 60),
    hitRateLimit(admin, "webhook:global", 1200, 60),
  ]);
  if (!byIp || !global) {
    return NextResponse.json({ ok: true });
  }

  const transmissionId = req.headers.get("tosspayments-webhook-transmission-id")?.slice(0, 128);
  const eventType = String(body.eventType || "").slice(0, 64);
  const paymentKey = body.data?.paymentKey;
  const orderId = body.data?.orderId;

  // 증폭 방어 2: 토스가 항상 보내는 transmission ID가 없으면 위조로 간주하고 무시
  const KNOWN_EVENTS = ["PAYMENT_STATUS_CHANGED", "DEPOSIT_CALLBACK", "CANCEL_STATUS_CHANGED"];
  if (!transmissionId || !KNOWN_EVENTS.includes(eventType) || !isValidPaymentKey(paymentKey) || !isValidOrderId(orderId)) {
    return NextResponse.json({ ok: true });
  }

  // 증폭 방어 3: 토스 조회(외부 API) 전에 주문 존재를 DB에서 먼저 확인
  const { data: orderRow } = await admin
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();
  if (!orderRow) {
    return NextResponse.json({ ok: true });
  }

  // 수신 claim: transmission ID unique insert. 이미 있으면 처리 완료된 전송 → 200.
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

  if (eventType !== "PAYMENT_STATUS_CHANGED") {
    // DEPOSIT_CALLBACK 등 — 가상계좌 미지원(선택 A)이므로 기록만 하고 종료
    return NextResponse.json({ ok: true });
  }

  // 처리: 조회 API로 재검증한 상태만 반영. 일시 오류면 claim을 풀고 500 → 토스 재전송.
  try {
    const res = await tossGetPayment(paymentKey);
    if (res.ok) {
      await applyVerifiedPaymentState(admin, orderId, res.data, "webhook");
      return NextResponse.json({ ok: true });
    }
    if (res.status === 404) {
      // 토스에 없는 결제 — 재시도해도 결과가 같으므로 완료 처리
      await logPaymentEvent(admin, {
        orderId, eventType: "webhook_payment_not_found", source: "webhook", httpStatus: res.status,
      });
      return NextResponse.json({ ok: true });
    }
    // 조회 일시 실패 → claim 해제 후 500 (토스가 재전송)
    await releaseClaim(admin, transmissionId);
    return NextResponse.json({ error: "verify failed, retry" }, { status: 500 });
  } catch (e) {
    console.error("webhook verify error:", e);
    await releaseClaim(admin, transmissionId);
    return NextResponse.json({ error: "transient error, retry" }, { status: 500 });
  }
}

/** 처리 실패 시 수신 claim(unique 로그)을 삭제해 토스 재전송이 다시 처리되게 한다 */
async function releaseClaim(admin: ReturnType<typeof createAdminClient>, transmissionId: string) {
  try {
    await admin.from("payment_events").delete().eq("transmission_id", transmissionId);
  } catch (e) {
    console.error("webhook claim release failed:", e);
  }
}
