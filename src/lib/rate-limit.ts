import "server-only";
import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * 공유 저장소(Supabase) 기반 rate limit.
 *
 * 서버리스 인스턴스가 여러 개 떠도 하나의 카운터를 공유한다.
 * (단일 인스턴스 메모리 Map은 Vercel에서 의미가 없음)
 *
 * fail-open 정책: DB 오류 시 결제 흐름을 막지 않도록 "허용"하되 로그를 남긴다.
 * confirm은 DB claim이 이중 처리를 별도로 막고 있어 rate limit이 뚫려도
 * 과금 정합성은 유지된다. 웹훅은 뒤따르는 주문 존재 확인이 증폭을 줄인다.
 */
export async function hitRateLimit(
  admin: SupabaseClient,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const { data, error } = await admin.rpc("hit_rate_limit", {
    p_key: key.slice(0, 200),
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate limit rpc error:", error.message);
    return true;
  }
  return data === true;
}

/**
 * 클라이언트 IP 추출.
 * Vercel이 직접 설정하는 x-real-ip를 우선 사용한다 (클라이언트 위조 불가).
 * x-forwarded-for는 폴백 — Vercel 운영 환경에서는 플랫폼이 재작성하지만
 * 다른 환경에서는 위조될 수 있어 첫 값만 참고용으로 쓴다.
 */
export function clientIp(req: NextRequest): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.slice(0, 64);
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim().slice(0, 64);
  return "unknown";
}

/** 요청 본문 크기 제한 확인 (content-length 기준 1차 방어) */
export function bodyTooLarge(req: NextRequest, maxBytes: number): boolean {
  const len = Number(req.headers.get("content-length") || 0);
  return Number.isFinite(len) && len > maxBytes;
}

/**
 * 크기 제한이 있는 JSON 본문 파서.
 * Content-Length가 없거나 chunked인 요청도 실제 읽은 길이로 재검증한다.
 * Content-Type이 JSON이 아니거나, 초과하거나, 파싱 불가면 null.
 */
export async function readJsonLimited<T>(req: NextRequest, maxBytes: number): Promise<T | null> {
  if (bodyTooLarge(req, maxBytes)) return null;
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  let text: string;
  try {
    text = await req.text();
  } catch {
    return null;
  }
  if (text.length === 0 || text.length > maxBytes) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
