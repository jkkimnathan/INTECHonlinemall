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
  description: "INTEL, ASUS, MANLI, ASRock 공식 수입사 직영몰",
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
  brands: [
    { name: "INTEL", slug: "intel", logo: "/images/brands/intel.png" },
    { name: "ASUS", slug: "asus", logo: "/images/brands/asus.png" },
    { name: "MANLI", slug: "manli", logo: "/images/brands/manli.png" },
    { name: "ASRock", slug: "asrock", logo: "/images/brands/asrock.png" },
  ],

  // ─── 연락처 ───
  contact: {
    phone: "02-0000-0000",
    email: "info@intechonline.kr",
    address: "서울특별시",
    businessNumber: "000-00-00000",
    ceo: "",
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
    { title: "특가", href: "/sale" },
    { title: "커뮤니티", href: "/community" },
  ],

  // ─── 푸터 메뉴 ───
  footerNav: {
    고객센터: [
      { title: "공지사항", href: "/notice" },
      { title: "자주 묻는 질문", href: "/faq" },
      { title: "1:1 문의", href: "/inquiry" },
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
