"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
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

// 임시 주문 데이터
const dummyOrders = [
  {
    id: "ORD-2025-001",
    date: "2025-03-10",
    status: "배송완료",
    items: "Intel Core i7-14700K 외 1건",
    total: 628000,
  },
  {
    id: "ORD-2025-002",
    date: "2025-03-15",
    status: "배송중",
    items: "ASUS ROG STRIX B760-F GAMING WIFI",
    total: 329000,
  },
];

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

const gradeColors: Record<string, string> = {
  일반: "bg-gray-100 text-gray-700",
  실버: "bg-gray-200 text-gray-800",
  골드: "bg-yellow-100 text-yellow-800",
  VIP: "bg-purple-100 text-purple-800",
};

export default function MyPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);

  if (!isLoggedIn || !user) {
    router.push("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">마이페이지</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 프로필 카드 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 회원 정보 카드 */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-gray-900">{user.name}</h2>
                    <Badge className={gradeColors[user.grade]}>
                      <Crown className="h-3 w-3 mr-1" />
                      {user.grade}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* 적립금 */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  적립금
                </div>
                <span className="font-bold text-blue-600">
                  {user.points.toLocaleString()}P
                </span>
              </div>

              <Separator className="my-2" />

              {/* 빠른 메뉴 */}
              <nav className="space-y-1 mt-3">
                <Link
                  href="/cart"
                  className="flex items-center justify-between py-2.5 px-2 rounded-md hover:bg-gray-50 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-gray-400" />
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
                    <Heart className="h-4 w-4 text-gray-400" />
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
              <h3 className="font-bold text-gray-900 mb-4">주문/배송 현황</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                  <p className="text-xs text-gray-500">결제완료</p>
                </div>
                <div className="p-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                  <p className="text-xs text-gray-500">배송중</p>
                </div>
                <div className="p-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                  <p className="text-xs text-gray-500">배송완료</p>
                </div>
                <div className="p-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <RotateCcw className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500">교환/반품</p>
                </div>
              </div>
            </div>

            {/* 최근 주문 내역 */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold text-gray-900 mb-4">최근 주문 내역</h3>
              <div className="space-y-3">
                {dummyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {order.id}
                        </span>
                        <Badge
                          className={
                            order.status === "배송완료"
                              ? "bg-green-100 text-green-700"
                              : order.status === "배송중"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.items}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 회원 정보 */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">회원 정보</h3>
                <Button variant="outline" size="sm" className="text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  수정
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex">
                  <span className="text-gray-500 w-20">이름</span>
                  <span className="text-gray-900">{user.name}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-20">이메일</span>
                  <span className="text-gray-900">{user.email}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-20">연락처</span>
                  <span className="text-gray-900">{user.phone}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-20">가입일</span>
                  <span className="text-gray-900">{user.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
