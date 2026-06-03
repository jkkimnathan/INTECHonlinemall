"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getProducts, deleteProduct } from "@/lib/supabase/products";
import { Product } from "@/types/product";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { showToast } from "@/components/ui/toast";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getProducts({}).then(setAllProducts);
  }, []);

  const products = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.brand.toLowerCase().includes(search.toLowerCase())
      ),
    [allProducts, search]
  );

  async function handleDelete(product: Product) {
    if (!confirm(`"${product.name}"을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    setDeletingId(product.id);
    const { error } = await deleteProduct(product.id);
    if (error) {
      showToast(`삭제 실패: ${error}`, "error");
    } else {
      setAllProducts((prev) => prev.filter((p) => p.id !== product.id));
    }
    setDeletingId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1d1d1f]">상품 관리</h1>
        <Button
          className="bg-[#1A56DB] hover:bg-[#1747b4]"
          onClick={() => router.push("/admin/products/new")}
        >
          <Plus className="h-4 w-4 mr-1" />
          상품 등록
        </Button>
      </div>

      {/* 검색 */}
      <div className="relative max-w-sm mb-4">
        <Input
          placeholder="상품명 또는 브랜드 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#86868b]">상품</th>
                <th className="text-left px-4 py-3 font-medium text-[#86868b] hidden md:table-cell">브랜드</th>
                <th className="text-left px-4 py-3 font-medium text-[#86868b] hidden lg:table-cell">카테고리</th>
                <th className="text-right px-4 py-3 font-medium text-[#86868b]">가격</th>
                <th className="text-center px-4 py-3 font-medium text-[#86868b]">재고</th>
                <th className="text-center px-4 py-3 font-medium text-[#86868b] hidden sm:table-cell">상태</th>
                <th className="text-center px-4 py-3 font-medium text-[#86868b]">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1d1d1f] truncate max-w-[250px]">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#a1a1aa] md:hidden">
                      {product.brand} | {product.category}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-[#3f3f46]">
                    {product.brand}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[#3f3f46]">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {product.salePrice ? (
                      <div>
                        <p className="font-medium text-red-600">
                          {formatPrice(product.salePrice)}
                        </p>
                        <p className="text-xs text-[#a1a1aa] line-through">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    ) : (
                      <span className="font-medium">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      className={
                        product.stock === 0
                          ? "bg-red-100 text-red-700"
                          : product.stock <= 5
                          ? "bg-[#fff7ed] text-[#c2410c]"
                          : "bg-[#ecfdf5] text-[#047857]"
                      }
                    >
                      {product.stock === 0 ? "품절" : product.stock}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <div className="flex gap-1 justify-center">
                      {product.isNew && (
                        <Badge className="bg-blue-100 text-[#1A56DB] text-[10px]">NEW</Badge>
                      )}
                      {product.isSale && (
                        <Badge className="bg-red-100 text-red-700 text-[10px]">SALE</Badge>
                      )}
                      {product.condition === "refurbished" && (
                        <Badge className="bg-[#fff7ed] text-[#c2410c] text-[10px]">리퍼</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => router.push(`/admin/products/${product.id}`)}
                      >
                        <Pencil className="h-3.5 w-3.5 text-[#a1a1aa]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={deletingId === product.id}
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t text-sm text-[#86868b]">
          총 {products.length}개 상품
        </div>
      </div>
    </div>
  );
}
