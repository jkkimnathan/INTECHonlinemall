import { Metadata } from "next";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/supabase/products.server";
import { getPageBannerServer } from "@/lib/supabase/page-banners.server";
import PageBannerHeader from "@/components/ui/PageBannerHeader";

export const metadata: Metadata = {
  title: "특가 상품",
  description: "지금 할인 중인 IT 하드웨어를 만나보세요",
};

// 공개 페이지 ISR 캐싱 (120초마다 갱신) — 응답 속도 개선
export const revalidate = 120;

export default async function SalePage() {
  const [products, banner] = await Promise.all([
    getProducts({ isSale: true }),
    getPageBannerServer("sale"),
  ]);

  return (
    <div>
      <PageBannerHeader
        title={banner?.title || "특가 상품"}
        subtitle={banner?.subtitle || "지금 할인 중인 IT 하드웨어를 놓치지 마세요!"}
        imageUrl={banner?.imageUrl}
        gradientClass="from-red-600 to-orange-500"
        subtitleColor="text-red-100"
        eyebrow="Today's Sale"
      />

      <ProductGrid
        products={products}
        title="할인 중인 상품"
        description={`${products.length}개의 특가 상품`}
      />
    </div>
  );
}
