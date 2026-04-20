import { Metadata } from "next";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/supabase/products.server";
import { getPageBannerServer } from "@/lib/supabase/page-banners.server";
import PageBannerHeader from "@/components/ui/PageBannerHeader";

export const metadata: Metadata = {
  title: "리퍼비쉬",
  description: "검증된 리퍼비쉬 IT 하드웨어를 합리적인 가격에 만나보세요",
};

export default async function RefurbishedPage() {
  const [products, banner] = await Promise.all([
    getProducts({ condition: "refurbished" }),
    getPageBannerServer("refurbished"),
  ]);

  return (
    <div>
      <PageBannerHeader
        title={banner?.title || "리퍼비쉬 상품"}
        subtitle={banner?.subtitle || "공식 수입사가 직접 검수한 리퍼 제품 | 품질 보증 | A/S 지원"}
        imageUrl={banner?.imageUrl}
        gradientClass="from-orange-500 to-amber-500"
        subtitleColor="text-orange-100"
      />

      {/* 리퍼비쉬 안내 */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 text-sm">
            리퍼비쉬 상품이란?
          </h3>
          <p className="text-sm text-amber-800 mt-1">
            공식 수입사에서 직접 수거하여 점검, 테스트, 클리닝을 완료한 제품입니다.
            외관 상태에 따라 A급/B급으로 분류되며, 모든 제품은 정상 작동이 확인된
            제품만 판매합니다. 별도의 보증 기간이 제공됩니다.
          </p>
        </div>
      </div>

      <ProductGrid
        products={products}
        title="리퍼비쉬 전체 상품"
        description={`${products.length}개의 리퍼 상품`}
      />
    </div>
  );
}
