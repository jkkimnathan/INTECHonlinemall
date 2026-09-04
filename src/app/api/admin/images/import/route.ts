import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { readJsonLimited } from "@/lib/rate-limit";

/**
 * 관리자 이미지 URL 가져오기 API
 *
 * 외부 이미지 주소(플레이오토·벤더 이미지 호스팅 등)를 받아 서버에서 다운로드한 뒤
 * 우리 Supabase 저장소(product-images)에 복사하고 공개 URL 을 돌려준다.
 * → 외부 서버가 이미지를 지우거나 주소를 바꿔도 몰 이미지는 유지되고,
 *   기존 이미지 최적화(리사이즈·WebP)도 그대로 적용된다.
 *
 * 다운로드가 막힌 경우(핫링크 차단 등)에는 https 주소에 한해 원본 주소를 그대로
 * 돌려주어 "외부 참조" 로 등록할 수 있게 한다. http 주소는 복사 실패 시 등록 불가.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_URLS = 10;
const MAX_BYTES = 15 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;

const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export interface ImageImportResult {
  /** 요청한 원본 주소 */
  source: string;
  /** 등록에 사용할 주소 (복사 성공 시 저장소 URL, 실패 시 https 원본 또는 null) */
  url: string | null;
  /** 저장소로 복사되었는지 */
  copied: boolean;
  /** 실패/대체 사유 */
  error?: string;
}

/** 허용 가능한 이미지 URL 인지 검사 (SSRF 방지: 사설망·로컬 주소 차단) */
function parseImageUrl(raw: unknown): URL | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s || s.length > 2048) return null;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (u.username || u.password) return null;
  const host = u.hostname.toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return null;
  }
  if (host.includes(":")) return null; // IPv6 리터럴
  const m = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (
      a === 0 || a === 10 || a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127)
    ) {
      return null;
    }
  }
  return u;
}

/** 파일 앞부분 시그니처로 이미지 형식 판별 (Content-Type 이 잘못된 서버 대비) */
function sniffImageType(b: Uint8Array): string | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return "image/webp";
  }
  if (b.length >= 12 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
    if (brand === "avif" || brand === "avis") return "image/avif";
  }
  return null;
}

async function importOne(
  u: URL,
  admin: ReturnType<typeof createAdminClient>
): Promise<ImageImportResult> {
  const source = u.toString();
  // 복사 실패 시 대체: https 원본만 외부 참조 허용 (http 는 혼합 콘텐츠로 표시 불가)
  const fallback = u.protocol === "https:" ? source : null;
  const fallbackNote = fallback ? " — 원본 주소를 외부 참조로 등록합니다" : " — http 주소는 복사 실패 시 등록할 수 없습니다";

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(source, {
      signal: ctrl.signal,
      redirect: "follow",
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; intechonline-image-import/1.0)",
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
        Referer: `${u.protocol}//${u.host}/`,
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      return { source, url: fallback, copied: false, error: `다운로드 실패 (HTTP ${res.status})${fallbackNote}` };
    }
    const declared = Number(res.headers.get("content-length") || 0);
    if (declared > MAX_BYTES) {
      return { source, url: fallback, copied: false, error: `이미지가 15MB 를 초과합니다${fallbackNote}` };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0) {
      return { source, url: fallback, copied: false, error: `빈 응답${fallbackNote}` };
    }
    if (buf.byteLength > MAX_BYTES) {
      return { source, url: fallback, copied: false, error: `이미지가 15MB 를 초과합니다${fallbackNote}` };
    }

    const headerType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const type = sniffImageType(new Uint8Array(buf.buffer, buf.byteOffset, Math.min(16, buf.byteLength))) ?? (IMAGE_EXT[headerType] ? headerType : null);
    if (!type) {
      // 이미지가 아닌 응답(HTML 오류 페이지 등)은 외부 참조로도 등록하지 않는다
      return { source, url: null, copied: false, error: "이미지 파일이 아닙니다 (주소를 확인해주세요)" };
    }

    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${IMAGE_EXT[type]}`;
    const { error } = await admin.storage
      .from("product-images")
      .upload(path, buf, { contentType: type, cacheControl: "3600", upsert: false });
    if (error) {
      return { source, url: fallback, copied: false, error: `저장소 업로드 실패: ${error.message}${fallbackNote}` };
    }
    const { data } = admin.storage.from("product-images").getPublicUrl(path);
    return { source, url: data.publicUrl, copied: true };
  } catch (e) {
    clearTimeout(timer);
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      source,
      url: fallback,
      copied: false,
      error: `${aborted ? "응답 시간 초과(15초)" : "다운로드 실패(서버 접속 불가 또는 차단)"}${fallbackNote}`,
    };
  }
}

export async function POST(req: NextRequest) {
  const adminUser = await requireAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = await readJsonLimited<{ urls?: unknown }>(req, 32 * 1024);
  if (!body || !Array.isArray(body.urls) || body.urls.length === 0) {
    return NextResponse.json({ error: "가져올 이미지 주소가 없습니다." }, { status: 400 });
  }
  if (body.urls.length > MAX_URLS) {
    return NextResponse.json({ error: `한 번에 최대 ${MAX_URLS}개까지 가져올 수 있습니다.` }, { status: 400 });
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "서버 설정 오류" },
      { status: 500 }
    );
  }

  const results: ImageImportResult[] = await Promise.all(
    body.urls.map(async (raw): Promise<ImageImportResult> => {
      const u = parseImageUrl(raw);
      if (!u) {
        return {
          source: typeof raw === "string" ? raw.slice(0, 200) : "",
          url: null,
          copied: false,
          error: "올바른 이미지 주소가 아닙니다 (https:// 로 시작하는 공개 주소만 가능)",
        };
      }
      return importOne(u, admin);
    })
  );

  return NextResponse.json({ results });
}
