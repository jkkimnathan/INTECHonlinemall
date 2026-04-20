"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getOrderById } from "@/lib/supabase/orders";
import { Order } from "@/types/order";
import { CheckCircle, Package, ArrowRight, Loader2 } from "lucide-react";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId).then((o) => {
        setOrder(o);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-500">주문 정보를 찾을 수 없습니다.</p>
        <Link href="/" className="mt-4">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* 완료 아이콘 */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              주문이 완료되었습니다!
            </h1>
            <p className="text-gray-500 mt-2">
              주문번호: <span className="font-mono font-bold">{order.id}</span>
            </p>
          </div>

          {/* 주문 요약 */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">주문 내역</h2>

            <div className="space-y-3">
              {order.items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="text-xs text-blue-600">{product.brand}</p>
                    <p className="text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">수량: {quantity}</p>
                  </div>
                  <span className="font-medium">
                    {formatPrice(
                      (product.salePrice ?? product.price) * quantity
                    )}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">상품 금액</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">배송비</span>
                <span>
                  {order.shippingFee === 0 ? "무료" : formatPrice(order.shippingFee)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>할인</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-baseline">
              <span className="font-bold">총 결제금액</span>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          {/* 배송 정보 */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">배송 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="text-gray-500 w-20">받는 분</span>
                <span>{order.shipping.name}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-20">연락처</span>
                <span>{order.shipping.phone}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-20">주소</span>
                <span>
                  {order.shipping.address} {order.shipping.addressDetail}
                </span>
              </div>
              {order.shipping.memo && (
                <div className="flex">
                  <span className="text-gray-500 w-20">메모</span>
                  <span>{order.shipping.memo}</span>
                </div>
              )}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/order/${order.id}`} className="flex-1">
              <Button variant="outline" className="w-full h-11">
                <Package className="h-4 w-4 mr-2" />
                주문 상세보기
              </Button>
            </Link>
            <Link href="/products" className="flex-1">
              <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700">
                쇼핑 계속하기
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
          주문 정보를 불러오는 중...
        </div>
      }
    >
      <OrderCompleteContent />
    </Suspense>
  );
}
