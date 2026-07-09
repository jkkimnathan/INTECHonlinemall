import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화 설정
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tamfbsqtrncnmjuzjbjf.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },

  // 보안 헤더
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 토스페이먼츠 결제위젯 + 다음(카카오) 우편번호 검색 스크립트 허용
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.tosspayments.com https://t1.daumcdn.net https://ssl.daumcdn.net https://postcode.map.daum.net",
              // 웹폰트 CSS: Pretendard(jsdelivr) + Manrope(구글폰트)
              "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://tamfbsqtrncnmjuzjbjf.supabase.co https://static.toss.im https://*.tosspayments.com https://t1.daumcdn.net",
              // 폰트 파일: 구글폰트(gstatic) + jsdelivr
              "font-src 'self' data: https://static.toss.im https://fonts.gstatic.com https://cdn.jsdelivr.net",
              "connect-src 'self' https://tamfbsqtrncnmjuzjbjf.supabase.co wss://tamfbsqtrncnmjuzjbjf.supabase.co https://api.tosspayments.com https://event.tosspayments.com https://*.tosspayments.com",
              // 결제위젯/우편번호 검색이 iframe으로 동작
              "frame-src 'self' https://*.tosspayments.com https://postcode.map.daum.net",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // 빌드 최적화
  poweredByHeader: false,
};

export default nextConfig;
