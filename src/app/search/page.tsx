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
  const [products, setProducts] = useState<Product[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  // 로딩 여부는 "현재 검색어의 결과를 이미 불러왔는가"로 파생 (effect 내 동기 setState 제거)
  const loading = loadedFor !== query;

  useEffect(() => {
    let alive = true;
    const opts = query ? { search: query } : {};
    getProducts(opts).then((data) => {
      if (!alive) return;
      setProducts(data.filter((p) => !isHiddenBrand(p.brand)));
      setLoadedFor(query);
    });
    return () => {
      alive = false;
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
