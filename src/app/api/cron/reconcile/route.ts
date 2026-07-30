import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { tossGetPaymentByOrderId } from "@/lib/toss";
import { applyVerifiedPaymentState } from "@/lib/payment-reconcile";
import { logPaymentEvent } from "@/lib/payment-events";
import { SupabaseClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const PAGE = 20;
const TIME_BUDGET_MS = 40_000;

/**
 * 정기 대사(reconciliation) 작업 — Vercel Cron 등에서 주기 호출.
 * Authorization: Bearer ${CRON_SECRET} 필요.
 *
 * 처리 순서 (위험한 것부터):
 *  1) IN_PROGRESS로 남은 결제대기 주문 (승인 결과 불명확 — 과금됐을 수 있음)
 *  2) 30분 이상 지난 결제대기 주문 → 토스 조회: DONE이면 확정 복구, 404면 만료
 *  3) 취소처리중 / 환불확인필요 주문 → 토스 상태에 따라 취소 확정 또는 유지
 *  4) 비정상 상태 조합 경보 (만료됐는데 결제키 존재 등)
 *  5) 결제 흔적 없는 오래된 결제대기 일괄 만료 + rate limit 키 정리
 *
 * 각 큐는 시간 예산(40초) 안에서 페이지를 반복 처리한다(cursor: last_reconciled_at).
 * 실행 1회 한도 20건이 아니라, 예산이 허락하는 만큼 전부 소진한다.
 * 모든 처리는 멱등 — 중간에 잘려도 다음 실행이 이어받는다.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let admin: SupabaseClient;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server config" }, { status: 500 });
  }

  const startMs = Date.now();
  const runStart = new Date().toISOString();
  const summary = { checked: 0, expired: 0, reconciled: 0, unresolved: 0, anomalies: 0, timedOut: false };

  const timeLeft = () => TIME_BUDGET_MS - (Date.now() - startMs);

  // 큐를 시간 예산 내에서 페이지 반복 처리.
  // reconcileOne이 last_reconciled_at을 갱신하므로 runStart 필터로 같은 행 재처리를 막는다.
  const drain = async (
    buildQuery: () => PromiseLike<{ data: { id: string }[] | null }>,
    expireOn404: boolean
  ) => {
    while (timeLeft() > 5_000) {
      const { data: rows } = await buildQuery();
      if (!rows || rows.length === 0) return;
      summary.checked += rows.length;
      await Promise.all(rows.map((r) => reconcileOne(admin, r.id, summary, expireOn404)));
      if (rows.length < PAGE) return;
    }
    summary.timedOut = true;
  };

  const notReconciledThisRun = `last_reconciled_at.is.null,last_reconciled_at.lt.${runStart}`;

  // 1) 승인 결과 불명확(IN_PROGRESS) — 최우선. 10분 이상 방치된 것만.
  const inProgressCutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  await drain(
    () => admin.from("orders").select("id")
      .eq("status", "결제대기")
      .eq("payment_status", "IN_PROGRESS")
      .lt("confirm_claimed_at", inProgressCutoff)
      .or(notReconciledThisRun)
      .order("created_at", { ascending: true })
      .limit(PAGE),
    false // 불명확 주문은 404여도 자동 만료하지 않고 다음 단계(일반 큐)에서 판단
  );

  // 2) 오래된 결제대기 (모든 payment_status)
  const pendingCutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  await drain(
    () => admin.from("orders").select("id")
      .eq("status", "결제대기")
      .lt("created_at", pendingCutoff)
      .or(notReconciledThisRun)
      .order("created_at", { ascending: true })
      .limit(PAGE),
    true
  );

  // 3) 취소처리중 / 환불확인필요
  await drain(
    () => admin.from("orders").select("id")
      .in("status", ["취소처리중", "환불확인필요"])
      .or(notReconciledThisRun)
      .order("created_at", { ascending: true })
      .limit(PAGE),
    false
  );

  // 4) 비정상 상태 조합 경보: 만료 처리됐는데 결제키가 있는 주문 (있어서는 안 됨)
  const { data: anomalies } = await admin
    .from("orders")
    .select("id, status, payment_status")
    .eq("status", "만료")
    .not("payment_key", "is", null)
    .limit(20);
  for (const a of anomalies ?? []) {
    summary.anomalies += 1;
    await logPaymentEvent(admin, {
      orderId: a.id, eventType: "anomaly_expired_with_payment", source: "cron",
      detail: { paymentStatus: a.payment_status },
    });
  }

  // 5) 결제 흔적 없는 오래된 결제대기 일괄 만료 + rate limit 키 정리
  const { data: expiredCount } = await admin.rpc("expire_pending_orders", {
    p_older_than_minutes: 60,
    p_limit: 200,
  });
  if (typeof expiredCount === "number") summary.expired += expiredCount;
  await admin.rpc("cleanup_rate_limits");

  await logPaymentEvent(admin, { eventType: "reconcile_run", source: "cron", detail: summary });
  return NextResponse.json({ ok: true, ...summary });
}

/** 주문 1건 대사: 토스 조회 → 상태 반영. 404면(만료 허용 큐 한정) 만료 처리. */
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
