import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route에서의 관리자 검증.
 * 쿠키 세션의 JWT를 서버에서 검증하고 app_metadata.is_admin을 확인한다.
 * (app_metadata는 서버에서만 설정 가능 — 클라이언트 조작 불가)
 */
export async function requireAdmin(): Promise<{ userId: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (user.app_metadata?.is_admin !== true) return null;
  return { userId: user.id };
}
