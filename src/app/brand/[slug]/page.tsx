import { Metadata } from "next";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/dummy-products";
import { siteConfig } from "@/config/site";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = siteConfig.brands.find((b) => b.slug === slug);
  const brandName = brand?.name || slug.toUpperCase();
  return {
    title: `${brandName} 제품`,
    description: `${siteConfig.name}의 ${brandName} 공식 제품 목록`,
  };
}

export function generateStaticParams() {
  return siteConfig.brands.map((brand) => ({ slug: brand.slug }));
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = siteConfig.brands.find((b) => b.slug === slug);
  const brandName = brand?.name || slug.toUpperCase();
  const products = getProducts({ brand: brandName });

  return (
    <div>
      {/* 브랜드 헤더 */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">{brandName}</h1>
          <p className="text-gray-300 mt-2">
            {brandName} 공식 수입 제품 | 정품 보증 | A/S 지원
          </p>
        </div>
      </div>

      <ProductGrid
        products={products}
        title={`${brandName} 전체 상품`}
        description={`${products.length}개의 ${brandName} 제품`}
        showFilters={true}
      />
    </div>
  );
}
