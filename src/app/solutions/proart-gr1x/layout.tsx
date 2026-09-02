// ProArt GR1X 전용관 레이아웃.
// 루트 레이아웃이 공통 Header/Footer를 항상 렌더하므로(라우트 그룹 재구성 없이는 제외 불가)
// 여기서는 래퍼 없이 children만 통과시키고, 페이지 자체의 sticky 서브네비가
// 사이트 헤더 높이(실측 --hdr)만큼 아래에 붙도록 처리한다.
export default function ProArtGr1xLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
