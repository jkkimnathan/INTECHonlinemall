"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Banner } from "@/lib/supabase/banners";

interface Props {
  banners?: Banner[];
}

export default function HeroBannerSlider({ banners: initialBanners = [] }: Props) {
  const [banners] = useState<Banner[]>(initialBanners);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % (banners.length || 1));
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + (banners.length || 1)) % (banners.length || 1));
  }, [banners.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, banners.length]);

  // DB에 배너가 없으면 기본 그라데이션 배너
  if (banners.length === 0) {
    return (
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm text-blue-200 font-medium mb-4">
                공식 수입사 직영몰
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                최신 IT 하드웨어를
                <br />
                <span className="text-blue-300">최고의 가격으로</span>
              </h1>
              <p className="mt-4 text-gray-300 text-sm md:text-base leading-relaxed max-w-lg">
                INTEL, ASUS, MANLI, ASRock, Microsoft, iPC 정품을 공식 수입사에서 직접 만나보세요.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 터치 스와이프
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current = null;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStart.current === null || touchEnd.current === null) return;
    const diff = touchStart.current - touchEnd.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStart.current = null;
    touchEnd.current = null;
  };

  const isInternal = (url: string) => url.startsWith("/");

  return (
    <section
      className="relative overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 슬라이드 컨테이너 */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => {
          const content = (
            <picture className="min-w-full block">
              {banner.mobileImageUrl && (
                <source media="(max-width: 767px)" srcSet={banner.mobileImageUrl} />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-[300px] md:h-[400px] object-cover"
              />
            </picture>
          );

          if (banner.linkUrl) {
            if (isInternal(banner.linkUrl)) {
              return (
                <Link key={banner.id} href={banner.linkUrl} className="min-w-full block">
                  {content}
                </Link>
              );
            }
            return (
              <a
                key={banner.id}
                href={banner.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-full block"
              >
                {content}
              </a>
            );
          }

          return (
            <div key={banner.id} className="min-w-full">
              {content}
            </div>
          );
        })}
      </div>

      {/* 좌우 화살표 */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* 네비게이션 도트 */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === current
                  ? "bg-white w-6"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
