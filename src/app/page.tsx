import HeroBanner from "@/components/home/HeroBanner";
import BrandShowcase from "@/components/home/BrandShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Features from "@/components/home/Features";
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
      <HeroBanner />
      <Features />
      <BrandShowcase />
      <FeaturedProducts />
    </>
  );
}
