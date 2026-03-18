"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/dummy-products";

interface Deal {
  productId: string;
  soldPercent: number;
  hoursLeft: number;
}

const dealConfig: Deal[] = [
  { productId: "3", soldPercent: 72, hoursLeft: 6 },
  { productId: "7", soldPercent: 45, hoursLeft: 12 },
  { productId: "11", soldPercent: 88, hoursLeft: 3 },
];

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function getDiscountRate(price: number, salePrice: number) {
  return Math.round(((price - salePrice) / price) * 100);
}

export default function TimeDeal() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 6, 0, 0, 0);

    const update = () => {
      const now = new Date();
      const diff = Math.max(0, endTime.getTime() - now.getTime());
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const allProducts = getProducts({});
  const deals = dealConfig
    .map((deal) => ({
      ...deal,
      product: allProducts.find((p) => p.id === deal.productId),
    }))
    .filter((d) => d.product && d.product.salePrice);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="container mx-auto px-4">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">타임딜</h2>
              <p className="text-sm text-gray-500">한정 시간 특가 할인</p>
            </div>
          </div>

          {/* 카운트다운 */}
          {mounted && (
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-red-600" />
              <span className="text-sm text-gray-500">남은 시간</span>
              <div className="flex items-center gap-1">
                <span className="bg-gray-900 text-white text-lg font-mono font-bold px-2 py-1 rounded">
                  {pad(timeLeft.hours)}
                </span>
                <span className="text-gray-900 font-bold">:</span>
                <span className="bg-gray-900 text-white text-lg font-mono font-bold px-2 py-1 rounded">
                  {pad(timeLeft.minutes)}
                </span>
                <span className="text-gray-900 font-bold">:</span>
                <span className="bg-gray-900 text-white text-lg font-mono font-bold px-2 py-1 rounded">
                  {pad(timeLeft.seconds)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 딜 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deals.map(({ product, soldPercent }) => {
            if (!product) return null;
            const discount = product.salePrice
              ? getDiscountRate(product.price, product.salePrice)
              : 0;

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="bg-white rounded-xl border border-red-100 p-5 hover:shadow-lg transition-shadow group"
              >
                {/* 이미지 */}
                <div className="aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center p-4">
                    <p className="text-xs text-gray-400">{product.brand}</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">
                      {product.name}
                    </p>
                  </div>
                  <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs">
                    {discount}% OFF
                  </Badge>
                </div>

                {/* 상품 정보 */}
                <p className="text-xs text-blue-600 font-medium">{product.brand}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </p>

                {/* 가격 */}
                <div className="mt-3">
                  <p className="text-xs text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-red-600">
                      {discount}%
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.salePrice!)}
                    </span>
                  </div>
                </div>

                {/* 판매 현황 바 */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-red-600 font-semibold">
                      {soldPercent}% 판매
                    </span>
                    <span className="text-gray-400">한정 수량</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${soldPercent}%` }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white">
                  구매하기
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
