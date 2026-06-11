"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ArrowLeft,
  Megaphone,
  CalendarDays,
  MessageSquare,
  ImageIcon,
  Zap,
  Grid3X3,
} from "lucide-react";
import { siteConfig } from "@/config/site";

const adminNav = [
  { title: "대시보드", href: "/admin", icon: LayoutDashboard },
  { title: "홈 섹션", href: "/admin/home-sections", icon: Grid3X3 },
  { title: "상품 관리", href: "/admin/products", icon: Package },
  { title: "주문 관리", href: "/admin/orders", icon: ShoppingCart },
  { title: "회원 관리", href: "/admin/members", icon: Users },
  { title: "공지 관리", href: "/admin/notices", icon: Megaphone },
  { title: "배너 관리", href: "/admin/banners", icon: ImageIcon },
  { title: "이벤트 관리", href: "/admin/events", icon: CalendarDays },
  { title: "타임딜 관리", href: "/admin/timedeals", icon: Zap },
  { title: "메인 이미지 배너", href: "/admin/main-image-banners", icon: Grid3X3 },
  { title: "페이지 배너", href: "/admin/page-banners", icon: ImageIcon },
  { title: "브랜드 배너", href: "/admin/brand-banners", icon: ImageIcon },
  { title: "Q&A 관리", href: "/admin/qna", icon: MessageSquare },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* 상단바 */}
      <header className="bg-[#0F172A] text-white h-14 flex items-center px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4 w-full">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#94A3B8] hover:text-white text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">사이트로</span>
          </Link>
          <div className="h-5 w-px bg-[#1E293B]" />
          <span className="font-bold text-sm">
            {siteConfig.name} 관리자
          </span>
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <aside className="w-56 bg-white border-r min-h-[calc(100vh-3.5rem)] sticky top-14 hidden md:block">
          <nav className="p-3 space-y-1">
            {adminNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive
                      ? "bg-[#EEF4FF] text-[#1A56DB] font-medium"
                      : "text-[#3f3f46] hover:bg-[#fbfbfd] hover:text-[#1d1d1f]"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 모바일 탭 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
          <div className="flex">
            {adminNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center py-2 text-[10px] ${
                    isActive ? "text-[#1A56DB]" : "text-[#a1a1aa]"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
