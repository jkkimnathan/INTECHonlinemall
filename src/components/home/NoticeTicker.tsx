"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

interface TickerNotice {
  id: string;
  title: string;
}

interface TickerEvent {
  id: string;
  title: string;
}

interface Props {
  notices?: TickerNotice[];
  events?: TickerEvent[];
}

export default function NoticeTicker({ notices = [], events = [] }: Props) {
  const items = [
    ...notices.slice(0, 5).map((n) => ({
      text: `[공지] ${n.title}`,
      href: `/notice/${n.id}`,
    })),
    ...events.slice(0, 5).map((e) => ({
      text: `[이벤트] ${e.title}`,
      href: `/event/${e.id}`,
    })),
  ];

  if (items.length === 0) {
    return (
      <div className="bg-[#0F172A] text-[#cbd5e1] overflow-hidden">
        <div className="container mx-auto px-4 flex items-center h-9">
          <div className="flex items-center gap-2 flex-shrink-0 pr-4 border-r border-[#1E293B]">
            <Bell className="h-3.5 w-3.5 text-yellow-400" />
            <Link href="/notice" className="text-xs font-semibold text-white hover:text-yellow-400 transition-colors">
              공지
            </Link>
          </div>
          <div className="overflow-hidden flex-1 ml-4">
            <span className="text-xs text-[#a1a1aa]">공지사항이 없습니다.</span>
          </div>
        </div>
      </div>
    );
  }

  const separator = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";

  return (
    <div className="bg-[#0F172A] text-[#cbd5e1] overflow-hidden">
      <div className="container mx-auto px-4 flex items-center h-9">
        <div className="flex items-center gap-2 flex-shrink-0 pr-4 border-r border-[#1E293B]">
          <Bell className="h-3.5 w-3.5 text-yellow-400" />
          <Link href="/notice" className="text-xs font-semibold text-white hover:text-yellow-400 transition-colors">
            공지
          </Link>
        </div>
        <div className="overflow-hidden flex-1 ml-4">
          <div className="animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
            {[0, 1].map((loop) => (
              <span key={loop} className={loop === 1 ? "ml-20" : ""}>
                {items.map((item, i) => (
                  <span key={`${loop}-${i}`}>
                    <Link
                      href={item.href}
                      className="text-xs hover:text-yellow-400 transition-colors"
                    >
                      {item.text}
                    </Link>
                    {i < items.length - 1 && <span className="text-xs">{separator}</span>}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
