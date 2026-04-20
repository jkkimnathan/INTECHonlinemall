"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Pin, Loader2, ChevronRight } from "lucide-react";
import { getNotices, Notice } from "@/lib/supabase/notices";
import { getPageBanner, PageBanner } from "@/lib/supabase/page-banners";
import Link from "next/link";
import Image from "next/image";

const categoryColors: Record<string, string> = {
  안내: "bg-blue-100 text-blue-700",
  배송: "bg-green-100 text-green-700",
  정책: "bg-gray-100 text-gray-700",
  입고: "bg-purple-100 text-purple-700",
  이벤트: "bg-pink-100 text-pink-700",
};

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<PageBanner | null>(null);

  useEffect(() => {
    getNotices().then((data) => {
      setNotices(data);
      setLoading(false);
    });
    getPageBanner("notice").then(setBanner);
  }, []);

  const pinnedNotices = notices.filter((n) => n.isPinned);
  const regularNotices = notices.filter((n) => !n.isPinned);

  const bannerTitle = banner?.title || "공지사항";
  const bannerSubtitle = banner?.subtitle || "인텍앤컴퍼니몰의 새로운 소식을 알려드립니다";

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
        <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold">{bannerTitle}</h1>
            <p className="text-gray-300 mt-2">{bannerSubtitle}</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_120px] bg-gray-50 border-b px-5 py-3">
              <span className="text-sm font-medium text-gray-500">제목</span>
              <span className="text-sm font-medium text-gray-500 text-center">등록일</span>
            </div>

            <div className="divide-y">
              {/* 고정 공지 */}
              {pinnedNotices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notice/${notice.id}`}
                  className="flex items-center px-5 py-4 hover:bg-blue-50/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Pin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                      <Badge className={categoryColors[notice.category] || "bg-gray-100 text-gray-700"}>
                        {notice.category}
                      </Badge>
                      <Badge className="bg-blue-50 text-blue-600">고정</Badge>
                      <span className="font-medium text-gray-900 truncate">{notice.title}</span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 block sm:hidden">
                      {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm text-gray-400 w-[120px] text-center flex-shrink-0">
                    {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 ml-2 flex-shrink-0" />
                </Link>
              ))}

              {/* 일반 공지 */}
              {regularNotices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notice/${notice.id}`}
                  className="flex items-center px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[notice.category] || "bg-gray-100 text-gray-700"}>
                        {notice.category}
                      </Badge>
                      <span className="font-medium text-gray-900 truncate">{notice.title}</span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 block sm:hidden">
                      {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm text-gray-400 w-[120px] text-center flex-shrink-0">
                    {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
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
