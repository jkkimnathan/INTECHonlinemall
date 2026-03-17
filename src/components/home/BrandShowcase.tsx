"use client";

import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";

export default function BrandShowcase() {
  const brandColors: Record<string, string> = {
    intel: "from-blue-600 to-blue-800",
    asus: "from-gray-700 to-gray-900",
    manli: "from-red-600 to-red-800",
    asrock: "from-green-600 to-green-800",
    toshiba: "from-red-700 to-red-900",
    microsoft: "from-sky-500 to-blue-700",
    msi: "from-red-500 to-gray-900",
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">공식 취급 브랜드</h2>
          <p className="text-gray-500 mt-2">
            정품 보증 | 공식 수입사 직영 | A/S 보장
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {siteConfig.brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brand/${brand.slug}`}
              className="group relative flex flex-col items-center justify-center h-40 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              {/* 배경: 이미지가 있으면 이미지, 없으면 그라데이션 */}
              {brand.bgImage ? (
                <Image
                  src={brand.bgImage}
                  alt={`${brand.name} 배경`}
                  fill
                  className="object-cover brightness-50 group-hover:brightness-[0.35] group-hover:scale-110 transition-all duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  onError={(e) => {
                    // 배경 이미지 로드 실패 시 숨기기
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : null}
              {/* 그라데이션 폴백 (이미지 없을 때 또는 로드 실패 시) */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${brandColors[brand.slug] || "from-gray-600 to-gray-800"} ${brand.bgImage ? "opacity-0" : "opacity-100"}`}
              />

              {/* 브랜드 로고 또는 텍스트 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span className="text-2xl font-bold text-white tracking-wider drop-shadow-lg">
                  {brand.name}
                </span>
                <span className="text-xs text-white/80 group-hover:text-white transition-colors">
                  제품 보러가기 &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
