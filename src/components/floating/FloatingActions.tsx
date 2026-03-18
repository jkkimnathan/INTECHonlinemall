"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowUp, MessageCircle, Clock, X } from "lucide-react";
import { useRecentlyViewedStore } from "@/store/recentlyViewed";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = useRecentlyViewedStore((s) => s.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScroll = useCallback(() => {
    setShowTop(window.scrollY > 200);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
      {/* 최근 본 상품 패널 */}
      {recentOpen && mounted && items.length > 0 && (
        <div className="bg-white rounded-lg shadow-xl border w-72 mb-1">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-semibold text-gray-900">최근 본 상품</span>
            <button
              onClick={() => setRecentOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-0"
                onClick={() => setRecentOpen(false)}
              >
                <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                  <span className="text-[8px] text-gray-400 text-center leading-tight">
                    {product.brand}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 font-medium truncate">
                    {product.name}
                  </p>
                  <p className="text-xs font-bold text-blue-600 mt-0.5">
                    {formatPrice(product.salePrice ?? product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 최근 본 상품 버튼 */}
      {mounted && items.length > 0 && (
        <button
          onClick={() => setRecentOpen(!recentOpen)}
          className="relative w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="최근 본 상품"
        >
          <Clock className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {items.length}
          </span>
        </button>
      )}

      {/* 카카오톡 상담 */}
      <a
        href="https://pf.kakao.com/_placeholder"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-[#FEE500] shadow-lg flex items-center justify-center hover:brightness-95 transition-all"
        title="카카오톡 상담"
      >
        <MessageCircle className="h-5 w-5 text-[#3C1E1E]" />
      </a>

      {/* TOP 버튼 */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-gray-800 text-white shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
          title="맨 위로"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
