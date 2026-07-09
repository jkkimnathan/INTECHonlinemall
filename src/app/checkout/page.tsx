"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { loadTossPayments, TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { ShippingInfo } from "@/types/order";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

const shippingMemos = [
  "배송 전 연락 부탁드립니다",
  "부재 시 경비실에 맡겨주세요",
  "부재 시 문 앞에 놓아주세요",
  "부재 시 택배함에 넣어주세요",
  "직접 입력",
];

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice } = useCartStore();
  const { user, isLoggedIn, loading: authLoading } = useAuthStore();
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
  const [usePoints, setUsePoints] = useState(0);
  const [error, setError] = useState("");
  const [daumLoaded, setDaumLoaded] = useState(false);

  // 토스 결제위젯 (결제수단 선택 UI가 위젯 안에 포함됨)
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const widgetInitRef = useRef(false);

  const subtotal = getTotalPrice();
  const shippingFee = subtotal >= 50000 ? 0 : 3000;
  const discount = Math.min(usePoints, subtotal);
  const total = subtotal + shippingFee - discount;

  // 위젯 초기화 (1회). React Strict Mode의 effect 이중 실행에도 안전하도록
  // ref 가드로 단 한 번만 렌더한다(위젯은 같은 selector에 두 번 렌더하면 오류).
  useEffect(() => {
    if (!user || items.length === 0 || widgetInitRef.current) return;
    widgetInitRef.current = true;

    (async () => {
      try {
        const toss = await loadTossPayments(TOSS_CLIENT_KEY);
        const w = toss.widgets({ customerKey: user.id });
        await w.setAmount({ currency: "KRW", value: total });
        await Promise.all([
          w.renderPaymentMethods({ selector: "#toss-payment-methods" }),
          w.renderAgreement({ selector: "#toss-agreement" }),
        ]);
        setWidgets(w);
        setWidgetReady(true);
      } catch (e) {
        console.error("toss widget init failed:", e);
        widgetInitRef.current = false; // 실패 시 재시도 허용
        setError("결제창을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, items.length]);

  // 금액이 바뀌면 위젯에 반영 (포인트 사용 등)
  useEffect(() => {
    if (widgets && widgetReady) {
      widgets.setAmount({ currency: "KRW", value: total }).catch(() => {});
    }
  }, [widgets, widgetReady, total]);

  // 비로그인 리다이렉트 (렌더 중이 아니라 effect에서)
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [authLoading, isLoggedIn, router]);

  // 결제 실패로 돌아온 경우 안내 (failUrl 리다이렉트)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const failMessage = params.get("message");
    if (params.get("code") || failMessage) {
      setError(failMessage || "결제가 완료되지 않았습니다. 다시 시도해주세요.");
      window.history.replaceState(null, "", "/checkout");
    }
  }, []);

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

  // 인증 상태 확인 중이거나 비로그인일 때는 대기 화면.
  // 리다이렉트는 렌더 중이 아니라 effect에서 처리(정적 생성 중 location 참조 오류 방지 +
  // 새로고침·직접 진입 시 로그인 판정 전 튕김 방지).
  if (authLoading || !isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#fbfbfd]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // 장바구니 비어있음
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#fbfbfd]">
        <ShoppingBag className="h-16 w-16 text-[#d1d5db] mb-4" />
        <h2 className="text-xl font-bold text-[#1d1d1f]">주문할 상품이 없습니다</h2>
        <Link href="/products" className="mt-4">
          <Button className="rounded-full bg-[#1A56DB] hover:bg-[#1747b4]">쇼핑하기</Button>
        </Link>
      </div>
    );
  }

  const updateShipping = (field: keyof ShippingInfo, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const handleOrder = async () => {
    setError("");
    if (!shipping.name) return setError("받는 분 이름을 입력해주세요.");
    if (!shipping.phone) return setError("연락처를 입력해주세요.");
    if (!shipping.address) return setError("주소를 입력해주세요.");
    if (!widgets || !widgetReady) return setError("결제창이 아직 준비되지 않았습니다.");

    const memo = shipping.memo === "직접 입력" ? customMemo : shipping.memo;

    setSubmitting(true);
    try {
      // 1단계: 서버가 금액을 재계산하고 "결제대기" 주문을 만든다
      const res = await fetch("/api/orders/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          shipping: { ...shipping, memo },
          usePoints: discount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "주문 준비에 실패했습니다.");
        return;
      }

      // 2단계: 서버가 확정한 금액으로 토스 결제창 호출
      await widgets.setAmount({ currency: "KRW", value: data.amount });
      await widgets.requestPayment({
        orderId: data.orderId,
        orderName: data.orderName,
        successUrl: `${window.location.origin}/order/complete`,
        failUrl: `${window.location.origin}/checkout`,
        customerEmail: user?.email,
        customerName: user?.name || shipping.name,
      });
      // requestPayment는 성공 시 successUrl로 이동하므로 이후 코드는 실행되지 않음
    } catch (e) {
      // 사용자가 결제창을 닫은 경우 등
      const message = e instanceof Error ? e.message : "";
      if (!message.includes("취소")) {
        setError(message || "결제를 시작하지 못했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fbfbfd] min-h-screen">
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
        onLoad={() => setDaumLoaded(true)}
      />
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em]">주문서 작성</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 배송정보 + 결제수단 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 주문 상품 요약 */}
            <div className="bg-white rounded-2xl border border-[#f1f1f3] p-6">
              <h2 className="font-bold text-[#1d1d1f] mb-3">
                주문 상품 ({items.length}개)
              </h2>
              <div className="space-y-2">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-en text-[10px] font-semibold uppercase tracking-[0.1em] text-[#86868b]">{product.brand}</p>
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
            <div className="bg-white rounded-2xl border border-[#f1f1f3] p-6">
              <h2 className="font-bold text-[#1d1d1f] mb-4">배송 정보</h2>
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

            {/* 적립금 사용 */}
            {user && user.points > 0 && (
              <div className="bg-white rounded-2xl border border-[#f1f1f3] p-6">
                <h2 className="font-bold text-[#1d1d1f] mb-4">적립금 사용</h2>
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

            {/* 결제 수단 (토스페이먼츠 위젯) */}
            <div className="bg-white rounded-2xl border border-[#f1f1f3] p-6">
              <h2 className="font-bold text-[#1d1d1f] mb-4">결제 수단</h2>
              {!widgetReady && !error && (
                <p className="text-sm text-gray-400 py-8 text-center">결제 수단을 불러오는 중...</p>
              )}
              <div id="toss-payment-methods" />
              <div id="toss-agreement" />
            </div>
          </div>

          {/* 오른쪽: 결제 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#f1f1f3] p-6 sticky top-32">
              <h3 className="font-bold text-[#1d1d1f] mb-4">결제 금액</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">상품 금액</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">배송비</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-[#059669]">무료</span>
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
                <span className="font-bold text-[#1d1d1f]">총 결제금액</span>
                <span className="text-2xl font-bold text-[#1d1d1f] tabular-nums tracking-[-0.025em]">
                  {formatPrice(total)}
                </span>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-3">{error}</p>
              )}

              <Button
                className="w-full h-12 rounded-full bg-[#1A56DB] hover:bg-[#1747b4] text-white font-semibold text-base"
                onClick={handleOrder}
                disabled={submitting || !widgetReady}
              >
                {submitting ? "주문 처리 중..." : `${formatPrice(total)} 결제하기`}
              </Button>

              <p className="text-xs text-gray-400 mt-3 text-center leading-relaxed">
                주문 내용을 확인하였으며, 결제에 동의합니다.
                <br />
                토스페이먼츠 안전결제
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
