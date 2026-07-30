import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin-auth";

const PAGE_SIZE_MAX = 50;

/** 관리자 목록에서 상태 필터로 허용하는 값 */
const FILTERABLE_STATUSES = [
  "결제대기", "결제완료", "배송준비", "배송중", "배송완료",
  "취소처리중", "취소", "환불확인필요", "만료", "교환/반품",
];

/**
 * 관리자 주문 목록 API — 서버 페이지네이션.
 *
 * 기본 목록은 요약 컬럼만 조회한다 (items 전체 JSON을 내려보내지 않음).
 * 만료/결제대기 주문은 명시적으로 필터를 선택했을 때만 포함한다.
 */
export async function GET(req: NextRequest) {
  const adminUser = await requireAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 500 });
  }

  const params = req.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, Number(params.get("pageSize")) || 20));
  const status = params.get("status");
  const search = (params.get("search") || "").trim().slice(0, 64);

  let query = admin
    .from("orders")
    .select("id, status, payment_status, total, created_at, approved_at, canceled_at, shipping, items",
      { count: "exact" });

  if (status && FILTERABLE_STATUSES.includes(status)) {
    query = query.eq("status", status);
  } else {
    // 기본 목록: 결제 전/만료 주문은 분리 (명시 필터로만 조회)
    query = query.not("status", "in", '("결제대기","만료")');
  }

  if (search) {
    query = query.ilike("id", `%${search.replace(/[%_]/g, "")}%`);
  }

  const from = (page - 1) * pageSize;
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) {
    console.error("admin order list error:", error.message);
    return NextResponse.json({ error: "주문 목록 조회에 실패했습니다." }, { status: 500 });
  }

  // 브라우저 메모리 절약: items 전체 대신 요약 정보만 추출해 전달
  const orders = (data ?? []).map((row) => {
    const items = (row.items as { product?: { name?: string }; quantity?: number }[]) || [];
    return {
      id: row.id,
      status: row.status,
      paymentStatus: row.payment_status,
      total: row.total,
      createdAt: row.created_at,
      approvedAt: row.approved_at,
      canceledAt: row.canceled_at,
      customerName: (row.shipping as { name?: string })?.name || "",
      firstItemName: items[0]?.product?.name || "",
      itemCount: items.length,
    };
  });

  return NextResponse.json({
    orders,
    page,
    pageSize,
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  });
}
