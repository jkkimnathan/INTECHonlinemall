"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { siteConfig } from "@/config/site";
import { Eye, EyeOff, Loader2 } from "lucide-react";

/** open-redirect 방지: 내부 경로만 허용 */
function safeReturnUrl(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

const subscribeNoop = () => () => {};
/** 서버 HTML 단계(false) → 하이드레이션 완료(true). 클라이언트 JS가 붙기 전 제출을 막는 데 사용 */
function useHydrated() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = safeReturnUrl(
    searchParams.get("returnUrl") ?? searchParams.get("redirect")
  );
  const { login, isLoggedIn, loading } = useAuthStore();
  const hydrated = useHydrated();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 이미 로그인한 경우 — auth 초기화 완료 후에만 이동
  useEffect(() => {
    if (!loading && isLoggedIn) {
      router.replace(returnUrl);
    }
  }, [loading, isLoggedIn, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // 브라우저 자동완성·비밀번호 관리자가 onChange 없이 값을 채운 경우를 대비해
    // React 상태보다 실제 입력란(DOM) 값을 우선 사용한다.
    const form = new FormData(e.currentTarget);
    const emailValue = (String(form.get("email") ?? "") || email).trim();
    const passwordValue = String(form.get("password") ?? "") || password;

    if (!emailValue) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (!passwordValue) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(emailValue, passwordValue);
      if (result.success) {
        router.push(returnUrl);
        return;
      }
      setError(result.error || "로그인에 실패했습니다.");
    } catch {
      setError("로그인 처리 중 오류가 발생했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
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
          <form method="post" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                이메일
              </label>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                required
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
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 min-w-11 min-h-11 flex items-center justify-center text-[#a1a1aa] hover:text-[#3f3f46]"
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
              <p role="alert" className="text-red-500 text-sm">{error}</p>
            )}

            {/* 하이드레이션 전에는 비활성화: JS가 붙기 전 클릭이 일반 POST 새로고침(입력값 초기화)으로
                이어져 "버튼이 반응 없음"처럼 보이는 것을 방지 */}
            <Button
              type="submit"
              className="w-full h-11 rounded-full bg-[#1A56DB] hover:bg-[#1747b4] text-white"
              disabled={!hydrated || submitting}
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

            {/* 스크립트 로딩이 늦거나 실패한 경우에만(2.5초 후) 보이는 안내 — 정상 환경에서는 노출되지 않음 */}
            {!hydrated && (
              <p className="login-hint text-center text-xs text-[#86868b]" aria-live="polite">
                화면을 준비하고 있습니다. 잠시 후에도 버튼이 눌리지 않으면 새로고침하거나
                최신 Chrome·Edge·Safari 브라우저로 접속해주세요.
              </p>
            )}
            <noscript>
              <p className="text-center text-xs text-red-500">
                로그인하려면 브라우저에서 JavaScript를 허용해야 합니다.
              </p>
            </noscript>
          </form>

          {/* 소셜 로그인은 추후 카카오/네이버 OAuth 키 발급 후 활성화 */}

          {/* 하단 링크 */}
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-[#86868b]">
            <Link
              href="/forgot-password"
              className="hover:text-[#1A56DB] hover:underline"
            >
              비밀번호 찾기
            </Link>
            <span className="text-[#e5e7eb]">|</span>
            <span>
              아직 회원이 아니신가요?{" "}
              <Link
                href="/signup"
                className="text-[#1A56DB] font-medium hover:underline"
              >
                회원가입
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
