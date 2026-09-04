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
    price: Number(row.price) || 0,
    salePrice: (row.sale_price as number) ?? null,
    images: (row.images as string[]) || [],
    detailImages: (row.detail_images as string[]) || [],
    // 목록 조회에서는 상세 HTML(수십~수백 KB)을 클라이언트 페이로드에 싣지 않는다 → toProductDetail 사용
    detailHtml: "",
    ecoName: (row.eco_name as string) || "",
    stock: (row.stock as number) || 0,
    isNew: (row.is_new as boolean) || false,
    isSale: (row.is_sale as boolean) || false,
    isFeatured: (row.is_featured as boolean) || false,
    subcategory: (row.subcategory as string) || null,
    createdAt: (row.created_at as string) || "",
  };
}

/** DB row → Product (상세 HTML 포함). 단일 상품 조회(상세페이지·관리자 수정)에서만 사용 */
export function toProductDetail(row: Record<string, unknown>): Product {
  return {
    ...toProduct(row),
    detailHtml: (row.detail_html as string) || "",
  };
}
