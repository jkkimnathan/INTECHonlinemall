import "server-only";
import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * 공유 저장소(Supabase) 기반 rate limit.
 *
 * 서버리스 인스턴스가 여러 개 떠도 하나의 카운터를 공유한다.
 * (단일 인스턴스 메모리 Map은 Vercel에서 의미가 없음)
 *
 * DB 오류 시에는 결제 흐름을 막지 않도록 "허용"으로 처리하되 로그를 남긴다.
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
    return true; // fail-open: 한도 판정 불가 시 요청은 통과시키고 기록만 남긴다
  }
  return data === true;
}

/** 프록시 뒤에서 클라이언트 IP 추출 (Vercel 기준) */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim().slice(0, 64);
  return req.headers.get("x-real-ip")?.slice(0, 64) || "unknown";
}

/** 요청 본문 크기 제한 확인 (content-length 기준) */
export function bodyTooLarge(req: NextRequest, maxBytes: number): boolean {
  const len = Number(req.headers.get("content-length") || 0);
  return Number.isFinite(len) && len > maxBytes;
}
