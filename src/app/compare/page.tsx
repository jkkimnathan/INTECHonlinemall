"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, GitCompareArrows, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/store/compare";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

/** 상품 비교 페이지 — 비교함(최대 4개)의 핵심 정보·사양을 표로 대조 */
export default function ComparePage() {
  const { items, remove, clear } = useCompareStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="bg-[#fbfbfd] min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">
          <GitCompareArrows className="h-12 w-12 text-[#d4d4d8] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1d1d1f]">상품 비교</h1>
          <p className="text-[#86868b] mt-2 text-sm">
            상품 카드의 비교 버튼을 눌러 2~4개 상품을 담으면 여기서 한눈에 비교할 수 있습니다.
          </p>
          <Link href="/products" className="inline-block mt-6">
            <Button className="rounded-full bg-[#1A56DB] hover:bg-[#1747b4] text-white px-6">
              상품 보러가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 모든 상품의 사양 키 합집합 (등장 순서 유지)
  const specKeys: string[] = [];
  for (const p of items) {
    for (const k of Object.keys(p.specs || {})) {
      if (!specKeys.includes(k)) specKeys.push(k);
    }
  }

  return (
    <div className="bg-[#fbfbfd] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em]">상품 비교</h1>
            <p className="text-sm text-[#86868b] mt-1">{items.length}개 상품을 비교하고 있습니다</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clear}>
              모두 비우기
            </Button>
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                계속 쇼핑
              </Button>
            </Link>
          </div>
        </div>

        {/* 비교 표 — 표 영역만 가로 스크롤 */}
        <div className="bg-white rounded-2xl border border-[#f1f1f3] overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-[#f1f1f3]">
                <th className="w-28 md:w-36 p-4 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#86868b] align-bottom">
                  상품
                </th>
                {items.map((p) => (
                  <th key={p.id} className="p-4 text-center align-top min-w-[150px]">
                    <div className="relative">
                      <button
                        onClick={() => remove(p.id)}
                        aria-label={`${p.name} 비교에서 제거`}
                        className="absolute -top-1 -right-1 text-[#a1a1aa] hover:text-[#1d1d1f] p-1.5"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <Link href={`/products/${p.slug}`} className="block group">
                        <div className="relative w-24 h-24 mx-auto bg-[#f5f5f7] rounded-xl overflow-hidden">
                          {p.images[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill sizes="96px" className="object-contain p-2 group-hover:scale-105 transition-transform" />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-[#86868b] p-1 text-center">
                              {p.brand}
                            </span>
                          )}
                        </div>
                        <p className="font-en text-[10px] font-semibold uppercase tracking-[0.1em] text-[#86868b] mt-2">{p.brand}</p>
                        <p className="text-[13px] font-semibold text-[#1d1d1f] mt-0.5 line-clamp-2 leading-snug group-hover:text-[#1A56DB]">
                          {p.name}
                        </p>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f7f7f8]">
              <tr>
                <td className="p-4 text-[#86868b] font-medium">가격</td>
                {items.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    {p.salePrice != null && p.salePrice < p.price ? (
                      <div>
                        <span className="block text-[11px] text-[#a1a1aa] line-through tabular-nums">{formatPrice(p.price)}</span>
                        <span className="font-bold text-[#b91c1c] tabular-nums">{formatPrice(p.salePrice)}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-[#1d1d1f] tabular-nums">{formatPrice(p.price)}</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-[#86868b] font-medium">상태</td>
                {items.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    {p.condition === "refurbished" ? (
                      <span className="inline-block rounded-full bg-[#fff7ed] text-[#c2410c] text-xs font-semibold px-2.5 py-1">리퍼</span>
                    ) : (
                      <span className="inline-block rounded-full bg-[#eef4ff] text-[#1d4ed8] text-xs font-semibold px-2.5 py-1">새상품</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-[#86868b] font-medium">카테고리</td>
                {items.map((p) => (
                  <td key={p.id} className="p-4 text-center text-[#3f3f46]">{p.category}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-[#86868b] font-medium">재고</td>
                {items.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    {p.stock > 0 ? (
                      <span className="text-[#047857] font-medium tabular-nums">{p.stock}개</span>
                    ) : (
                      <span className="text-[#b91c1c] font-medium">품절</span>
                    )}
                  </td>
                ))}
              </tr>
              {specKeys.map((key) => (
                <tr key={key}>
                  <td className="p-4 text-[#86868b] font-medium">{key}</td>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 text-center text-[#3f3f46]">
                      {p.specs?.[key] || <span className="text-[#d4d4d8]">-</span>}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4" />
                {items.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    <Link href={`/products/${p.slug}`}>
                      <Button size="sm" className="rounded-full bg-[#1A56DB] hover:bg-[#1747b4] text-white px-5">
                        자세히 보기
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
