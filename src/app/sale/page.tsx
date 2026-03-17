import { Metadata } from "next";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/dummy-products";

export const metadata: Metadata = {
  title: "특가 상품",
  description: "지금 할인 중인 IT 하드웨어를 만나보세요",
};

export default function SalePage() {
  const products = getProducts({ isSale: true });

  return (
    <div>
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">특가 상품</h1>
          <p className="text-red-100 mt-2">
            지금 할인 중인 IT 하드웨어를 놓치지 마세요!
          </p>
        </div>
      </div>

      <ProductGrid
        products={products}
        title="할인 중인 상품"
        description={`${products.length}개의 특가 상품`}
      />
    </div>
  );
}
