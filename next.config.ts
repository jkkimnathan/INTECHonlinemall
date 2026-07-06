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
              // Daum 우편번호(주소검색) 스크립트 허용
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://t1.daumcdn.net https://*.daumcdn.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://tamfbsqtrncnmjuzjbjf.supabase.co https://*.daumcdn.net https://*.daum.net",
              "font-src 'self' data:",
              "connect-src 'self' https://tamfbsqtrncnmjuzjbjf.supabase.co wss://tamfbsqtrncnmjuzjbjf.supabase.co https://*.daum.net https://*.daumcdn.net",
              // Daum 우편번호 레이어(iframe) 허용
              "frame-src https://postcode.map.daum.net",
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
