"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { ShoppingCart, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { showToast } from "@/components/ui/toast";

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
      className="group bg-white rounded-[14px] border border-[#f1f1f3] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:-translate-y-0.5 hover:border-[#e5e5ea] hover:shadow-[0_1px_2px_0_rgba(15,23,42,.04),0_12px_28px_-8px_rgba(15,23,42,.08)]"
    >
      {/* 상품 이미지 */}
      <div className="relative aspect-square bg-[#f5f5f7] flex items-center justify-center overflow-hidden">
        {product.images[0] ? (
          <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="text-center p-4">
            <p className="font-en text-[10px] font-semibold uppercase tracking-[0.1em] text-[#86868b]">{product.brand}</p>
            <p className="text-[#3f3f46] text-sm mt-1 line-clamp-2">{product.name}</p>
          </div>
        )}

        {/* 배지 */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {product.condition === "refurbished" && (
            <Badge className="rounded-full bg-[#fff7ed] text-[#c2410c] text-[11px] font-semibold border-transparent">리퍼</Badge>
          )}
          {product.isNew && (
            <Badge className="rounded-full bg-[#eef4ff] text-[#1d4ed8] text-[11px] font-semibold border-transparent">NEW</Badge>
          )}
          {product.isSale && product.salePrice && (
            <Badge className="rounded-full bg-[#DC2626] text-white text-[11px] font-semibold border-transparent">
              {getDiscountRate(product.price, product.salePrice)}%
            </Badge>
          )}
          {isFreeShipping && (
            <Badge className="rounded-full bg-[#ecfdf5] text-[#047857] text-[11px] font-semibold border-transparent">
              <Truck className="h-3 w-3 mr-0.5" />
              무료배송
            </Badge>
          )}
        </div>

        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="outline" className="rounded-full text-[11px] text-[#b91c1c] border-[#fecaca] bg-white">
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
                showToast("상품이 장바구니에 담겼습니다.");
              }}
              className="bg-white text-[#1d1d1f] px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-[#1A56DB] hover:text-white transition-colors shadow-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              장바구니 담기
            </button>
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="p-4">
        <p className="font-en text-[10px] font-semibold uppercase tracking-[0.1em] text-[#86868b]">{product.brand}</p>
        <h3 className="text-[13.5px] font-semibold text-[#1d1d1f] mt-1.5 line-clamp-2 leading-[1.4] tracking-[-0.01em] min-h-[38px]">
          {product.name}
        </h3>
        <p className="text-[11px] text-[#86868b] mt-1">{product.category}</p>

        <div className="mt-3">
          {product.salePrice ? (
            <div>
              <span className="text-[11px] text-[#a1a1aa] line-through tabular-nums">
                {formatPrice(product.price)}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[13px] font-bold text-[#b91c1c] tabular-nums">
                  {getDiscountRate(product.price, product.salePrice)}%
                </span>
                <span className="text-[15px] font-bold text-[#1d1d1f] tabular-nums tracking-[-0.01em]">
                  {formatPrice(product.salePrice)}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-[15px] font-bold text-[#1d1d1f] tabular-nums tracking-[-0.01em]">
              {formatPrice(product.price)}
            </span>
          )}
          {/* 적립금 */}
          <p className="text-[10.5px] text-[#86868b] mt-1.5 tabular-nums">
            적립금 {formatPrice(points)}
          </p>
        </div>
      </div>
    </Link>
  );
}
