"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";
import { Loader2, Save, Upload, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  getHomeSection,
  upsertHomeSection,
  uploadHomeSectionImage,
} from "@/lib/supabase/home-sections";
import {
  DEFAULT_IPC,
  DEFAULT_REFURB,
  IpcContent,
  RefurbContent,
} from "@/lib/home-sections-defaults";

const labelCls = "block text-sm font-medium text-[#3f3f46] mb-1";
const cardCls = "bg-white rounded-2xl border border-[#f1f1f3] p-6";

export default function HomeSectionsAdmin() {
  const [loading, setLoading] = useState(true);
  const [savingIpc, setSavingIpc] = useState(false);
  const [savingRefurb, setSavingRefurb] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [ipc, setIpc] = useState<IpcContent>(DEFAULT_IPC);
  const [refurb, setRefurb] = useState<RefurbContent>(DEFAULT_REFURB);

  useEffect(() => {
    Promise.all([
      getHomeSection<IpcContent>("ipc"),
      getHomeSection<RefurbContent>("refurb"),
    ]).then(([i, r]) => {
      if (i) setIpc({ ...DEFAULT_IPC, ...i });
      if (r) setRefurb({ ...DEFAULT_REFURB, ...r });
      setLoading(false);
    });
  }, []);

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast("파일 크기가 5MB를 초과합니다.", "error");
      return;
    }
    setUploading(true);
    const { url, error } = await uploadHomeSectionImage(file);
    setUploading(false);
    if (error) return showToast(`업로드 실패: ${error}`, "error");
    if (url) setIpc((p) => ({ ...p, imageUrl: url }));
  };

  const saveIpc = async () => {
    setSavingIpc(true);
    const { error } = await upsertHomeSection("ipc", ipc);
    setSavingIpc(false);
    showToast(error ? `저장 실패: ${error}` : "iPC 섹션이 저장되었습니다.", error ? "error" : "success");
  };

  const saveRefurb = async () => {
    setSavingRefurb(true);
    const { error } = await upsertHomeSection("refurb", refurb);
    setSavingRefurb(false);
    showToast(error ? `저장 실패: ${error}` : "리퍼몰 섹션이 저장되었습니다.", error ? "error" : "success");
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
          <h1 className="text-2xl font-bold text-[#1d1d1f]">홈 섹션 관리</h1>
          <p className="text-sm text-[#86868b] mt-1">
            홈의 iPC 쇼케이스 · 리퍼몰 쇼케이스 콘텐츠를 수정합니다.
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm">관리자 홈</Button>
        </Link>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
        제목에서 <strong>줄바꿈(Enter)</strong>은 그대로 화면에 반영됩니다. 저장 후 홈에서 확인하세요.
      </div>

      {/* ---------------- iPC 쇼케이스 ---------------- */}
      <div className={`${cardCls} mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1d1d1f]">iPC 쇼케이스</h2>
          <Button onClick={saveIpc} disabled={savingIpc} className="bg-[#1A56DB] hover:bg-[#1747b4]" size="sm">
            {savingIpc ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            저장
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Eyebrow (영문 라벨)</label>
              <Input value={ipc.eyebrow} onChange={(e) => setIpc({ ...ipc, eyebrow: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>헤드라인 (줄바꿈 가능)</label>
              <textarea
                value={ipc.headline}
                onChange={(e) => setIpc({ ...ipc, headline: e.target.value })}
                rows={2}
                className="w-full border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className={labelCls}>설명</label>
              <textarea
                value={ipc.description}
                onChange={(e) => setIpc({ ...ipc, description: e.target.value })}
                rows={3}
                className="w-full border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>하단 CTA 텍스트</label>
                <Input value={ipc.ctaLabel} onChange={(e) => setIpc({ ...ipc, ctaLabel: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>하단 CTA 링크</label>
                <Input value={ipc.ctaHref} onChange={(e) => setIpc({ ...ipc, ctaHref: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelCls}>좌측 하단 캡션</label>
              <Input value={ipc.caption} onChange={(e) => setIpc({ ...ipc, caption: e.target.value })} />
            </div>
          </div>

          <div>
            <label className={labelCls}>좌측 제품 이미지 (없으면 iPC 로고)</label>
            <p className="text-xs text-[#a1a1aa] mb-2">권장: 720 × 480px (3:2 비율) · JPG/PNG/WebP</p>
            {ipc.imageUrl ? (
              <div className="relative h-40 rounded-lg overflow-hidden bg-[#f5f5f7] mb-2">
                <Image src={ipc.imageUrl} alt="iPC" fill className="object-contain" sizes="400px" />
                <button
                  onClick={() => setIpc({ ...ipc, imageUrl: null })}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                >
                  삭제
                </button>
              </div>
            ) : (
              <div className="h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 text-[#a1a1aa] text-xs">
                이미지 없음 (iPC 로고 표시)
              </div>
            )}
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
              <span className="inline-flex items-center gap-1 text-sm text-[#1A56DB]">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                이미지 업로드
              </span>
            </label>
          </div>
        </div>

        {/* 라인업(티어) 편집 */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>라인업 (티어)</label>
            <button
              onClick={() => setIpc({ ...ipc, tiers: [...ipc.tiers, { tier: "", title: "", spec: "", price: 0, href: "/brand/ipc" }] })}
              className="inline-flex items-center gap-1 text-sm text-[#1A56DB]"
            >
              <Plus className="h-4 w-4" /> 추가
            </button>
          </div>
          <div className="space-y-3">
            {ipc.tiers.map((t, i) => (
              <div key={i} className="bg-[#fbfbfd] border border-[#f1f1f3] rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_1fr_120px_auto] gap-2 items-center">
                  <Input placeholder="ENTRY" value={t.tier} onChange={(e) => { const tiers = [...ipc.tiers]; tiers[i] = { ...t, tier: e.target.value }; setIpc({ ...ipc, tiers }); }} />
                  <Input placeholder="iPC Office" value={t.title} onChange={(e) => { const tiers = [...ipc.tiers]; tiers[i] = { ...t, title: e.target.value }; setIpc({ ...ipc, tiers }); }} />
                  <Input placeholder="사양" value={t.spec} onChange={(e) => { const tiers = [...ipc.tiers]; tiers[i] = { ...t, spec: e.target.value }; setIpc({ ...ipc, tiers }); }} />
                  <Input type="number" placeholder="가격" value={t.price} onChange={(e) => { const tiers = [...ipc.tiers]; tiers[i] = { ...t, price: Number(e.target.value) }; setIpc({ ...ipc, tiers }); }} />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-[#86868b] whitespace-nowrap">
                      <input type="checkbox" checked={!!t.featured} onChange={(e) => { const tiers = [...ipc.tiers]; tiers[i] = { ...t, featured: e.target.checked }; setIpc({ ...ipc, tiers }); }} />
                      인기
                    </label>
                    <button onClick={() => setIpc({ ...ipc, tiers: ipc.tiers.filter((_, j) => j !== i) })} className="text-[#a1a1aa] hover:text-[#DC2626]">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#86868b] whitespace-nowrap">이동 링크</span>
                  <Input placeholder="/brand/ipc 또는 /products/슬러그" value={t.href} onChange={(e) => { const tiers = [...ipc.tiers]; tiers[i] = { ...t, href: e.target.value }; setIpc({ ...ipc, tiers }); }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- 리퍼몰 쇼케이스 ---------------- */}
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1d1d1f]">리퍼몰 쇼케이스</h2>
          <Button onClick={saveRefurb} disabled={savingRefurb} className="bg-[#1A56DB] hover:bg-[#1747b4]" size="sm">
            {savingRefurb ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            저장
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelCls}>Eyebrow (영문 라벨)</label>
            <Input value={refurb.eyebrow} onChange={(e) => setRefurb({ ...refurb, eyebrow: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>헤드라인 (줄바꿈 가능)</label>
            <textarea value={refurb.headline} onChange={(e) => setRefurb({ ...refurb, headline: e.target.value })} rows={2} className="w-full border border-[#e5e7eb] rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className={labelCls}>설명</label>
            <textarea value={refurb.description} onChange={(e) => setRefurb({ ...refurb, description: e.target.value })} rows={3} className="w-full border border-[#e5e7eb] rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelCls}>버튼1 텍스트</label><Input value={refurb.cta1Label} onChange={(e) => setRefurb({ ...refurb, cta1Label: e.target.value })} /></div>
            <div><label className={labelCls}>버튼1 링크</label><Input value={refurb.cta1Href} onChange={(e) => setRefurb({ ...refurb, cta1Href: e.target.value })} /></div>
            <div><label className={labelCls}>버튼2 텍스트 (비우면 숨김)</label><Input value={refurb.cta2Label} onChange={(e) => setRefurb({ ...refurb, cta2Label: e.target.value })} /></div>
            <div><label className={labelCls}>버튼2 링크</label><Input value={refurb.cta2Href} onChange={(e) => setRefurb({ ...refurb, cta2Href: e.target.value })} /></div>
          </div>
        </div>

        {/* 등급 편집 */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>검수 등급</label>
            <button
              onClick={() => setRefurb({ ...refurb, grades: [...refurb.grades, { g: "", color: "#34d399", name: "", desc: "" }] })}
              className="inline-flex items-center gap-1 text-sm text-[#1A56DB]"
            >
              <Plus className="h-4 w-4" /> 추가
            </button>
          </div>
          <div className="space-y-3">
            {refurb.grades.map((r, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[70px_90px_1fr_2fr_auto] gap-2 items-center bg-[#fbfbfd] border border-[#f1f1f3] rounded-lg p-3">
                <Input placeholder="S" value={r.g} onChange={(e) => { const g = [...refurb.grades]; g[i] = { ...r, g: e.target.value }; setRefurb({ ...refurb, grades: g }); }} />
                <input type="color" value={r.color} onChange={(e) => { const g = [...refurb.grades]; g[i] = { ...r, color: e.target.value }; setRefurb({ ...refurb, grades: g }); }} className="h-9 w-full rounded border border-[#e5e7eb]" />
                <Input placeholder="이름" value={r.name} onChange={(e) => { const g = [...refurb.grades]; g[i] = { ...r, name: e.target.value }; setRefurb({ ...refurb, grades: g }); }} />
                <Input placeholder="설명" value={r.desc} onChange={(e) => { const g = [...refurb.grades]; g[i] = { ...r, desc: e.target.value }; setRefurb({ ...refurb, grades: g }); }} />
                <button onClick={() => setRefurb({ ...refurb, grades: refurb.grades.filter((_, j) => j !== i) })} className="text-[#a1a1aa] hover:text-[#DC2626] justify-self-center">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
