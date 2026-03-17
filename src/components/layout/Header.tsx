"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Phone,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [mobileBrandOpen, setMobileBrandOpen] = useState(false);
  const cartItemCount = useCartStore((s) => s.getTotalItems());
  const { isLoggedIn, user, logout } = useAuthStore();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 브랜드 메뉴와 일반 메뉴 분리
  const brandNavItems = siteConfig.mainNav.filter((item) =>
    item.href.startsWith("/brand/")
  );
  const otherNavItems = siteConfig.mainNav.filter(
    (item) => !item.href.startsWith("/brand/")
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      {/* 상단 바 - 연락처, 로그인 */}
      <div className="bg-gray-900 text-gray-300 text-xs">
        <div className="container mx-auto px-4 flex items-center justify-between h-8">
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <span>{siteConfig.contact.phone}</span>
            <span className="mx-2">|</span>
            <span>공식 수입사 직영몰</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="text-gray-300">
                  {user?.name}님
                </span>
                <span>|</span>
                <Link href="/mypage" className="hover:text-white transition-colors">
                  마이페이지
                </Link>
                <span>|</span>
                <button
                  onClick={() => { logout(); router.push("/"); }}
                  className="hover:text-white transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-white transition-colors">
                  로그인
                </Link>
                <span>|</span>
                <Link href="/signup" className="hover:text-white transition-colors">
                  회원가입
                </Link>
                <span>|</span>
                <Link href="/mypage" className="hover:text-white transition-colors">
                  마이페이지
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 메인 헤더 - 로고, 검색, 장바구니 */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* 모바일 메뉴 버튼 */}
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="lg:hidden" />}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="text-lg font-bold mb-4">
                {siteConfig.name}
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                <Link
                  href="/products"
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                >
                  전체상품
                </Link>

                {/* 모바일 브랜드 아코디언 */}
                <button
                  onClick={() => setMobileBrandOpen(!mobileBrandOpen)}
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors text-left"
                >
                  브랜드
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileBrandOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileBrandOpen && (
                  <div className="ml-3 flex flex-col gap-1 border-l-2 border-blue-200 pl-3">
                    {brandNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-blue-600 transition-colors"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}

                {/* 나머지 메뉴 */}
                {otherNavItems
                  .filter((item) => item.href !== "/products")
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}

                <div className="border-t my-2" />
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                >
                  회원가입
                </Link>
                <Link
                  href="/mypage"
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                >
                  마이페이지
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* 로고 */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              {siteConfig.name}
            </span>
          </Link>

          {/* 검색바 */}
          <div className="hidden sm:flex flex-1 max-w-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="relative w-full"
            >
              <Input
                type="text"
                placeholder="상품명, 브랜드, 모델명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-10 rounded-full border-gray-300 focus:border-blue-500"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10 rounded-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* 우측 아이콘 */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Search className="h-5 w-5" />
            </Button>
            <Link href="/mypage">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/wishlist">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 네비게이션 메뉴 (데스크탑) */}
      <nav className="hidden lg:block border-t bg-white">
        <div className="container mx-auto px-4">
          <ul className="flex items-center">
            {/* 전체상품 */}
            <li>
              <Link
                href="/products"
                className="inline-flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                전체상품
              </Link>
            </li>

            {/* 브랜드 드롭다운 */}
            <li
              className="relative"
              onMouseEnter={() => setBrandMenuOpen(true)}
              onMouseLeave={() => setBrandMenuOpen(false)}
            >
              <button className="inline-flex items-center gap-1 px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                브랜드
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${brandMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {brandMenuOpen && (
                <div className="absolute top-full left-0 bg-white border rounded-lg shadow-xl py-2 min-w-[180px] z-50">
                  {brandNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </li>

            {/* 나머지 메뉴 (전체상품 제외) */}
            {otherNavItems
              .filter((item) => item.href !== "/products")
              .map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
