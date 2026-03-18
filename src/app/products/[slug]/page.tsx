"use client";

import { use } from "react";
import Link from "next/link";
import { getProductBySlug, getProducts } from "@/lib/dummy-products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import {
  ShoppingCart,
  Heart,
  ChevronRight,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { useState, useEffect } from "react";
import { getProductJsonLd, getBreadcrumbJsonLd } from "@/lib/jsonld";
import { useRecentlyViewedStore } from "@/store/recentlyViewed";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((s) => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const addToRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product, addToRecentlyViewed]);

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

  const relatedProducts = getProducts({ brand: product.brand })
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

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
    <div className="bg-gray-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getProductJsonLd(product)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      {/* 브레드크럼 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">홈</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-blue-600">전체상품</Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/brand/${product.brand.toLowerCase()}`}
              className="hover:text-blue-600"
            >
              {product.brand}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* 상품 상세 */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 이미지 영역 */}
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <p className="text-gray-400 text-sm">상품 이미지</p>
                <p className="text-gray-500 text-lg font-medium mt-2">
                  {product.name}
                </p>
              </div>
            </div>

            {/* 상품 정보 */}
            <div>
              {/* 배지 */}
              <div className="flex gap-2 mb-3">
                {product.condition === "refurbished" && (
                  <Badge className="bg-orange-500 text-white">리퍼비쉬</Badge>
                )}
                {product.isNew && (
                  <Badge className="bg-blue-600 text-white">NEW</Badge>
                )}
                {product.isSale && (
                  <Badge className="bg-red-500 text-white">SALE</Badge>
                )}
              </div>

              {/* 브랜드 & 카테고리 */}
              <Link
                href={`/brand/${product.brand.toLowerCase()}`}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                {product.brand}
              </Link>
              <span className="text-sm text-gray-400 mx-2">|</span>
              <span className="text-sm text-gray-500">{product.category}</span>

              {/* 상품명 */}
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
                {product.name}
              </h1>

              {/* 가격 */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                {product.salePrice ? (
                  <>
                    <p className="text-sm text-gray-400 line-through">
                      정가: {formatPrice(product.price)}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-red-600">
                        {discountRate}%
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(product.salePrice)}
                      </span>
                    </div>
                    <p className="text-xs text-red-500 mt-1">
                      {formatPrice(product.price - product.salePrice)} 할인
                    </p>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* 재고 */}
              <div className="mt-3">
                {product.stock > 0 ? (
                  <span className="text-sm text-green-600">
                    재고 있음 ({product.stock}개)
                  </span>
                ) : (
                  <span className="text-sm text-red-500 font-medium">품절</span>
                )}
              </div>

              <Separator className="my-4" />

              {/* 수량 선택 */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">수량</span>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  합계:{" "}
                  <span className="font-bold text-gray-900">
                    {formatPrice(finalPrice * quantity)}
                  </span>
                </span>
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 mt-6">
                <Button
                  size="lg"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={product.stock === 0}
                  onClick={() => {
                    addToCart(product, quantity);
                    alert(`${product.name}이(가) 장바구니에 담겼습니다.`);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  장바구니 담기
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={isInWishlist(product.id) ? "text-red-500 border-red-300" : ""}
                  onClick={() => {
                    if (isInWishlist(product.id)) {
                      removeFromWishlist(product.id);
                    } else {
                      addToWishlist(product);
                    }
                  }}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-red-500" : ""}`} />
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

        {/* 상품 설명 & 스펙 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* 상품 설명 */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">상품 설명</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* 제품 스펙 */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">제품 사양</h2>
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
        </div>

        {/* 관련 상품 */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
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
