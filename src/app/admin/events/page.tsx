"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
  SiteEvent,
} from "@/lib/supabase/events";
import { Plus, Pencil, Trash2, X, Loader2, CalendarDays, Upload, Image as ImageIcon } from "lucide-react";

const statusOptions = ["진행중", "종료", "예정"];

export default function AdminEventsPage() {
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("진행중");
  const [imageUrl, setImageUrl] = useState("");

  const loadEvents = () => {
    getEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setStatus("진행중");
    setImageUrl("");
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (event: SiteEvent) => {
    setTitle(event.title);
    setDescription(event.description);
    setStartDate(event.startDate);
    setEndDate(event.endDate);
    setStatus(event.status);
    setImageUrl(event.imageUrl ?? "");
    setEditingId(event.id);
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
    const { url, error } = await uploadEventImage(file);
    setUploading(false);
    if (error) {
      alert(`업로드 실패: ${error}`);
      return;
    }
    if (url) setImageUrl(url);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !startDate || !endDate) return;
    setSubmitting(true);

    if (editingId) {
      await updateEvent(editingId, {
        title,
        description,
        startDate,
        endDate,
        status,
        imageUrl: imageUrl || null,
      });
    } else {
      await createEvent({
        title,
        description,
        startDate,
        endDate,
        status,
        imageUrl: imageUrl || undefined,
      });
    }

    resetForm();
    setSubmitting(false);
    loadEvents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deleteEvent(id);
    loadEvents();
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
          <h1 className="text-2xl font-bold text-[#1d1d1f]">이벤트 관리</h1>
          <p className="text-sm text-[#86868b] mt-1">총 {events.length}건</p>
        </div>
        <Button
          className="bg-[#1A56DB] hover:bg-[#1747b4]"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          이벤트 등록
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
              {editingId ? "이벤트 수정" : "이벤트 등록"}
            </h2>
            <button type="button" onClick={resetForm}>
              <X className="h-5 w-5 text-[#a1a1aa]" />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3f3f46] mb-1">
              제목
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="이벤트 제목"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3f3f46] mb-1">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이벤트 설명"
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm resize-none"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                시작일
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                종료일
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
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
                  alt="이벤트 이미지"
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
        {events.length === 0 ? (
          <div className="text-center py-16 text-[#a1a1aa]">
            등록된 이벤트가 없습니다.
          </div>
        ) : (
          <div className="divide-y">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 flex items-start justify-between gap-4"
              >
                <div className="flex gap-3 flex-1 min-w-0">
                  {event.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={
                          event.status === "진행중"
                            ? "bg-[#ecfdf5] text-[#047857]"
                            : event.status === "예정"
                            ? "bg-blue-100 text-[#1A56DB]"
                            : "bg-gray-100 text-[#86868b]"
                        }
                      >
                        {event.status}
                      </Badge>
                      <span className="text-xs text-[#a1a1aa] flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {event.startDate} ~ {event.endDate}
                      </span>
                    </div>
                    <h3 className="font-medium text-[#1d1d1f]">{event.title}</h3>
                    <p className="text-sm text-[#86868b] mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(event)}
                  >
                    <Pencil className="h-4 w-4 text-[#a1a1aa]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
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
