import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/supabase/products.server";

export default async function FeaturedProducts() {
  const products = (await getProducts({ isFeatured: true })).slice(0, 8);

  return (
    <section className="py-12 bg-[#fbfbfd]">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa]">
              Recommended
            </div>
            <h2 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em] mt-2">추천 상품</h2>
            <p className="text-sm text-[#86868b] mt-1">인기 있는 IT 하드웨어를 만나보세요</p>
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
