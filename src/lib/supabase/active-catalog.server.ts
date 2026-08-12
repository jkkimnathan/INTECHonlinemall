import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server-public";
import { isHiddenBrand } from "@/config/site";

/**
 * 실제 상품이 1개 이상 등록된 브랜드/카테고리 집합을 반환한다.
 * 빈 브랜드(예: 아직 입점 전 Microsoft)·빈 카테고리(예: 모니터)를
 * 네비게이션·홈에서 자동으로 숨기고, 상품이 들어오면 자동으로 다시 노출하기 위한 것.
 *
 * 안전장치: 조회 실패하거나 결과가 비어 있으면 null을 반환하고,
 * 호출부는 "알 수 없음 → 전부 노출"로 폴백한다. (DB 장애 시 메뉴가 통째로 사라지는 것 방지)
 *
 * React cache로 요청 단위 1회만 조회된다.
 */
export const getActiveCatalog = cache(
  async (): Promise<{ brandSlugs: Set<string>; categories: Set<string> } | null> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("products")
        .select("brand, category")
        .limit(5000);

      if (error || !data || data.length === 0) return null;

      const brandSlugs = new Set<string>();
      const categories = new Set<string>();
      for (const row of data as { brand?: string; category?: string }[]) {
        if (row.brand && !isHiddenBrand(row.brand)) {
          brandSlugs.add(row.brand.toLowerCase());
        }
        if (row.category) categories.add(row.category);
      }
      if (brandSlugs.size === 0 && categories.size === 0) return null;
      return { brandSlugs, categories };
    } catch {
      return null;
    }
  }
);

/** 활성 브랜드 slug 배열 (없으면 null = 전부 노출) */
export async function getActiveBrandSlugs(): Promise<string[] | null> {
  const catalog = await getActiveCatalog();
  return catalog ? Array.from(catalog.brandSlugs) : null;
}

/** 활성 카테고리 배열 (없으면 null = 전부 노출) */
export async function getActiveCategories(): Promise<string[] | null> {
  const catalog = await getActiveCatalog();
  return catalog ? Array.from(catalog.categories) : null;
}
