import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { tossGetPaymentByOrderId } from "@/lib/toss";
import { applyVerifiedPaymentState } from "@/lib/payment-reconcile";
import { logPaymentEvent } from "@/lib/payment-events";
import { SupabaseClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const BATCH = 20;

/**
 * 정기 대사(reconciliation) 작업 — Vercel Cron 등에서 주기 호출.
 * Authorization: Bearer ${CRON_SECRET} 필요.
 *
 * 처리 대상:
 *  1) 30분 이상 지난 결제대기 주문 → 토스 조회로 실제 상태 확인
 *     - 토스 DONE인데 내부 결제대기 → 확정 복구
 *     - 토스 404 (결제 이력 없음) → 만료 처리 (진행 중 claim은 보호)
 *  2) 취소처리중 / 환불확인필요 주문 → 토스 상태에 따라 취소 확정 또는 유지
 *  3) 결제 흔적 없는 오래된 결제대기 주문 일괄 만료
 *  4) 오래된 rate limit 키 정리
 *
 * 배치 크기를 제한하고 토스 조회는 병렬로 수행해 실행 시간을 예측 가능하게 유지한다.
 * 모든 처리는 멱등 — 중간에 잘려도 다음 실행이 이어받는다.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server config" }, { status: 500 });
  }

  const summary = {
    pendingChecked: 0,
    unsettledChecked: 0,
    expired: 0,
    reconciled: 0,
    unresolved: 0,
  };

  // 1) 30분 이상 지난 결제대기 주문: 토스에서 실제 결제 여부 확인
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: pending } = await admin
    .from("orders")
    .select("id")
    .eq("status", "결제대기")
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(BATCH);

  summary.pendingChecked = pending?.length ?? 0;
  await Promise.all(
    (pending ?? []).map((order) => reconcileOne(admin, order.id, summary, true))
  );

  // 2) 취소처리중 / 환불확인필요 주문 대사
  const { data: unsettled } = await admin
    .from("orders")
    .select("id")
    .in("status", ["취소처리중", "환불확인필요"])
    .order("created_at", { ascending: true })
    .limit(BATCH);

  summary.unsettledChecked = unsettled?.length ?? 0;
  await Promise.all(
    (unsettled ?? []).map((order) => reconcileOne(admin, order.id, summary, false))
  );

  // 3) 결제 흔적이 없는 오래된 결제대기 주문 일괄 만료
  const { data: expiredCount } = await admin.rpc("expire_pending_orders", {
    p_older_than_minutes: 60,
    p_limit: 200,
  });
  if (typeof expiredCount === "number") summary.expired += expiredCount;

  // 4) rate limit 키 정리
  await admin.rpc("cleanup_rate_limits");

  await logPaymentEvent(admin, {
    eventType: "reconcile_run",
    source: "cron",
    detail: summary,
  });

  return NextResponse.json({ ok: true, ...summary });
}

/** 주문 1건 대사: 토스 조회 → 상태 반영. 404면(결제대기 한정) 만료 처리. */
async function reconcileOne(
  admin: SupabaseClient,
  orderId: string,
  summary: { expired: number; reconciled: number; unresolved: number },
  expireOn404: boolean
) {
  try {
    const res = await tossGetPaymentByOrderId(orderId);
    if (res.ok) {
      await applyVerifiedPaymentState(admin, orderId, res.data, "cron");
      summary.reconciled += 1;
    } else if (res.status === 404 && expireOn404) {
      // 토스에 결제 이력 자체가 없음 → 만료.
      // 단, 사용자가 방금 결제를 시작했을 수 있으므로 진행 중 claim(90초)은 보호한다.
      const claimGuard = new Date(Date.now() - 90 * 1000).toISOString();
      const { data: updated } = await admin
        .from("orders")
        .update({ status: "만료", payment_status: "EXPIRED" })
        .eq("id", orderId)
        .eq("status", "결제대기")
        .or(`confirm_claimed_at.is.null,confirm_claimed_at.lt.${claimGuard}`)
        .select("id");
      if (updated && updated.length > 0) summary.expired += 1;
    } else {
      summary.unresolved += 1;
    }
  } catch {
    summary.unresolved += 1;
  }
  await admin
    .from("orders")
    .update({ last_reconciled_at: new Date().toISOString() })
    .eq("id", orderId);
}
