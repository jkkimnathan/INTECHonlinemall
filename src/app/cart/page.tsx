"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { getProductsByIds } from "@/lib/supabase/products";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, refreshProducts } =
    useCartStore();
  // persist 스토어는 SSR HTML(빈 장바구니)과 첫 클라이언트 렌더가 달라질 수 있어 마운트 후 렌더
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // 담아둔 스냅샷이 낡지 않도록 서버의 최신 가격·재고로 갱신
  useEffect(() => {
    if (!mounted) return;
    const ids = useCartStore.getState().items.map((i) => i.product.id);
    if (ids.length === 0) return;
    getProductsByIds(ids)
      .then((fresh) => {
        if (fresh.length > 0) refreshProducts(fresh);
      })
      .catch(() => {});
  }, [mounted, refreshProducts]);

  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice >= 50000 ? 0 : 3000;
  const finalTotal = totalPrice + shippingFee;

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#fbfbfd]">
        <p className="text-sm text-[#86868b]">장바구니를 불러오는 중...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#fbfbfd]">
        <ShoppingBag className="h-16 w-16 text-[#d1d5db] mb-4" />
        <h2 className="text-xl font-bold text-[#1d1d1f]">
          장바구니가 비어있습니다
        </h2>
        <p className="text-[#86868b] mt-2 text-sm">
          마음에 드는 상품을 담아보세요
        </p>
        <Link href="/products" className="mt-6">
          <Button className="rounded-full bg-[#1A56DB] hover:bg-[#1747b4]">
            쇼핑 계속하기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfbfd] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa]">
              Shopping Cart
            </div>
            <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em] mt-1.5 tabular-nums">
              장바구니 ({items.length}종)
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs text-[#86868b] hover:text-[#DC2626]"
            onClick={clearCart}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            전체 삭제
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 장바구니 상품 목록 */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => {
              const unitPrice = product.salePrice ?? product.price;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-[#f1f1f3] p-4 flex gap-4"
                >
                  {/* 이미지 */}
                  <Link href={`/products/${product.slug}`}>
                    <div className="w-24 h-24 bg-[#f5f5f7] rounded-xl flex-shrink-0 relative overflow-hidden">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-[10px] text-center">
                            {product.brand}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.slug}`}>
                      <p className="font-en text-[10px] font-semibold uppercase tracking-[0.1em] text-[#86868b]">{product.brand}</p>
                      <h3 className="text-sm font-semibold text-[#1d1d1f] truncate hover:text-[#1A56DB] mt-0.5">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-2 flex items-center gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-sm font-bold text-[#1d1d1f] tabular-nums">
                            {formatPrice(product.salePrice)}
                          </span>
                          <span className="text-xs text-[#a1a1aa] line-through tabular-nums">
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-[#1d1d1f] tabular-nums">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {/* 수량 + 삭제 */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-[#e5e7eb] rounded-full">
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          className="p-1.5 pl-2.5 text-[#3f3f46] hover:text-[#1A56DB]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-semibold tabular-nums">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              product.id,
                              Math.min(product.stock, quantity + 1)
                            )
                          }
                          className="p-1.5 pr-2.5 text-[#3f3f46] hover:text-[#1A56DB]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold text-[#1d1d1f] tabular-nums whitespace-nowrap">
                          {formatPrice(unitPrice * quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-[#a1a1aa] hover:text-[#DC2626] flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#f1f1f3] p-6 sticky top-32">
              <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa] mb-4">
                Order Summary
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#86868b]">상품 금액</span>
                  <span className="text-[#1d1d1f] tabular-nums">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868b]">배송비</span>
                  <span className="text-[#1d1d1f] tabular-nums">
                    {shippingFee === 0 ? (
                      <span className="text-[#059669]">무료</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-[#a1a1aa] tabular-nums">
                    * {formatPrice(50000)} 이상 구매 시 무료배송
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[#1d1d1f]">총 결제금액</span>
                <span className="text-2xl font-bold text-[#1d1d1f] tabular-nums tracking-[-0.025em]">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              <Button
                className="w-full mt-5 h-12 rounded-full bg-[#1A56DB] hover:bg-[#1747b4] text-white font-semibold"
                onClick={() => router.push("/checkout")}
              >
                주문하기
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <Link href="/products">
                <Button variant="outline" className="w-full mt-2 text-sm rounded-full">
                  쇼핑 계속하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
