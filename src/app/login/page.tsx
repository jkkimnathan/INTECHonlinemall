"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { siteConfig } from "@/config/site";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 이미 로그인한 경우
  if (isLoggedIn) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "로그인에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#fbfbfd] py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#f1f1f3] p-8">
          {/* 로고/타이틀 */}
          <div className="text-center mb-8">
            <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa] mb-2">
              Member Login
            </div>
            <Link href="/">
              <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-[-0.02em]">
                {siteConfig.name}
              </h1>
            </Link>
            <p className="text-[#86868b] text-sm mt-2">
              로그인하고 다양한 혜택을 누려보세요
            </p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                이메일
              </label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                비밀번호
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#3f3f46]"
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
              className="w-full h-11 rounded-full bg-[#1A56DB] hover:bg-[#1747b4] text-white"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          {/* 소셜 로그인은 추후 카카오/네이버 OAuth 키 발급 후 활성화 */}

          {/* 하단 링크 */}
          <div className="mt-6 text-center text-sm text-[#86868b]">
            아직 회원이 아니신가요?{" "}
            <Link
              href="/signup"
              className="text-[#1A56DB] font-medium hover:underline"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
