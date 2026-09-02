import type { Metadata } from "next";
import { Onest } from "next/font/google";
import ArcProB70Client from "./ArcProB70Client";

// 영문 디스플레이 타이틀용 서체(GR1X 전용관과 동일 체계)
const onest = Onest({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-onest",
  fallback: ["Manrope", "Pretendard Variable", "Pretendard", "sans-serif"],
});

const TITLE = "Intel Arc Pro B70 32GB | 로컬 AI 전용관";
const DESCRIPTION =
  "32GB. 로컬 AI의 새로운 기준. Intel 레퍼런스 · ASRock Creator · ASUS UGen — 공식 수입사 인텍앤컴퍼니. 클라우드 없이, 32GB의 여유로 27B 모델을 내 데스크에서.";
const OG_IMAGE = "/solutions/arc-pro-b70/intel-b70-ref-cut.png";

export function generateMetadata(): Metadata {
  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: "/solutions/arc-pro-b70" },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: "/solutions/arc-pro-b70",
      type: "website",
      locale: "ko_KR",
      images: [{ url: OG_IMAGE, width: 1024, height: 1024, alt: "Intel Arc Pro B70" }],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: [OG_IMAGE],
    },
  };
}

export const revalidate = 3600;

export default function ArcProB70Page() {
  return <ArcProB70Client fontClassName={onest.variable} />;
}
