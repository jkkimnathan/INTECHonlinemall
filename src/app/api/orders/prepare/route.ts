import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { toProduct } from "@/lib/supabase/product-utils";
import { validateQuantity } from "@/lib/security";
import { ShippingInfo } from "@/types/order";

interface PrepareItem {
  productId: string;
  quantity: number;
}

interface PrepareBody {
  items: PrepareItem[];
  shipping: ShippingInfo;
  usePoints: number;
}

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 3000;

/**
 * 주문 준비: 서버가 DB 가격으로 금액을 재계산하고 "결제대기" 주문을 만든다.
 * 브라우저가 보낸 금액은 일절 신뢰하지 않는다.
 */
export async function POST(req: NextRequest) {
  // 1. 로그인 확인 (쿠키 세션)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // 2. 입력 검증
  let body: PrepareBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { items, shipping } = body;
  const usePoints = Number(body.usePoints) || 0;

  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return NextResponse.json({ error: "주문 상품이 없습니다." }, { status: 400 });
  }
  for (const item of items) {
    if (typeof item.productId !== "string" || !validateQuantity(item.quantity)) {
      return NextResponse.json({ error: "상품 수량이 유효하지 않습니다." }, { status: 400 });
    }
  }
  if (!shipping?.name || !shipping?.phone || !shipping?.address) {
    return NextResponse.json({ error: "배송 정보가 누락되었습니다." }, { status: 400 });
  }
  if (!Number.isInteger(usePoints) || usePoints < 0) {
    return NextResponse.json({ error: "포인트 값이 유효하지 않습니다." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 설정 오류입니다. 관리자에게 문의해주세요." }, { status: 500 });
  }

  // 3. DB에서 실제 상품 정보 조회 (가격·재고는 여기 값만 사용)
  const productIds = items.map((i) => i.productId);
  const { data: rows, error: productError } = await admin
    .from("products")
    .select("*")
    .in("id", productIds);

  if (productError || !rows) {
    return NextResponse.json({ error: "상품 조회에 실패했습니다." }, { status: 500 });
  }

  const productMap = new Map(rows.map((r) => [r.id as string, r]));
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const row = productMap.get(item.productId);
    if (!row) {
      return NextResponse.json({ error: "판매 중이 아닌 상품이 포함되어 있습니다." }, { status: 400 });
    }
    const stock = (row.stock as number) ?? 0;
    if (stock < item.quantity) {
      return NextResponse.json(
        { error: `재고가 부족합니다: ${row.name} (남은 수량 ${stock}개)` },
        { status: 409 }
      );
    }
    const product = toProduct(row);
    const unitPrice = product.salePrice ?? product.price;
    subtotal += unitPrice * item.quantity;
    orderItems.push({ product, quantity: item.quantity });
  }

  // 4. 포인트 잔액 검증 (보유량 초과 사용 거부)
  if (usePoints > 0) {
    const { data: profile } = await admin
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();
    const balance = (profile?.points as number) ?? 0;
    if (usePoints > balance) {
      return NextResponse.json({ error: "보유 포인트를 초과했습니다." }, { status: 400 });
    }
    if (usePoints > subtotal) {
      return NextResponse.json({ error: "포인트는 상품 금액까지만 사용할 수 있습니다." }, { status: 400 });
    }
  }

  // 5. 서버 기준 금액 확정
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee - usePoints;

  // 6. "결제대기" 주문 생성 (주문번호는 예측 불가능한 랜덤 값)
  const orderId = `ORD-${randomUUID()}`;
  const { error: insertError } = await admin.from("orders").insert([{
    id: orderId,
    user_id: user.id,
    items: orderItems,
    shipping: {
      name: String(shipping.name).slice(0, 50),
      phone: String(shipping.phone).slice(0, 20),
      zipcode: String(shipping.zipcode || "").slice(0, 10),
      address: String(shipping.address).slice(0, 200),
      addressDetail: String(shipping.addressDetail || "").slice(0, 200),
      memo: String(shipping.memo || "").slice(0, 200),
    },
    payment_method: "card",
    subtotal,
    shipping_fee: shippingFee,
    discount: usePoints,
    used_points: usePoints,
    total,
    status: "결제대기",
  }]);

  if (insertError) {
    console.error("prepare order insert error:", insertError);
    return NextResponse.json({ error: "주문 생성에 실패했습니다." }, { status: 500 });
  }

  const firstName = orderItems[0].product.name;
  const orderName =
    orderItems.length > 1 ? `${firstName.slice(0, 80)} 외 ${orderItems.length - 1}건` : firstName.slice(0, 100);

  return NextResponse.json({ orderId, amount: total, orderName });
}
