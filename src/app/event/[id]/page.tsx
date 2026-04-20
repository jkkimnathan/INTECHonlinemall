"use client";

import { use, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CalendarDays } from "lucide-react";
import { getEventById, SiteEvent } from "@/lib/supabase/events";
import Link from "next/link";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<SiteEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEventById(id).then((data) => {
      setEvent(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-gray-400 mb-4">존재하지 않는 이벤트입니다.</p>
          <Link href="/event">
            <Button variant="outline">목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">이벤트</h1>
          <p className="text-purple-100 mt-2">다양한 혜택과 이벤트를 확인하세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 뒤로가기 */}
        <Link href="/event" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>

        <div className="bg-white rounded-lg border overflow-hidden">
          {/* 헤더 */}
          <div className="px-6 py-5 border-b">
            <div className="flex items-center gap-2 mb-2">
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
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <CalendarDays className="h-3.5 w-3.5" />
                {event.startDate} ~ {event.endDate}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
            <p className="text-sm text-gray-400 mt-2">
              등록일: {new Date(event.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* 본문 */}
          <div className="px-6 py-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>

            {event.imageUrl && (
              <div className="mt-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="max-w-full rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>

        {/* 하단 목록 버튼 */}
        <div className="mt-6 text-center">
          <Link href="/event">
            <Button variant="outline" className="px-8">
              목록으로
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
