import dynamic from "next/dynamic";
import HeroBannerSlider from "@/components/home/HeroBannerSlider";
import NoticeTicker from "@/components/home/NoticeTicker";
import Features from "@/components/home/Features";
import IpcShowcase from "@/components/home/IpcShowcase";
import MainImageBannerSection from "@/components/home/MainImageBannerSection";
import { getHomePageData } from "@/lib/supabase/home-data.server";
import { getHomeSectionServer } from "@/lib/supabase/home-sections.server";
import { IpcContent, RefurbContent } from "@/lib/home-sections-defaults";
import { getWebSiteJsonLd } from "@/lib/jsonld";

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
          __html: JSON.stringify(getWebSiteJsonLd()),
        }}
      />
      <NoticeTicker notices={data.notices} events={data.events} />
      <HeroBannerSlider banners={data.banners} />
      <Features />
      <IpcShowcase content={ipcContent} />
      <MainImageBannerSection banners={data.mainImageBanners} />
      <TimeDeal deals={data.timeDeals} products={data.timeDealProducts} />
      <RefurbShowcase content={refurbContent} />
      <CategoryTabs />
      <BrandShowcase />
      <FeaturedProducts />
    </>
  );
}
