"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/store/order";
import { dummyProducts } from "@/lib/dummy-products";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  ArrowUpRight,
  Eye,
} from "lucide-react";

// 임시 통계 데이터
const stats = {
  todaySales: 1580000,
  monthSales: 24560000,
  totalProducts: dummyProducts.length,
  lowStockProducts: dummyProducts.filter((p) => p.stock <= 5).length,
  totalMembers: 128,
  todayVisitors: 342,
};

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

const recentActivity = [
  { type: "주문", message: "ORD-2025-001 결제 완료", time: "5분 전" },
  { type: "회원", message: "신규 회원 가입 (kim@test.com)", time: "15분 전" },
  { type: "상품", message: "Intel Core i5-14400F 재고 50개 입고", time: "1시간 전" },
  { type: "주문", message: "ORD-2025-002 배송 완료 처리", time: "2시간 전" },
  { type: "문의", message: "상품문의 새 글 1건", time: "3시간 전" },
];

export default function AdminDashboard() {
  const orders = useOrderStore((s) => s.orders);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500">
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
          change="+12%"
        />
        <StatCard
          title="이번 달 매출"
          value={formatPrice(stats.monthSales)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
          change="+8%"
        />
        <StatCard
          title="총 상품"
          value={`${stats.totalProducts}개`}
          icon={<Package className="h-5 w-5" />}
          color="purple"
          sub={`재고 부족: ${stats.lowStockProducts}개`}
        />
        <StatCard
          title="총 회원"
          value={`${stats.totalMembers}명`}
          icon={<Users className="h-5 w-5" />}
          color="orange"
          sub={`오늘 방문: ${stats.todayVisitors}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 주문 */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">최근 주문</h2>
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
                    <p className="font-mono text-xs text-gray-500">{order.id}</p>
                    <p className="text-gray-900">
                      {order.items[0]?.product.name}
                      {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(order.total)}</p>
                    <Badge className="bg-blue-100 text-blue-700 text-[10px]">
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
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-gray-900 mb-4">최근 활동</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2 border-b last:border-0"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    activity.type === "주문"
                      ? "bg-blue-500"
                      : activity.type === "회원"
                      ? "bg-green-500"
                      : activity.type === "상품"
                      ? "bg-purple-500"
                      : "bg-orange-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 재고 부족 상품 */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-gray-900 mb-4">재고 부족 상품</h2>
          <div className="space-y-2">
            {dummyProducts
              .filter((p) => p.stock <= 5)
              .map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div>
                    <p className="text-xs text-blue-600">{product.brand}</p>
                    <p className="text-gray-900 truncate max-w-[250px]">
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
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-gray-900 mb-4">빠른 관리</h2>
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
            <Link href="/" target="_blank">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Eye className="h-6 w-6 text-gray-500" />
                <span className="text-xs">사이트 보기</span>
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
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">{title}</span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {change && (
        <p className="text-xs text-green-600 mt-1">
          {change} 전일 대비
        </p>
      )}
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
