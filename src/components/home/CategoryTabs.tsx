"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/lib/supabase/products";
import ProductCard from "@/components/product/ProductCard";
import { Product, ProductCategory } from "@/types/product";
import { isHiddenBrand } from "@/config/site";

const categories: { label: string; value: ProductCategory | "전체" }[] = [
  { label: "전체", value: "전체" },
  { label: "CPU", value: "CPU" },
  { label: "그래픽카드", value: "그래픽카드" },
  { label: "메인보드", value: "메인보드" },
  { label: "모니터", value: "모니터" },
  { label: "조립PC", value: "조립PC" },
  { label: "기타", value: "기타" },
];

export default function CategoryTabs() {
  const [active, setActive] = useState<ProductCategory | "전체">("전체");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  // 로딩 여부는 "현재 선택된 카테고리의 데이터를 이미 불러왔는가"로 파생 (effect 내 동기 setState 제거)
  const loading = loadedFor !== active;

  useEffect(() => {
    let alive = true;
    const opts =
      active === "전체" ? {} : { category: active as ProductCategory };
    getProducts(opts).then((data) => {
      if (!alive) return;
      setProducts(data.filter((p) => !isHiddenBrand(p.brand)).slice(0, 8));
      setLoadedFor(active);
    });
    return () => {
      alive = false;
    };
  }, [active]);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa]">
            Categories
          </div>
          <h2 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em] mt-2">
            카테고리별 인기상품
          </h2>
          <p className="text-sm text-[#86868b] mt-1">
            카테고리를 선택하여 인기 상품을 확인하세요
          </p>
        </div>

        {/* 탭 버튼 */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActive(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                active === cat.value
                  ? "bg-[#1A56DB] text-white"
                  : "bg-[#f5f5f7] text-[#3f3f46] hover:bg-[#EEF4FF] hover:text-[#1A56DB]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 상품 그리드 */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <p>상품을 불러오는 중...</p>
          </div>
        ) : products.length > 0 ? (
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
