import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  /** 서버에서 받은 최신 상품 정보로 스냅샷(가격·재고) 갱신, 삭제된 상품은 제거 */
  refreshProducts: (fresh: Product[]) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

/** 수량을 1 이상의 정수로, 재고가 있으면 재고 이하로 클램핑 */
function clampQuantity(quantity: number, stock: number): number {
  const q = Math.max(1, Math.floor(Number(quantity) || 1));
  return stock > 0 ? Math.min(q, stock) : q;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? {
                      ...item,
                      quantity: clampQuantity(
                        item.quantity + quantity,
                        product.stock
                      ),
                    }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { product, quantity: clampQuantity(quantity, product.stock) },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: clampQuantity(quantity, item.product.stock) }
              : item
          ),
        }));
      },

      refreshProducts: (fresh) => {
        const byId = new Map(fresh.map((p) => [p.id, p]));
        set((state) => ({
          items: state.items
            .filter((item) => byId.has(item.product.id))
            .map((item) => {
              const product = byId.get(item.product.id)!;
              return {
                product,
                quantity: clampQuantity(item.quantity, product.stock),
              };
            }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (sum, item) =>
            sum +
            (item.product.salePrice ?? item.product.price) * item.quantity,
          0
        ),
    }),
    { name: "cart-storage" }
  )
);
