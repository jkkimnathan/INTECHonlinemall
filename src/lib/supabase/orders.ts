import { createClient } from "@/lib/supabase/client";
import { Order, OrderStatus } from "@/types/order";
import { CartItem } from "@/store/cart";
import { validatePrice, validateQuantity } from "@/lib/security";

interface CreateOrderInput {
  userId: string;
  items: CartItem[];
  shipping: Order["shipping"];
  paymentMethod: Order["paymentMethod"];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}

function toOrder(row: Record<string, unknown>): Order {
  const items = row.items as CartItem[];
  const shipping = row.shipping as Order["shipping"];
  return {
    id: row.id as string,
    userId: row.user_id as string,
    items,
    shipping,
    paymentMethod: (row.payment_method as Order["paymentMethod"]) || "card",
    subtotal: row.subtotal as number,
    shippingFee: row.shipping_fee as number,
    discount: row.discount as number,
    total: row.total as number,
    status: row.status as OrderStatus,
    createdAt: row.created_at as string,
    trackingNumber: (row.tracking_number as string) || undefined,
  };
}

/** 주문 생성 */
export async function createOrder(input: CreateOrderInput): Promise<{ order: Order | null; error: string | null }> {
  // 서버 검증: 금액 및 수량 유효성
  if (!validatePrice(input.subtotal) || !validatePrice(input.total) || !validatePrice(input.shippingFee)) {
    return { order: null, error: "주문 금액이 유효하지 않습니다." };
  }
  if (input.total < 0 || input.subtotal < 0) {
    return { order: null, error: "주문 금액이 유효하지 않습니다." };
  }
  for (const item of input.items) {
    if (!validateQuantity(item.quantity)) {
      return { order: null, error: `상품 수량이 유효하지 않습니다: ${item.product?.name}` };
    }
  }
  if (!input.userId || !input.shipping?.name || !input.shipping?.phone || !input.shipping?.address) {
    return { order: null, error: "배송 정보가 누락되었습니다." };
  }

  const supabase = createClient();
  const id = `ORD-${Date.now()}`;

  const { data, error } = await supabase
    .from("orders")
    .insert([{
      id,
      user_id: input.userId,
      items: input.items,
      shipping: input.shipping,
      payment_method: input.paymentMethod,
      subtotal: input.subtotal,
      shipping_fee: input.shippingFee,
      discount: input.discount,
      total: input.total,
      status: "결제완료",
    }])
    .select("*")
    .single();

  if (error) return { order: null, error: error.message };
  return { order: toOrder(data), error: null };
}

/** 주문 조회 (by ID) */
export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toOrder(data);
}

/** 내 주문 목록 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(toOrder);
}

/** 전체 주문 목록 (어드민) */
export async function getAllOrders(): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(toOrder);
}

/** 주문 상태 변경 (어드민) */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { error: error.message };
  return { error: null };
}
