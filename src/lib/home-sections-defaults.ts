// 홈 iPC/리퍼몰 쇼케이스 섹션 — 공유 타입 + 기본값
// (Supabase import 없음: 서버 컴포넌트·클라이언트·admin 모두에서 사용)

export interface IpcTier {
  tier: string;
  title: string;
  spec: string;
  price: number;
  featured?: boolean;
  href: string;
}

export interface IpcContent {
  eyebrow: string;
  caption: string;
  imageUrl: string | null;
  headline: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  tiers: IpcTier[];
}

export interface RefurbGrade {
  g: string;
  color: string;
  name: string;
  desc: string;
}

export interface RefurbContent {
  eyebrow: string;
  headline: string;
  description: string;
  cta1Label: string;
  cta1Href: string;
  cta2Label: string;
  cta2Href: string;
  grades: RefurbGrade[];
}

export const DEFAULT_IPC: IpcContent = {
  eyebrow: "Built by INTECH · Since 1981",
  caption: "iPC Gaming · G500 series",
  imageUrl: null,
  headline: "공식 수입사가\n제작한 검증된 PC.",
  description:
    "INTEL · ASUS · MANLI 정품 부품을 인텍이 직접 검수하고 조립합니다. 용도에 맞는 라인업을 선택하세요.",
  ctaLabel: "iPC 전체 라인업 보기",
  ctaHref: "/brand/ipc",
  tiers: [
    { tier: "ENTRY", title: "iPC Office", spec: "i5-14400 · 16GB · 512GB NVMe", price: 990000, href: "/brand/ipc" },
    { tier: "MAINSTREAM", title: "iPC Gaming", spec: "Core Ultra 9 · 32GB · RTX 5080", price: 3490000, featured: true, href: "/brand/ipc" },
    { tier: "PERFORMANCE", title: "iPC Workstation Pro", spec: "i9-14900K · 64GB · 2TB · RTX 5080", price: 4490000, href: "/brand/ipc" },
  ],
};

export const DEFAULT_REFURB: RefurbContent = {
  eyebrow: "Refurbished · Officially Inspected",
  headline: "공식 수입사가\n직접 검수한 리퍼몰.",
  description:
    "다른 쇼핑몰에 없는 인텍만의 차별점. 공식 수입사가 직접 검수·재판매하는 리퍼비쉬 전용 섹션. 모든 상품은 정상 동작 확인을 거치며 A/S는 인텍앤컴퍼니가 직접 제공합니다.",
  cta1Label: "리퍼몰 둘러보기",
  cta1Href: "/refurbished",
  cta2Label: "검수 기준 알아보기",
  cta2Href: "/refurbished",
  grades: [
    { g: "S", color: "#34d399", name: "단순 개봉", desc: "박스 개봉만 된 미사용 상품 · 신품과 동일" },
    { g: "A", color: "#60a5fa", name: "구성품 누락 · 미세 스크래치", desc: "본품 정상 동작 확인 · 동봉품 누락 또는 외관 흠집" },
    { g: "B", color: "#fbbf24", name: "중고에 가까움", desc: "사용감 있음 · 가격 메리트로 보상 · 정상 동작 확인" },
  ],
};
