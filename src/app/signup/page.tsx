"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { siteConfig } from "@/config/site";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { validatePassword, validateEmail, validatePhone } from "@/lib/security";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoggedIn } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoggedIn) {
    router.push("/mypage");
    return null;
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("이름을 입력해주세요.");
    if (!form.email) return setError("이메일을 입력해주세요.");
    if (!validateEmail(form.email)) return setError("올바른 이메일 형식을 입력해주세요.");
    if (!form.phone) return setError("연락처를 입력해주세요.");
    if (!validatePhone(form.phone)) return setError("올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)");
    if (!form.password) return setError("비밀번호를 입력해주세요.");
    const pwResult = validatePassword(form.password);
    if (!pwResult.valid) return setError(pwResult.error!);
    if (form.password !== form.passwordConfirm)
      return setError("비밀번호가 일치하지 않습니다.");
    if (!agreeTerms) return setError("이용약관에 동의해주세요.");
    if (!agreePrivacy) return setError("개인정보처리방침에 동의해주세요.");

    setSubmitting(true);
    const result = await signup({
      email: form.email,
      password: form.password,
      name: form.name,
      phone: form.phone,
    });
    setSubmitting(false);

    if (result.success) {
      router.push("/mypage");
    } else {
      setError(result.error || "회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900">
                {siteConfig.name}
              </h1>
            </Link>
            <p className="text-gray-500 text-sm mt-2">회원가입</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="홍길동"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="h-11"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일 <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="h-11"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연락처 <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="010-0000-0000"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="h-11"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="영문+숫자+특수문자 8자 이상"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="h-11 pr-10"
                  disabled={submitting}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="비밀번호 재입력"
                value={form.passwordConfirm}
                onChange={(e) => updateField("passwordConfirm", e.target.value)}
                className="h-11"
                disabled={submitting}
              />
              {form.passwordConfirm && form.password === form.passwordConfirm && (
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <Check className="h-3 w-3" /> 비밀번호가 일치합니다
                </p>
              )}
            </div>

            {/* 약관 동의 */}
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5"
                  disabled={submitting}
                />
                <span className="text-sm text-gray-600">
                  <Link
                    href="/terms"
                    className="text-blue-600 hover:underline"
                  >
                    이용약관
                  </Link>
                  에 동의합니다 (필수)
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="mt-0.5"
                  disabled={submitting}
                />
                <span className="text-sm text-gray-600">
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:underline"
                  >
                    개인정보처리방침
                  </Link>
                  에 동의합니다 (필수)
                </span>
              </label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  가입 처리 중...
                </>
              ) : (
                "가입하기"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            이미 회원이신가요?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
