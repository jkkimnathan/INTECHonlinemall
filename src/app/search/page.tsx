"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/dummy-products";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const products = query ? getProducts({ search: query }) : getProducts();

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
        <div className="container mx-auto px-4 py-20 text-center text-gray-400">
          검색 중...
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
