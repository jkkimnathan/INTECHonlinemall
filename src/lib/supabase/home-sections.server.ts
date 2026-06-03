import { createClient } from "./server";

/** 서버 컴포넌트에서 홈 섹션 콘텐츠(JSON) 조회. 없으면 null → 컴포넌트 기본값 사용 */
export async function getHomeSectionServer<T>(key: string): Promise<T | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("home_sections")
      .select("content")
      .eq("key", key)
      .single();

    if (error || !data) return null;
    return data.content as T;
  } catch {
    // 테이블 미생성 등 — 기본값으로 폴백
    return null;
  }
}
