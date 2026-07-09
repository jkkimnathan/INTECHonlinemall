"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getOrderById } from "@/lib/supabase/orders";
import { useCartStore } from "@/store/cart";
import { Order } from "@/types/order";
import { CheckCircle, XCircle, Package, ArrowRight, Loader2 } from "lucide-react";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentKey = searchParams.get("paymentKey");
  const amount = searchParams.get("amount");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [confirmError, setConfirmError] = useState("");
  const confirmStartedRef = useRef(false);

  useEffect(() => {
    if (!orderId) return;
    if (confirmStartedRef.current) return;
    confirmStartedRef.current = true;

    (async () => {
      // 토스 결제 성공 리다이렉트인 경우: 서버 승인부터 처리
      if (paymentKey && amount) {
        try {
          const res = await fetch("/api/payments/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
          });
          const data = await res.json();
          if (!res.ok) {
            setConfirmError(data.error || "결제 승인에 실패했습니다.");
            setLoading(false);
            return;
          }
          // 승인 성공 → 장바구니 비우기
          useCartStore.getState().clearCart();
        } catch {
          setConfirmError("결제 승인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
          setLoading(false);
          return;
        }
      }

      const o = await getOrderById(orderId);
      setOrder(o);
      setLoading(false);
    })();
  }, [orderId, paymentKey, amount]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        {paymentKey && (
          <p className="text-sm text-gray-500">결제를 확인하고 있습니다. 잠시만 기다려주세요...</p>
        )}
      </div>
    );
  }

  // 결제 승인 실패
  if (confirmError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-[#1d1d1f]">결제가 완료되지 않았습니다</h1>
        <p className="text-sm text-[#86868b] mt-2 text-center">{confirmError}</p>
        <p className="text-xs text-[#a1a1aa] mt-1">결제 금액은 청구되지 않았거나 자동 취소되었습니다.</p>
        <Link href="/checkout" className="mt-6">
          <Button className="rounded-full bg-[#1A56DB] hover:bg-[#1747b4]">다시 결제하기</Button>
        </Link>
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
    <div className="bg-[#fbfbfd] min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* 완료 아이콘 */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#ecfdf5] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-[#059669]" />
            </div>
            <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa]">
              Order Complete
            </div>
            <h1 className="text-[30px] font-bold text-[#1d1d1f] tracking-[-0.025em] mt-2">
              주문이 완료되었습니다!
            </h1>
            <p className="text-[#86868b] mt-2">
              주문번호: <span className="font-mono font-bold text-[#1d1d1f]">{order.id}</span>
            </p>
          </div>

          {/* 주문 요약 */}
          <div className="bg-white rounded-2xl border border-[#f1f1f3] p-6 mb-6">
            <h2 className="font-bold text-[#1d1d1f] mb-4">주문 내역</h2>

            <div className="space-y-3">
              {order.items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-en text-[10px] font-semibold uppercase tracking-[0.1em] text-[#86868b]">{product.brand}</p>
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
              <span className="font-bold text-[#1d1d1f]">총 결제금액</span>
              <span className="text-2xl font-bold text-[#1d1d1f] tabular-nums tracking-[-0.025em]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          {/* 배송 정보 */}
          <div className="bg-white rounded-2xl border border-[#f1f1f3] p-6 mb-6">
            <h2 className="font-bold text-[#1d1d1f] mb-4">배송 정보</h2>
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
              <Button variant="outline" className="w-full h-11 rounded-full">
                <Package className="h-4 w-4 mr-2" />
                주문 상세보기
              </Button>
            </Link>
            <Link href="/products" className="flex-1">
              <Button className="w-full h-11 rounded-full bg-[#1A56DB] hover:bg-[#1747b4]">
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
