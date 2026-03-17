import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order, ShippingInfo, PaymentMethod, OrderStatus } from "@/types/order";
import { CartItem } from "@/store/cart";

interface OrderStore {
  orders: Order[];
  createOrder: (data: {
    userId: string;
    items: CartItem[];
    shipping: ShippingInfo;
    paymentMethod: PaymentMethod;
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
  }) => Order;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByUserId: (userId: string) => Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],

      createOrder: (data) => {
        const order: Order = {
          id: `ORD-${Date.now()}`,
          ...data,
          status: "결제완료",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      getOrdersByUserId: (userId) =>
        get().orders.filter((o) => o.userId === userId),

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        }));
      },
    }),
    { name: "order-storage" }
  )
);
