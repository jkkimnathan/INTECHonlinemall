import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * 서버 전용 관리자 클라이언트 (service_role 키 사용).
 *
 * RLS(행 접근 규칙)를 우회하므로 반드시 서버 코드(API Route)에서만 import할 것.
 * 브라우저 번들에 포함되면 안 됩니다 — NEXT_PUBLIC_ 접두사가 없는 환경변수라
 * 클라이언트에서는 값이 비어 에러가 나도록 되어 있습니다.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다 (.env.local 확인)");
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
