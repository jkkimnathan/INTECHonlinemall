"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug, getProducts } from "@/lib/supabase/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { showToast } from "@/components/ui/toast";
import {
  ShoppingCart,
  Heart,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import ProductReviews from "@/components/product/ProductReviews";
import { Product } from "@/types/product";
import { getProductJsonLd, getBreadcrumbJsonLd, jsonLdString } from "@/lib/jsonld";
import { useRecentlyViewedStore } from "@/store/recentlyViewed";

function DetailImageSection({ images, productName }: { images: string[]; productName: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border mt-6 overflow-hidden">
      <div className="p-6 pb-0">
        <h2 className="text-lg font-bold text-[#1d1d1f]">상세 정보</h2>
      </div>
      <div className={`mt-4 relative ${!expanded ? "max-h-[600px] overflow-hidden" : ""}`}>
        {images.map((img, i) => (
          <Image key={i} src={img} alt={`${productName} 상세 ${i + 1}`} width={0} height={0} sizes="100vw" className="w-full h-auto" />
        ))}
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      <div className="p-4 text-center border-t">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {expanded ? (
            <>상세정보 접기 <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>상세정보 더보기 <ChevronDown className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const addToCart = useCartStore((s) => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const addToRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug).then((p) => {
      setProduct(p);
      setLoading(false);
      if (p) {
        addToRecentlyViewed(p);
        getProducts({ brand: p.brand }).then((related) => {
          setRelatedProducts(related.filter((r) => r.id !== p.id).slice(0, 4));
        });
      }
    });
  }, [slug, addToRecentlyViewed]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">상품 정보를 불러오는 중...</p>
      </div>
    );
  }

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

  const finalPrice = product.salePrice ?? product.price;
  const discountRate = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "홈", url: "/" },
    { name: "전체상품", url: "/products" },
    { name: product.brand, url: `/brand/${product.brand.toLowerCase()}` },
    { name: product.name, url: `/products/${product.slug}` },
  ]);

  return (
    <div className="bg-[#fbfbfd] min-h-screen">
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
      {/* 브레드크럼 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-[#86868b]">
            <Link href="/" className="hover:text-[#1A56DB]">홈</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-[#1A56DB]">전체상품</Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/brand/${product.brand.toLowerCase()}`}
              className="hover:text-[#1A56DB]"
            >
              {product.brand}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#1d1d1f] truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* 상품 상세 */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-[#f1f1f3] p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* 이미지 영역 */}
            <div>
              <div className="relative aspect-square bg-[#f5f5f7] rounded-xl overflow-hidden">
                {product.images.length > 0 ? (
                  <Image src={product.images[mainImage] || product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                    <div>
                      <p className="text-gray-400 text-sm">상품 이미지</p>
                      <p className="text-gray-500 text-lg font-medium mt-2">{product.name}</p>
                    </div>
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(i)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === mainImage ? "border-[#1d1d1f]" : "border-[#f1f1f3] hover:border-[#d1d5db]"}`}
                    >
                      <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="64px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 상품 정보 */}
            <div>
              {/* 배지 */}
              <div className="flex gap-2 mb-3">
                {product.condition === "refurbished" && (
                  <Badge className="rounded-full bg-[#fff7ed] text-[#c2410c] border-transparent">리퍼비쉬</Badge>
                )}
                {product.isNew && (
                  <Badge className="rounded-full bg-[#eef4ff] text-[#1d4ed8] border-transparent">NEW</Badge>
                )}
                {product.isSale && (
                  <Badge className="rounded-full bg-[#DC2626] text-white border-transparent">SALE</Badge>
                )}
              </div>

              {/* 브랜드 & 카테고리 */}
              <Link
                href={`/brand/${product.brand.toLowerCase()}`}
                className="font-en text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A56DB] hover:underline"
              >
                {product.brand}
              </Link>
              <span className="text-sm text-[#d1d5db] mx-2">·</span>
              <span className="text-sm text-[#86868b]">{product.category}</span>

              {/* 상품명 */}
              <h1 className="text-[22px] md:text-[26px] font-bold text-[#1d1d1f] tracking-[-0.02em] leading-[1.3] mt-2">
                {product.name}
              </h1>

              {/* 가격 */}
              <div className="mt-4 p-5 bg-[#f5f5f7] rounded-xl">
                {product.salePrice ? (
                  <>
                    <p className="text-sm text-[#a1a1aa] line-through tabular-nums">
                      정가: {formatPrice(product.price)}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-bold text-[#dc2626] tabular-nums tracking-[-0.025em]">
                        {discountRate}%
                      </span>
                      <span className="text-3xl font-bold text-[#1d1d1f] tabular-nums tracking-[-0.025em]">
                        {formatPrice(product.salePrice)}
                      </span>
                    </div>
                    <p className="text-xs text-[#dc2626] mt-1 tabular-nums">
                      {formatPrice(product.price - product.salePrice)} 할인
                    </p>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-[#1d1d1f] tabular-nums tracking-[-0.025em]">
                    {formatPrice(product.price)}
                  </span>
                )}
                <p className="text-xs text-[#86868b] mt-2 tabular-nums">
                  적립금 {formatPrice(Math.floor(finalPrice * 0.01))}
                </p>
              </div>

              {/* 재고 */}
              <div className="mt-3">
                {product.stock > 0 ? (
                  <span className="text-sm text-[#059669] font-medium tabular-nums">
                    재고 있음 ({product.stock}개)
                  </span>
                ) : (
                  <span className="text-sm text-[#dc2626] font-medium">품절</span>
                )}
              </div>

              <Separator className="my-4" />

              {/* 수량 선택 */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#3f3f46]">수량</span>
                <div className="flex items-center border border-[#e5e7eb] rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 pl-3 hover:text-[#1A56DB] text-[#3f3f46]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="p-2 pr-3 hover:text-[#1A56DB] text-[#3f3f46]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-[#86868b]">
                  합계:{" "}
                  <span className="font-bold text-[#1d1d1f] tabular-nums">
                    {formatPrice(finalPrice * quantity)}
                  </span>
                </span>
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 mt-6">
                <Button
                  size="lg"
                  className="flex-1 rounded-full bg-[#1A56DB] hover:bg-[#1747b4]"
                  disabled={product.stock === 0}
                  onClick={() => {
                    addToCart(product, quantity);
                    showToast(`${product.name}이(가) 장바구니에 담겼습니다.`);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  장바구니 담기
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`rounded-full ${isInWishlist(product.id) ? "text-[#DC2626] border-[#fecaca]" : ""}`}
                  onClick={() => {
                    if (isInWishlist(product.id)) {
                      removeFromWishlist(product.id);
                    } else {
                      addToWishlist(product);
                    }
                  }}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-[#DC2626]" : ""}`} />
                </Button>
              </div>

              {/* 배송/보증 안내 */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span>평일 오후 2시 이전 주문 당일 출고</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span>공식 수입사 정품 보증</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RotateCcw className="h-4 w-4 text-gray-400" />
                  <span>7일 이내 교환/반품 가능</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상세페이지 이미지 */}
        {product.detailImages && product.detailImages.length > 0 && (
          <DetailImageSection images={product.detailImages} productName={product.name} />
        )}

        {/* 상품 설명 & 스펙 - 내용이 있을 때만 표시 */}
        {(product.description?.trim() || Object.keys(product.specs).length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {product.description?.trim() && (
              <div className="bg-white rounded-2xl border border-[#f1f1f3] p-6">
                <h2 className="text-lg font-bold text-[#1d1d1f] mb-4">상품 설명</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
            {Object.keys(product.specs).length > 0 && (
              <div className="bg-white rounded-2xl border border-[#f1f1f3] p-6">
                <h2 className="text-lg font-bold text-[#1d1d1f] mb-4">제품 사양</h2>
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key} className="border-b last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-gray-600 whitespace-nowrap w-1/3">
                          {key}
                        </td>
                        <td className="py-2.5 text-gray-900">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 리뷰 */}
        <ProductReviews productId={product.id} />

        {/* 관련 상품 */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-[#1d1d1f] mb-4">
              같은 브랜드의 다른 상품
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
