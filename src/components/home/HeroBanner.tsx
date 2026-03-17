import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="text-blue-400 font-semibold text-sm mb-2 tracking-wider uppercase">
            공식 수입사 직영몰
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            최신 IT 하드웨어를
            <br />
            <span className="text-blue-400">최고의 가격</span>으로
          </h1>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            INTEL, ASUS, MANLI, ASRock 공식 수입사에서 직접 판매합니다.
            <br className="hidden md:block" />
            정품 보증과 최저가를 동시에 만나보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                전체 상품 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sale">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8"
              >
                특가 상품
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
    </section>
  );
}
