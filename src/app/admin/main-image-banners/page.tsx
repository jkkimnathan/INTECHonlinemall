"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MainImageBanner,
  BannerPosition,
  getAllMainImageBanners,
  createMainImageBanner,
  updateMainImageBanner,
  deleteMainImageBanner,
  uploadMainImageBannerImage,
} from "@/lib/supabase/main-image-banners";
import { Loader2, Plus, Trash2, Save, X } from "lucide-react";

const POSITION_LABELS: Record<BannerPosition, string> = {
  "left-1": "좌측 상단",
  "left-2": "좌측 하단 왼쪽",
  "left-3": "좌측 하단 오른쪽",
  center: "중앙 (롤링)",
  "right-1": "우측 상단",
  "right-2": "우측 하단 왼쪽",
  "right-3": "우측 하단 오른쪽",
};

const ALL_POSITIONS: BannerPosition[] = [
  "left-1",
  "left-2",
  "left-3",
  "center",
  "right-1",
  "right-2",
  "right-3",
];

interface BannerForm {
  position: BannerPosition;
  title: string;
  linkUrl: string;
  imageFile: File | null;
  imagePreview: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm: BannerForm = {
  position: "left-1",
  title: "",
  linkUrl: "",
  imageFile: null,
  imagePreview: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminMainImageBannersPage() {
  const [banners, setBanners] = useState<MainImageBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BannerForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadBanners = async () => {
    setLoading(true);
    const data = await getAllMainImageBanners();
    setBanners(data);
    setLoading(false);
  };

  useEffect(() => {
    // 최초 로드: loadBanners()는 동기 setLoading(true)를 포함하므로 여기선 직접 조회
    let alive = true;
    getAllMainImageBanners().then((data) => {
      if (!alive) return;
      setBanners(data);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 가능하도록 초기화
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const handleSave = async () => {
    setError("");
    if (!form.title.trim()) return setError("제목을 입력해주세요.");
    if (!editingId && !form.imageFile) return setError("이미지를 선택해주세요.");

    setSaving(true);

    let imageUrl = "";

    if (form.imageFile) {
      const uploadResult = await uploadMainImageBannerImage(form.imageFile);
      if (uploadResult.error || !uploadResult.url) {
        setError(uploadResult.error || "이미지 업로드 실패");
        setSaving(false);
        return;
      }
      imageUrl = uploadResult.url;
    }

    if (editingId) {
      const updates: Parameters<typeof updateMainImageBanner>[1] = {
        position: form.position,
        title: form.title,
        linkUrl: form.linkUrl || null,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      if (imageUrl) updates.imageUrl = imageUrl;
      await updateMainImageBanner(editingId, updates);
    } else {
      await createMainImageBanner({
        position: form.position,
        imageUrl,
        linkUrl: form.linkUrl || undefined,
        title: form.title,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      });
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    loadBanners();
  };

  const handleEdit = (banner: MainImageBanner) => {
    setEditingId(banner.id);
    setForm({
      position: banner.position,
      title: banner.title,
      linkUrl: banner.linkUrl || "",
      imageFile: null,
      imagePreview: banner.imageUrl,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deleteMainImageBanner(id);
    loadBanners();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  };

  // Group banners by position
  const bannersByPosition: Record<string, MainImageBanner[]> = {};
  for (const b of banners) {
    if (!bannersByPosition[b.position]) bannersByPosition[b.position] = [];
    bannersByPosition[b.position].push(b);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">
            메인 이미지 배너 관리
          </h1>
          <p className="text-sm text-[#86868b] mt-1">
            메인 페이지의 이미지 배너 섹션을 관리합니다. (좌 3 / 중앙 롤링 / 우 3)
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm({ ...emptyForm });
              setError("");
            }}
            className="bg-[#1A56DB] hover:bg-[#1747b4] text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            배너 추가
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "배너 수정" : "새 배너 추가"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                위치 *
              </label>
              <select
                value={form.position}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    position: e.target.value as BannerPosition,
                  }))
                }
                className="w-full h-10 px-3 border rounded-md text-sm"
              >
                {ALL_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {POSITION_LABELS[pos]} ({pos})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                제목 *
              </label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="배너 제목"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                링크 URL (선택)
              </label>
              <Input
                value={form.linkUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, linkUrl: e.target.value }))
                }
                placeholder="/products/example 또는 https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                정렬 순서 (중앙 롤링 순서)
              </label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sortOrder: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                이미지 {editingId ? "(변경 시에만 선택)" : "*"}
              </label>
              <p className="text-xs text-[#a1a1aa] mb-1">
                권장(위치별): 중앙 롤링 600×480px (5:4) · 좌우 큰 배너 640×480px (4:3) · 작은 배너 400×400px (정사각형) · 최대 10MB
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-[#86868b] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#EEF4FF] file:text-[#1A56DB] hover:file:bg-blue-100"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="block text-sm font-medium text-[#3f3f46]">
                활성화
              </label>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.isActive ? "bg-[#1A56DB]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    form.isActive ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {form.imagePreview && (
            <div className="mt-4">
              <p className="text-sm text-[#86868b] mb-2">미리보기:</p>
              <div className="relative w-40 h-40 rounded-lg overflow-hidden border">
                <Image
                  src={form.imagePreview}
                  alt="미리보기"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1A56DB] hover:bg-[#1747b4] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> 저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" /> 저장
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" /> 취소
            </Button>
          </div>
        </div>
      )}

      {/* Banner List by Position */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#a1a1aa]" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 text-[#a1a1aa]">
          등록된 배너가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {ALL_POSITIONS.map((pos) => {
            const items = bannersByPosition[pos];
            if (!items || items.length === 0) return null;
            return (
              <div key={pos} className="bg-white rounded-xl border">
                <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                  <h3 className="text-sm font-semibold text-[#3f3f46]">
                    {POSITION_LABELS[pos]}{" "}
                    <span className="text-[#a1a1aa] font-normal">({pos})</span>
                  </h3>
                </div>
                <div className="divide-y">
                  {items.map((banner) => (
                    <div
                      key={banner.id}
                      className="flex items-center gap-4 p-4"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1d1d1f] truncate">
                          {banner.title}
                        </p>
                        {banner.linkUrl && (
                          <p className="text-xs text-[#a1a1aa] truncate">
                            {banner.linkUrl}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              banner.isActive
                                ? "bg-[#ecfdf5] text-[#047857]"
                                : "bg-gray-100 text-[#86868b]"
                            }`}
                          >
                            {banner.isActive ? "활성" : "비활성"}
                          </span>
                          <span className="text-xs text-[#a1a1aa]">
                            순서: {banner.sortOrder}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(banner)}
                        >
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
