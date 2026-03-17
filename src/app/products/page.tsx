import { Metadata } from "next";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/dummy-products";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "전체상품",
  description: `${siteConfig.name} 전체 상품 목록`,
};

export default function ProductsPage() {
  const products = getProducts();

  return (
    <ProductGrid
      products={products}
      title="전체상품"
      description="모든 IT 하드웨어를 한눈에 확인하세요"
    />
  );
}
