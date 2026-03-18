import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product";

interface RecentlyViewedStore {
  items: Product[];
  addItem: (product: Product) => void;
  clearItems: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          const filtered = state.items.filter((item) => item.id !== product.id);
          return { items: [product, ...filtered].slice(0, 5) };
        });
      },

      clearItems: () => set({ items: [] }),
    }),
    { name: "recently-viewed-storage" }
  )
);
