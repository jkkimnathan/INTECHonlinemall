import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { toProduct } from "./product-utils";

export { toProduct };

/** 상품 목록 조회 */
export async function getProducts(options?: {
  brand?: string;
  category?: string;
  condition?: "new" | "refurbished";
  isSale?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "newest" | "name";
}): Promise<Product[]> {
  const supabase = createClient();
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

  // 정렬
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

  return (data || []).map(toProduct);
}

/** 단일 상품 조회 (slug) */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return toProduct(data);
}

/** 단일 상품 조회 (id) */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toProduct(data);
}

/** 카테고리 목록 */
export async function getCategories(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("category");

  if (error || !data) return [];

  const categories = [...new Set(data.map((r) => r.category as string))];
  return categories.sort();
}

/** 브랜드 목록 */
export async function getBrands(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("brand");

  if (error || !data) return [];

  const brands = [...new Set(data.map((r) => r.brand as string))];
  return brands.sort();
}

/** 여러 상품 ID로 조회 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);

  if (error || !data) return [];
  return data.map(toProduct);
}

export interface ProductInput {
  name: string;
  slug: string;
  brand: string;
  category: Product["category"];
  condition: Product["condition"];
  description: string;
  specs: Record<string, string>;
  price: number;
  sale_price: number | null;
  images: string[];
  detail_images: string[];
  stock: number;
  is_new: boolean;
  is_sale: boolean;
  is_featured: boolean;
  subcategory?: string | null;
}

/** slug 중복 시 자동으로 -2, -3 등 suffix 추가 */
async function resolveUniqueSlug(slug: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .like("slug", `${slug}%`);

  if (!data || data.length === 0) return slug;

  const existing = new Set(data.map((d: { slug: string }) => d.slug));
  if (!existing.has(slug)) return slug;

  let i = 2;
  while (existing.has(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

/** 상품 등록 */
export async function createProduct(input: ProductInput): Promise<{ id: string | null; error: string | null }> {
  const supabase = createClient();
  input.slug = await resolveUniqueSlug(input.slug);

  const { data, error } = await supabase
    .from("products")
    .insert([input])
    .select("id")
    .single();

  if (error) return { id: null, error: error.message };
  return { id: (data as { id: string }).id, error: null };
}

/** 상품 수정 */
export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

/** 상품 삭제 */
export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

/** 이미지 업로드 → public URL 반환 */
export async function uploadProductImage(file: File): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
