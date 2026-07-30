import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";
import { mapTossMethod, TossPayment } from "@/lib/toss";
import { logPaymentEvent } from "@/lib/payment-events";

/**
 * 토스 조회 API로 검증된 결제 상태를 내부 주문에 반영한다.
 * 웹훅과 대사 크론이 공유하는 로직 — 여러 번 실행해도 결과가 같다(멱등).
 * 웹훅 본문은 신뢰하지 않으며, 반드시 조회 API 응답(payment)을 넘겨야 한다.
 */
export async function applyVerifiedPaymentState(
  admin: SupabaseClient,
  orderId: string,
  payment: TossPayment,
  source: "webhook" | "cron"
) {
  // 조회 응답의 orderId와 반영 대상 주문이 일치해야 한다.
  // (웹훅 본문의 paymentKey/orderId 조합 조작 방어)
  if (payment.orderId !== orderId) {
    await logPaymentEvent(admin, {
      orderId, eventType: "verify_order_mismatch", source,
      detail: { tossOrderId: payment.orderId },
    });
    return;
  }

  const { data: order } = await admin
    .from("orders")
    .select("id, status, total, payment_key, payment_status")
    .eq("id", orderId)
    .single();
  if (!order) return;

  const now = new Date().toISOString();

  switch (payment.status) {
    case "DONE": {
      // 결제는 승인됐는데 내부가 결제대기로 남은 경우 → 확정 (금액/통화 검증 후)
      if (order.status === "결제대기") {
        if (payment.totalAmount !== order.total || payment.currency !== "KRW" || payment.method === "가상계좌") {
          await admin
            .from("orders")
            .update({
              status: "환불확인필요",
              payment_status: "RECONCILIATION_REQUIRED",
              // 결제키를 저장해야 관리자 취소가 토스 환불과 연결된다
              payment_key: order.payment_key || payment.paymentKey,
              cancel_reason: "웹훅/대사 검증 불일치",
            })
            .eq("id", orderId)
            .eq("status", "결제대기");
          await logPaymentEvent(admin, {
            orderId, eventType: "verify_mismatch", source, tossStatus: payment.status,
            detail: { tossAmount: payment.totalAmount, orderTotal: order.total, method: payment.method },
          });
          return;
        }
        const { data: result } = await admin.rpc("finalize_order_payment_v2", {
          p_order_id: orderId,
          p_payment_key: payment.paymentKey,
          p_payment_method: mapTossMethod(payment),
          p_toss_status: payment.status,
        });
        await logPaymentEvent(admin, {
          orderId, eventType: result?.ok ? "recovered_finalize" : "recover_finalize_fail",
          source, tossStatus: payment.status, detail: { code: result?.code },
        });
        // 확정 실패(재고 부족 등)면 환불확인필요로 보존 — 운영자가 취소 처리
        if (!result?.ok && result?.code !== "ALREADY_DONE") {
          await admin
            .from("orders")
            .update({
              status: "환불확인필요",
              payment_status: "RECONCILIATION_REQUIRED",
              payment_key: order.payment_key || payment.paymentKey,
              cancel_reason: `대사 확정 실패 (${result?.code})`,
            })
            .eq("id", orderId)
            .eq("status", "결제대기");
        }
      } else {
        await admin
          .from("orders")
          .update({ toss_status: payment.status, last_reconciled_at: now })
          .eq("id", orderId);
      }
      return;
    }
    case "CANCELED": {
      // 토스에서 전액 취소 확인 → 내부도 취소로 정리 (복구는 RPC가 멱등 처리)
      if (["결제완료", "배송준비", "취소처리중", "환불확인필요"].includes(order.status)) {
        const { data: result } = await admin.rpc("restore_order_cancellation", {
          p_order_id: orderId,
          p_payment_status: payment.status,
          p_toss_status: payment.status,
          p_reason: `토스 취소 확인 (${source})`,
        });
        await logPaymentEvent(admin, {
          orderId, eventType: "verified_cancel_applied", source,
          tossStatus: payment.status, detail: { code: result?.code },
        });
      } else if (order.status === "결제대기") {
        // 승인 전 취소/중단 → 주문만 만료 처리
        await admin
          .from("orders")
          .update({ status: "만료", payment_status: payment.status, toss_status: payment.status, last_reconciled_at: now })
          .eq("id", orderId)
          .eq("status", "결제대기");
      } else {
        // 배송중/배송완료 등 — 자동 처리하지 않고 기록만 남겨 운영자가 확인
        await logPaymentEvent(admin, {
          orderId, eventType: "canceled_in_unhandled_status", source,
          tossStatus: payment.status, detail: { orderStatus: order.status },
        });
      }
      return;
    }
    case "PARTIAL_CANCELED": {
      // 부분취소는 일부 금액이 남아 있으므로 자동으로 전액 복구/취소하지 않는다.
      // 환불확인필요로 표시해 운영자가 부분환불 내역을 확인하고 처리한다.
      if (["결제완료", "배송준비", "취소처리중"].includes(order.status)) {
        await admin
          .from("orders")
          .update({
            status: "환불확인필요",
            payment_status: "RECONCILIATION_REQUIRED",
            toss_status: payment.status,
            cancel_reason: "토스 부분취소 감지 — 운영자 확인 필요",
            last_reconciled_at: now,
          })
          .eq("id", orderId)
          .eq("status", order.status);
      } else {
        await admin
          .from("orders")
          .update({ toss_status: payment.status, last_reconciled_at: now })
          .eq("id", orderId);
      }
      await logPaymentEvent(admin, {
        orderId, eventType: "partial_cancel_detected", source,
        tossStatus: payment.status, detail: { orderStatus: order.status },
      });
      return;
    }
    case "WAITING_FOR_DEPOSIT": {
      // 가상계좌 미지원(선택 A): 결제완료로 절대 처리하지 않고 대사 대상으로 표시
      await admin
        .from("orders")
        .update({ payment_status: "WAITING_FOR_DEPOSIT", toss_status: payment.status, last_reconciled_at: now })
        .eq("id", orderId)
        .eq("status", "결제대기");
      await logPaymentEvent(admin, {
        orderId, eventType: "virtual_account_detected", source, tossStatus: payment.status,
      });
      return;
    }
    case "ABORTED":
    case "EXPIRED": {
      if (order.status === "결제대기") {
        await admin
          .from("orders")
          .update({ payment_status: payment.status, toss_status: payment.status, last_reconciled_at: now })
          .eq("id", orderId)
          .eq("status", "결제대기");
      }
      return;
    }
    default: {
      await admin
        .from("orders")
        .update({ toss_status: payment.status, last_reconciled_at: now })
        .eq("id", orderId);
    }
  }
}
