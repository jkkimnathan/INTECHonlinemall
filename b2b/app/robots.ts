import type { MetadataRoute } from 'next'

/**
 * 공개 랜딩은 색인 허용.
 * /admin·/dealer 는 robots 에 나열하지 않는다 — robots 는 접근통제가 아니며
 * 경로 존재만 광고하기 때문(보안 감사 반영). 색인 차단은 각 레이아웃의
 * noindex 메타데이터가 담당한다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: (process.env.NEXT_PUBLIC_SITE_URL || 'https://ipcb2bmall.com') + '/sitemap.xml',
  }
}
