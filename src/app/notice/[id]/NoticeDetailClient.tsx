"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pin } from "lucide-react";
import { Notice } from "@/lib/supabase/notices";
import Link from "next/link";

const categoryColors: Record<string, string> = {
  안내: "bg-blue-100 text-blue-700",
  배송: "bg-green-100 text-green-700",
  정책: "bg-gray-100 text-gray-700",
  입고: "bg-purple-100 text-purple-700",
  이벤트: "bg-pink-100 text-pink-700",
};

export default function NoticeDetailClient({ notice }: { notice: Notice }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">공지사항</h1>
          <p className="text-gray-300 mt-2">중요한 안내사항을 확인하세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 뒤로가기 */}
        <Link href="/notice" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>

        <div className="bg-white rounded-lg border overflow-hidden">
          {/* 헤더 */}
          <div className="px-6 py-5 border-b">
            <div className="flex items-center gap-2 mb-2">
              {notice.isPinned && <Pin className="h-3.5 w-3.5 text-blue-500" />}
              <Badge className={categoryColors[notice.category] || "bg-gray-100 text-gray-700"}>
                {notice.category}
              </Badge>
              {notice.isPinned && <Badge className="bg-blue-50 text-blue-600">고정</Badge>}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{notice.title}</h2>
            <p className="text-sm text-gray-400 mt-2">
              {new Date(notice.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* 본문 */}
          <div className="px-6 py-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{notice.content}</p>

            {notice.imageUrl && (
              <div className="mt-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={notice.imageUrl}
                  alt={notice.title}
                  className="max-w-full rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>

        {/* 하단 목록 버튼 */}
        <div className="mt-6 text-center">
          <Link href="/notice">
            <Button variant="outline" className="px-8">
              목록으로
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
