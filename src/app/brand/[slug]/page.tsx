import { Metadata } from "next";
import Image from "next/image";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/supabase/products.server";
import { getPageBannerServer } from "@/lib/supabase/page-banners.server";
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
  const [allProducts, banner] = await Promise.all([
    getProducts({ brand: brandName }),
    getPageBannerServer(`brand-${slug}`),
  ]);

  // 관리자에서 편집한 제목/문구 (없으면 기본값)
  const heroTitle = banner?.title || brandName;
  const heroDesc = sub
    ? sub
    : banner?.subtitle || `${brandName} 공식 수입 제품 · 정품 보증 · A/S 지원`;

  // 서브카테고리 필터 (중간 카테고리 클릭 시 하위 전체 포함)
  const products = sub
    ? allProducts.filter((p) => p.subcategory && (p.subcategory === sub || p.subcategory.startsWith(sub + " > ")))
    : allProducts;

  const titleSuffix = sub ? ` - ${sub}` : " 전체 상품";

  return (
    <div>
      {/* 브랜드 인트로 히어로 */}
      {banner?.imageUrl ? (
        // 관리자에서 등록한 배경 이미지 배너
        <div className="relative h-[200px] md:h-[260px] overflow-hidden border-b border-[#f1f1f3]">
          <Image src={banner.imageUrl} alt={heroTitle} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
                Official Importer · {brandName}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.025em] mt-2 [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">
                {heroTitle}
              </h1>
              <p className="text-white/90 mt-2 text-sm [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
                {heroDesc}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // 기본: 로고 + 텍스트
        <div className="bg-[#fbfbfd] border-b border-[#f1f1f3]">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-5">
              {brand?.logo && (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center p-4 flex-shrink-0 border bg-white border-[#f1f1f3]">
                  <Image
                    src={brand.logo}
                    alt={brandName}
                    width={64}
                    height={64}
                    className={`object-contain max-h-12 w-auto ${slug === "ipc" ? "brightness-0" : ""}`}
                  />
                </div>
              )}
              <div>
                <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa]">
                  Official Importer · {brandName}
                </div>
                <h1 className="text-[32px] font-bold text-[#1d1d1f] tracking-[-0.025em] mt-2 leading-[1.1]">
                  {heroTitle}
                </h1>
                <p className="text-[#86868b] mt-2 text-sm">
                  {heroDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProductGrid
        products={products}
        title={`${brandName}${titleSuffix}`}
        description={`${products.length}개의 제품`}
        showFilters={true}
      />
    </div>
  );
}
