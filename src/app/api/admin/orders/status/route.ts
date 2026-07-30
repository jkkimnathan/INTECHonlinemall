import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { isValidOrderId } from "@/lib/toss";
import { ADMIN_SIMPLE_STATUSES, isAdminSimpleTransition } from "@/lib/order-status";
import { logPaymentEvent } from "@/lib/payment-events";
import { readJsonLimited } from "@/lib/rate-limit";
import { OrderStatus } from "@/types/order";

/**
 * 관리자 배송 상태 변경 API (서버 상태 머신 검증).
 *
 * 여기서는 배송 관련 전이만 허용한다:
 *   결제완료→배송준비, 배송준비→배송중, 배송중→배송완료, 배송완료→교환/반품
 * 결제/환불이 걸린 상태(결제완료, 취소, 취소처리중, 환불확인필요, 만료)는
 * 전용 API(결제 승인/취소/대사)만 만들 수 있다.
 */
export async function POST(req: NextRequest) {
  const adminUser = await requireAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = await readJsonLimited<{ orderId?: unknown; status?: unknown }>(req, 4 * 1024);
  if (!body) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const orderId = body.orderId;
  const nextStatus = body.status as OrderStatus;
  if (!isValidOrderId(orderId) || !ADMIN_SIMPLE_STATUSES.includes(nextStatus)) {
    return NextResponse.json({ error: "요청 값이 유효하지 않습니다." }, { status: 400 });
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
    .select("id, status")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }
  if (order.status === nextStatus) {
    return NextResponse.json({ ok: true, orderId, status: nextStatus });
  }
  if (!isAdminSimpleTransition(order.status, nextStatus)) {
    return NextResponse.json(
      { error: `'${order.status}' → '${nextStatus}' 상태 변경은 허용되지 않습니다.` },
      { status: 409 }
    );
  }

  // 조건부 update로 동시 변경 경쟁도 방지 (현재 상태일 때만 전이)
  const { data: updated, error } = await admin
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId)
    .eq("status", order.status)
    .select("id")
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "상태 변경에 실패했습니다. 새로고침 후 다시 시도해주세요." }, { status: 409 });
  }

  await logPaymentEvent(admin, {
    orderId, eventType: "admin_status_change", source: "admin",
    detail: { by: adminUser.userId, from: order.status, to: nextStatus },
  });
  return NextResponse.json({ ok: true, orderId, status: nextStatus });
}
