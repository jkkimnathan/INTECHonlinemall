import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/supabase/products.server";

export default async function FeaturedProducts() {
  const products = (await getProducts({ isFeatured: true })).slice(0, 8);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">추천 상품</h2>
            <p className="text-gray-500 mt-1">인기 있는 IT 하드웨어를 만나보세요</p>
          </div>
          <Link href="/products">
            <Button variant="outline" size="sm">
              전체보기
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
