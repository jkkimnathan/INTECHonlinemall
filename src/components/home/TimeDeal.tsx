"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Timer, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  TimeDeal as TimeDealType,
  TimeDealItem,
} from "@/lib/supabase/timedeals";
import { Product } from "@/types/product";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function getDiscountRate(original: number, deal: number) {
  if (original <= 0) return 0;
  return Math.round(((original - deal) / original) * 100);
}

interface Props {
  deals?: (TimeDealType & { items: TimeDealItem[] })[];
  products?: Product[];
}

export default function TimeDeal({ deals: initialDeals = [], products: initialProducts = [] }: Props) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const productMap = useMemo(() => {
    const map: Record<string, Product> = {};
    initialProducts.forEach((p) => { map[p.id] = p; });
    return map;
  }, [initialProducts]);

  const earliestEnd = useMemo(() => {
    if (initialDeals.length === 0) return null;
    return initialDeals.reduce((min, d) => {
      const t = new Date(d.endTime);
      return t < min ? t : min;
    }, new Date(initialDeals[0].endTime));
  }, [initialDeals]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!earliestEnd) return;
    const update = () => {
      const now = new Date();
      const diff = Math.max(0, earliestEnd.getTime() - now.getTime());
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [earliestEnd]);

  const pad = (n: number) => String(n).padStart(2, "0");

  // 아이템이 있는 딜만 표시
  const activeDeals = initialDeals.filter((d) => d.items.length > 0);
  const hasProducts = Object.keys(productMap).length > 0;

  if (activeDeals.length === 0 || !hasProducts) return null;

  return (
    <section className="py-12 bg-[#fef2f2]">
      <div className="container mx-auto px-4">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#DC2626] rounded-full flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#dc2626]">
                Today&apos;s Sale
              </div>
              <h2 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em]">타임딜</h2>
            </div>
          </div>

          {/* 카운트다운 */}
          {mounted && (
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-[#DC2626]" />
              <span className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#86868b]">Ends in</span>
              <div className="flex items-center gap-1">
                <span className="bg-[#1d1d1f] text-white text-lg font-mono font-bold px-2 py-1 rounded tabular-nums">
                  {pad(timeLeft.hours)}
                </span>
                <span className="text-[#1d1d1f] font-bold">:</span>
                <span className="bg-[#1d1d1f] text-white text-lg font-mono font-bold px-2 py-1 rounded tabular-nums">
                  {pad(timeLeft.minutes)}
                </span>
                <span className="text-[#1d1d1f] font-bold">:</span>
                <span className="bg-[#1d1d1f] text-white text-lg font-mono font-bold px-2 py-1 rounded tabular-nums">
                  {pad(timeLeft.seconds)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 딜 그룹들 */}
        {activeDeals.map((deal) => (
          <div key={deal.id} className="mb-8 last:mb-0">
            {activeDeals.length > 1 && (
              <h3 className="text-lg font-bold text-gray-800 mb-4">{deal.title}</h3>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {deal.items.map((item) => {
                const product = productMap[item.productId];
                if (!product) return null;

                const isSoldOut = item.soldCount >= item.dealQuantity;
                const soldPercent = Math.min(
                  100,
                  Math.round((item.soldCount / item.dealQuantity) * 100)
                );
                const basePrice = product.salePrice || product.price;
                const discount = getDiscountRate(product.price, item.dealPrice);

                const cardContent = (
                  <div
                    className={`bg-white rounded-xl border p-4 transition-shadow group relative ${
                      isSoldOut
                        ? "border-gray-200 opacity-75"
                        : "border-red-100 hover:shadow-lg"
                    }`}
                  >
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-white/60 rounded-xl z-10 flex items-center justify-center">
                        <div className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm">
                          타임딜 완판되었습니다
                        </div>
                      </div>
                    )}

                    <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <p className="text-xs text-gray-400">{product.brand}</p>
                          <p className="text-sm text-gray-600 font-medium mt-1">
                            {product.name}
                          </p>
                        </div>
                      )}
                      {!isSoldOut && (
                        <Badge className="absolute top-2 left-2 bg-[#DC2626] text-white text-xs rounded-full">
                          {discount}% OFF
                        </Badge>
                      )}
                    </div>

                    <p className="font-en text-[10px] font-semibold uppercase tracking-[0.1em] text-[#86868b]">{product.brand}</p>
                    <p className="text-sm font-semibold text-[#1d1d1f] mt-1 line-clamp-2 group-hover:text-[#1A56DB] transition-colors">
                      {product.name}
                    </p>

                    <div className="mt-2">
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </p>
                      {product.salePrice && product.salePrice !== item.dealPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          할인가 {formatPrice(product.salePrice)}
                        </p>
                      )}
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-lg font-bold text-red-600">
                          {discount}%
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.dealPrice)}
                        </span>
                      </div>
                      {basePrice > item.dealPrice && (
                        <p className="text-xs text-red-500 mt-0.5">
                          추가 {formatPrice(basePrice - item.dealPrice)} 할인
                        </p>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-red-600 font-semibold">
                          {isSoldOut ? "완판" : `${soldPercent}% 판매`}
                        </span>
                        <span className="text-gray-400">
                          {item.dealQuantity}개 한정
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isSoldOut
                              ? "bg-gray-400"
                              : "bg-gradient-to-r from-red-500 to-orange-500"
                          }`}
                          style={{ width: `${soldPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );

                if (isSoldOut) {
                  return (
                    <div key={item.id} className="cursor-not-allowed">
                      {cardContent}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={`/products/${product.slug}`}
                    className="block"
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
