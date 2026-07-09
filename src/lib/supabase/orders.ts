import { createClient } from "@/lib/supabase/client";
import { Order, OrderStatus } from "@/types/order";
import { CartItem } from "@/store/cart";

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

// 주문 생성은 서버 API(/api/orders/prepare + /api/payments/confirm)에서만 수행한다.
// 브라우저에서의 직접 INSERT는 RLS로 차단되어 있다 (payment_migration.sql 참고).

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

/** 내 주문 목록 (결제 전 주문은 제외) */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "결제대기")
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
