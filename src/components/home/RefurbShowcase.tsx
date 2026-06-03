import Link from "next/link";

const grades = [
  { g: "S", color: "#34d399", name: "단순 개봉", desc: "박스 개봉만 된 미사용 상품 · 신품과 동일" },
  { g: "A", color: "#60a5fa", name: "구성품 누락 · 미세 스크래치", desc: "본품 정상 동작 확인 · 동봉품 누락 또는 외관 흠집" },
  { g: "B", color: "#fbbf24", name: "중고에 가까움", desc: "사용감 있음 · 가격 메리트로 보상 · 정상 동작 확인" },
];

export default function RefurbShowcase() {
  return (
    <section className="bg-[#0F172A] text-white">
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* 좌측: 카피 */}
        <div>
          <div className="font-en text-[11px] font-bold uppercase tracking-[0.16em] text-[#fdba74]">
            Refurbished · Officially Inspected
          </div>
          <h2 className="mt-3.5 text-[32px] lg:text-[36px] font-bold tracking-[-0.025em] leading-[1.08]">
            공식 수입사가
            <br />
            직접 검수한 리퍼몰.
          </h2>
          <p className="mt-4 text-sm text-[#c7c7cc] leading-[1.65] max-w-[460px]">
            <b className="text-white font-semibold">다른 쇼핑몰에 없는 인텍만의 차별점.</b>{" "}
            공식 수입사가 직접 검수·재판매하는 리퍼비쉬 전용 섹션. 모든 상품은 정상 동작
            확인을 거치며 A/S는 인텍앤컴퍼니가 직접 제공합니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/refurbished"
              className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-[#1A56DB] hover:bg-[#1747b4] text-white text-sm font-semibold transition-colors"
            >
              리퍼몰 둘러보기
            </Link>
            <Link
              href="/refurbished"
              className="inline-flex items-center justify-center h-9 px-5 rounded-full border border-white/25 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              검수 기준 알아보기
            </Link>
          </div>
        </div>

        {/* 우측: 등급 안내 */}
        <div className="flex flex-col gap-2.5">
          {grades.map((r) => (
            <div
              key={r.g}
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
