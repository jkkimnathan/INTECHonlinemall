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
import { siteConfig, isHiddenBrand } from "@/config/site";
import { BRAND_SUBCATEGORIES, SubcategoryNode } from "@/config/brand-subcategories";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";

/** 캐스케이딩 서브카테고리 패널 - 호버하면 다음 레벨이 오른쪽에 나타남 */
function SubcategoryPanel({
  nodes,
  brandSlug,
  pathPrefix,
}: {
  nodes: SubcategoryNode[];
  brandSlug: string;
  pathPrefix: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredNode = hovered ? nodes.find((n) => n.label === hovered) : null;

  return (
    <div className="flex">
      <div className="py-2 min-w-[180px] border-r">
        {nodes.map((node) => {
          const fullPath = pathPrefix ? `${pathPrefix} > ${node.label}` : node.label;
          const hasChildren = node.children && node.children.length > 0;
          return (
            <Link
              key={node.label}
              href={`/brand/${brandSlug}?sub=${encodeURIComponent(fullPath)}`}
              onMouseEnter={() => setHovered(node.label)}
              className={`flex items-center justify-between px-4 py-1.5 text-sm transition-colors ${
                hovered === node.label
                  ? "text-[#1A56DB] bg-[#EEF4FF]"
                  : "text-gray-600 hover:text-[#1A56DB] hover:bg-[#EEF4FF]"
              }`}
            >
              {node.label}
              {hasChildren && <ChevronDown className="h-3 w-3 -rotate-90 flex-shrink-0" />}
            </Link>
          );
        })}
      </div>
      {hoveredNode?.children && hoveredNode.children.length > 0 && (
        <SubcategoryPanel
          nodes={hoveredNode.children}
          brandSlug={brandSlug}
          pathPrefix={pathPrefix ? `${pathPrefix} > ${hoveredNode.label}` : hoveredNode.label}
        />
      )}
    </div>
  );
}

/** 모바일용 서브카테고리 - 아코디언 방식 */
function MobileSubcategoryList({
  nodes,
  brandSlug,
  pathPrefix,
  depth,
  onNavigate,
}: {
  nodes: SubcategoryNode[];
  brandSlug: string;
  pathPrefix: string;
  depth: number;
  onNavigate?: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className={depth > 0 ? "ml-3 border-l border-[#e5e7eb] pl-2" : ""}>
      {nodes.map((node) => {
        const fullPath = pathPrefix ? `${pathPrefix} > ${node.label}` : node.label;
        const hasChildren = node.children && node.children.length > 0;
        return (
          <div key={node.label}>
            <div className="flex items-center justify-between">
              <Link
                href={`/brand/${brandSlug}?sub=${encodeURIComponent(fullPath)}`}
                onClick={onNavigate}
                className="flex-1 px-2 py-2 text-[13px] text-[#86868b] hover:text-[#1A56DB] rounded hover:bg-[#fbfbfd] transition-colors"
              >
                {node.label}
              </Link>
              {hasChildren && (
                <button
                  onClick={() => setExpanded(expanded === node.label ? null : node.label)}
                  className="p-2 text-[#a1a1aa] hover:text-[#1A56DB]"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${expanded === node.label ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
            {expanded === node.label && hasChildren && (
              <MobileSubcategoryList
                nodes={node.children!}
                brandSlug={brandSlug}
                pathPrefix={fullPath}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);
  const [mobileBrandOpen, setMobileBrandOpen] = useState(false);
  const [mobileSubBrand, setMobileSubBrand] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const cartItemCount = useCartStore((s) => s.getTotalItems());
  const { isLoggedIn, user, logout } = useAuthStore();

  const closeMenu = () => setMenuOpen(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  // 브랜드 메뉴와 일반 메뉴 분리
  const brandNavItems = siteConfig.mainNav.filter(
    (item) =>
      item.href.startsWith("/brand/") &&
      !isHiddenBrand(item.href.replace("/brand/", ""))
  );
  const otherNavItems = siteConfig.mainNav.filter(
    (item) => !item.href.startsWith("/brand/")
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      {/* 상단 바 - 연락처, 로그인 */}
      <div className="bg-[#0F172A] text-[#cbd5e1] text-xs">
        <div className="container mx-auto px-4 flex items-center justify-between h-8">
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            <span className="tabular-nums">{siteConfig.contact.phone}</span>
            <span className="mx-2 text-[#475569]">|</span>
            <span>공식 수입사 직영몰 · Since 1981</span>
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
                  onClick={async () => { await logout(); router.push("/"); }}
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
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="lg:hidden" />}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[82%] max-w-xs overflow-y-auto p-5">
              <SheetTitle className="text-lg font-bold mb-4">
                {siteConfig.name}
              </SheetTitle>
              <nav className="flex flex-col">
                <Link
                  href="/products"
                  onClick={closeMenu}
                  className="px-3 py-3 text-base font-semibold rounded-lg hover:bg-[#f5f5f7] transition-colors"
                >
                  전체상품
                </Link>

                {/* 모바일 브랜드 아코디언 */}
                <button
                  onClick={() => setMobileBrandOpen(!mobileBrandOpen)}
                  className="flex items-center justify-between px-3 py-3 text-base font-semibold rounded-lg hover:bg-[#f5f5f7] transition-colors text-left"
                >
                  브랜드
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileBrandOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileBrandOpen && (
                  <div className="ml-3 flex flex-col gap-0.5 border-l-2 border-[#d8e6ff] pl-3">
                    {brandNavItems.map((item) => {
                      const brandName = item.title;
                      const subs = BRAND_SUBCATEGORIES[brandName];
                      const slug = siteConfig.brands.find((b) => b.name === brandName)?.slug || brandName.toLowerCase();
                      return (
                        <div key={item.href}>
                          <div className="flex items-center justify-between">
                            <Link
                              href={item.href}
                              onClick={closeMenu}
                              className="flex-1 px-3 py-2.5 text-sm text-[#3f3f46] rounded-md hover:bg-[#f5f5f7] hover:text-[#1A56DB] transition-colors"
                            >
                              {item.title}
                            </Link>
                            {subs && (
                              <button
                                onClick={() => setMobileSubBrand(mobileSubBrand === brandName ? null : brandName)}
                                className="p-2 text-[#a1a1aa] hover:text-[#1A56DB]"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${mobileSubBrand === brandName ? "rotate-180" : ""}`} />
                              </button>
                            )}
                          </div>
                          {mobileSubBrand === brandName && subs && (
                            <MobileSubcategoryList
                              nodes={subs}
                              brandSlug={slug}
                              pathPrefix=""
                              depth={0}
                              onNavigate={closeMenu}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 나머지 메뉴 */}
                {otherNavItems
                  .filter((item) => item.href !== "/products")
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="px-3 py-3 text-base font-semibold rounded-lg hover:bg-[#f5f5f7] transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}

                <div className="border-t border-[#f1f1f3] my-2" />
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="px-3 py-3 text-base font-medium rounded-lg hover:bg-[#f5f5f7]"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className="px-3 py-3 text-base font-medium rounded-lg hover:bg-[#f5f5f7]"
                >
                  회원가입
                </Link>
                <Link
                  href="/mypage"
                  onClick={closeMenu}
                  className="px-3 py-3 text-base font-medium rounded-lg hover:bg-[#f5f5f7]"
                >
                  마이페이지
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* 로고 */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-bold text-[#1d1d1f] tracking-[-0.02em]">
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
                className="pr-10 h-10 rounded-full border-[#D1D5DB] focus:border-[#1A56DB] focus:shadow-[0_0_0_3px_rgba(26,86,219,.18)]"
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
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              aria-label="검색"
              onClick={() => setMobileSearchOpen((v) => !v)}
            >
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
                  <span className="absolute -top-1 -right-1 bg-[#DC2626] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center tabular-nums">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* 모바일 검색바 (토글) */}
        {mobileSearchOpen && (
          <div className="sm:hidden pb-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="relative w-full"
            >
              <Input
                type="text"
                autoFocus
                placeholder="상품명, 브랜드, 모델명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-11 h-11 rounded-full border-[#D1D5DB] focus:border-[#1A56DB] focus:shadow-[0_0_0_3px_rgba(26,86,219,.18)]"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label="검색 실행"
                className="absolute right-0.5 top-0.5 h-10 w-10 rounded-full text-[#71717A]"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* 네비게이션 메뉴 (데스크탑) */}
      <nav className="hidden lg:block border-t bg-white">
        <div className="container mx-auto px-4">
          <ul className="flex items-center">
            {/* 전체상품 */}
            <li>
              <Link
                href="/products"
                className="inline-flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#1A56DB] hover:bg-[#EEF4FF] transition-colors"
              >
                전체상품
              </Link>
            </li>

            {/* 브랜드 메가메뉴 드롭다운 */}
            <li
              className="relative"
              onMouseEnter={() => setBrandMenuOpen(true)}
              onMouseLeave={() => { setBrandMenuOpen(false); setHoveredBrand(null); }}
            >
              <button className="inline-flex items-center gap-1 px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#1A56DB] hover:bg-[#EEF4FF] transition-colors">
                브랜드
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${brandMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {brandMenuOpen && (
                <div className="absolute top-full left-0 bg-white border rounded-lg shadow-xl z-50 flex min-w-[180px]">
                  {/* 브랜드 목록 (왼쪽) */}
                  <div className="py-2 border-r min-w-[160px]">
                    {brandNavItems.map((item) => {
                      const brandName = item.title;
                      const hasSub = !!BRAND_SUBCATEGORIES[brandName];
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onMouseEnter={() => setHoveredBrand(brandName)}
                          className={`flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                            hoveredBrand === brandName
                              ? "text-[#1A56DB] bg-[#EEF4FF]"
                              : "text-gray-700 hover:text-[#1A56DB] hover:bg-[#EEF4FF]"
                          }`}
                        >
                          {item.title}
                          {hasSub && <ChevronDown className="h-3 w-3 -rotate-90" />}
                        </Link>
                      );
                    })}
                  </div>
                  {/* 하위 카테고리 (오른쪽 - 캐스케이딩) */}
                  {hoveredBrand && BRAND_SUBCATEGORIES[hoveredBrand] && (
                    <SubcategoryPanel
                      nodes={BRAND_SUBCATEGORIES[hoveredBrand]}
                      brandSlug={siteConfig.brands.find((b) => b.name === hoveredBrand)?.slug || hoveredBrand.toLowerCase()}
                      pathPrefix=""
                    />
                  )}
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
                    className="inline-flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#1A56DB] hover:bg-[#EEF4FF] transition-colors"
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
