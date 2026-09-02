import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { solutions } from "@/config/solutions";

export const metadata: Metadata = {
  title: "AI 솔루션 전용관",
  description:
    "인텍앤컴퍼니 공식 수입 AI 솔루션 전용관. ASUS ProArt GR1X(NVIDIA RTX Spark) 등 워크스테이션급 AI 솔루션을 만나보세요.",
  alternates: { canonical: "/solutions" },
};

export const revalidate = 3600;

const CARDS = [
  {
    key: "proart-gr1x",
    brand: "ASUS · NVIDIA",
    name: solutions["proart-gr1x"].name,
    tagline: "손바닥 위의 AI 슈퍼컴퓨터. NVIDIA RTX Spark 슈퍼칩 · 128GB 통합 메모리",
    href: "/solutions/proart-gr1x",
    image: "/solutions/proart-gr1x/kv-rings.png",
    status: "2026년 가을 출시 예정",
  },
  {
    key: "arc-pro-b70",
    brand: "Intel",
    name: "Intel Arc Pro B70",
    tagline: "워크스테이션 그래픽 · AI 추론 가속",
    href: null,
    image: null,
    status: "준비 중",
  },
] as const;

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
      <div className="container mx-auto px-4 py-14 md:py-20">
        <header className="max-w-2xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#1A56DB]">Solutions</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] md:text-4xl">AI 솔루션 전용관</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#6e6e73]">
            공식 수입사가 직접 소개하는 AI 워크스테이션·가속 솔루션입니다. 제품별 전용관에서 사양을 확인하고 견적을 요청하세요.
          </p>
        </header>

        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {CARDS.map((c) => {
            const body = (
              <>
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0A0908]">
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#f1f3f6] text-[13px] font-medium text-[#8e8e93]">
                      이미지 준비 중
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6e6e73]">{c.brand}</span>
                  <h2 className="text-xl font-bold tracking-[-0.02em]">{c.name}</h2>
                  <p className="text-[14px] leading-relaxed text-[#6e6e73]">{c.tagline}</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span
                      className={
                        c.href
                          ? "rounded-full bg-[#EEF4FF] px-3 py-1 text-[12px] font-semibold text-[#1A56DB]"
                          : "rounded-full bg-[#f1f3f6] px-3 py-1 text-[12px] font-semibold text-[#8e8e93]"
                      }
                    >
                      {c.status}
                    </span>
                    {c.href ? (
                      <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#1A56DB]">
                        전용관 보기 <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : (
                      <span className="text-[14px] font-medium text-[#8e8e93]">준비 중</span>
                    )}
                  </div>
                </div>
              </>
            );
            return (
              <li key={c.key} className="flex">
                {c.href ? (
                  <Link
                    href={c.href}
                    className="group flex w-full flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] focus-visible:outline-2 focus-visible:outline-[#1A56DB]"
                  >
                    {body}
                  </Link>
                ) : (
                  <div
                    aria-disabled="true"
                    className="flex w-full flex-col overflow-hidden rounded-2xl border border-dashed border-[#d1d5db] bg-white opacity-70"
                  >
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
