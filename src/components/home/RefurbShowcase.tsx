import Link from "next/link";
import { DEFAULT_REFURB, RefurbContent } from "@/lib/home-sections-defaults";

export default function RefurbShowcase({ content }: { content?: RefurbContent | null }) {
  const c = content ?? DEFAULT_REFURB;

  return (
    <section className="bg-[#0F172A] text-white">
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* 좌측: 카피 */}
        <div>
          <div className="font-en text-[11px] font-bold uppercase tracking-[0.16em] text-[#fdba74]">
            {c.eyebrow}
          </div>
          <h2 className="mt-3.5 text-[32px] lg:text-[36px] font-bold tracking-[-0.025em] leading-[1.08] whitespace-pre-line">
            {c.headline}
          </h2>
          <p className="mt-4 text-sm text-[#c7c7cc] leading-[1.65] max-w-[460px]">
            {c.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={c.cta1Href || "/refurbished"}
              className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-[#1A56DB] hover:bg-[#1747b4] text-white text-sm font-semibold transition-colors"
            >
              {c.cta1Label}
            </Link>
            {c.cta2Label && (
              <Link
                href={c.cta2Href || "/refurbished"}
                className="inline-flex items-center justify-center h-9 px-5 rounded-full border border-white/25 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                {c.cta2Label}
              </Link>
            )}
          </div>
        </div>

        {/* 우측: 등급 안내 */}
        <div className="flex flex-col gap-2.5">
          {c.grades.map((r) => (
            <div
              key={r.g + r.name}
              className="flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl bg-white/5 border border-white/10 transition-colors hover:bg-white/[0.07]"
            >
              <span
                className="flex-shrink-0 font-en text-[13px] font-extrabold tracking-[0.04em] text-[#0F172A] rounded-md px-[11px] py-1.5 min-w-8 text-center"
                style={{ background: r.color }}
              >
                {r.g}
              </span>
              <div>
                <div className="text-[13.5px] font-bold text-white">{r.name}</div>
                <div className="text-[11.5px] text-[#94a3b8] mt-0.5">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
