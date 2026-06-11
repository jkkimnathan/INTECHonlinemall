import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * 공개 데이터 전용 서버 클라이언트 (쿠키 미사용).
 *
 * 쿠키를 읽지 않으므로 이 클라이언트만 사용하는 서버 컴포넌트/페이지는
 * 정적 생성 + ISR 캐싱이 가능해져 응답 속도가 크게 빨라집니다.
 * 인증이 필요 없는 "공개 읽기"(상품·배너·홈 섹션 등)에만 사용하세요.
 * 쓰기/관리/회원 데이터는 기존 쿠키 클라이언트(server.ts)를 사용합니다.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
