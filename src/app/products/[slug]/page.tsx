import type { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug, getProducts } from "@/lib/supabase/products.server";
import { getProductJsonLd, getBreadcrumbJsonLd, jsonLdString } from "@/lib/jsonld";
import { siteConfig } from "@/config/site";
import ProductDetailClient from "./ProductDetailClient";

// 상품 정보 ISR 캐싱 (60초) — 재고/가격 표시는 주문 시 서버(RPC)에서 재검증됨
export const revalidate = 60;

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(decodeURIComponent(slug));

  if (!product) {
    return { title: "상품을 찾을 수 없습니다" };
  }

  const finalPrice = product.salePrice ?? product.price;
  const description = `${product.brand} ${product.name} - ${formatPrice(finalPrice)} | ${siteConfig.description}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/products/${product.slug}`,
      type: "website",
      ...(product.images.length > 0 && { images: [{ url: product.images[0] }] }),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(decodeURIComponent(slug));

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          상품을 찾을 수 없습니다
        </h1>
        <Link href="/products" className="text-blue-600 hover:underline mt-4 inline-block">
          전체상품으로 돌아가기
        </Link>
      </div>
    );
  }

  const related = (await getProducts({ brand: product.brand }))
    .filter((r) => r.id !== product.id)
    .slice(0, 4);

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "홈", url: "/" },
    { name: "전체상품", url: "/products" },
    { name: product.brand, url: `/brand/${product.brand.toLowerCase()}` },
    { name: product.name, url: `/products/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(getProductJsonLd(product)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(breadcrumbJsonLd),
        }}
      />
      {/* key로 상품 전환 시 수량/이미지 선택 등 클라이언트 상태 초기화 */}
      <ProductDetailClient
        key={product.id}
        product={product}
        relatedProducts={related}
      />
    </>
  );
}
