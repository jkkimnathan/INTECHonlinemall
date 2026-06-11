"use client";

import Link from "next/link";
import Image from "next/image";
import { visibleBrands } from "@/config/site";

export default function BrandShowcase() {
  const brands = visibleBrands;

  // 브랜드 개수에 맞춰 데스크탑 칸 수를 맞춤 (도시바 숨김 등으로 개수가 바뀌어도 빈칸 없이 균형)
  const lgColsClass =
    ({
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
      6: "lg:grid-cols-6",
      7: "lg:grid-cols-7",
      8: "lg:grid-cols-8",
    } as Record<number, string>)[brands.length] ?? "lg:grid-cols-7";

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="font-en text-[11px] font-bold uppercase tracking-[0.16em] text-[#a1a1aa]">
            Official Importer · Brand Family
          </div>
          <h2 className="mt-3.5 text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em]">
            공식 취급 브랜드
          </h2>
        </div>

        {/* 브랜드 로고 스트립 — 원본 컬러, 호버 페이드만 (그라데이션·invert 금지) */}
        <div className={`grid grid-cols-3 sm:grid-cols-3 ${lgColsClass} border-y border-[#f1f1f3]`}>
          {brands.map((brand, i) => {
            const isIpc = brand.slug === "ipc";
            return (
              <Link
                key={brand.slug}
                href={`/brand/${brand.slug}`}
                aria-label={brand.name}
                className={`group flex items-center justify-center px-3 py-6 ${
                  i < brands.length - 1 ? "lg:border-r border-[#f1f1f3]" : ""
                }`}
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={120}
                  height={36}
                  className={`max-h-9 w-auto object-contain opacity-100 group-hover:opacity-70 transition-opacity duration-200 ${isIpc ? "brightness-0" : ""}`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
