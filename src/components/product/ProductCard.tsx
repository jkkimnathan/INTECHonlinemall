"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { ShoppingCart, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function getDiscountRate(price: number, salePrice: number) {
  return Math.round(((price - salePrice) / price) * 100);
}

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((s) => s.addItem);
  const finalPrice = product.salePrice ?? product.price;
  const points = Math.floor(finalPrice * 0.01);
  const isFreeShipping = finalPrice >= 50000;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* 상품 이미지 */}
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-400 text-xs">{product.brand}</p>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.name}</p>
        </div>

        {/* 배지 */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {product.condition === "refurbished" && (
            <Badge className="bg-orange-500 text-white text-[10px]">리퍼</Badge>
          )}
          {product.isNew && (
            <Badge className="bg-blue-600 text-white text-[10px]">NEW</Badge>
          )}
          {product.isSale && product.salePrice && (
            <Badge className="bg-red-500 text-white text-[10px]">
              {getDiscountRate(product.price, product.salePrice)}%
            </Badge>
          )}
          {isFreeShipping && (
            <Badge className="bg-green-600 text-white text-[10px]">
              <Truck className="h-3 w-3 mr-0.5" />
              무료배송
            </Badge>
          )}
        </div>

        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="outline" className="text-[10px] text-red-500 border-red-300">
              재고 {product.stock}개
            </Badge>
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">품절</span>
          </div>
        )}

        {/* 호버 시 장바구니 담기 */}
        {product.stock > 0 && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-colors shadow-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              장바구니 담기
            </button>
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="p-3">
        <p className="text-xs text-blue-600 font-medium">{product.brand}</p>
        <h3 className="text-sm font-medium text-gray-900 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{product.category}</p>

        <div className="mt-2">
          {product.salePrice ? (
            <div>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-red-600 font-bold text-sm">
                  {getDiscountRate(product.price, product.salePrice)}%
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {formatPrice(product.salePrice)}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-sm font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
          {/* 적립금 */}
          <p className="text-[11px] text-orange-600 mt-1">
            적립금 {formatPrice(points)}
          </p>
        </div>
      </div>
    </Link>
  );
}
