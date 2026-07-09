/**
 * 사이트 설정 파일 (중앙 관리)
 *
 * 쇼핑몰 이름, 로고, 브랜드 컬러, 연락처 등을 이 파일에서만 수정하면
 * 사이트 전체에 자동으로 반영됩니다.
 */

export const siteConfig = {
  // ─── 기본 정보 ───
  name: "인텍앤컴퍼니몰",
  nameEn: "INTECH & Company Mall",
  description: "INTEL, ASUS, MANLI, ASRock, Microsoft, iPC 공식 수입사 직영몰",
  url: "https://intechonline.kr",
  domain: "intechonline.kr",

  // ─── 로고 (추후 로고 파일을 /public/images/ 에 넣고 경로만 변경하면 됩니다) ───
  logo: {
    src: "/images/logo.png",
    alt: "인텍앤컴퍼니몰 로고",
    width: 180,
    height: 40,
  },

  // ─── 취급 브랜드 ───
  // logo: 브랜드 로고 이미지 (투명 배경 PNG 권장, /public/images/brands/ 에 저장)
  // bgImage: 브랜드 카드 배경 이미지 (선택, /public/images/brands/ 에 저장)
  brands: [
    { name: "INTEL", slug: "intel", logo: "/images/brands/intel.png", bgImage: "" },
    { name: "ASUS", slug: "asus", logo: "/images/brands/asus.png", bgImage: "" },
    { name: "MANLI", slug: "manli", logo: "/images/brands/manli.png", bgImage: "" },
    { name: "ASRock", slug: "asrock", logo: "/images/brands/ASRock.png", bgImage: "" },
    { name: "TOSHIBA", slug: "toshiba", logo: "/images/brands/toshiba.png", bgImage: "" },
    { name: "Microsoft", slug: "microsoft", logo: "/images/brands/Microsoft.png", bgImage: "" },
    { name: "iPC", slug: "ipc", logo: "/images/brands/ipc.png", bgImage: "" },
  ],

  // ─── 연락처 ───
  contact: {
    companyName: "(주)인텍앤컴퍼니원효직매장",
    ceo: "조덕현",
    businessNumber: "106-85-13284",
    mailOrderNumber: "2009-서울용산-01203",
    address: "서울특별시 용산구 원효로58길 15, 1층",
    phone: "1544-6549",
    email: "event@intechn.com",
    csHours: "평일 09:30 ~ 17:00",
    csLunch: "점심 12:00 ~ 13:00",
  },

  // ─── SNS ───
  social: {
    youtube: "",
    instagram: "",
    blog: "",
  },

  // ─── 네비게이션 메뉴 ───
  mainNav: [
    { title: "전체상품", href: "/products" },
    { title: "INTEL", href: "/brand/intel" },
    { title: "ASUS", href: "/brand/asus" },
    { title: "MANLI", href: "/brand/manli" },
    { title: "ASRock", href: "/brand/asrock" },
    { title: "TOSHIBA", href: "/brand/toshiba" },
    { title: "Microsoft", href: "/brand/microsoft" },
    { title: "iPC", href: "/brand/ipc" },
    { title: "특가", href: "/sale" },
    { title: "리퍼비쉬", href: "/refurbished" },
    { title: "이벤트", href: "/event" },
    { title: "공지사항", href: "/notice" },
    { title: "커뮤니티", href: "/community" },
  ],

  // ─── 푸터 메뉴 ───
  footerNav: {
    고객센터: [
      { title: "공지사항", href: "/notice" },
      { title: "자주 묻는 질문", href: "/faq" },
      { title: "1:1 문의", href: "/community" },
    ],
    쇼핑안내: [
      { title: "이용약관", href: "/terms" },
      { title: "개인정보처리방침", href: "/privacy" },
      { title: "배송안내", href: "/shipping" },
      { title: "교환/반품 안내", href: "/returns" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;

// ─── 숨김 브랜드 (코드는 보존, 화면 노출만 차단) ───
// slug 소문자 기준. 다시 노출하려면 이 배열에서 제거하면 됩니다.
export const HIDDEN_BRAND_SLUGS: string[] = ["toshiba"];

/** 브랜드명 또는 slug가 숨김 대상인지 (대소문자 무시). 상품 brand 값에도 사용 */
export function isHiddenBrand(brand: string): boolean {
  return HIDDEN_BRAND_SLUGS.includes(brand.toLowerCase());
}

/** 화면 노출용 브랜드 목록 (숨김 제외) */
export const visibleBrands = siteConfig.brands.filter((b) => !isHiddenBrand(b.slug));

/** 화면 노출용 브랜드 네비 항목 (숨김 제외) */
export const visibleBrandNav = siteConfig.mainNav.filter(
  (item) => !HIDDEN_BRAND_SLUGS.some((s) => item.href === `/brand/${s}`)
);
