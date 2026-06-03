"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import ProductCard from "@/components/product/ProductCard";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { showToast } from "@/components/ui/toast";

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <Heart className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-[#1d1d1f]">
          관심상품이 없습니다
        </h2>
        <p className="text-[#86868b] mt-2 text-sm">
          마음에 드는 상품의 하트를 눌러보세요
        </p>
        <Link href="/products" className="mt-6">
          <Button className="bg-[#1A56DB] hover:bg-[#1747b4]">
            상품 둘러보기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1d1d1f]">
            관심상품 ({items.length})
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                items.forEach((p) => addToCart(p));
                showToast("모든 관심상품이 장바구니에 담겼습니다.");
              }}
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              전체 장바구니 담기
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-red-500 hover:text-red-600"
              onClick={clearWishlist}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              전체 삭제
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
