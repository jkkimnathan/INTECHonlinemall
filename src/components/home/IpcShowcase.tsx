import Link from "next/link";
import Image from "next/image";

const tiers = [
  {
    tier: "ENTRY",
    title: "iPC Office",
    spec: "i5-14400 · 16GB · 512GB NVMe",
    price: 990000,
  },
  {
    tier: "MAINSTREAM",
    title: "iPC Gaming",
    spec: "Core Ultra 9 · 32GB · RTX 5080",
    price: 3490000,
    featured: true,
  },
  {
    tier: "PERFORMANCE",
    title: "iPC Workstation Pro",
    spec: "i9-14900K · 64GB · 2TB · RTX 5080",
    price: 4490000,
  },
];

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default function IpcShowcase() {
  return (
    <section className="bg-white border-b border-[#f1f1f3]">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] min-h-[480px]">
        {/* 좌측: 제품 비주얼 */}
        <div className="relative bg-[#f5f5f7] overflow-hidden flex items-center justify-center py-16 px-8">
          <div className="bg-[#1d1d1f] rounded-2xl px-10 py-8 flex items-center justify-center">
            <Image
              src="/images/brands/ipc.png"
              alt="iPC"
              width={220}
              height={80}
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className="absolute left-8 bottom-7 font-en text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a1a1aa]">
            iPC Gaming · G500 series
          </div>
        </div>

        {/* 우측: 카피 + 라인업 */}
        <div className="px-8 sm:px-14 py-14 flex flex-col gap-5 justify-center">
          <div className="flex items-center gap-3.5">
            <span className="text-xl font-bold text-[#1d1d1f] tracking-[-0.02em]">iPC</span>
            <span className="w-px h-[18px] bg-[#e5e5ea]" />
            <span className="font-en text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#86868b]">
              Built by INTECH · Since 1981
            </span>
          </div>
          <h2 className="text-[32px] lg:text-[40px] font-bold text-[#1d1d1f] tracking-[-0.025em] leading-[1.08]">
            공식 수입사가
            <br />
            제작한 검증된 PC.
          </h2>
          <p className="text-[15px] text-[#424245] leading-[1.6] max-w-[400px]">
            INTEL · ASUS · MANLI 정품 부품을 인텍이 직접 검수하고 조립합니다. 용도에 맞는
            라인업을 선택하세요.
          </p>

          <div className="flex flex-col gap-2 mt-3">
            {tiers.map((t) => (
              <Link
                key={t.tier}
                href="/brand/ipc"
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
            href="/brand/ipc"
            className="inline-flex items-center gap-1.5 mt-1.5 text-[13px] font-semibold text-[#1d1d1f]"
          >
            iPC 전체 라인업 보기 <span className="text-[#86868b]">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
