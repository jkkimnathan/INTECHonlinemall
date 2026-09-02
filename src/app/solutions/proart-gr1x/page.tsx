import type { Metadata } from "next";
import { Onest } from "next/font/google";
import ProArtGr1xClient from "./ProArtGr1xClient";

// ASUS ProArt 전용 서체(TT Norms Pro)의 무료 대체. 정식 폰트 확보 시 교체.
const onest = Onest({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-onest",
  fallback: ["Manrope", "Pretendard Variable", "Pretendard", "sans-serif"],
});

const TITLE = "ASUS ProArt GR1X | NVIDIA RTX Spark";
const DESCRIPTION =
  "손바닥 위의 AI 슈퍼컴퓨터. NVIDIA RTX Spark 슈퍼칩을 탑재한 150mm의 데스크톱 — AI 에이전트, 창작, 게이밍이 이 안에 다 있습니다.";
const OG_IMAGE = "/solutions/proart-gr1x/kv-rings.png";

export function generateMetadata(): Metadata {
  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: "/solutions/proart-gr1x" },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: "/solutions/proart-gr1x",
      type: "website",
      locale: "ko_KR",
      images: [{ url: OG_IMAGE, width: 1672, height: 941, alt: "ASUS ProArt GR1X" }],
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

export default function ProArtGr1xPage() {
  return <ProArtGr1xClient fontClassName={onest.variable} />;
}
