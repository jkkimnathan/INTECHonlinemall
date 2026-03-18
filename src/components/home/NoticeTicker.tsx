"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

const notices = [
  { text: "[공지] 배송 안내: 평일 오후 2시 이전 주문 시 당일 출고", href: "/notice" },
  { text: "[이벤트] 회원가입 시 2,000원 적립금 즉시 지급!", href: "/event" },
  { text: "[안내] 주말/공휴일 고객센터 휴무 (평일 09:30~17:00)", href: "/notice" },
  { text: "[특가] 이번 주 한정 특가 상품을 확인하세요!", href: "/sale" },
];

export default function NoticeTicker() {
  const noticeText = notices.map((n) => n.text).join("        \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0        ");

  return (
    <div className="bg-gray-900 text-gray-300 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center h-9">
        <div className="flex items-center gap-2 flex-shrink-0 pr-4 border-r border-gray-700">
          <Bell className="h-3.5 w-3.5 text-yellow-400" />
          <Link href="/notice" className="text-xs font-semibold text-white hover:text-yellow-400 transition-colors">
            공지
          </Link>
        </div>
        <div className="overflow-hidden flex-1 ml-4">
          <div className="animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
            <span className="text-xs">{noticeText}</span>
            <span className="text-xs ml-20">{noticeText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
