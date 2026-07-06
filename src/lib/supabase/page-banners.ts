import { createClient } from "./client";
import { validateImageFile } from "@/lib/security";

export interface PageBanner {
  id: string;
  pageKey: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  updatedAt: string;
}

interface PageBannerRow {
  id: string;
  page_key: string;
  title: string;
  subtitle: string;
  image_url: string | null;
  updated_at: string;
}

function toBanner(row: PageBannerRow): PageBanner {
  return {
    id: row.id,
    pageKey: row.page_key,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    updatedAt: row.updated_at,
  };
}

/** 특정 페이지 배너 조회 */
export async function getPageBanner(pageKey: string): Promise<PageBanner | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("page_banners")
    .select("*")
    .eq("page_key", pageKey)
    .single();

  if (error || !data) return null;
  return toBanner(data);
}

/** 전체 페이지 배너 목록 */
export async function getAllPageBanners(): Promise<PageBanner[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("page_banners")
    .select("*")
    .order("page_key", { ascending: true });

  if (error || !data) return [];
  return data.map(toBanner);
}

/** 페이지 배너 저장 (upsert) */
export async function upsertPageBanner(input: {
  pageKey: string;
  title: string;
  subtitle: string;
  imageUrl?: string | null;
}): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("page_banners")
    .upsert(
      {
        page_key: input.pageKey,
        title: input.title,
        subtitle: input.subtitle,
        image_url: input.imageUrl || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page_key" }
    );

  if (error) return { error: error.message };
  return { error: null };
}

/** 배너 이미지 업로드 */
export async function uploadPageBannerImage(file: File): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  // 래스터 이미지만 허용 (SVG/HTML 등 스크립트 실행 가능 파일 차단)
  const { ext, error: fileErr } = validateImageFile(file);
  if (fileErr) return { url: null, error: fileErr };
  const path = `page-banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
