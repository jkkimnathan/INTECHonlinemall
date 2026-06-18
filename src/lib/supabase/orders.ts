import { createClient } from "@/lib/supabase/client";
import { Order, OrderStatus } from "@/types/order";
import { CartItem } from "@/store/cart";
import { validateQuantity } from "@/lib/security";

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
  // 빠른 클라이언트 사전 점검(UX용) — 실제 금액/재고 검증은 서버 RPC(create_order)에서 수행.
  // 클라이언트가 보낸 subtotal/total/shippingFee 값은 신뢰하지 않는다(위변조 방지).
  if (!input.userId || !input.shipping?.name || !input.shipping?.phone || !input.shipping?.address) {
    return { order: null, error: "배송 정보가 누락되었습니다." };
  }
  for (const item of input.items) {
    if (!validateQuantity(item.quantity)) {
      return { order: null, error: `상품 수량이 유효하지 않습니다: ${item.product?.name}` };
    }
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("create_order", {
    p_items: input.items,
    p_shipping: input.shipping,
    p_payment_method: input.paymentMethod,
    p_use_points: Math.max(0, Math.floor(input.discount || 0)),
  });

  if (error) return { order: null, error: error.message };
  if (!data) return { order: null, error: "주문 생성에 실패했습니다." };
  return { order: toOrder(data as Record<string, unknown>), error: null };
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
