"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import { getQnaList, createQna, QnaItem } from "@/lib/supabase/qna";
import { getPageBanner, PageBanner } from "@/lib/supabase/page-banners";
import { showToast } from "@/components/ui/toast";
import Image from "next/image";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
  Loader2,
  X,
  Send,
  Lock,
} from "lucide-react";

const categoryColors: Record<string, string> = {
  상품문의: "bg-[#eef4ff] text-[#1d4ed8]",
  배송문의: "bg-[#ecfdf5] text-[#047857]",
  "교환/반품": "bg-[#fff7ed] text-[#c2410c]",
  기타: "bg-[#f5f5f7] text-[#3f3f46]",
};

const categories = ["전체", "상품문의", "배송문의", "교환/반품", "기타"];
const writeCategories = ["상품문의", "배송문의", "교환/반품", "기타"];

export default function CommunityPage() {
  const { user, isLoggedIn } = useAuthStore();
  const [items, setItems] = useState<QnaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState("전체");

  // 비밀글 비밀번호 입력
  const [passwordInput, setPasswordInput] = useState("");
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  // 글쓰기 상태
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState("상품문의");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formIsSecret, setFormIsSecret] = useState(false);
  const [formPassword, setFormPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [banner, setBanner] = useState<PageBanner | null>(null);

  const loadQna = () => {
    getQnaList().then((data) => {
      setItems(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadQna();
    getPageBanner("community").then(setBanner);
  }, []);

  const filtered =
    filter === "전체" ? items : items.filter((q) => q.category === filter);

  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setFormCategory("상품문의");
    setFormIsSecret(false);
    setFormPassword("");
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast("제목과 내용을 입력해주세요.", "warning");
      return;
    }
    if (formIsSecret && !formPassword.trim()) {
      showToast("비밀글 비밀번호를 입력해주세요.", "warning");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    const result = await createQna({
      userId: user.id,
      authorName: user.name.charAt(0) + "**",
      category: formCategory,
      title: formTitle,
      content: formContent,
      isSecret: formIsSecret,
      password: formIsSecret ? formPassword : undefined,
    });
    setSubmitting(false);

    if (result) {
      showToast("질문이 등록되었습니다.");
      resetForm();
      loadQna();
    } else {
      showToast("등록에 실패했습니다.", "error");
    }
  };

  // 비밀글 열기 시도
  const handleOpenSecret = (item: QnaItem) => {
    // 작성자 본인이면 바로 열기
    if (user && item.userId === user.id) {
      setUnlockedIds((prev) => new Set(prev).add(item.id));
      setOpenId(item.id);
      return;
    }
    // 비밀번호 확인
    if (passwordInput === item.password) {
      setUnlockedIds((prev) => new Set(prev).add(item.id));
      setOpenId(item.id);
      setPasswordInput("");
    } else {
      showToast("비밀번호가 일치하지 않습니다.", "error");
    }
  };

  const canViewSecret = (item: QnaItem) => {
    return !item.isSecret || unlockedIds.has(item.id) || (user && item.userId === user.id);
  };

  const bannerTitle = banner?.title || "커뮤니티";
  const bannerSubtitle = banner?.subtitle || "Q&A 게시판 | 궁금한 점을 질문해주세요";

  return (
    <div className="bg-[#fbfbfd] min-h-screen">
      {banner?.imageUrl ? (
        <div className="relative h-[200px] md:h-[300px] overflow-hidden">
          <Image src={banner.imageUrl} alt={bannerTitle} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.025em]">{bannerTitle}</h1>
              <p className="text-white/80 mt-2">{bannerSubtitle}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#0F172A] text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.025em]">{bannerTitle}</h1>
            <p className="text-indigo-100 mt-2">{bannerSubtitle}</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* 필터 + 글쓰기 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <Button
            className="bg-[#1A56DB] hover:bg-[#1747b4] text-sm"
            onClick={() => {
              if (!isLoggedIn) {
                showToast("로그인이 필요합니다.", "warning");
                return;
              }
              setShowForm(true);
            }}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            질문하기
          </Button>
        </div>

        {!isLoggedIn && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
            질문을 작성하려면 로그인이 필요합니다.
          </div>
        )}

        {/* 글쓰기 폼 */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-[#f1f1f3] p-6 mb-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#1d1d1f]">질문 작성</h2>
              <button type="button" onClick={resetForm}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  {writeCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="질문 제목을 입력해주세요"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                내용
              </label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="궁금한 내용을 자세히 작성해주세요"
                rows={4}
                className="w-full border rounded-md px-3 py-2 text-sm resize-none"
                required
              />
            </div>
            {/* 비밀글 설정 */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsSecret}
                  onChange={(e) => setFormIsSecret(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Lock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">비밀글</span>
              </label>
              {formIsSecret && (
                <Input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="비밀번호 (4자리 이상)"
                  className="w-48"
                  minLength={4}
                  required
                />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                취소
              </Button>
              <Button
                type="submit"
                className="bg-[#1A56DB] hover:bg-[#1747b4]"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                등록
              </Button>
            </div>
          </form>
        )}

        {/* Q&A 목록 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {filter === "전체"
              ? "등록된 질문이 없습니다."
              : "해당 카테고리의 게시글이 없습니다."}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#f1f1f3] divide-y">
            {filtered.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (openId === item.id) {
                      setOpenId(null);
                      return;
                    }
                    // 비밀글이고 잠금 안 풀린 경우
                    if (item.isSecret && !canViewSecret(item)) {
                      setOpenId("pwd-" + item.id);
                      return;
                    }
                    setOpenId(item.id);
                  }}
                  className="w-full text-left p-4 hover:bg-[#fbfbfd] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className={
                        categoryColors[item.category] ||
                        "bg-[#f5f5f7] text-[#3f3f46]"
                      }
                    >
                      {item.category}
                    </Badge>
                    <Badge
                      className={
                        item.isAnswered
                          ? "bg-[#ecfdf5] text-[#047857]"
                          : "bg-gray-100 text-gray-500"
                      }
                    >
                      {item.isAnswered ? "답변완료" : "대기중"}
                    </Badge>
                    {item.isSecret && (
                      <Lock className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[#1d1d1f] text-sm">
                      {item.isSecret && !canViewSecret(item)
                        ? "비밀글입니다."
                        : item.title}
                    </h3>
                    {openId === item.id ? (
                      <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {item.authorName}
                    </span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </button>

                {/* 비밀번호 입력 폼 */}
                {openId === "pwd-" + item.id && (
                  <div className="px-4 pb-4">
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                      <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <Input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleOpenSecret(item);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleOpenSecret(item)}
                        className="bg-[#1A56DB] hover:bg-[#1747b4]"
                      >
                        확인
                      </Button>
                    </div>
                  </div>
                )}

                {/* 내용 표시 */}
                {openId === item.id && canViewSecret(item) && (
                  <div className="px-4 pb-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                      <p className="font-medium text-gray-500 text-xs mb-2">
                        질문
                      </p>
                      <p className="whitespace-pre-line">{item.content}</p>
                    </div>
                    {item.answerContent && (
                      <div className="bg-blue-50 rounded-lg p-4 mt-2 text-sm">
                        <p className="font-medium text-blue-600 text-xs mb-2">
                          관리자 답변 (
                          {item.answerDate
                            ? new Date(item.answerDate).toLocaleDateString(
                                "ko-KR"
                              )
                            : ""}
                          )
                        </p>
                        <p className="text-gray-700 whitespace-pre-line">
                          {item.answerContent}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
