import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product";
import { createClient } from "@/lib/supabase/client";
import { toProduct } from "@/lib/supabase/product-utils";

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncFromSupabase: () => Promise<void>;
}

async function getLoggedInUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const exists = get().items.find((item) => item.id === product.id);
        if (exists) return;

        set((state) => ({ items: [...state.items, product] }));

        // DB 동기화 (비동기, 실패해도 무시)
        getLoggedInUserId().then((userId) => {
          if (!userId) return;
          const supabase = createClient();
          supabase
            .from("wishlist_items")
            .upsert({ user_id: userId, product_id: product.id }, { onConflict: "user_id,product_id" })
            .then(() => {});
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));

        getLoggedInUserId().then((userId) => {
          if (!userId) return;
          const supabase = createClient();
          supabase
            .from("wishlist_items")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId)
            .then(() => {});
        });
      },

      isInWishlist: (productId) =>
        get().items.some((item) => item.id === productId),

      clearWishlist: () => set({ items: [] }),

      syncFromSupabase: async () => {
        const userId = await getLoggedInUserId();
        if (!userId) return;

        const supabase = createClient();

        // 로컬 아이템을 DB에 동기화
        const localItems = get().items;
        for (const item of localItems) {
          await supabase
            .from("wishlist_items")
            .upsert({ user_id: userId, product_id: item.id }, { onConflict: "user_id,product_id" });
        }

        // DB에서 전체 목록 로드
        const { data: wishlistRows } = await supabase
          .from("wishlist_items")
          .select("product_id")
          .eq("user_id", userId);

        if (!wishlistRows || wishlistRows.length === 0) return;

        const productIds = wishlistRows.map((r) => r.product_id as string);
        const { data: products } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);

        if (products) {
          set({ items: products.map((p) => toProduct(p as Record<string, unknown>)) });
        }
      },
    }),
    { name: "wishlist-storage" }
  )
);
