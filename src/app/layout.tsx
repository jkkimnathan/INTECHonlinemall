import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";
import { getOrganizationJsonLd } from "@/lib/jsonld";
import FloatingActions from "@/components/floating/FloatingActions";
import AuthProvider from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationJsonLd()),
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
