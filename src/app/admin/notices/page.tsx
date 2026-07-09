"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  uploadNoticeImage,
  Notice,
} from "@/lib/supabase/notices";
import { Plus, Pencil, Trash2, Pin, X, Loader2, Upload, Image as ImageIcon } from "lucide-react";

const categories = ["안내", "배송", "정책", "입고", "이벤트"];

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("안내");
  const [isPinned, setIsPinned] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const loadNotices = () => {
    getNotices().then((data) => {
      setNotices(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("안내");
    setIsPinned(false);
    setImageUrl("");
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (notice: Notice) => {
    setTitle(notice.title);
    setContent(notice.content);
    setCategory(notice.category);
    setIsPinned(notice.isPinned);
    setImageUrl(notice.imageUrl || "");
    setEditingId(notice.id);
    setShowForm(true);
  };

  async function handleImageUpload(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기가 10MB를 초과합니다.");
      return;
    }
    setUploading(true);
    const { url, error } = await uploadNoticeImage(file);
    setUploading(false);
    if (error) {
      alert(`업로드 실패: ${error}`);
      return;
    }
    if (url) setImageUrl(url);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);

    let ok: boolean;
    if (editingId) {
      ok = await updateNotice(editingId, {
        title,
        content,
        category,
        isPinned,
        imageUrl: imageUrl || null,
      });
    } else {
      const created = await createNotice({
        title,
        content,
        category,
        isPinned,
        imageUrl: imageUrl || null,
      });
      ok = created !== null;
    }

    setSubmitting(false);
    if (!ok) {
      alert("저장에 실패했습니다. 다시 시도해주세요.");
      loadNotices();
      return;
    }

    resetForm();
    loadNotices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const ok = await deleteNotice(id);
    if (!ok) alert("삭제에 실패했습니다. 다시 시도해주세요.");
    loadNotices();
  };

  const handleTogglePin = async (notice: Notice) => {
    const ok = await updateNotice(notice.id, { isPinned: !notice.isPinned });
    if (!ok) alert("저장에 실패했습니다. 다시 시도해주세요.");
    loadNotices();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#a1a1aa]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">공지 관리</h1>
          <p className="text-sm text-[#86868b] mt-1">총 {notices.length}건</p>
        </div>
        <Button
          className="bg-[#1A56DB] hover:bg-[#1747b4]"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          공지 등록
        </Button>
      </div>

      {/* 등록/수정 폼 */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border p-6 mb-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1d1d1f]">
              {editingId ? "공지 수정" : "공지 등록"}
            </h2>
            <button type="button" onClick={resetForm}>
              <X className="h-5 w-5 text-[#a1a1aa]" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                제목
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공지 제목"
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                  카테고리
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded"
                  />
                  고정
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3f3f46] mb-1">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지 내용"
              rows={4}
              className="w-full border rounded-md px-3 py-2 text-sm resize-none"
              required
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-[#3f3f46] mb-1">
              이미지 (선택)
            </label>
            <p className="text-xs text-[#a1a1aa] mb-2">
              권장: 가로 900px 이상 · 세로 길이 자유 (본문 상세 이미지) · 최대 10MB · JPG/PNG/WebP
            </p>
            {imageUrl ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="공지 이미지"
                  className="max-w-full max-h-60 object-contain rounded-lg border"
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
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-[#EEF4FF]">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ""; }}
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 className="h-6 w-6 text-[#1A56DB] animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-gray-300 mb-2" />
                    <span className="text-sm text-[#86868b]">클릭하여 이미지 업로드</span>
                    <span className="text-xs text-[#a1a1aa] mt-1">최대 10MB</span>
                  </>
                )}
              </label>
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
              {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingId ? "수정" : "등록"}
            </Button>
          </div>
        </form>
      )}

      {/* 목록 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {notices.length === 0 ? (
          <div className="text-center py-16 text-[#a1a1aa]">
            등록된 공지가 없습니다.
          </div>
        ) : (
          <div className="divide-y">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="p-4 flex items-start justify-between gap-4"
              >
                <div className="flex gap-3 flex-1 min-w-0">
                  {notice.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={notice.imageUrl}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-gray-100 text-[#3f3f46] text-xs">
                        {notice.category}
                      </Badge>
                      {notice.isPinned && (
                        <Badge className="bg-[#EEF4FF] text-[#1A56DB] text-xs">
                          <Pin className="h-3 w-3 mr-0.5" />
                          고정
                        </Badge>
                      )}
                      {notice.imageUrl && (
                        <ImageIcon className="h-3 w-3 text-[#a1a1aa]" />
                      )}
                      <span className="text-xs text-[#a1a1aa]">
                        {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <h3 className="font-medium text-[#1d1d1f] truncate">
                      {notice.title}
                    </h3>
                    <p className="text-sm text-[#86868b] mt-1 line-clamp-2">
                      {notice.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePin(notice)}
                    title={notice.isPinned ? "고정 해제" : "고정"}
                  >
                    <Pin
                      className={`h-4 w-4 ${
                        notice.isPinned ? "text-[#1A56DB]" : "text-[#a1a1aa]"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(notice)}
                  >
                    <Pencil className="h-4 w-4 text-[#a1a1aa]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(notice.id)}
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
