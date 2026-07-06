import dynamic from "next/dynamic";
import HeroBannerSlider from "@/components/home/HeroBannerSlider";
import NoticeTicker from "@/components/home/NoticeTicker";
import Features from "@/components/home/Features";
import IpcShowcase from "@/components/home/IpcShowcase";
import MainImageBannerSection from "@/components/home/MainImageBannerSection";
import { getHomePageData } from "@/lib/supabase/home-data.server";
import { getHomeSectionServer } from "@/lib/supabase/home-sections.server";
import { IpcContent, RefurbContent } from "@/lib/home-sections-defaults";
import { getWebSiteJsonLd, jsonLdString } from "@/lib/jsonld";

// 홈 ISR 캐싱 (120초마다 갱신) — 응답 속도 개선
export const revalidate = 120;

export const metadata = {
  alternates: { canonical: "/" },
};

// 스크롤해야 보이는 컴포넌트는 lazy load (초기 번들 축소)
const TimeDeal = dynamic(() => import("@/components/home/TimeDeal"), {
  loading: () => <div className="py-12" />,
});
const RefurbShowcase = dynamic(() => import("@/components/home/RefurbShowcase"), {
  loading: () => <div className="py-12" />,
});
const CategoryTabs = dynamic(() => import("@/components/home/CategoryTabs"), {
  loading: () => <div className="py-12" />,
});
const BrandShowcase = dynamic(() => import("@/components/home/BrandShowcase"), {
  loading: () => <div className="py-12" />,
});
const FeaturedProducts = dynamic(
  () => import("@/components/home/FeaturedProducts"),
  { loading: () => <div className="py-12" /> }
);

export default async function Home() {
  // 서버에서 모든 홈 데이터를 병렬 프리페칭
  const [data, ipcContent, refurbContent] = await Promise.all([
    getHomePageData(),
    getHomeSectionServer<IpcContent>("ipc"),
    getHomeSectionServer<RefurbContent>("refurb"),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(getWebSiteJsonLd()),
        }}
      />
      <NoticeTicker notices={data.notices} events={data.events} />
      {/* 1. 히어로 배너 */}
      <HeroBannerSlider banners={data.banners} />
      <Features />
      {/* 2. 메인 이미지 배너 */}
      <MainImageBannerSection banners={data.mainImageBanners} />
      {/* 3. iPC 섹션 */}
      <IpcShowcase content={ipcContent} />
      {/* 4. 타임딜 */}
      <TimeDeal deals={data.timeDeals} products={data.timeDealProducts} />
      {/* 5. 추천 상품 */}
      <FeaturedProducts />
      {/* 6. 카테고리별 인기 상품 */}
      <CategoryTabs />
      {/* 7. 리퍼몰 */}
      <RefurbShowcase content={refurbContent} />
      {/* 8. 공식 취급 브랜드 */}
      <BrandShowcase />
    </>
  );
}
