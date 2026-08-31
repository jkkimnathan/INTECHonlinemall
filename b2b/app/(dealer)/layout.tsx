import type { Metadata } from 'next'

/** 거래처 영역: 검색엔진 색인 차단 (보안 감사 반영) */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DealerGroupLayout({ children }: { children: React.ReactNode }) {
  return children
}
