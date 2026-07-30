import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { toProduct } from "@/lib/supabase/product-utils";
import { validateQuantity } from "@/lib/security";
import { hitRateLimit, clientIp, bodyTooLarge } from "@/lib/rate-limit";
import { logPaymentEvent } from "@/lib/payment-events";
import {
  MIN_PAYMENT_AMOUNT,
  aggregateQuantities,
  evaluatePayableAmount,
  calcShippingFee,
} from "@/lib/order-utils";
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

/**
 * 주문 준비: 서버가 DB 가격으로 금액을 재계산하고 "결제대기" 주문을 만든다.
 * 브라우저가 보낸 금액은 일절 신뢰하지 않는다.
 * 0원 주문(전액 포인트)은 토스 결제창 없이 이 API에서 곧바로 확정한다.
 */
export async function POST(req: NextRequest) {
  if (bodyTooLarge(req, 32 * 1024)) {
    return NextResponse.json({ error: "요청이 너무 큽니다." }, { status: 413 });
  }

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
    if (
      typeof item.productId !== "string" ||
      item.productId.length === 0 ||
      item.productId.length > 64 ||
      !validateQuantity(item.quantity)
    ) {
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

  // 3. rate limit (사용자 + IP, 공유 저장소 기반)
  const ip = clientIp(req);
  const [byUser, byIp] = await Promise.all([
    hitRateLimit(admin, `prepare:u:${user.id}`, 10, 60),
    hitRateLimit(admin, `prepare:ip:${ip}`, 30, 60),
  ]);
  if (!byUser || !byIp) {
    return NextResponse.json({ error: "요청이 너무 잦습니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
  }

  // 4. 같은 상품이 여러 줄로 들어오면 수량을 먼저 합산한다
  const qtyByProduct = aggregateQuantities(items);
  for (const [, qty] of qtyByProduct) {
    if (!validateQuantity(qty)) {
      return NextResponse.json({ error: "상품 수량이 유효하지 않습니다." }, { status: 400 });
    }
  }

  // 5. DB에서 실제 상품 정보 조회 (가격·재고는 여기 값만 사용)
  const productIds = [...qtyByProduct.keys()];
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

  for (const [productId, quantity] of qtyByProduct) {
    const row = productMap.get(productId);
    if (!row) {
      return NextResponse.json({ error: "판매 중이 아닌 상품이 포함되어 있습니다." }, { status: 400 });
    }
    const stock = (row.stock as number) ?? 0;
    if (stock < quantity) {
      return NextResponse.json(
        { error: `재고가 부족합니다: ${row.name} (남은 수량 ${stock}개)` },
        { status: 409 }
      );
    }
    const product = toProduct(row);
    const unitPrice = product.salePrice ?? product.price;
    subtotal += unitPrice * quantity;
    orderItems.push({ product, quantity });
  }

  // 6. 포인트 잔액 검증 (보유량 초과 사용 거부)
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

  // 7. 서버 기준 금액 확정
  const shippingFee = calcShippingFee(subtotal);
  const total = subtotal + shippingFee - usePoints;

  // 결제수단 최소 금액 미만(0원 초과 ~ 100원 미만)은 포인트 조정 안내
  if (evaluatePayableAmount(total) === "BELOW_MIN") {
    return NextResponse.json(
      { error: `결제 금액은 최소 ${MIN_PAYMENT_AMOUNT}원 이상이어야 합니다. 포인트 사용량을 조정해주세요.` },
      { status: 400 }
    );
  }

  // 8. "결제대기" 주문 생성 (주문번호는 예측 불가능한 랜덤 값)
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
    payment_method: total === 0 ? "points" : "card",
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

  // 9. 0원 주문: 토스 결제창을 거치지 않고 서버에서 곧바로 확정
  //    (포인트·재고 차감은 finalize RPC의 단일 트랜잭션으로 처리,
  //     payment_status = 'ZERO_AMOUNT'로 토스 미경유 주문임을 기록)
  if (total === 0) {
    const { data: result, error: rpcError } = await admin.rpc("finalize_order_payment_v2", {
      p_order_id: orderId,
      p_payment_key: null,
      p_payment_method: "points",
      p_toss_status: null,
    });
    if (rpcError || !result?.ok) {
      const code = result?.code || rpcError?.message || "UNKNOWN";
      console.error("zero-amount finalize failed:", code);
      const message =
        code === "NOT_ENOUGH_STOCK"
          ? "재고가 부족합니다."
          : code === "NOT_ENOUGH_POINTS"
          ? "포인트 잔액이 부족합니다."
          : "주문 확정에 실패했습니다.";
      return NextResponse.json({ error: message }, { status: 409 });
    }
    await logPaymentEvent(admin, { orderId, eventType: "zero_amount_ok" });
    return NextResponse.json({ orderId, amount: 0, orderName: "", zeroAmount: true });
  }

  const firstName = orderItems[0].product.name;
  const orderName =
    orderItems.length > 1 ? `${firstName.slice(0, 80)} 외 ${orderItems.length - 1}건` : firstName.slice(0, 100);

  return NextResponse.json({ orderId, amount: total, orderName });
}
