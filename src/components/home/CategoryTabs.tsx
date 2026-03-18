"use client";

import { useState } from "react";
import { getProducts } from "@/lib/dummy-products";
import ProductCard from "@/components/product/ProductCard";
import { ProductCategory } from "@/types/product";

const categories: { label: string; value: ProductCategory | "전체" }[] = [
  { label: "전체", value: "전체" },
  { label: "CPU", value: "CPU" },
  { label: "그래픽카드", value: "그래픽카드" },
  { label: "메인보드", value: "메인보드" },
  { label: "SSD", value: "SSD" },
  { label: "메모리", value: "메모리" },
  { label: "모니터", value: "모니터" },
  { label: "기타", value: "기타" },
];

export default function CategoryTabs() {
  const [active, setActive] = useState<ProductCategory | "전체">("전체");

  const products =
    active === "전체"
      ? getProducts({}).slice(0, 8)
      : getProducts({ category: active as ProductCategory }).slice(0, 8);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          카테고리별 인기상품
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          카테고리를 선택하여 인기 상품을 확인하세요
        </p>

        {/* 탭 버튼 */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActive(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                active === cat.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 상품 그리드 */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>해당 카테고리에 상품이 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}
