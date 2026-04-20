"use client";

import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";

export default function BrandShowcase() {
  const brandColors: Record<string, string> = {
    intel: "from-blue-500 via-blue-600 to-blue-800",
    asus: "from-gray-600 via-gray-700 to-gray-900",
    manli: "from-red-500 via-red-600 to-red-800",
    asrock: "from-green-500 via-green-600 to-green-800",
    toshiba: "from-red-600 via-red-700 to-red-900",
    microsoft: "from-sky-400 via-blue-500 to-blue-700",
    ipc: "from-indigo-500 via-purple-600 to-purple-800",
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
              {/* 그라데이션 배경 */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${brandColors[brand.slug] || "from-gray-600 to-gray-800"} transition-opacity duration-300`}
              />
              {/* 오버레이 효과 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

              {/* 브랜드 로고 */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-28 h-16 relative flex items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={112}
                    height={64}
                    className="object-contain brightness-0 invert drop-shadow-lg"
                    onError={(e) => {
                      // 로고 로드 실패 시 텍스트로 대체
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.parentElement?.querySelector(".fallback-text");
                      if (fallback) (fallback as HTMLElement).style.display = "block";
                    }}
                  />
                  <span className="fallback-text hidden text-2xl font-bold text-white tracking-wider drop-shadow-lg">
                    {brand.name}
                  </span>
                </div>
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
