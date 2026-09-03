"use client";

import { useState } from "react";
import { Code2, Eye } from "lucide-react";

/**
 * 상세페이지 HTML 붙여넣기 편집기 (관리자 전용)
 *
 * - 벤더에서 받은 상세 HTML 을 그대로 붙여넣는다. 저장 시 원문이 보관되고,
 *   상세페이지 표시 시점에 서버에서 script/iframe/이벤트 속성이 제거된다.
 * - 미리보기는 sandbox iframe(스크립트·폼·동일출처 차단)에서 렌더해
 *   관리자 화면 자체에는 영향을 주지 않는다.
 */
export default function DetailHtmlEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [tab, setTab] = useState<"code" | "preview">("code");
  const sizeKb = Math.round((new TextEncoder().encode(value).length / 1024) * 10) / 10;

  const previewDoc = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base target="_blank">
<style>
  body { margin: 0; padding: 8px; font-family: system-ui, -apple-system, "Pretendard", sans-serif; color: #1d1d1f; }
  img { max-width: 100%; height: auto; }
  table { max-width: 100%; }
</style></head><body>${value}</body></html>`;

  return (
    <div className="mt-6 border-t pt-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">HTML 상세 (선택)</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            벤더 상세 HTML 을 그대로 붙여넣으세요. 이미지와 함께 등록하면 HTML 이 먼저, 이미지가 그 아래에 표시됩니다.
          </p>
        </div>
        <div className="flex rounded-lg border bg-gray-50 p-0.5 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setTab("code")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
              tab === "code" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" /> 코드
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
              tab === "preview" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> 미리보기
          </button>
        </div>
      </div>

      {tab === "code" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          rows={12}
          placeholder={"<div>\n  <img src=\"https://...\" alt=\"\">\n  ...\n</div>"}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      ) : value.trim() ? (
        <iframe
          title="HTML 상세 미리보기"
          sandbox=""
          srcDoc={previewDoc}
          className="w-full h-[600px] rounded-lg border border-gray-200 bg-white"
        />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
          붙여넣은 HTML 이 없습니다.
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
        <span>
          저장 후 표시 시 script·iframe·이벤트 속성은 자동 제거되며, 외부 이미지(https)는 허용됩니다.
        </span>
        <span>{value ? `${sizeKb} KB` : ""}{value && sizeKb > 4000 ? " · 5,000KB 를 넘으면 저장되지 않습니다" : ""}</span>
      </div>
      {value.trim() && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-2 text-xs text-red-500 hover:underline"
        >
          HTML 상세 비우기
        </button>
      )}
    </div>
  );
}
