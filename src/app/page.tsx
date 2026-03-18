import HeroBannerSlider from "@/components/home/HeroBannerSlider";
import NoticeTicker from "@/components/home/NoticeTicker";
import BrandShowcase from "@/components/home/BrandShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Features from "@/components/home/Features";
import TimeDeal from "@/components/home/TimeDeal";
import CategoryTabs from "@/components/home/CategoryTabs";
import { getWebSiteJsonLd } from "@/lib/jsonld";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getWebSiteJsonLd()),
        }}
      />
      <NoticeTicker />
      <HeroBannerSlider />
      <Features />
      <TimeDeal />
      <CategoryTabs />
      <BrandShowcase />
      <FeaturedProducts />
    </>
  );
}
