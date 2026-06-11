import Link from "next/link";
import Image from "next/image";
import { DEFAULT_IPC, IpcContent } from "@/lib/home-sections-defaults";

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default function IpcShowcase({ content }: { content?: IpcContent | null }) {
  const c = content ?? DEFAULT_IPC;

  return (
    <section className="bg-white border-b border-[#f1f1f3]">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] lg:min-h-[480px]">
        {/* 좌측: 이미지 등록 시 이미지, 없으면 검은 iPC 로고 */}
        <div className="relative overflow-hidden flex items-center justify-center py-10 px-6 lg:py-16 lg:px-8">
          {c.imageUrl ? (
            <Image
              src={c.imageUrl}
              alt="iPC"
              width={720}
              height={480}
              className="max-w-full max-h-[88%] w-auto h-auto object-contain"
            />
          ) : (
            <Image
              src="/images/brands/ipc.png"
              alt="iPC"
              width={220}
              height={80}
              className="h-16 lg:h-28 w-auto object-contain brightness-0"
            />
          )}
        </div>

        {/* 우측: 카피 + 라인업 */}
        <div className="px-6 sm:px-14 py-10 lg:py-14 flex flex-col gap-5 justify-center">
          <div className="flex items-center gap-3.5">
            <span className="text-xl font-bold text-[#1d1d1f] tracking-[-0.02em]">iPC</span>
            <span className="w-px h-[18px] bg-[#e5e5ea]" />
            <span className="font-en text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#86868b]">
              {c.eyebrow}
            </span>
          </div>
          <h2 className="text-[32px] lg:text-[40px] font-bold text-[#1d1d1f] tracking-[-0.025em] leading-[1.08] whitespace-pre-line">
            {c.headline}
          </h2>
          <p className="text-[15px] text-[#424245] leading-[1.6] max-w-[400px]">
            {c.description}
          </p>

          <div className="flex flex-col gap-3 mt-3">
            {c.tiers.map((t) => (
              <Link
                key={t.tier + t.title}
                href={t.href || "/brand/ipc"}
                className={`group relative flex items-center gap-4 px-4 py-3.5 bg-white rounded-xl transition-all duration-200 hover:translate-x-0.5 hover:border-[#d2d2d7] ${
                  t.featured ? "border border-[#d2d2d7] shadow-[0_1px_2px_0_rgba(15,23,42,.04)]" : "border border-[#e5e5ea]"
                }`}
              >
                {t.featured && (
                  <span className="absolute -top-2.5 right-3.5 bg-[#1d1d1f] text-white font-en text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full">
                    Popular
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-en text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#86868b]">
                    {t.tier}
                  </div>
                  <div className="text-sm font-bold text-[#1d1d1f] mt-0.5 tracking-[-0.01em]">
                    {t.title}
                  </div>
                  <div className="text-[11.5px] text-[#86868b] mt-0.5">{t.spec}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-en text-[9.5px] text-[#a1a1aa] tracking-[0.08em]">FROM</div>
                  <div className="text-base font-bold text-[#1d1d1f] tabular-nums tracking-[-0.01em]">
                    {formatPrice(t.price)}
                  </div>
                </div>
                <div className="flex-shrink-0 text-[12.5px] font-semibold text-[#1d1d1f] px-3.5 py-2 border border-[#e5e5ea] rounded-full">
                  선택
                </div>
              </Link>
            ))}
          </div>

          <Link
            href={c.ctaHref || "/brand/ipc"}
            className="inline-flex items-center gap-1.5 mt-1.5 text-[13px] font-semibold text-[#1d1d1f]"
          >
            {c.ctaLabel} <span className="text-[#86868b]">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
