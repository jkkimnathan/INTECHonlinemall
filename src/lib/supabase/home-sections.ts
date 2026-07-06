import { createClient } from "./client";
import { validateImageFile } from "@/lib/security";

/** 홈 섹션 콘텐츠(JSON) 조회 */
export async function getHomeSection<T>(key: string): Promise<T | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("home_sections")
    .select("content")
    .eq("key", key)
    .single();

  if (error || !data) return null;
  return data.content as T;
}

/** 홈 섹션 콘텐츠 저장 (upsert) */
export async function upsertHomeSection(
  key: string,
  content: unknown
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("home_sections").upsert(
    {
      key,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) return { error: error.message };
  return { error: null };
}

/** 섹션 이미지 업로드 (product-images 버킷 재사용) */
export async function uploadHomeSectionImage(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  // 래스터 이미지만 허용 (SVG/HTML 등 스크립트 실행 가능 파일 차단)
  const { ext, error: fileErr } = validateImageFile(file);
  if (fileErr) return { url: null, error: fileErr };
  const path = `home-sections/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
