"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getAllPageBanners,
  upsertPageBanner,
  uploadPageBannerImage,
  PageBanner,
} from "@/lib/supabase/page-banners";
import { showToast } from "@/components/ui/toast";
import { Loader2, Upload, Save, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// 관리 가능한 페이지 목록
const PAGE_KEYS = [
  { key: "sale", label: "특가", defaultTitle: "특가 상품", defaultSubtitle: "지금 할인 중인 IT 하드웨어를 놓치지 마세요!" },
  { key: "refurbished", label: "리퍼비쉬", defaultTitle: "리퍼비쉬 상품", defaultSubtitle: "공식 수입사가 직접 검수한 리퍼 제품 | 품질 보증 | A/S 지원" },
  { key: "event", label: "이벤트", defaultTitle: "이벤트", defaultSubtitle: "다양한 혜택과 이벤트를 확인하세요" },
  { key: "notice", label: "공지사항", defaultTitle: "공지사항", defaultSubtitle: "인텍앤컴퍼니몰의 새로운 소식을 알려드립니다" },
  { key: "community", label: "커뮤니티", defaultTitle: "커뮤니티", defaultSubtitle: "Q&A 게시판 | 궁금한 점을 질문해주세요" },
];

export default function PageBannersAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  // 폼 상태
  const [forms, setForms] = useState<
    Record<string, { title: string; subtitle: string; imageUrl: string | null }>
  >({});

  useEffect(() => {
    getAllPageBanners().then((data) => {
      const map: Record<string, PageBanner> = {};
      data.forEach((b) => { map[b.pageKey] = b; });

      // 폼 초기화
      const formState: Record<string, { title: string; subtitle: string; imageUrl: string | null }> = {};
      PAGE_KEYS.forEach(({ key, defaultTitle, defaultSubtitle }) => {
        const existing = map[key];
        formState[key] = {
          title: existing?.title || defaultTitle,
          subtitle: existing?.subtitle || defaultSubtitle,
          imageUrl: existing?.imageUrl || null,
        };
      });
      setForms(formState);
      setLoading(false);
    });
  }, []);

  const updateForm = (key: string, field: string, value: string | null) => {
    setForms((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleUpload = async (key: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast("파일 크기가 5MB를 초과합니다.", "error");
      return;
    }
    setUploading(key);
    const { url, error } = await uploadPageBannerImage(file);
    setUploading(null);
    if (error) {
      showToast(`업로드 실패: ${error}`, "error");
      return;
    }
    if (url) updateForm(key, "imageUrl", url);
  };

  const handleSave = async (key: string) => {
    const form = forms[key];
    if (!form.title.trim()) {
      showToast("제목을 입력하세요.", "warning");
      return;
    }
    setSaving(key);
    const { error } = await upsertPageBanner({
      pageKey: key,
      title: form.title,
      subtitle: form.subtitle,
      imageUrl: form.imageUrl,
    });
    setSaving(null);
    if (error) {
      showToast(`저장 실패: ${error}`, "error");
    } else {
      showToast("저장되었습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#a1a1aa]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">페이지 배너 관리</h1>
          <p className="text-sm text-[#86868b] mt-1">
            각 페이지 상단 배너의 제목, 설명, 배경 이미지를 설정합니다.
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm">관리자 홈</Button>
        </Link>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
        <strong>배경 이미지 권장 사이즈:</strong> 가로 1920px x 세로 300px (6.4:1 비율). JPG/PNG, 5MB 이내.
        <br />이미지가 없으면 기존 단색 그라데이션 배경이 유지됩니다.
      </div>

      <div className="space-y-6">
        {PAGE_KEYS.map(({ key, label }) => {
          const form = forms[key];
          if (!form) return null;

          return (
            <div key={key} className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1d1d1f]">
                  {label} 페이지 <span className="text-sm text-[#a1a1aa] font-normal">/{key}</span>
                </h2>
                <Button
                  onClick={() => handleSave(key)}
                  disabled={saving === key}
                  className="bg-[#1A56DB] hover:bg-[#1747b4]"
                  size="sm"
                >
                  {saving === key ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  저장
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 텍스트 설정 */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                      제목
                    </label>
                    <Input
                      value={form.title}
                      onChange={(e) => updateForm(key, "title", e.target.value)}
                      placeholder="페이지 제목"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                      설명
                    </label>
                    <Input
                      value={form.subtitle}
                      onChange={(e) => updateForm(key, "subtitle", e.target.value)}
                      placeholder="페이지 설명"
                    />
                  </div>
                </div>

                {/* 이미지 설정 */}
                <div>
                  <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                    배경 이미지
                  </label>
                  {form.imageUrl ? (
                    <div className="relative h-32 rounded-lg overflow-hidden bg-gray-100 mb-2">
                      <Image
                        src={form.imageUrl}
                        alt={`${label} 배너`}
                        fill
                        className="object-cover"
                        sizes="400px"
                      />
                      <button
                        onClick={() => updateForm(key, "imageUrl", null)}
                        className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                      <div className="text-center text-[#a1a1aa]">
                        <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                        <p className="text-xs">이미지 없음 (단색 배경 사용)</p>
                      </div>
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(key, file);
                        e.target.value = ""; // 같은 파일 재선택 가능하도록 초기화
                      }}
                    />
                    <span className="inline-flex items-center gap-1 text-sm text-[#1A56DB] hover:text-[#1A56DB]">
                      {uploading === key ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      이미지 업로드
                    </span>
                  </label>
                </div>
              </div>

              {/* 미리보기 */}
              {form.imageUrl && (
                <div className="mt-4">
                  <p className="text-xs text-[#a1a1aa] mb-2">미리보기</p>
                  <div
                    className="relative rounded-lg overflow-hidden h-24"
                  >
                    <Image
                      src={form.imageUrl}
                      alt="preview"
                      fill
                      className="object-cover"
                      sizes="800px"
                    />
                    <div className="absolute inset-0 flex items-center">
                      <div className="px-6">
                        <h3 className="text-white font-bold text-lg [text-shadow:0_2px_10px_rgba(0,0,0,0.7)]">{form.title}</h3>
                        <p className="text-white/90 text-sm [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">{form.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
