import type { Metadata } from "next";
import { Onest } from "next/font/google";
import WindowsProClient from "./WindowsProClient";

// 영문 디스플레이 타이틀용 서체(GR1X · B70 전용관과 동일 체계)
const onest = Onest({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-onest",
  fallback: ["Manrope", "Pretendard Variable", "Pretendard", "sans-serif"],
});

const TITLE = "Windows 11 Pro 기업용 디바이스 | Windows Pro Device";
const DESCRIPTION =
  "업무용 PC는, 처음부터 Pro로. Windows 11 Pro가 기본 탑재된 iPC 데스크톱과 ASUS 비즈니스 노트북. 공식 수입사가 정품 라이선스부터 배포, A/S까지 책임집니다.";
const OG_IMAGE = "/solutions/windows-pro/laptop-cut.png";

export function generateMetadata(): Metadata {
  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: "/solutions/windows-pro" },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: "/solutions/windows-pro",
      type: "website",
      locale: "ko_KR",
      images: [{ url: OG_IMAGE, width: 1600, height: 820, alt: "Windows 11 Pro 노트북" }],
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

export default function WindowsProPage() {
  return <WindowsProClient fontClassName={onest.variable} />;
}
