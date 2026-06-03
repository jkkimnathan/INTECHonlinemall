"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getOrderById } from "@/lib/supabase/orders";
import { Order } from "@/types/order";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
} from "lucide-react";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

const statusSteps = ["결제완료", "배송준비", "배송중", "배송완료"] as const;
const statusIcons = {
  결제완료: Clock,
  배송준비: Package,
  배송중: Truck,
  배송완료: CheckCircle,
};
const statusColors: Record<string, string> = {
  결제완료: "bg-blue-100 text-[#1A56DB]",
  배송준비: "bg-yellow-100 text-yellow-700",
  배송중: "bg-[#fff7ed] text-[#c2410c]",
  배송완료: "bg-[#ecfdf5] text-[#047857]",
  취소: "bg-red-100 text-red-700",
  "교환/반품": "bg-gray-100 text-[#3f3f46]",
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#a1a1aa]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-xl font-bold text-[#1d1d1f]">
          주문을 찾을 수 없습니다
        </h2>
        <Link href="/mypage" className="mt-4">
          <Button>마이페이지로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(
    order.status as (typeof statusSteps)[number]
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/mypage">
              <ArrowLeft className="h-5 w-5 text-[#86868b]" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#1d1d1f]">주문 상세</h1>
              <p className="text-sm text-[#86868b] font-mono">{order.id}</p>
            </div>
            <Badge className={`ml-auto ${statusColors[order.status]}`}>
              {order.status}
            </Badge>
          </div>

          {/* 배송 진행 상태 */}
          {currentStepIndex >= 0 && (
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h2 className="font-bold text-[#1d1d1f] mb-6">배송 상태</h2>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => {
                  const Icon = statusIcons[step];
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={step} className="flex flex-col items-center flex-1 relative">
                      {index > 0 && (
                        <div
                          className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                            index <= currentStepIndex
                              ? "bg-blue-500"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                          isCurrent
                            ? "bg-[#1A56DB] text-white"
                            : isActive
                            ? "bg-blue-100 text-[#1A56DB]"
                            : "bg-gray-100 text-[#a1a1aa]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`text-xs mt-2 ${
                          isActive ? "text-[#1d1d1f] font-medium" : "text-[#a1a1aa]"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 주문 상품 */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="font-bold text-[#1d1d1f] mb-4">주문 상품</h2>
            <div className="space-y-3">
              {order.items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 py-3 border-b last:border-0"
                >
                  <div className="relative w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill sizes="64px" className="object-cover" />
                    ) : (
                      <span className="text-[#a1a1aa] text-[10px]">{product.brand}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm font-medium text-[#1d1d1f] hover:text-[#1A56DB]"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-[#86868b]">
                      {product.brand} | 수량: {quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold whitespace-nowrap">
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
                <span className="text-[#86868b]">상품 금액</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">배송비</span>
                <span>
                  {order.shippingFee === 0
                    ? "무료"
                    : formatPrice(order.shippingFee)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>할인</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-base">
                <span>총 결제금액</span>
                <span className="text-[#1A56DB]">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* 배송 정보 */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="font-bold text-[#1d1d1f] mb-4">배송 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="text-[#86868b] w-20">받는 분</span>
                <span>{order.shipping.name}</span>
              </div>
              <div className="flex">
                <span className="text-[#86868b] w-20">연락처</span>
                <span>{order.shipping.phone}</span>
              </div>
              <div className="flex">
                <span className="text-[#86868b] w-20">주소</span>
                <span>
                  {order.shipping.address} {order.shipping.addressDetail}
                </span>
              </div>
              {order.shipping.memo && (
                <div className="flex">
                  <span className="text-[#86868b] w-20">메모</span>
                  <span>{order.shipping.memo}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex">
                  <span className="text-[#86868b] w-20">송장번호</span>
                  <span className="font-mono">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* 주문일시 */}
          <div className="text-center text-xs text-[#a1a1aa]">
            주문일시: {new Date(order.createdAt).toLocaleString("ko-KR")}
          </div>
        </div>
      </div>
    </div>
  );
}
