"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getOrderById } from "@/lib/supabase/orders";
import { Order } from "@/types/order";
import { Search, Package, ArrowLeft, Loader2 } from "lucide-react";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

const statusColors: Record<string, string> = {
  결제완료: "bg-blue-100 text-[#1A56DB]",
  배송준비: "bg-yellow-100 text-yellow-700",
  배송중: "bg-[#ecfdf5] text-[#047857]",
  배송완료: "bg-gray-100 text-[#3f3f46]",
  취소: "bg-red-100 text-red-700",
  "교환/반품": "bg-[#fff7ed] text-[#c2410c]",
};

export default function OrderLookupPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [result, setResult] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setSearched(true);

    if (!orderNumber.trim() || !contact.trim()) {
      setError("주문번호와 연락처를 모두 입력해주세요.");
      return;
    }

    setSearching(true);
    const found = await getOrderById(orderNumber.trim());
    setSearching(false);

    if (found && (found.shipping.phone === contact.trim())) {
      setResult(found);
    } else {
      setError("주문을 찾을 수 없습니다. 주문번호와 연락처를 다시 확인해주세요.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-lg">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-7 w-7 text-[#1A56DB]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">비회원 주문조회</h1>
          <p className="text-sm text-[#86868b] mt-2">
            주문번호와 연락처를 입력하여 주문 내역을 확인하세요
          </p>
        </div>

        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3f3f46] mb-1.5">
              주문번호
            </label>
            <Input
              type="text"
              placeholder="예: ORD-1234567890"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3f3f46] mb-1.5">
              전화번호
            </label>
            <Input
              type="text"
              placeholder="주문 시 입력한 연락처"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full bg-[#1A56DB] hover:bg-[#1747b4]" disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            주문 조회
          </Button>
        </form>

        {/* 에러 메시지 */}
        {searched && error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 주문 결과 */}
        {result && (
          <div className="mt-6 bg-white rounded-lg border overflow-hidden">
            <div className="p-5 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#86868b]">주문번호</p>
                  <p className="text-sm font-bold text-[#1d1d1f]">{result.id}</p>
                </div>
                <Badge className={statusColors[result.status] || "bg-gray-100"}>
                  {result.status}
                </Badge>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-2">
                주문일: {new Date(result.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>

            {/* 상품 목록 */}
            <div className="p-5 border-b">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">주문 상품</h3>
              <div className="space-y-3">
                {result.items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1d1d1f] truncate">{item.product.name}</p>
                      <p className="text-xs text-[#86868b]">수량: {item.quantity}개</p>
                    </div>
                    <p className="text-sm font-medium text-[#1d1d1f] ml-4">
                      {formatPrice((item.product.salePrice ?? item.product.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 배송 정보 */}
            <div className="p-5 border-b">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">배송 정보</h3>
              <div className="text-sm text-[#3f3f46] space-y-1">
                <p>{result.shipping.name} / {result.shipping.phone}</p>
                <p>{result.shipping.address} {result.shipping.addressDetail}</p>
                {result.shipping.memo && (
                  <p className="text-[#a1a1aa]">배송메모: {result.shipping.memo}</p>
                )}
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="p-5">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">결제 정보</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-[#3f3f46]">
                  <span>상품금액</span>
                  <span>{formatPrice(result.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#3f3f46]">
                  <span>배송비</span>
                  <span>{result.shippingFee === 0 ? "무료" : formatPrice(result.shippingFee)}</span>
                </div>
                {result.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>할인</span>
                    <span>-{formatPrice(result.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#1d1d1f] pt-2 border-t">
                  <span>총 결제금액</span>
                  <span className="text-[#1A56DB]">{formatPrice(result.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 돌아가기 */}
        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#86868b] hover:text-[#1A56DB] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
