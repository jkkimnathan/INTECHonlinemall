/** 상품 카테고리 */
export type ProductCategory =
  | "CPU"
  | "메인보드"
  | "그래픽카드"
  | "메모리"
  | "SSD"
  | "HDD"
  | "파워서플라이"
  | "케이스"
  | "쿨러"
  | "모니터"
  | "키보드"
  | "마우스"
  | "조립PC"
  | "기타";

/** 상품 상태 */
export type ProductCondition = "new" | "refurbished";

/** 상품 */
export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: ProductCategory;
  condition: ProductCondition;
  description: string;
  specs: Record<string, string>;
  price: number;
  salePrice: number | null;
  images: string[];
  detailImages: string[];
  stock: number;
  isNew: boolean;
  isSale: boolean;
  isFeatured: boolean;
  subcategory: string | null;
  createdAt: string;
}
