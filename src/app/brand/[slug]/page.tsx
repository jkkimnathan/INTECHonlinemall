import { Metadata } from "next";
import Image from "next/image";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/supabase/products.server";
import { siteConfig } from "@/config/site";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
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

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const { sub } = await searchParams;
  const brand = siteConfig.brands.find((b) => b.slug === slug);
  const brandName = brand?.name || slug.toUpperCase();
  const allProducts = await getProducts({ brand: brandName });

  // 서브카테고리 필터 (중간 카테고리 클릭 시 하위 전체 포함)
  const products = sub
    ? allProducts.filter((p) => p.subcategory && (p.subcategory === sub || p.subcategory.startsWith(sub + " > ")))
    : allProducts;

  const titleSuffix = sub ? ` - ${sub}` : " 전체 상품";

  return (
    <div>
      {/* 브랜드 헤더 */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-4">
            {brand?.logo && (
              <div className="w-20 h-20 bg-white/10 rounded-xl flex items-center justify-center p-3 flex-shrink-0">
                <Image
                  src={brand.logo}
                  alt={brandName}
                  width={64}
                  height={64}
                  className="object-contain brightness-0 invert"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{brandName}</h1>
              <p className="text-gray-300 mt-2">
                {sub ? sub : `${brandName} 공식 수입 제품 | 정품 보증 | A/S 지원`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProductGrid
        products={products}
        title={`${brandName}${titleSuffix}`}
        description={`${products.length}개의 제품`}
        showFilters={true}
      />
    </div>
  );
}
