"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    bgGradient: "from-gray-900 via-blue-900 to-gray-900",
    subtitle: "공식 수입사 직영몰",
    title: "최신 IT 하드웨어를",
    titleHighlight: "최고의 가격으로",
    description: "INTEL, ASUS, MANLI, ASRock, TOSHIBA, Microsoft, MSI 정품을 공식 수입사에서 직접 만나보세요.",
    ctaText: "전체 상품 보기",
    ctaLink: "/products",
    secondaryText: "특가 상품",
    secondaryLink: "/sale",
  },
  {
    id: 2,
    bgGradient: "from-red-900 via-orange-900 to-red-900",
    subtitle: "SPECIAL SALE",
    title: "최대 40% 할인",
    titleHighlight: "특가 대전",
    description: "엄선된 인기 제품들을 특별 할인가로 만나보세요. 한정 수량 특가 진행 중!",
    ctaText: "특가 보러가기",
    ctaLink: "/sale",
    secondaryText: "리퍼비쉬",
    secondaryLink: "/refurbished",
  },
  {
    id: 3,
    bgGradient: "from-emerald-900 via-teal-900 to-emerald-900",
    subtitle: "BRAND STORE",
    title: "7개 글로벌 브랜드",
    titleHighlight: "공식 정품 보증",
    description: "100% 정품만 취급합니다. 공식 수입사 A/S와 품질 보증을 경험하세요.",
    ctaText: "브랜드 둘러보기",
    ctaLink: "/products",
    secondaryText: "이벤트",
    secondaryLink: "/event",
  },
  {
    id: 4,
    bgGradient: "from-purple-900 via-indigo-900 to-purple-900",
    subtitle: "REFURBISHED",
    title: "검증된 리퍼비쉬",
    titleHighlight: "합리적인 선택",
    description: "전문 엔지니어가 검수한 리퍼비쉬 제품을 합리적인 가격에 만나보세요.",
    ctaText: "리퍼비쉬 보기",
    ctaLink: "/refurbished",
    secondaryText: "전체 상품",
    secondaryLink: "/products",
  },
];

export default function HeroBannerSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section
      className="relative overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 슬라이드 컨테이너 */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`min-w-full bg-gradient-to-r ${slide.bgGradient}`}
          >
            <div className="container mx-auto px-4 py-16 md:py-24">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm text-blue-200 font-medium mb-4">
                  {slide.subtitle}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  {slide.title}
                  <br />
                  <span className="text-blue-300">{slide.titleHighlight}</span>
                </h1>
                <p className="mt-4 text-gray-300 text-sm md:text-base leading-relaxed max-w-lg">
                  {slide.description}
                </p>
                <div className="flex gap-3 mt-8">
                  <Link href={slide.ctaLink}>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                      {slide.ctaText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={slide.secondaryLink}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      {slide.secondaryText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 좌우 화살표 */}
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

      {/* 네비게이션 도트 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
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
    </section>
  );
}
