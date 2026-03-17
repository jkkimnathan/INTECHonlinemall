"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import { MessageSquare, ChevronDown, ChevronUp, User } from "lucide-react";

interface QnaItem {
  id: number;
  category: "상품문의" | "배송문의" | "교환/반품" | "기타";
  title: string;
  content: string;
  author: string;
  date: string;
  isAnswered: boolean;
  answer?: { content: string; date: string };
}

const dummyQna: QnaItem[] = [
  {
    id: 1,
    category: "상품문의",
    title: "Intel i7-14700K 호환 메인보드 추천해주세요",
    content: "i7-14700K를 구매하려고 하는데, 어떤 메인보드가 호환되나요? B760과 Z790 차이도 알고 싶습니다.",
    author: "김**",
    date: "2025-03-12",
    isAnswered: true,
    answer: {
      content: "안녕하세요. i7-14700K는 LGA1700 소켓 메인보드와 호환됩니다. B760은 가성비, Z790은 오버클럭을 지원합니다. 오버클럭이 필요 없으시면 B760 추천드립니다. 감사합니다.",
      date: "2025-03-12",
    },
  },
  {
    id: 2,
    category: "배송문의",
    title: "배송 기간이 어느 정도 걸리나요?",
    content: "서울 지역인데 주문하면 보통 며칠 정도 걸릴까요?",
    author: "이**",
    date: "2025-03-14",
    isAnswered: true,
    answer: {
      content: "안녕하세요. 평일 오후 2시 이전 주문은 당일 출고되며, 서울 지역은 출고 다음날 수령 가능합니다. 감사합니다.",
      date: "2025-03-14",
    },
  },
  {
    id: 3,
    category: "상품문의",
    title: "MANLI RTX 4070 SUPER 재입고 일정 문의",
    content: "현재 품절인데 재입고 예정일이 언제인가요?",
    author: "박**",
    date: "2025-03-15",
    isAnswered: false,
  },
  {
    id: 4,
    category: "교환/반품",
    title: "개봉 후 교환이 가능한가요?",
    content: "메인보드를 구매했는데 다른 모델로 교환하고 싶습니다. 개봉은 했지만 사용하지 않았습니다.",
    author: "최**",
    date: "2025-03-16",
    isAnswered: true,
    answer: {
      content: "안녕하세요. 개봉 후 미사용 제품은 수령일로부터 7일 이내 교환 가능합니다. 단, 왕복 배송비가 발생할 수 있습니다. 1:1 문의로 연락주시면 안내드리겠습니다.",
      date: "2025-03-16",
    },
  },
];

const categoryColors: Record<string, string> = {
  상품문의: "bg-blue-100 text-blue-700",
  배송문의: "bg-green-100 text-green-700",
  "교환/반품": "bg-orange-100 text-orange-700",
  기타: "bg-gray-100 text-gray-700",
};

export default function CommunityPage() {
  const { isLoggedIn } = useAuthStore();
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("전체");

  const categories = ["전체", "상품문의", "배송문의", "교환/반품", "기타"];
  const filtered = filter === "전체" ? dummyQna : dummyQna.filter((q) => q.category === filter);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">커뮤니티</h1>
          <p className="text-indigo-100 mt-2">Q&A 게시판 | 궁금한 점을 질문해주세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 필터 + 글쓰기 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-sm"
            disabled={!isLoggedIn}
            onClick={() => alert(isLoggedIn ? "글쓰기 기능은 추후 구현됩니다." : "로그인이 필요합니다.")}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            질문하기
          </Button>
        </div>

        {!isLoggedIn && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
            질문을 작성하려면 로그인이 필요합니다.
          </div>
        )}

        {/* Q&A 목록 */}
        <div className="bg-white rounded-lg border divide-y">
          {filtered.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={categoryColors[item.category]}>
                    {item.category}
                  </Badge>
                  <Badge
                    className={
                      item.isAnswered
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }
                  >
                    {item.isAnswered ? "답변완료" : "대기중"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {item.title}
                  </h3>
                  {openId === item.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.author}
                  </span>
                  <span>{item.date}</span>
                </div>
              </button>

              {openId === item.id && (
                <div className="px-4 pb-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                    <p className="font-medium text-gray-500 text-xs mb-2">질문</p>
                    <p>{item.content}</p>
                  </div>
                  {item.answer && (
                    <div className="bg-blue-50 rounded-lg p-4 mt-2 text-sm">
                      <p className="font-medium text-blue-600 text-xs mb-2">
                        관리자 답변 ({item.answer.date})
                      </p>
                      <p className="text-gray-700">{item.answer.content}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            해당 카테고리의 게시글이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
