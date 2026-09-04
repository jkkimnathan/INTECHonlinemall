"use client";

import { useState } from "react";
import { Link2, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { importImagesByUrl, parseImageUrlList, type ImageImportResult } from "@/lib/image-import";

/**
 * 이미지 URL 로 추가 (관리자 전용)
 *
 * 플레이오토·벤더 이미지 호스팅 등 외부 주소를 붙여넣으면 서버가 이미지를 받아
 * 우리 저장소에 복사한 뒤 등록한다. 복사가 막힌 https 주소는 외부 참조로 등록된다.
 */
export default function ImageUrlAdder({
  multiple,
  remaining,
  onAdd,
  disabled,
}: {
  /** 여러 장 허용 여부 (썸네일은 false) */
  multiple: boolean;
  /** 추가 가능한 남은 장수 */
  remaining: number;
  /** 등록에 사용할 최종 URL 목록 전달 */
  onAdd: (urls: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<ImageImportResult[] | null>(null);
  const [error, setError] = useState("");

  const canAdd = remaining > 0 && !disabled;

  async function handleImport() {
    setError("");
    setResults(null);
    let urls = parseImageUrlList(text);
    if (urls.length === 0) {
      setError("https:// 로 시작하는 이미지 주소를 입력해주세요.");
      return;
    }
    if (!multiple) urls = urls.slice(0, 1);
    if (urls.length > remaining) urls = urls.slice(0, remaining);
    if (urls.length > 10) urls = urls.slice(0, 10);

    setBusy(true);
    try {
      const res = await importImagesByUrl(urls);
      setResults(res);
      const ok = res.filter((r) => r.url).map((r) => r.url as string);
      if (ok.length > 0) {
        onAdd(ok);
        setText("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "이미지 가져오기에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!canAdd && !open}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-300"
      >
        <Link2 className="h-3.5 w-3.5" />
        {open ? "URL 입력 닫기" : "URL로 추가"}
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50/40 p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={multiple ? 3 : 1}
            disabled={busy || !canAdd}
            placeholder={
              multiple
                ? "https://... 이미지 주소를 붙여넣으세요. 여러 장은 줄바꿈으로 구분 (최대 10개)"
                : "https://... 이미지 주소 1개"
            }
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 disabled:bg-gray-50"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-gray-500">
              서버가 이미지를 받아 우리 저장소에 복사합니다. 복사가 막힌 주소는 외부 참조로 등록됩니다.
              {multiple && remaining < 10 ? ` (남은 ${remaining}장)` : ""}
            </p>
            <button
              type="button"
              onClick={handleImport}
              disabled={busy || !canAdd || !text.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:bg-gray-300"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
              {busy ? "가져오는 중..." : "가져오기"}
            </button>
          </div>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          {results && (
            <ul className="mt-2 space-y-1">
              {results.map((r, i) => (
                <li key={`${r.source}-${i}`} className="flex items-start gap-1.5 text-[11px]">
                  {r.copied ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                  ) : r.url ? (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                  )}
                  <span className="min-w-0 break-all text-gray-600">
                    <span className="text-gray-400">{r.source.replace(/^https?:\/\//, "").slice(0, 80)}</span>
                    {" · "}
                    {r.copied ? "저장소에 복사됨" : r.url ? `외부 참조로 등록됨 (${r.error ?? ""})` : r.error ?? "실패"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
