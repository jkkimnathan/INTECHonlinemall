import { Product } from "@/types/product";

/** DB row → Product 변환 (서버/클라이언트 공용) */
export function toProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    brand: (row.brand as string) || "",
    category: row.category as Product["category"],
    condition: (row.condition as Product["condition"]) || "new",
    description: (row.description as string) || "",
    specs: (row.specs as Record<string, string>) || {},
    price: row.price as number,
    salePrice: (row.sale_price as number) ?? null,
    images: (row.images as string[]) || [],
    detailImages: (row.detail_images as string[]) || [],
    stock: (row.stock as number) || 0,
    isNew: (row.is_new as boolean) || false,
    isSale: (row.is_sale as boolean) || false,
    isFeatured: (row.is_featured as boolean) || false,
    subcategory: (row.subcategory as string) || null,
    createdAt: (row.created_at as string) || "",
  };
}
