/**
 * 이미지 URL 가져오기 — 클라이언트 헬퍼 (관리자 화면용)
 */
import type { ImageImportResult } from "@/app/api/admin/images/import/route";

export type { ImageImportResult };

/** 붙여넣은 텍스트에서 이미지 주소 목록 추출 (줄바꿈·공백·쉼표 구분, 중복 제거) */
export function parseImageUrlList(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of text.split(/[\s,]+/)) {
    const t = token.trim().replace(/^["'<]+|[>"']+$/g, "");
    if (!t) continue;
    if (!/^https?:\/\//i.test(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/** 서버에 이미지 복사를 요청한다. 실패한 항목도 결과 배열에 포함된다. */
export async function importImagesByUrl(urls: string[]): Promise<ImageImportResult[]> {
  const res = await fetch("/api/admin/images/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  });
  const data = (await res.json().catch(() => null)) as { results?: ImageImportResult[]; error?: string } | null;
  if (!res.ok || !data?.results) {
    throw new Error(data?.error || `이미지 가져오기 실패 (HTTP ${res.status})`);
  }
  return data.results;
}

/** 우리 저장소(Supabase Storage)나 사이트 내부 경로가 아닌 외부 참조 이미지인지 */
export function isExternalImage(url: string): boolean {
  if (!url || url.startsWith("/")) return false;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (base && url.startsWith(base)) return false;
  return /^https?:\/\//i.test(url);
}
