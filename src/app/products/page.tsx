import { Metadata } from "next";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/supabase/products.server";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "전체상품",
  description: `${siteConfig.name} 전체 상품 목록`,
};

// 공개 페이지 ISR 캐싱 (120초마다 갱신) — 응답 속도 개선
export const revalidate = 120;

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <ProductGrid
      products={products}
      title="전체상품"
      description="모든 IT 하드웨어를 한눈에 확인하세요"
    />
  );
}
