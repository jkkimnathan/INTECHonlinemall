import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/product";
import { toProduct } from "./product-utils";
import { isHiddenBrand } from "@/config/site";

/** 상품 목록 조회 (Server Component용) */
export async function getProducts(options?: {
  brand?: string;
  category?: string;
  condition?: "new" | "refurbished";
  isSale?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "newest" | "name";
}): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase.from("products").select("*");

  if (options?.brand) {
    query = query.ilike("brand", options.brand);
  }
  if (options?.category) {
    query = query.eq("category", options.category);
  }
  if (options?.condition) {
    query = query.eq("condition", options.condition);
  }
  if (options?.isSale) {
    query = query.eq("is_sale", true);
  }
  if (options?.isFeatured) {
    query = query.eq("is_featured", true);
  }
  if (options?.search) {
    const q = `%${options.search}%`;
    query = query.or(`name.ilike.${q},brand.ilike.${q},category.ilike.${q},description.ilike.${q}`);
  }

  switch (options?.sortBy) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("getProducts error:", error);
    return [];
  }
  // 숨김 브랜드(예: 도시바) 상품은 공개 목록에서 제외
  return (data || []).map(toProduct).filter((p) => !isHiddenBrand(p.brand));
}

/** 단일 상품 조회 (slug) */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return toProduct(data);
}

/** 카테고리 목록 */
export async function getCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("category");

  if (error || !data) return [];
  const categories = [...new Set(data.map((r) => r.category as string))];
  return categories.sort();
}
