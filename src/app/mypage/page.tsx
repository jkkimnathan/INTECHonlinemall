"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { getOrdersByUserId } from "@/lib/supabase/orders";
import { Order } from "@/types/order";
import {
  Package,
  Heart,
  ShoppingCart,
  Coins,
  Settings,
  LogOut,
  ChevronRight,
  Crown,
  Truck,
  CheckCircle,
  RotateCcw,
} from "lucide-react";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

const gradeColors: Record<string, string> = {
  일반: "bg-gray-100 text-[#3f3f46]",
  실버: "bg-gray-200 text-[#1d1d1f]",
  골드: "bg-yellow-100 text-yellow-800",
  VIP: "bg-purple-100 text-purple-800",
};

const statusBadgeColors: Record<string, string> = {
  결제완료: "bg-blue-100 text-[#1A56DB]",
  배송준비: "bg-yellow-100 text-yellow-700",
  배송중: "bg-[#fff7ed] text-[#c2410c]",
  배송완료: "bg-[#ecfdf5] text-[#047857]",
  취소: "bg-red-100 text-red-700",
  "교환/반품": "bg-gray-100 text-[#3f3f46]",
};

export default function MyPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user?.id) {
      getOrdersByUserId(user.id).then(setOrders);
    }
  }, [user?.id]);

  if (!isLoggedIn || !user) {
    router.push("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const statusCounts = {
    결제완료: orders.filter((o) => o.status === "결제완료").length,
    배송중: orders.filter((o) => o.status === "배송중" || o.status === "배송준비").length,
    배송완료: orders.filter((o) => o.status === "배송완료").length,
    "교환/반품": orders.filter((o) => o.status === "교환/반품").length,
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">마이페이지</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 프로필 카드 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-[#1A56DB]">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-[#1d1d1f]">{user.name}</h2>
                    <Badge className={gradeColors[user.grade]}>
                      <Crown className="h-3 w-3 mr-1" />
                      {user.grade}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#86868b]">{user.email}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-[#3f3f46]">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  적립금
                </div>
                <span className="font-bold text-[#1A56DB]">
                  {user.points.toLocaleString()}P
                </span>
              </div>

              <Separator className="my-2" />

              <nav className="space-y-1 mt-3">
                <Link
                  href="/cart"
                  className="flex items-center justify-between py-2.5 px-2 rounded-md hover:bg-gray-50 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-[#a1a1aa]" />
                    장바구니
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {cartItems.length}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center justify-between py-2.5 px-2 rounded-md hover:bg-gray-50 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-[#a1a1aa]" />
                    관심상품
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {wishlistItems.length}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </Link>
              </nav>

              <Separator className="my-3" />

              <Button
                variant="outline"
                className="w-full text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>

          {/* 오른쪽: 주문/상태 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 주문 상태 요약 */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold text-[#1d1d1f] mb-4">주문/배송 현황</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3">
                  <div className="w-10 h-10 bg-[#EEF4FF] rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="h-5 w-5 text-[#1A56DB]" />
                  </div>
                  <p className="text-2xl font-bold text-[#1d1d1f]">{statusCounts.결제완료}</p>
                  <p className="text-xs text-[#86868b]">결제완료</p>
                </div>
                <div className="p-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-[#1d1d1f]">{statusCounts.배송중}</p>
                  <p className="text-xs text-[#86868b]">배송중</p>
                </div>
                <div className="p-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-[#1d1d1f]">{statusCounts.배송완료}</p>
                  <p className="text-xs text-[#86868b]">배송완료</p>
                </div>
                <div className="p-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <RotateCcw className="h-5 w-5 text-[#a1a1aa]" />
                  </div>
                  <p className="text-2xl font-bold text-[#1d1d1f]">{statusCounts["교환/반품"]}</p>
                  <p className="text-xs text-[#86868b]">교환/반품</p>
                </div>
              </div>
            </div>

            {/* 최근 주문 내역 */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold text-[#1d1d1f] mb-4">최근 주문 내역</h3>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-[#a1a1aa] text-sm">아직 주문 내역이 없습니다.</p>
                  <Link href="/products" className="mt-3 inline-block">
                    <Button size="sm" className="bg-[#1A56DB] hover:bg-[#1747b4]">쇼핑하러 가기</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <Link
                      key={order.id}
                      href={`/order/${order.id}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#1d1d1f]">
                            {order.id}
                          </span>
                          <Badge className={statusBadgeColors[order.status] || "bg-gray-100 text-[#3f3f46]"}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#86868b] mt-1">
                          {order.items[0]?.product.name}
                          {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                        </p>
                        <p className="text-xs text-[#a1a1aa] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1d1d1f]">
                          {formatPrice(order.total)}
                        </p>
                        <ChevronRight className="h-4 w-4 text-gray-300 ml-auto mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 회원 정보 */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#1d1d1f]">회원 정보</h3>
                <Button variant="outline" size="sm" className="text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  수정
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex">
                  <span className="text-[#86868b] w-20">이름</span>
                  <span className="text-[#1d1d1f]">{user.name}</span>
                </div>
                <div className="flex">
                  <span className="text-[#86868b] w-20">이메일</span>
                  <span className="text-[#1d1d1f]">{user.email}</span>
                </div>
                <div className="flex">
                  <span className="text-[#86868b] w-20">연락처</span>
                  <span className="text-[#1d1d1f]">{user.phone}</span>
                </div>
                <div className="flex">
                  <span className="text-[#86868b] w-20">가입일</span>
                  <span className="text-[#1d1d1f]">{user.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
