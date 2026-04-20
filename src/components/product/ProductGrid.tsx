"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  title: string;
  description?: string;
  showFilters?: boolean;
  showSearch?: boolean;
}

type SortOption = "newest" | "price-asc" | "price-desc" | "name";

export default function ProductGrid({
  products,
  title,
  description,
  showFilters = true,
  showSearch = true,
}: ProductGridProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );
  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (selectedBrand) {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    switch (sortBy) {
      case "price-asc":
        result.sort(
          (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
        );
        break;
      case "price-desc":
        result.sort(
          (a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)
        );
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return result;
  }, [products, search, selectedCategory, selectedBrand, sortBy]);

  const hasActiveFilters = selectedCategory || selectedBrand || search;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {/* 검색 & 필터 바 */}
        {(showSearch || showFilters) && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {showSearch && (
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="상품 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {showFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={showFilterPanel ? "bg-blue-50 border-blue-300" : ""}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-1" />
                  필터
                </Button>
              )}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border rounded-md px-3 py-1.5 bg-white"
              >
                <option value="newest">최신순</option>
                <option value="price-asc">낮은 가격순</option>
                <option value="price-desc">높은 가격순</option>
                <option value="name">이름순</option>
              </select>

              <span className="text-sm text-gray-500 ml-2">
                {filtered.length}개 상품
              </span>
            </div>
          </div>
        )}

        {/* 필터 패널 */}
        {showFilterPanel && showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* 카테고리 필터 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  카테고리
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    variant={selectedCategory === "" ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setSelectedCategory("")}
                  >
                    전체
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 브랜드 필터 (브랜드 페이지가 아닐 때만) */}
              {brands.length > 1 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    브랜드
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      variant={selectedBrand === "" ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setSelectedBrand("")}
                    >
                      전체
                    </Button>
                    {brands.map((brand) => (
                      <Button
                        key={brand}
                        variant={selectedBrand === brand ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setSelectedBrand(brand)}
                      >
                        {brand}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 활성 필터 태그 */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-gray-500">적용된 필터:</span>
            {search && (
              <FilterTag label={`"${search}"`} onRemove={() => setSearch("")} />
            )}
            {selectedCategory && (
              <FilterTag
                label={selectedCategory}
                onRemove={() => setSelectedCategory("")}
              />
            )}
            {selectedBrand && (
              <FilterTag
                label={selectedBrand}
                onRemove={() => setSelectedBrand("")}
              />
            )}
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
                setSelectedBrand("");
              }}
              className="text-xs text-red-500 hover:text-red-700 ml-2"
            >
              전체 초기화
            </button>
          </div>
        )}

        {/* 상품 그리드 */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">검색 결과가 없습니다</p>
            <p className="text-gray-400 text-sm mt-2">
              다른 키워드나 필터를 시도해보세요
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}
