"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const faqs: FaqItem[] = [
  { category: "주문/결제", q: "주문은 어떻게 하나요?", a: "원하시는 상품을 장바구니에 담은 후, 주문서 작성 페이지에서 배송지 정보와 결제 수단을 선택하여 결제하시면 됩니다." },
  { category: "주문/결제", q: "결제 수단은 어떤 것이 있나요?", a: "신용/체크카드, 실시간 계좌이체, 가상계좌, 카카오페이, 네이버페이, 토스페이를 지원합니다. (PG 연동 후 순차적으로 활성화 예정)" },
  { category: "주문/결제", q: "주문 후 상품 변경이 가능한가요?", a: "출고 전이라면 고객센터(1544-6549)로 연락하시면 변경 가능합니다. 출고 후에는 교환/반품 절차를 이용해주세요." },
  { category: "배송", q: "배송은 얼마나 걸리나요?", a: "평일 오후 2시 이전 결제 완료 시 당일 출고됩니다. 서울/수도권은 출고 다음 날, 지방은 2~3일 내 수령 가능합니다." },
  { category: "배송", q: "배송비는 얼마인가요?", a: "50,000원 이상 구매 시 무료 배송이며, 미만 시 3,000원의 배송비가 부과됩니다. 도서산간 지역은 추가 배송비가 발생할 수 있습니다." },
  { category: "배송", q: "배송 추적은 어디서 하나요?", a: "마이페이지 > 주문 내역에서 송장번호를 확인하실 수 있으며, 해당 택배사 사이트에서 배송 추적이 가능합니다." },
  { category: "교환/반품", q: "교환/반품은 어떻게 하나요?", a: "상품 수령 후 7일 이내 고객센터(1544-6549)로 연락하시면 안내받으실 수 있습니다. 단, 고객 변심의 경우 왕복 배송비가 발생합니다." },
  { category: "교환/반품", q: "개봉한 상품도 반품이 되나요?", a: "개봉 후 미사용 제품은 반품 가능합니다. 다만 사용 흔적이 있거나 포장이 훼손된 경우, 재판매가 불가능한 경우에는 반품이 어려울 수 있습니다." },
  { category: "보증/A/S", q: "보증 기간은 어떻게 되나요?", a: "공식 수입사 직영몰로서 제조사 정품 보증이 적용됩니다. 브랜드별 보증 기간은 상품 상세 페이지를 참고해주세요." },
  { category: "보증/A/S", q: "A/S는 어디서 받나요?", a: "당사는 공식 수입사로서 A/S 접수를 직접 진행합니다. 고객센터로 연락하시면 A/S 절차를 안내드립니다." },
  { category: "회원", q: "회원가입 혜택이 있나요?", a: "회원가입 시 적립금이 지급되며, 구매 금액의 1%가 적립됩니다. 등급에 따라 추가 혜택이 제공됩니다." },
  { category: "회원", q: "비밀번호를 분실했어요.", a: "로그인 페이지에서 '비밀번호 찾기'를 통해 가입 이메일로 재설정 링크를 받으실 수 있습니다." },
];

const categories = ["전체", "주문/결제", "배송", "교환/반품", "보증/A/S", "회원"];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState("전체");

  const filtered = filter === "전체" ? faqs : faqs.filter((f) => f.category === filter);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">자주 묻는 질문</h1>
          <p className="text-blue-100 mt-2">궁금한 점을 빠르게 해결하세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => { setFilter(cat); setOpenIndex(null); }}
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="bg-white rounded-lg border divide-y">
          {filtered.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-blue-600 font-bold text-sm flex-shrink-0">Q</span>
                  <span className="text-sm font-medium text-gray-900">{item.q}</span>
                </div>
                {openIndex === i ? (
                  <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 flex gap-3">
                    <span className="text-blue-600 font-bold flex-shrink-0">A</span>
                    <p>{item.a}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            해당 카테고리의 질문이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
