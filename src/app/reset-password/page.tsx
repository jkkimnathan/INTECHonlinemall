"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { validatePassword } from "@/lib/security";
import { Loader2, Eye, EyeOff } from "lucide-react";

/**
 * Supabase 비밀번호 재설정 랜딩 페이지.
 * 메일의 recovery 링크로 진입하면 세션이 생성되며(PASSWORD_RECOVERY),
 * 이 페이지에서 새 비밀번호를 설정한다.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  // recovery 링크 세션 확인 — 해시(#access_token) 처리가 늦을 수 있어 auth 이벤트도 함께 대기
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!cancelled && s) setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session) setReady(true);
    });

    const timer = setTimeout(() => {
      if (cancelled) return;
      setReady((r) => {
        if (!r) {
          setError(
            "링크가 만료되었거나 유효하지 않습니다. 재설정 메일을 다시 요청해주세요."
          );
        }
        return r;
      });
    }, 3000);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.error || "비밀번호 형식을 확인해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#fbfbfd] py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#f1f1f3] p-8">
          {done ? (
            <div className="text-center">
              <h1 className="text-xl font-bold text-[#1d1d1f]">
                비밀번호가 변경되었습니다
              </h1>
              <p className="text-[#86868b] text-sm mt-3">
                새 비밀번호로 다시 로그인해주세요.
              </p>
              <Button
                className="w-full h-11 rounded-full bg-[#1A56DB] hover:bg-[#1747b4] text-white mt-6"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
              >
                로그인 화면으로
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa] mb-2">
                  New Password
                </div>
                <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-[-0.02em]">
                  새 비밀번호 설정
                </h1>
              </div>

              {!ready && !error && (
                <p className="text-center text-sm text-[#86868b]">
                  인증 정보를 확인하는 중...
                </p>
              )}

              {ready && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                      새 비밀번호
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="8자 이상, 영문+숫자+특수문자"
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
                  <div>
                    <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                      새 비밀번호 확인
                    </label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호 재입력"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="h-11"
                      disabled={submitting}
                    />
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-full bg-[#1A56DB] hover:bg-[#1747b4] text-white"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        변경 중...
                      </>
                    ) : (
                      "비밀번호 변경"
                    )}
                  </Button>
                </form>
              )}

              {!ready && error && (
                <div className="text-center space-y-4">
                  <p className="text-red-500 text-sm">{error}</p>
                  <Link href="/forgot-password" className="block">
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-full"
                    >
                      재설정 메일 다시 요청
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
