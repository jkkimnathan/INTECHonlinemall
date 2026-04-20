"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { createOrder } from "@/lib/supabase/orders";
import { PaymentMethod, ShippingInfo } from "@/types/order";
import {
  CreditCard,
  Building2,
  Wallet,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    id: "card",
    label: "신용/체크카드",
    icon: <CreditCard className="h-5 w-5" />,
    description: "모든 카드 결제 가능",
  },
  {
    id: "transfer",
    label: "실시간 계좌이체",
    icon: <Building2 className="h-5 w-5" />,
    description: "은행 계좌에서 바로 결제",
  },
  {
    id: "virtual",
    label: "가상계좌",
    icon: <Building2 className="h-5 w-5" />,
    description: "발급된 계좌로 입금",
  },
  {
    id: "kakaopay",
    label: "카카오페이",
    icon: <Wallet className="h-5 w-5" />,
    description: "카카오페이 간편결제",
  },
  {
    id: "naverpay",
    label: "네이버페이",
    icon: <Wallet className="h-5 w-5" />,
    description: "네이버페이 간편결제",
  },
  {
    id: "tosspay",
    label: "토스페이",
    icon: <Wallet className="h-5 w-5" />,
    description: "토스페이 간편결제",
  },
];

const shippingMemos = [
  "배송 전 연락 부탁드립니다",
  "부재 시 경비실에 맡겨주세요",
  "부재 시 문 앞에 놓아주세요",
  "부재 시 택배함에 넣어주세요",
  "직접 입력",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isLoggedIn } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const [shipping, setShipping] = useState<ShippingInfo>({
    name: user?.name || "",
    phone: user?.phone || "",
    zipcode: "",
    address: "",
    addressDetail: "",
    memo: shippingMemos[0],
  });
  const [customMemo, setCustomMemo] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("card");
  const [usePoints, setUsePoints] = useState(0);
  const [error, setError] = useState("");
  const [daumLoaded, setDaumLoaded] = useState(false);

  const openAddressSearch = () => {
    const daum = (window as unknown as Record<string, unknown>).daum as
      | { Postcode: new (opts: Record<string, unknown>) => { open: () => void } }
      | undefined;
    if (!daum?.Postcode) return;
    new daum.Postcode({
      oncomplete: (data: { zonecode: string; roadAddress: string; jibunAddress: string }) => {
        updateShipping("zipcode", data.zonecode);
        updateShipping("address", data.roadAddress || data.jibunAddress);
      },
    }).open();
  };

  // 로그인 체크
  if (!isLoggedIn) {
    router.push("/login");
    return null;
  }

  // 장바구니 비어있음
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">주문할 상품이 없습니다</h2>
        <Link href="/products" className="mt-4">
          <Button className="bg-blue-600 hover:bg-blue-700">쇼핑하기</Button>
        </Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shippingFee = subtotal >= 50000 ? 0 : 3000;
  const discount = Math.min(usePoints, subtotal);
  const total = subtotal + shippingFee - discount;

  const updateShipping = (field: keyof ShippingInfo, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const handleOrder = async () => {
    setError("");
    if (!shipping.name) return setError("받는 분 이름을 입력해주세요.");
    if (!shipping.phone) return setError("연락처를 입력해주세요.");
    if (!shipping.address) return setError("주소를 입력해주세요.");

    const memo =
      shipping.memo === "직접 입력" ? customMemo : shipping.memo;

    setSubmitting(true);
    const { order, error: orderErr } = await createOrder({
      userId: user!.id,
      items: [...items],
      shipping: { ...shipping, memo },
      paymentMethod: selectedPayment,
      subtotal,
      shippingFee,
      discount,
      total,
    });
    setSubmitting(false);

    if (orderErr || !order) {
      setError(`주문 실패: ${orderErr || "알 수 없는 오류"}`);
      return;
    }

    clearCart();
    router.push(`/order/complete?orderId=${order.id}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
        onLoad={() => setDaumLoaded(true)}
      />
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">주문서 작성</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 배송정보 + 결제수단 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 주문 상품 요약 */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="font-bold text-gray-900 mb-3">
                주문 상품 ({items.length}개)
              </h2>
              <div className="space-y-2">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-600">{product.brand}</p>
                      <p className="text-gray-900 truncate">{product.name}</p>
                      <p className="text-gray-400 text-xs">수량: {quantity}</p>
                    </div>
                    <span className="font-medium ml-4 whitespace-nowrap">
                      {formatPrice(
                        (product.salePrice ?? product.price) * quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 배송 정보 */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="font-bold text-gray-900 mb-4">배송 정보</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    받는 분 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={shipping.name}
                    onChange={(e) => updateShipping("name", e.target.value)}
                    placeholder="이름"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={shipping.phone}
                    onChange={(e) => updateShipping("phone", e.target.value)}
                    placeholder="010-0000-0000"
                    className="h-10"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    우편번호
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={shipping.zipcode}
                      onChange={(e) => updateShipping("zipcode", e.target.value)}
                      placeholder="우편번호"
                      className="h-10 max-w-[150px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10"
                      type="button"
                      onClick={openAddressSearch}
                      disabled={!daumLoaded}
                    >
                      주소 검색
                    </Button>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={shipping.address}
                    onChange={(e) => updateShipping("address", e.target.value)}
                    placeholder="기본 주소"
                    className="h-10"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상세 주소
                  </label>
                  <Input
                    value={shipping.addressDetail}
                    onChange={(e) =>
                      updateShipping("addressDetail", e.target.value)
                    }
                    placeholder="상세 주소 (동/호수 등)"
                    className="h-10"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    배송 메모
                  </label>
                  <select
                    value={shipping.memo}
                    onChange={(e) => updateShipping("memo", e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white h-10"
                  >
                    {shippingMemos.map((memo) => (
                      <option key={memo} value={memo}>
                        {memo}
                      </option>
                    ))}
                  </select>
                  {shipping.memo === "직접 입력" && (
                    <Input
                      value={customMemo}
                      onChange={(e) => setCustomMemo(e.target.value)}
                      placeholder="배송 메모를 입력해주세요"
                      className="mt-2 h-10"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 결제 수단 */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="font-bold text-gray-900 mb-4">결제 수단</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      selectedPayment === method.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={
                        selectedPayment === method.id
                          ? "text-blue-600"
                          : "text-gray-400"
                      }
                    >
                      {method.icon}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        selectedPayment === method.id
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 적립금 사용 */}
            {user && user.points > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="font-bold text-gray-900 mb-4">적립금 사용</h2>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={usePoints}
                    onChange={(e) =>
                      setUsePoints(
                        Math.min(
                          Math.max(0, Number(e.target.value)),
                          user.points,
                          subtotal
                        )
                      )
                    }
                    className="max-w-[150px] h-10"
                    min={0}
                    max={Math.min(user.points, subtotal)}
                  />
                  <span className="text-sm text-gray-500">
                    보유: {user.points.toLocaleString()}P
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUsePoints(Math.min(user.points, subtotal))}
                  >
                    전액 사용
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽: 결제 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-32">
              <h3 className="font-bold text-gray-900 mb-4">결제 금액</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">상품 금액</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">배송비</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600">무료</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>적립금 할인</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-baseline mb-4">
                <span className="font-bold">총 결제금액</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(total)}
                </span>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-3">{error}</p>
              )}

              <Button
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
                onClick={handleOrder}
                disabled={submitting}
              >
                {submitting ? "주문 처리 중..." : `${formatPrice(total)} 결제하기`}
              </Button>

              <p className="text-xs text-gray-400 mt-3 text-center leading-relaxed">
                주문 내용을 확인하였으며, 결제에 동의합니다.
                <br />
                (추후 토스페이먼츠 PG 연동 예정)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
