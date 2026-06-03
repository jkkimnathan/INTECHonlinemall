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
      {/* 브랜드 인트로 히어로 */}
      <div className="bg-[#fbfbfd] border-b border-[#f1f1f3]">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-5">
            {brand?.logo && (
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center p-4 flex-shrink-0 border ${
                  slug === "ipc"
                    ? "bg-[#1d1d1f] border-transparent"
                    : "bg-white border-[#f1f1f3]"
                }`}
              >
                <Image
                  src={brand.logo}
                  alt={brandName}
                  width={64}
                  height={64}
                  className="object-contain max-h-12 w-auto"
                />
              </div>
            )}
            <div>
              <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa]">
                Official Importer · {brandName}
              </div>
              <h1 className="text-[32px] font-bold text-[#1d1d1f] tracking-[-0.025em] mt-2 leading-[1.1]">
                {brandName}
              </h1>
              <p className="text-[#86868b] mt-2 text-sm">
                {sub ? sub : `${brandName} 공식 수입 제품 · 정품 보증 · A/S 지원`}
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
