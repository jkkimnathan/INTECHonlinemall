"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, GitCompareArrows } from "lucide-react";
import { useCompareStore, COMPARE_MAX } from "@/store/compare";

/** 하단 고정 비교 바 — 비교함에 상품이 있을 때만 표시 */
export default function CompareBar() {
  const { items, remove, clear } = useCompareStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // persisted 스토어 하이드레이션 후에만 렌더 (SSR 불일치 방지)
  useEffect(() => setMounted(true), []);

  if (!mounted || items.length === 0) return null;
  // 비교 페이지·관리자에서는 숨김
  if (pathname.startsWith("/compare") || pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-[#e5e7eb] shadow-[0_-8px_24px_-12px_rgba(15,23,42,.15)]">
      <div className="container mx-auto px-4 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
          {items.map((p) => (
            <div
              key={p.id}
              className="relative flex-shrink-0 w-12 h-12 bg-[#f5f5f7] rounded-lg border border-[#f1f1f3] overflow-hidden"
            >
              {p.images[0] ? (
                <Image src={p.images[0]} alt={p.name} fill sizes="48px" className="object-contain p-1" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-[8px] text-[#86868b] p-0.5 text-center leading-tight">
                  {p.brand}
                </span>
              )}
              <button
                onClick={() => remove(p.id)}
                aria-label={`${p.name} 비교에서 제거`}
                className="absolute top-0 right-0 bg-black/60 text-white rounded-bl-md p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <span className="text-xs text-[#86868b] flex-shrink-0 tabular-nums ml-1">
            {items.length}/{COMPARE_MAX}
          </span>
        </div>

        <button
          onClick={clear}
          className="text-xs text-[#86868b] hover:text-[#1d1d1f] underline underline-offset-2 flex-shrink-0 py-2"
        >
          비우기
        </button>
        <Link
          href="/compare"
          className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 h-10 text-sm font-semibold transition-colors ${
            items.length >= 2
              ? "bg-[#1A56DB] text-white hover:bg-[#1747b4]"
              : "bg-[#f1f1f3] text-[#a1a1aa] pointer-events-none"
          }`}
        >
          <GitCompareArrows className="h-4 w-4" />
          비교하기
        </Link>
      </div>
    </div>
  );
}
