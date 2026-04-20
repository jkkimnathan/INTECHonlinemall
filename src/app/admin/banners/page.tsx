"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage,
  Banner,
} from "@/lib/supabase/banners";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
} from "lucide-react";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<"pc" | "mobile" | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  const loadBanners = () => {
    getAllBanners().then((data) => {
      setBanners(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const resetForm = () => {
    setTitle("");
    setImageUrl("");
    setMobileImageUrl("");
    setLinkUrl("");
    setSortOrder("0");
    setIsActive(true);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (banner: Banner) => {
    setTitle(banner.title);
    setImageUrl(banner.imageUrl);
    setMobileImageUrl(banner.mobileImageUrl || "");
    setLinkUrl(banner.linkUrl || "");
    setSortOrder(String(banner.sortOrder));
    setIsActive(banner.isActive);
    setEditingId(banner.id);
    setShowForm(true);
    setError("");
  };

  async function handleImageUpload(files: FileList | null, type: "pc" | "mobile") {
    if (!files?.length) return;
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      setError("파일 크기가 10MB를 초과합니다.");
      return;
    }
    setUploading(type);
    setError("");
    const { url, error: uploadErr } = await uploadBannerImage(file);
    setUploading(null);
    if (uploadErr) {
      setError(`업로드 실패: ${uploadErr}`);
      return;
    }
    if (url) {
      if (type === "pc") setImageUrl(url);
      else setMobileImageUrl(url);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("배너 제목을 입력하세요.");
    if (!imageUrl) return setError("PC 배너 이미지를 업로드하세요.");
    setSubmitting(true);
    setError("");

    const payload = {
      title: title.trim(),
      image_url: imageUrl,
      mobile_image_url: mobileImageUrl || null,
      link_url: linkUrl.trim() || null,
      sort_order: Number(sortOrder) || 0,
      is_active: isActive,
    };

    if (editingId) {
      const { error: updateErr } = await updateBanner(editingId, payload);
      if (updateErr) {
        setError(`수정 실패: ${updateErr}`);
        setSubmitting(false);
        return;
      }
    } else {
      const { error: createErr } = await createBanner(payload);
      if (createErr) {
        setError(`등록 실패: ${createErr}`);
        setSubmitting(false);
        return;
      }
    }

    resetForm();
    setSubmitting(false);
    loadBanners();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error: delErr } = await deleteBanner(id);
    if (delErr) {
      setError(`삭제 실패: ${delErr}`);
      return;
    }
    loadBanners();
  };

  const toggleActive = async (banner: Banner) => {
    await updateBanner(banner.id, { is_active: !banner.isActive });
    loadBanners();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">배너 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {banners.length}건 | 활성 {banners.filter((b) => b.isActive).length}건
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          배너 등록
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 등록/수정 폼 */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border p-6 mb-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">
              {editingId ? "배너 수정" : "배너 등록"}
            </h2>
            <button type="button" onClick={resetForm}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 space-y-1">
            <p><Monitor className="inline h-4 w-4 mr-1" /><strong>PC 배너:</strong> 1920 x 400px (4.8:1 비율) — 필수</p>
            <p><Smartphone className="inline h-4 w-4 mr-1" /><strong>모바일 배너:</strong> 750 x 600px (1.25:1 비율) — 선택 (미등록 시 PC 이미지 사용)</p>
            <p className="text-xs text-blue-500">최대 10MB | JPG, PNG, WebP 권장</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              배너 제목 <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="배너 제목 (관리용)"
              required
            />
          </div>

          {/* PC 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Monitor className="inline h-4 w-4 mr-1" />
              PC 배너 이미지 <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 ml-2">1920 x 400px</span>
            </label>
            {imageUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="PC 배너 미리보기"
                  className="w-full max-h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { handleImageUpload(e.target.files, "pc"); e.target.value = ""; }}
                  disabled={uploading !== null}
                />
                {uploading === "pc" ? (
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-300 mb-2" />
                    <span className="text-sm text-gray-500">클릭하여 PC 배너 업로드</span>
                    <span className="text-xs text-gray-400 mt-1">1920 x 400px 권장</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* 모바일 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Smartphone className="inline h-4 w-4 mr-1" />
              모바일 배너 이미지
              <span className="text-xs text-gray-400 ml-2">750 x 600px (선택)</span>
            </label>
            {mobileImageUrl ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mobileImageUrl}
                  alt="모바일 배너 미리보기"
                  className="h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setMobileImageUrl("")}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { handleImageUpload(e.target.files, "mobile"); e.target.value = ""; }}
                  disabled={uploading !== null}
                />
                {uploading === "mobile" ? (
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-gray-300 mb-2" />
                    <span className="text-sm text-gray-500">클릭하여 모바일 배너 업로드</span>
                    <span className="text-xs text-gray-400 mt-1">미등록 시 PC 이미지가 자동 사용됩니다</span>
                  </>
                )}
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              클릭 시 이동 URL
            </label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="예: /products 또는 https://example.com"
            />
            <p className="text-xs text-gray-400 mt-1">
              내부 링크는 /로 시작 (예: /products), 외부 링크는 https://로 시작
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                정렬 순서
              </label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="숫자가 작을수록 앞에 표시"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                활성 상태
              </label>
              <select
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full h-10 border rounded-md px-3 text-sm"
              >
                <option value="true">활성 (표시됨)</option>
                <option value="false">비활성 (숨김)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              취소
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingId ? "수정" : "등록"}
            </Button>
          </div>
        </form>
      )}

      {/* 목록 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {banners.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>등록된 배너가 없습니다.</p>
            <p className="text-xs mt-1">배너를 등록하면 메인 페이지에 슬라이드로 표시됩니다.</p>
          </div>
        ) : (
          <div className="divide-y">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="p-4 flex items-center gap-4"
              >
                {/* 미리보기 */}
                <div className="flex gap-2 flex-shrink-0">
                  <div className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-36 h-[30px] object-cover rounded border"
                    />
                    <span className="text-[10px] text-gray-400">PC</span>
                  </div>
                  {banner.mobileImageUrl && (
                    <div className="text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={banner.mobileImageUrl}
                        alt={`${banner.title} 모바일`}
                        className="w-[25px] h-[30px] object-cover rounded border"
                      />
                      <span className="text-[10px] text-gray-400">M</span>
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className={
                        banner.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }
                    >
                      {banner.isActive ? "활성" : "비활성"}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-600">
                      순서: {banner.sortOrder}
                    </Badge>
                    {banner.mobileImageUrl ? (
                      <Badge className="bg-purple-100 text-purple-600 text-[10px]">PC+모바일</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 text-[10px]">PC만</Badge>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">
                    {banner.title}
                  </h3>
                  {banner.linkUrl && (
                    <p className="text-xs text-blue-500 truncate mt-0.5">
                      {banner.linkUrl}
                    </p>
                  )}
                </div>

                {/* 액션 */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    title={banner.isActive ? "비활성화" : "활성화"}
                    onClick={() => toggleActive(banner)}
                  >
                    {banner.isActive ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(banner)}
                  >
                    <Pencil className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
