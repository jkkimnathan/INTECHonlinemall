import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { tossCancel, tossGetPayment, tossGetPaymentByOrderId, TossTimeoutError, isValidOrderId } from "@/lib/toss";
import { isCancelable } from "@/lib/order-status";
import { logPaymentEvent } from "@/lib/payment-events";
import { readJsonLimited } from "@/lib/rate-limit";

/**
 * 관리자 주문 취소 API.
 *
 * 흐름:
 *  1) 관리자 JWT 검증
 *  2) 주문 상태가 취소 가능한지 확인 (상태 머신)
 *  3) 결제 이력이 없는 주문(결제대기/0원)은 토스 없이 내부 취소
 *  4) 결제된 주문은 먼저 '취소처리중'으로 표시 후 토스 취소 API 호출
 *     - 주문별 저장된 멱등키(cancel_key) 사용 → 중복 클릭에도 1회만 환불
 *  5) 토스 취소 "성공 확인" 후에만 포인트/재고 복구 + '취소' 확정
 *  6) 실패/불명확 시 '환불확인필요'로 보존 (임의로 취소 표시하지 않음)
 */
export async function POST(req: NextRequest) {
  const adminUser = await requireAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = await readJsonLimited<{ orderId?: unknown; reason?: unknown }>(req, 4 * 1024);
  if (!body) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const orderId = body.orderId;
  const reason = typeof body.reason === "string" ? body.reason.slice(0, 200) : "관리자 취소";
  if (!isValidOrderId(orderId)) {
    return NextResponse.json({ error: "주문번호 형식이 잘못되었습니다." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 500 });
  }

  const { data: order } = await admin
    .from("orders")
    .select("id, status, payment_status, payment_key, total, approved_at")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }
  if (order.status === "취소") {
    return NextResponse.json({ ok: true, orderId, status: "취소", already: true });
  }
  if (!isCancelable(order.status)) {
    return NextResponse.json(
      { error: `현재 상태(${order.status})에서는 취소할 수 없습니다.` },
      { status: 409 }
    );
  }

  await logPaymentEvent(admin, {
    orderId, eventType: "admin_cancel_request", source: "admin",
    detail: { by: adminUser.userId, from: order.status },
  });

  // ── 결제키가 없는 주문: 토스에 결제 이력이 정말 없는지 확인 후 내부 취소 ──
  // (환불확인필요 등에서 결제키 저장이 누락된 주문을 환불 없이 취소하는 사고 방지)
  let paymentKey: string | null = order.payment_key;
  if (!paymentKey && order.payment_status !== "ZERO_AMOUNT") {
    try {
      const check = await tossGetPaymentByOrderId(orderId);
      if (check.ok && check.data.orderId === orderId && check.data.status !== "CANCELED") {
        // 결제 이력이 존재 → 결제키를 복구해 토스 취소 경로로 진행
        paymentKey = check.data.paymentKey;
        await admin.from("orders").update({ payment_key: paymentKey }).eq("id", orderId);
        await logPaymentEvent(admin, {
          orderId, eventType: "payment_key_recovered", source: "admin",
          tossStatus: check.data.status,
        });
      } else if (!check.ok && check.status !== 404) {
        // 조회 실패(404 제외) → 결제 유무를 단정할 수 없으므로 취소를 중단
        return NextResponse.json(
          { error: "토스 결제 이력을 확인하지 못했습니다. 잠시 후 다시 시도해주세요." },
          { status: 502 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "토스 결제 이력을 확인하지 못했습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 }
      );
    }
  }

  // ── 결제 이력이 없는 주문: 토스 호출 없이 내부 취소 ──
  // (결제대기: 승인 전 / ZERO_AMOUNT: 토스 미경유 0원 주문)
  if (!paymentKey || order.payment_status === "ZERO_AMOUNT") {
    const { data: result } = await admin.rpc("restore_order_cancellation", {
      p_order_id: orderId,
      p_payment_status: order.payment_status === "ZERO_AMOUNT" ? "ZERO_AMOUNT" : "NONE",
      p_toss_status: null,
      p_reason: reason,
    });
    if (!result?.ok) {
      const msg =
        result?.code === "CONFIRM_IN_PROGRESS"
          ? "사용자가 지금 이 주문을 결제 중입니다. 잠시 후 다시 시도해주세요."
          : `취소 처리에 실패했습니다. (${result?.code})`;
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    await logPaymentEvent(admin, {
      orderId, eventType: "admin_cancel_ok", source: "admin", detail: { toss: false },
    });
    return NextResponse.json({ ok: true, orderId, status: "취소" });
  }

  // ── 결제된 주문: 취소처리중 claim → 토스 취소 → 확인 후 확정 ──
  // 조건부 UPDATE의 결과를 반드시 확인한다: 정확히 이 요청이 전환에 성공했을 때만
  // 토스 취소를 호출한다. (동시에 배송중으로 바뀐 주문을 외부에서만 환불하는 사고 방지)
  // 결제대기는 결제키가 복구된 경우(토스 승인됨 + 내부 미확정)에 한해 취소를 허용하되,
  // 진행 중인 confirm(90초 내 claim)이 있으면 건드리지 않는다.
  const claimGuard = new Date(Date.now() - 90 * 1000).toISOString();
  const { data: claimedRows } = await admin
    .from("orders")
    .update({ status: "취소처리중", cancel_reason: reason })
    .eq("id", orderId)
    .in("status", ["결제완료", "배송준비", "환불확인필요", "결제대기"])
    .or(`confirm_claimed_at.is.null,confirm_claimed_at.lt.${claimGuard}`)
    .select("id");

  if (!claimedRows || claimedRows.length === 0) {
    // claim 실패: 그 사이 상태가 바뀌었거나, 다른 관리자가 이미 취소를 진행 중.
    const { data: current } = await admin
      .from("orders")
      .select("status, confirm_claimed_at")
      .eq("id", orderId)
      .single();
    if (current?.status !== "취소처리중") {
      // 배송중 전환/결제 진행 중 등 → 토스 취소를 호출하지 않고 중단
      return NextResponse.json(
        { error: `주문 상태가 변경되어 취소할 수 없습니다. (현재: ${current?.status ?? "확인 불가"}) 새로고침 후 다시 확인해주세요.` },
        { status: 409 }
      );
    }
    // 이미 취소처리중 → 같은 cancel_key로 이어받는 재시도이므로 계속 진행 (멱등)
  }

  const { data: cancelKey } = await admin.rpc("ensure_cancel_key", { p_order_id: orderId });

  // 전액 취소(CANCELED)만 성공으로 인정한다. PARTIAL_CANCELED는 금액이 남아 있으므로
  // 자동으로 전액 복구/취소하지 않고 환불확인필요로 보존해 운영자가 확인한다.
  let cancelConfirmed = false;
  let tossStatus: string | undefined;
  try {
    const res = await tossCancel({
      paymentKey,
      cancelReason: reason,
      idempotencyKey: cancelKey || `${orderId}-admin-cancel`,
    });
    tossStatus = res.data.status;
    if (res.ok && res.data.status === "CANCELED") {
      cancelConfirmed = true;
    } else if (!res.ok && res.data.code === "ALREADY_CANCELED_PAYMENT") {
      cancelConfirmed = true;
      tossStatus = "CANCELED";
    } else {
      await logPaymentEvent(admin, {
        orderId, eventType: "cancel_fail", source: "admin",
        httpStatus: res.status, tossStatus, detail: { code: res.data.code },
      });
    }
  } catch (e) {
    // timeout/네트워크: 실패 단정 대신 조회로 실제 취소 여부 확인
    await logPaymentEvent(admin, {
      orderId, eventType: "cancel_unclear", source: "admin",
      detail: { reason: e instanceof TossTimeoutError ? "timeout" : "network" },
    });
    try {
      const check = await tossGetPayment(paymentKey);
      if (check.ok && check.data.status === "CANCELED") {
        cancelConfirmed = true;
        tossStatus = check.data.status;
      }
    } catch {
      // 조회도 실패 → 불명확 유지
    }
  }

  if (!cancelConfirmed) {
    // 취소가 확인되지 않음 → 환불확인필요로 보존 (대사 크론이 재확인)
    await admin
      .from("orders")
      .update({ status: "환불확인필요", payment_status: "RECONCILIATION_REQUIRED" })
      .eq("id", orderId)
      .eq("status", "취소처리중");
    return NextResponse.json(
      { error: "토스 취소가 확인되지 않았습니다. '환불확인필요' 상태로 보존했으며 자동 대사가 재확인합니다." },
      { status: 502 }
    );
  }

  // 취소 확인됨 → 포인트/재고 복구 + 취소 확정 (멱등 RPC)
  const { data: result } = await admin.rpc("restore_order_cancellation", {
    p_order_id: orderId,
    p_payment_status: "CANCELED",
    p_toss_status: tossStatus,
    p_reason: reason,
  });

  if (!result?.ok) {
    await logPaymentEvent(admin, {
      orderId, eventType: "restore_fail", source: "admin", detail: { code: result?.code },
    });
    return NextResponse.json(
      { error: `토스 취소는 완료됐지만 내부 복구에 실패했습니다. (${result?.code}) 대사 작업이 재시도합니다.` },
      { status: 500 }
    );
  }

  await logPaymentEvent(admin, {
    orderId, eventType: "admin_cancel_ok", source: "admin",
    tossStatus, detail: { restored: result?.restored },
  });
  return NextResponse.json({ ok: true, orderId, status: "취소" });
}
