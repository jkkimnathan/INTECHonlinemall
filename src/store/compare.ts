"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product";

export const COMPARE_MAX = 4;

interface CompareStore {
  items: Product[];
  toggle: (product: Product) => { ok: boolean; message: string };
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

/** 상품 비교 담기 (최대 4개, 새로고침에도 유지) */
export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const { items } = get();
        if (items.some((p) => p.id === product.id)) {
          set({ items: items.filter((p) => p.id !== product.id) });
          return { ok: true, message: "비교함에서 제거했습니다." };
        }
        if (items.length >= COMPARE_MAX) {
          return { ok: false, message: `비교는 최대 ${COMPARE_MAX}개까지 가능합니다.` };
        }
        set({ items: [...items, product] });
        return { ok: true, message: "비교함에 담았습니다." };
      },
      remove: (id) => set({ items: get().items.filter((p) => p.id !== id) }),
      clear: () => set({ items: [] }),
      has: (id) => get().items.some((p) => p.id === id),
    }),
    { name: "intech-compare" }
  )
);
