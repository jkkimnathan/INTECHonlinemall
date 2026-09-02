"use client";

import { useEffect, useMemo, useState } from "react";
import { getProducts } from "@/lib/supabase/products";
import { Product } from "@/types/product";

// 모듈 레벨 캐시 — 세션 중 1회만 로드
let cache: Product[] | null = null;
let loading: Promise<Product[]> | null = null;

async function loadProducts(): Promise<Product[]> {
  if (cache) return cache;
  if (!loading) {
    loading = getProducts()
      .then((list) => {
        cache = list;
        return list;
      })
      .catch(() => []);
  }
  return loading;
}

/** 공백/하이픈/언더스코어 제거 + 소문자 — "5070Ti" 와 "RTX 5070 Ti" 를 같게 매칭 */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s\-_]/g, "");
}

export interface Suggestion {
  slug: string;
  name: string;
  brand: string;
  price: number;
  salePrice: number | null;
  image: string | null;
}

/** 검색어 입력 시 상품 자동완성 목록 (최대 6개) */
export function useSearchSuggestions(query: string): Suggestion[] {
  const [products, setProducts] = useState<Product[]>(cache || []);
  const active = query.trim().length >= 1;

  useEffect(() => {
    if (!active || cache) return;
    let mounted = true;
    loadProducts().then((list) => {
      if (mounted) setProducts(list);
    });
    return () => {
      mounted = false;
    };
  }, [active]);

  return useMemo(() => {
    if (!active) return [];
    const q = normalize(query);
    if (!q) return [];
    const scored: { s: Suggestion; score: number }[] = [];
    for (const p of products) {
      const name = normalize(p.name);
      const brand = normalize(p.brand);
      const category = normalize(p.category);
      let score = -1;
      if (name.startsWith(q)) score = 3;
      else if (name.includes(q)) score = 2;
      else if (brand.includes(q) || category.includes(q)) score = 1;
      if (score >= 0) {
        scored.push({
          s: {
            slug: p.slug,
            name: p.name,
            brand: p.brand,
            price: p.price,
            salePrice: p.salePrice ?? null,
            image: p.images[0] || null,
          },
          score,
        });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 6).map((x) => x.s);
  }, [active, query, products]);
}
