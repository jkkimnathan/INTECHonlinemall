"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { dummyProducts } from "@/lib/dummy-products";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const products = dummyProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => alert("상품 등록 기능은 Supabase 연동 후 구현됩니다.")}
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
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">상품</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">브랜드</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">카테고리</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">가격</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">재고</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">상태</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[250px]">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400 md:hidden">
                      {product.brand} | {product.category}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                    {product.brand}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {product.salePrice ? (
                      <div>
                        <p className="font-medium text-red-600">
                          {formatPrice(product.salePrice)}
                        </p>
                        <p className="text-xs text-gray-400 line-through">
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
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }
                    >
                      {product.stock === 0 ? "품절" : product.stock}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <div className="flex gap-1 justify-center">
                      {product.isNew && (
                        <Badge className="bg-blue-100 text-blue-700 text-[10px]">NEW</Badge>
                      )}
                      {product.isSale && (
                        <Badge className="bg-red-100 text-red-700 text-[10px]">SALE</Badge>
                      )}
                      {product.condition === "refurbished" && (
                        <Badge className="bg-orange-100 text-orange-700 text-[10px]">리퍼</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
          총 {products.length}개 상품
        </div>
      </div>
    </div>
  );
}
