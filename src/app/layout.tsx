import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";
import { getOrganizationJsonLd, jsonLdString } from "@/lib/jsonld";
import FloatingActions from "@/components/floating/FloatingActions";
import AuthProvider from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/toast";

// Fonts (design system): 한글 본문 Pretendard + 영문 액센트 Manrope.
// Self-hosted CDN으로 로드 — next/font/google 빌드타임 페치 의존성 회피.
const PRETENDARD_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";
const MANROPE_CSS =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - ${siteConfig.description}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  keywords: [
    "컴퓨터 부품", "PC 하드웨어", "CPU", "그래픽카드", "메인보드",
    "INTEL", "ASUS", "MANLI", "ASRock", "TOSHIBA", "Microsoft", "MSI", "iPC", "조립PC",
    "공식 수입사", "정품", "인텍앤컴퍼니",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  // verification: { google: "인증코드", other: { "naver-site-verification": "인증코드" } },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={PRETENDARD_CSS} />
        <link rel="stylesheet" href={MANROPE_CSS} />
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdString(getOrganizationJsonLd()),
          }}
        />
        <AuthProvider>
          <ToastProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <FloatingActions />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
