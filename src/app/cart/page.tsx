"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } =
    useCartStore();

  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice >= 50000 ? 0 : 3000;
  const finalTotal = totalPrice + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">
          장바구니가 비어있습니다
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          마음에 드는 상품을 담아보세요
        </p>
        <Link href="/products" className="mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700">
            쇼핑 계속하기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            장바구니 ({items.length})
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-red-500 hover:text-red-600"
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
                  className="bg-white rounded-lg border p-4 flex gap-4"
                >
                  {/* 이미지 */}
                  <Link href={`/products/${product.slug}`}>
                    <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-400 text-[10px] text-center">
                        {product.brand}
                      </span>
                    </div>
                  </Link>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.slug}`}>
                      <p className="text-xs text-blue-600">{product.brand}</p>
                      <h3 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-2 flex items-center gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(product.salePrice)}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {/* 수량 + 삭제 */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          className="p-1.5 hover:bg-gray-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-medium">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              product.id,
                              Math.min(product.stock, quantity + 1)
                            )
                          }
                          className="p-1.5 hover:bg-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">
                          {formatPrice(unitPrice * quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-gray-400 hover:text-red-500"
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
            <div className="bg-white rounded-lg border p-6 sticky top-32">
              <h3 className="font-bold text-gray-900 mb-4">주문 요약</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">상품 금액</span>
                  <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">배송비</span>
                  <span className="text-gray-900">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">무료</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-gray-400">
                    * {formatPrice(50000)} 이상 구매 시 무료배송
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-900">총 결제금액</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              <Button
                className="w-full mt-4 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                onClick={() => window.location.href = "/checkout"}
              >
                주문하기
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <Link href="/products">
                <Button variant="outline" className="w-full mt-2 text-sm">
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
