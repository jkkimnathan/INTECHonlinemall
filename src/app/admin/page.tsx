"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllOrders } from "@/lib/supabase/orders";
import { getProducts } from "@/lib/supabase/products";
import { Product } from "@/types/product";
import { Order } from "@/types/order";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  ArrowUpRight,
  Eye,
} from "lucide-react";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({}).then(setAllProducts);
    getAllOrders().then(setOrders);
  }, []);

  const now = new Date();
  const today = now.toDateString();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const todaySales = orders
    .filter((o) => new Date(o.createdAt).toDateString() === today && o.status !== "취소")
    .reduce((sum, o) => sum + o.total, 0);
  const monthSales = orders
    .filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear && o.status !== "취소";
    })
    .reduce((sum, o) => sum + o.total, 0);

  const stats = {
    todaySales,
    monthSales,
    totalProducts: allProducts.length,
    lowStockProducts: allProducts.filter((p) => p.stock <= 5).length,
    totalOrders: orders.length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em]">대시보드</h1>
        <p className="text-sm text-[#86868b]">
          {new Date().toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="오늘 매출"
          value={formatPrice(stats.todaySales)}
          icon={<DollarSign className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="이번 달 매출"
          value={formatPrice(stats.monthSales)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="총 상품"
          value={`${stats.totalProducts}개`}
          icon={<Package className="h-5 w-5" />}
          color="purple"
          sub={`재고 부족: ${stats.lowStockProducts}개`}
        />
        <StatCard
          title="총 주문"
          value={`${stats.totalOrders}건`}
          icon={<ShoppingCart className="h-5 w-5" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 주문 */}
        <div className="bg-white rounded-2xl border border-[#f1f1f3] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1d1d1f]">최근 주문</h2>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs">
                전체보기 <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b last:border-0 text-sm"
                >
                  <div>
                    <p className="font-mono text-xs text-[#86868b]">{order.id}</p>
                    <p className="text-gray-900">
                      {order.items[0]?.product.name}
                      {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(order.total)}</p>
                    <Badge className="bg-[#eef4ff] text-[#1d4ed8] text-[10px]">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">
              아직 주문이 없습니다.
              <br />
              쇼핑몰에서 주문 테스트를 해보세요.
            </p>
          )}
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-2xl border border-[#f1f1f3] p-5">
          <h2 className="font-bold text-[#1d1d1f] mb-4">최근 활동</h2>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-start gap-3 py-2 border-b last:border-0"
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {order.id} — {order.status}
                    </p>
                    <p className="text-xs text-gray-400">
                      {timeAgo(order.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">
              아직 활동 내역이 없습니다.
            </p>
          )}
        </div>

        {/* 재고 부족 상품 */}
        <div className="bg-white rounded-2xl border border-[#f1f1f3] p-5">
          <h2 className="font-bold text-[#1d1d1f] mb-4">재고 부족 상품</h2>
          <div className="space-y-2">
            {allProducts
              .filter((p) => p.stock <= 5)
              .map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div>
                    <p className="font-en text-[10px] font-semibold uppercase tracking-[0.1em] text-[#86868b]">{product.brand}</p>
                    <p className="text-[#1d1d1f] truncate max-w-[250px]">
                      {product.name}
                    </p>
                  </div>
                  <Badge
                    className={
                      product.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }
                  >
                    {product.stock === 0 ? "품절" : `${product.stock}개`}
                  </Badge>
                </div>
              ))}
          </div>
        </div>

        {/* 빠른 링크 */}
        <div className="bg-white rounded-2xl border border-[#f1f1f3] p-5">
          <h2 className="font-bold text-[#1d1d1f] mb-4">빠른 관리</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/products">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Package className="h-6 w-6 text-blue-500" />
                <span className="text-xs">상품 관리</span>
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <ShoppingCart className="h-6 w-6 text-green-500" />
                <span className="text-xs">주문 관리</span>
              </Button>
            </Link>
            <Link href="/admin/members">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Users className="h-6 w-6 text-purple-500" />
                <span className="text-xs">회원 관리</span>
              </Button>
            </Link>
            <Link href="/admin/page-banners">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Eye className="h-6 w-6 text-orange-500" />
                <span className="text-xs">페이지 배너</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  change,
  sub,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change?: string;
  sub?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-[#eef4ff] text-[#1A56DB]",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-[#f1f1f3] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">{title}</span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-[#1d1d1f]">{value}</p>
      {change && (
        <p className="text-xs text-green-600 mt-1">
          {change} 전일 대비
        </p>
      )}
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
