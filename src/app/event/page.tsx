import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

export const metadata: Metadata = {
  title: "이벤트",
  description: "인텍앤컴퍼니몰 진행중인 이벤트",
};

// 임시 이벤트 데이터
const events = [
  {
    id: 1,
    title: "그랜드 오픈 기념 전 상품 10% 할인",
    description:
      "인텍앤컴퍼니몰 오픈을 기념하여 모든 상품 10% 할인 이벤트를 진행합니다.",
    startDate: "2025-03-01",
    endDate: "2025-04-30",
    status: "진행중",
    image: null,
  },
  {
    id: 2,
    title: "INTEL CPU 구매 시 쿨러 무료 증정",
    description: "인텔 14세대 CPU 구매 고객에게 정품 쿨러를 무료 증정합니다.",
    startDate: "2025-03-15",
    endDate: "2025-04-15",
    status: "진행중",
    image: null,
  },
  {
    id: 3,
    title: "회원가입 감사 이벤트 - 5,000P 적립금 지급",
    description:
      "신규 회원가입 시 즉시 사용 가능한 5,000포인트를 지급합니다.",
    startDate: "2025-03-01",
    endDate: "2025-12-31",
    status: "진행중",
    image: null,
  },
  {
    id: 4,
    title: "설날 맞이 특별 할인전",
    description: "새해 복 많이 받으세요! 인기 상품 최대 30% 할인",
    startDate: "2025-01-20",
    endDate: "2025-02-10",
    status: "종료",
    image: null,
  },
];

export default function EventPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">이벤트</h1>
          <p className="text-purple-100 mt-2">
            다양한 혜택과 이벤트를 확인하세요
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={
                        event.status === "진행중"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {event.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                    <CalendarDays className="h-3 w-3" />
                    <span>
                      {event.startDate} ~ {event.endDate}
                    </span>
                  </div>
                </div>
                <div className="w-32 h-20 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-400 text-xs">이벤트 이미지</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
