"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Loader2, ChevronRight } from "lucide-react";
import { getEvents, SiteEvent } from "@/lib/supabase/events";
import { getPageBanner, PageBanner } from "@/lib/supabase/page-banners";
import Link from "next/link";
import Image from "next/image";

export default function EventPage() {
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<PageBanner | null>(null);

  useEffect(() => {
    getEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
    getPageBanner("event").then(setBanner);
  }, []);

  const bannerTitle = banner?.title || "이벤트";
  const bannerSubtitle = banner?.subtitle || "다양한 혜택과 이벤트를 확인하세요";

  return (
    <div className="bg-gray-50 min-h-screen">
      {banner?.imageUrl ? (
        <div className="relative h-[200px] md:h-[300px] overflow-hidden">
          <Image src={banner.imageUrl} alt={bannerTitle} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <h1 className="text-3xl font-bold text-white">{bannerTitle}</h1>
              <p className="text-white/80 mt-2">{bannerSubtitle}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold">{bannerTitle}</h1>
            <p className="text-purple-100 mt-2">{bannerSubtitle}</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            등록된 이벤트가 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_140px_120px] bg-gray-50 border-b px-5 py-3">
              <span className="text-sm font-medium text-gray-500">제목</span>
              <span className="text-sm font-medium text-gray-500 text-center">기간</span>
              <span className="text-sm font-medium text-gray-500 text-center">상태</span>
            </div>

            <div className="divide-y">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="flex items-center px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          event.status === "진행중"
                            ? "bg-green-100 text-green-700"
                            : event.status === "예정"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                        }
                      >
                        {event.status}
                      </Badge>
                      <span className="font-medium text-gray-900 truncate">{event.title}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 sm:hidden">
                      <CalendarDays className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {event.startDate} ~ {event.endDate}
                      </span>
                    </div>
                  </div>
                  <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400 w-[140px] justify-center flex-shrink-0">
                    <CalendarDays className="h-3 w-3" />
                    {event.startDate} ~ {event.endDate}
                  </span>
                  <span className="hidden sm:block w-[120px] text-center flex-shrink-0">
                    <Badge
                      className={
                        event.status === "진행중"
                          ? "bg-green-100 text-green-700"
                          : event.status === "예정"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }
                    >
                      {event.status}
                    </Badge>
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 ml-2 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
