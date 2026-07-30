import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import {
  tossConfirm,
  tossCancel,
  tossGetPaymentByOrderId,
  validateApprovedPayment,
  mapTossMethod,
  isValidPaymentKey,
  isValidOrderId,
  isUnsettledConfirmError,
  TossTimeoutError,
  TossPayment,
} from "@/lib/toss";
import { hitRateLimit, clientIp, readJsonLimited } from "@/lib/rate-limit";
import { logPaymentEvent } from "@/lib/payment-events";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * 결제 승인 API.
 *
 * 안전장치:
 *  - 로그인 세션 + 주문 소유자 검증
 *  - 입력 형식/길이 제한, 요청 본문 크기 제한
 *  - 승인 금액은 DB에 저장된 주문 금액만 사용 (클라이언트 금액은 비교용)
 *  - 주문별 저장된 멱등키(confirm_key)로 토스 승인 호출
 *  - 같은 주문의 동시 confirm은 DB claim으로 한 요청만 토스를 호출
 *  - timeout/네트워크 오류 시 실패 단정 대신 결제 조회로 상태 확인
 *  - 승인 응답의 orderId/paymentKey/금액/통화/상태/결제수단 검증 (가상계좌 미지원)
 *  - DB 확정 실패 시 자동 취소를 시도하되, 취소 "성공을 확인"한 경우에만 취소로 안내
 *    확인 불가면 환불확인필요(RECONCILIATION_REQUIRED)로 보존
 */
export async function POST(req: NextRequest) {
  const body = await readJsonLimited<{ paymentKey?: unknown; orderId?: unknown; amount?: unknown }>(req, 4 * 1024);
  if (!body) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { paymentKey, orderId } = body;
  const clientAmount = Number(body.amount);
  if (!isValidPaymentKey(paymentKey) || !isValidOrderId(orderId) || !Number.isInteger(clientAmount) || clientAmount < 0) {
    return NextResponse.json({ error: "필수 값이 누락되었거나 형식이 잘못되었습니다." }, { status: 400 });
  }

  // 로그인 세션 검증
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 설정 오류입니다. 관리자에게 문의해주세요." }, { status: 500 });
  }

  // rate limit: 사용자 / IP / 주문 기준
  const ip = clientIp(req);
  const [byUser, byIp, byOrder] = await Promise.all([
    hitRateLimit(admin, `confirm:u:${user.id}`, 10, 60),
    hitRateLimit(admin, `confirm:ip:${ip}`, 30, 60),
    hitRateLimit(admin, `confirm:o:${orderId}`, 8, 60),
  ]);
  if (!byUser || !byIp || !byOrder) {
    return NextResponse.json({ error: "요청이 너무 잦습니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
  }

  // 주문 조회 + 소유자 검증
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, status, total, payment_key, confirm_key")
    .eq("id", orderId)
    .single();

  if (!order || order.user_id !== user.id) {
    // 존재 여부를 구분해서 알려주지 않는다 (주문번호 탐색 방지)
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }

  // 이미 같은 결제로 확정됨 → 성공 (새로고침/중복 호출 안전)
  if (order.status === "결제완료" && order.payment_key === paymentKey) {
    return NextResponse.json({ ok: true, orderId });
  }
  if (order.status !== "결제대기") {
    return NextResponse.json({ error: "결제할 수 없는 주문 상태입니다." }, { status: 409 });
  }
  if (order.total !== clientAmount) {
    return NextResponse.json({ error: "결제 금액이 주문 금액과 일치하지 않습니다." }, { status: 400 });
  }

  // 동시 confirm 단일화: claim을 얻은 요청만 토스 승인을 호출한다
  const { data: claim } = await admin.rpc("claim_order_confirm", { p_order_id: orderId });
  if (!claim?.ok) {
    return NextResponse.json(
      { error: "결제 확인이 진행 중입니다. 잠시 후 주문 내역을 확인해주세요." },
      { status: 409 }
    );
  }
  const confirmKey: string = claim.confirm_key;
  const serverAmount: number = claim.total;

  // 토스 승인 호출 (저장된 주문 금액 + 저장된 멱등키 + timeout)
  let payment: TossPayment;
  try {
    const res = await tossConfirm({
      paymentKey,
      orderId,
      amount: serverAmount,
      idempotencyKey: confirmKey,
    });

    if (!res.ok && !isUnsettledConfirmError(res.status, res.data.code)) {
      // 토스가 명시적으로 거절 (카드 한도 등) — 과금되지 않은 확정 실패.
      // claim을 해제하고 멱등키를 회전해 사용자가 새 결제로 재시도할 수 있게 한다.
      await logPaymentEvent(admin, {
        orderId, eventType: "confirm_fail", httpStatus: res.status,
        detail: { code: res.data.code },
      });
      await admin.rpc("release_order_confirm", { p_order_id: orderId, p_payment_status: "READY" });
      return NextResponse.json(
        { error: res.data.message || "결제 승인에 실패했습니다.", code: res.data.code },
        { status: 402 }
      );
    }

    if (!res.ok) {
      // 토스 5xx 또는 "처리 중/이미 처리됨" 계열 (IDEMPOTENT_REQUEST_PROCESSING 등)
      // — 승인 여부 불명확. 확정 실패로 오판하면 지연된 첫 승인과 새 결제가 겹쳐
      // 중복 과금될 수 있으므로, claim과 멱등키를 유지한 채 조회로 확인한다.
      const recovered = await recoverPaymentState(orderId);
      if (!recovered) {
        // 불명확 상태 유지: claim(IN_PROGRESS)을 풀지 않는다.
        // 만료 배치가 건드리지 못하게 하고, 대사 크론이 토스 조회로 판정한다.
        // 사용자 재시도(90초 후 claim 승계)는 같은 멱등키로 이어받는다.
        await logPaymentEvent(admin, {
          orderId, eventType: "confirm_unclear", httpStatus: res.status,
          detail: { code: res.data.code },
        });
        return NextResponse.json(
          { error: "결제 승인 결과를 확인하지 못했습니다. 잠시 후 주문 내역에서 결제 상태를 확인해주세요.", pending: true },
          { status: 502 }
        );
      }
      payment = recovered;
    } else {
      payment = res.data;
    }
  } catch (e) {
    // timeout/네트워크 단절: 실패로 단정하지 말고 조회로 실제 상태 확인
    const recovered = await recoverPaymentState(orderId);
    if (recovered) {
      payment = recovered;
    } else {
      // 불명확 상태 유지: claim(IN_PROGRESS)을 풀지 않는다 → 만료 대상에서 제외,
      // 90초 후 사용자 재시도(claim 승계, 같은 멱등키) 또는 대사 크론이 판정.
      await logPaymentEvent(admin, {
        orderId, eventType: "confirm_unclear",
        detail: { reason: e instanceof TossTimeoutError ? "timeout" : "network" },
      });
      return NextResponse.json(
        { error: "결제 승인 결과를 확인하지 못했습니다. 잠시 후 주문 내역에서 결제 상태를 확인해주세요.", pending: true },
        { status: 502 }
      );
    }
  }

  // 승인 응답 검증 (금액/통화/상태/결제수단, 가상계좌 미지원)
  const invalid = validateApprovedPayment(payment, { paymentKey, orderId, amount: serverAmount });
  if (invalid) {
    await logPaymentEvent(admin, {
      orderId, eventType: "confirm_invalid_response", tossStatus: payment.status,
      detail: { reason: invalid },
    });
    // 승인이 이루어진 결제라면 취소를 시도한다 (가상계좌 발급 포함)
    const canceled = await cancelWithVerify(admin, orderId, paymentKey, `승인 응답 검증 실패 (${invalid})`);
    if (canceled) {
      await admin.rpc("release_order_confirm", { p_order_id: orderId, p_payment_status: "ABORTED" });
      const msg = invalid === "VIRTUAL_ACCOUNT_NOT_SUPPORTED"
        ? "가상계좌 결제는 지원하지 않습니다. 다른 결제수단을 이용해주세요."
        : "결제 검증에 실패하여 결제가 취소되었습니다.";
      return NextResponse.json({ error: msg, refunded: true }, { status: 409 });
    }
    await markReconciliationRequired(admin, orderId, `검증 실패 후 취소 미확인 (${invalid})`, paymentKey);
    return NextResponse.json(
      { error: "결제 상태 확인이 필요합니다. 고객센터로 문의해주세요.", pending: true },
      { status: 500 }
    );
  }

  // 주문 확정 (상태 변경 + 포인트 차감 + 재고 차감 — 하나의 트랜잭션)
  const { data: result, error: rpcError } = await admin.rpc("finalize_order_payment_v2", {
    p_order_id: orderId,
    p_payment_key: paymentKey,
    p_payment_method: mapTossMethod(payment),
    p_toss_status: payment.status,
  });

  if (rpcError || !result?.ok) {
    const code = result?.code || rpcError?.message || "UNKNOWN";
    console.error("finalize failed:", code);
    await logPaymentEvent(admin, { orderId, eventType: "finalize_fail", detail: { code } });

    // 결제는 승인됐는데 주문 확정 실패 → 자동 취소 시도. 취소 성공을 "확인"한 경우에만 취소 안내.
    const canceled = await cancelWithVerify(admin, orderId, paymentKey, `주문 확정 실패 (${code})`);
    if (canceled) {
      await admin
        .from("orders")
        .update({ status: "취소", payment_status: "CANCELED", canceled_at: new Date().toISOString(), cancel_reason: `주문 확정 실패 (${code})`, confirm_claimed_at: null })
        .eq("id", orderId)
        .eq("status", "결제대기");
      const message =
        code === "NOT_ENOUGH_STOCK"
          ? "재고가 부족하여 결제가 취소되었습니다."
          : code === "NOT_ENOUGH_POINTS"
          ? "포인트 잔액이 부족하여 결제가 취소되었습니다."
          : "주문 확정에 실패하여 결제가 취소되었습니다.";
      return NextResponse.json({ error: message, refunded: true }, { status: 409 });
    }

    // 취소까지 실패/불명확 → 임의로 "취소 완료" 안내하지 않고 대사 대상으로 보존
    await markReconciliationRequired(admin, orderId, `확정 실패 후 취소 미확인 (${code})`, paymentKey);
    return NextResponse.json(
      { error: "결제 처리 중 문제가 발생했습니다. 결제 상태를 확인 중이니 고객센터로 문의해주세요.", pending: true },
      { status: 500 }
    );
  }

  await logPaymentEvent(admin, {
    orderId, eventType: "confirm_ok", tossStatus: payment.status,
    detail: { method: payment.method },
  });
  return NextResponse.json({ ok: true, orderId });
}

/** timeout 등으로 승인 결과가 불명확할 때 조회 API로 실제 상태 확인 */
async function recoverPaymentState(orderId: string): Promise<TossPayment | null> {
  try {
    const res = await tossGetPaymentByOrderId(orderId);
    if (res.ok && res.data.status === "DONE") return res.data;
    return null;
  } catch {
    return null;
  }
}

/**
 * 토스 취소 호출 + 성공 확인.
 * HTTP 응답과 취소 후 상태(CANCELED)까지 확인된 경우에만 true.
 * 이미 취소된 결제(ALREADY_CANCELED_PAYMENT)도 true.
 */
async function cancelWithVerify(
  admin: SupabaseClient,
  orderId: string,
  paymentKey: string,
  reason: string
): Promise<boolean> {
  const { data: cancelKey } = await admin.rpc("ensure_cancel_key", { p_order_id: orderId });
  await logPaymentEvent(admin, { orderId, eventType: "cancel_request", detail: { reason } });

  try {
    const res = await tossCancel({
      paymentKey,
      cancelReason: reason,
      idempotencyKey: cancelKey || `${orderId}-cancel`,
    });
    // 전액 취소(CANCELED)만 성공으로 인정한다. PARTIAL_CANCELED는 일부 금액이
    // 남아 있다는 뜻이므로 자동으로 "취소 완료" 처리하지 않는다 (대사/운영자 확인).
    if (res.ok && res.data.status === "CANCELED") {
      await logPaymentEvent(admin, { orderId, eventType: "cancel_ok", tossStatus: res.data.status });
      return true;
    }
    if (!res.ok && res.data.code === "ALREADY_CANCELED_PAYMENT") {
      await logPaymentEvent(admin, { orderId, eventType: "cancel_ok", detail: { code: res.data.code } });
      return true;
    }
    await logPaymentEvent(admin, {
      orderId, eventType: "cancel_fail", httpStatus: res.status,
      tossStatus: res.data.status, detail: { code: res.data.code },
    });
    return false;
  } catch (e) {
    await logPaymentEvent(admin, {
      orderId, eventType: "cancel_fail",
      detail: { reason: e instanceof TossTimeoutError ? "timeout" : "network" },
    });
    return false;
  }
}

/**
 * 취소 확인 불가 시 대사 필요 상태로 보존.
 * paymentKey를 반드시 저장한다 — 이 값이 없으면 관리자 취소가
 * "결제 이력 없음"으로 오판해 토스 환불 없이 내부 취소할 수 있다.
 */
async function markReconciliationRequired(
  admin: SupabaseClient,
  orderId: string,
  reason: string,
  paymentKey?: string
) {
  await admin
    .from("orders")
    .update({
      status: "환불확인필요",
      payment_status: "RECONCILIATION_REQUIRED",
      ...(paymentKey ? { payment_key: paymentKey } : {}),
      cancel_reason: reason.slice(0, 200),
      confirm_claimed_at: null,
    })
    .eq("id", orderId)
    .in("status", ["결제대기", "환불확인필요"]);
  await logPaymentEvent(admin, {
    orderId, eventType: "reconciliation_required",
    // paymentKey는 취소/조회에 쓰이는 운영 식별자 — 로그에는 끝 6자리만 남긴다
    detail: { reason, paymentKeyTail: paymentKey ? paymentKey.slice(-6) : null },
  });
}
