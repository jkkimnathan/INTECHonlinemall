"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/security";
import { siteConfig } from "@/config/site";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/reset-password` }
    );
    setSubmitting(false);

    if (resetError) {
      setError("메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#fbfbfd] py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#f1f1f3] p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MailCheck className="h-7 w-7 text-[#1A56DB]" />
              </div>
              <h1 className="text-xl font-bold text-[#1d1d1f]">
                재설정 메일을 보냈어요
              </h1>
              <p className="text-[#86868b] text-sm mt-3 leading-relaxed">
                <b className="text-[#1d1d1f]">{email}</b> 으로 비밀번호 재설정
                링크를 발송했습니다.
                <br />
                메일의 링크를 클릭해 새 비밀번호를 설정해주세요.
              </p>
              <p className="text-[#a1a1aa] text-xs mt-4">
                메일이 안 보이면 스팸함도 확인해 주세요.
              </p>
              <Link href="/login" className="block mt-6">
                <Button className="w-full h-11 rounded-full bg-[#1A56DB] hover:bg-[#1747b4] text-white">
                  로그인 화면으로
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa] mb-2">
                  Reset Password
                </div>
                <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-[-0.02em]">
                  비밀번호 찾기
                </h1>
                <p className="text-[#86868b] text-sm mt-2">
                  가입한 이메일로 재설정 링크를 보내드립니다
                </p>
              </div>

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

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button
                  type="submit"
                  className="w-full h-11 rounded-full bg-[#1A56DB] hover:bg-[#1747b4] text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      발송 중...
                    </>
                  ) : (
                    "재설정 메일 보내기"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-[#86868b] hover:text-[#1A56DB]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {siteConfig.name} 로그인으로 돌아가기
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
