"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { Package, ArrowLeft, LogIn } from "lucide-react";

/**
 * 주문 조회 안내 페이지.
 * 이 쇼핑몰은 회원 주문만 지원하므로(주문서 진입에 로그인 필수),
 * 주문 내역은 로그인 후 마이페이지에서 확인한다.
 * (비회원 주문 도입 시 서버 RPC 기반 조회로 교체 필요 — 클라이언트 검증 금지)
 */
export default function OrderLookupPage() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuthStore();

  // 로그인 상태면 주문 내역이 있는 마이페이지로 안내
  useEffect(() => {
    if (!loading && isLoggedIn) {
      router.replace("/mypage");
    }
  }, [loading, isLoggedIn, router]);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-7 w-7 text-[#1A56DB]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">주문 조회</h1>
          <p className="text-sm text-[#86868b] mt-2">
            주문 내역은 로그인 후 마이페이지에서 확인하실 수 있습니다.
          </p>
        </div>

        <div className="bg-white rounded-lg border p-6 text-center space-y-4">
          <p className="text-sm text-[#3f3f46] leading-relaxed">
            {process.env.NEXT_PUBLIC_SITE_NAME || "INTECH 온라인몰"}은 회원
            주문만 지원합니다.
            <br />
            주문하신 계정으로 로그인하시면 전체 주문 내역과 배송 상태를
            확인하실 수 있습니다.
          </p>
          <Link href="/login?returnUrl=/mypage" className="block">
            <Button className="w-full bg-[#1A56DB] hover:bg-[#1747b4]">
              <LogIn className="h-4 w-4 mr-2" />
              로그인하고 주문 조회
            </Button>
          </Link>
          <p className="text-xs text-[#a1a1aa]">
            주문 관련 문의는 고객센터 또는 1:1 문의를 이용해주세요.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#86868b] hover:text-[#1A56DB] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
