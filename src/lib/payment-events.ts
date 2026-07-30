import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * 결제 감사 로그 (payment_events 테이블).
 * 실패해도 본 흐름을 막지 않는다 — 로그는 최선 노력으로 남긴다.
 *
 * detail에는 민감정보(시크릿 키, Authorization, 카드번호, 전체 배송지/전화번호)를
 * 절대 넣지 않는다. 주문번호, 상태 코드, HTTP 상태 정도만 기록한다.
 */
export async function logPaymentEvent(
  admin: SupabaseClient,
  event: {
    orderId?: string;
    eventType: string;
    source?: "server" | "webhook" | "cron" | "admin";
    tossStatus?: string;
    httpStatus?: number;
    detail?: Record<string, unknown>;
    transmissionId?: string;
  }
): Promise<{ duplicate: boolean }> {
  const { error } = await admin.from("payment_events").insert([{
    order_id: event.orderId ?? null,
    event_type: event.eventType,
    source: event.source ?? "server",
    toss_status: event.tossStatus ?? null,
    http_status: event.httpStatus ?? null,
    detail: event.detail ?? null,
    transmission_id: event.transmissionId ?? null,
  }]);

  if (error) {
    // 23505 = unique violation → 같은 transmission_id의 웹훅 중복 수신
    if (error.code === "23505") return { duplicate: true };
    console.error("payment event log failed:", error.message);
  }
  return { duplicate: false };
}
