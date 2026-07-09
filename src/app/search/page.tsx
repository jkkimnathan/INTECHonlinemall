"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/supabase/products";
import { Product } from "@/types/product";
import { isHiddenBrand } from "@/config/site";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [result, setResult] = useState<{ query: string; products: Product[] } | null>(null);
  // 현재 query에 대한 결과가 아직 없으면 로딩 중 (effect 내 동기 setState 없이 파생)
  const loading = result === null || result.query !== query;
  const products = !loading && result ? result.products : [];

  useEffect(() => {
    let cancelled = false;
    const opts = query ? { search: query } : {};
    getProducts(opts)
      .then((data) => {
        // query가 바뀐 뒤 도착한 이전 응답은 무시 (stale response 방지)
        if (cancelled) return;
        setResult({ query, products: data.filter((p) => !isHiddenBrand(p.brand)) });
      })
      .catch(() => {
        if (cancelled) return;
        setResult({ query, products: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-[#a1a1aa]">
        검색 중...
      </div>
    );
  }

  return (
    <ProductGrid
      products={products}
      title={query ? `"${query}" 검색 결과` : "전체 상품"}
      description={
        query
          ? `${products.length}개의 검색 결과`
          : "검색어를 입력하세요"
      }
    />
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center text-[#a1a1aa]">
          검색 중...
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
