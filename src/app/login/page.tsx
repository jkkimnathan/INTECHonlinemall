"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { siteConfig } from "@/config/site";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // 이미 로그인한 경우
  if (isLoggedIn) {
    router.push("/mypage");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    const success = login(email, password);
    if (success) {
      router.push("/mypage");
    } else {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          {/* 로고/타이틀 */}
          <div className="text-center mb-8">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900">
                {siteConfig.name}
              </h1>
            </Link>
            <p className="text-gray-500 text-sm mt-2">
              로그인하고 다양한 혜택을 누려보세요
            </p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
            >
              로그인
            </Button>
          </form>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-400">또는</span>
            </div>
          </div>

          {/* 소셜 로그인 (추후 Supabase Auth로 연결) */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full h-11 text-sm"
              disabled
            >
              <span className="mr-2 text-lg">💬</span>
              카카오로 로그인 (준비 중)
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 text-sm"
              disabled
            >
              <span className="mr-2 text-lg font-bold text-green-500">N</span>
              네이버로 로그인 (준비 중)
            </Button>
          </div>

          {/* 하단 링크 */}
          <div className="mt-6 text-center text-sm text-gray-500">
            아직 회원이 아니신가요?{" "}
            <Link
              href="/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              회원가입
            </Link>
          </div>

          {/* 데모 안내 */}
          <div className="mt-4 bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
            <p className="font-semibold">테스트 안내</p>
            <p className="mt-1">
              아무 이메일과 비밀번호를 입력하면 데모 계정으로 로그인됩니다.
              (추후 Supabase 연동 시 실제 인증으로 교체)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
