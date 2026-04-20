import { createClient } from "@/lib/supabase/client";

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface BannerRow {
  id: string;
  title: string;
  image_url: string;
  mobile_image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

function toBanner(row: BannerRow): Banner {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    mobileImageUrl: row.mobile_image_url,
    linkUrl: row.link_url,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

/** 활성 배너 조회 (프론트용) */
export async function getActiveBanners(): Promise<Banner[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map(toBanner);
}

/** 전체 배너 조회 (관리자용) */
export async function getAllBanners(): Promise<Banner[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map(toBanner);
}

/** 배너 등록 */
export async function createBanner(input: {
  title: string;
  image_url: string;
  mobile_image_url?: string | null;
  link_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("banners").insert([{
    title: input.title,
    image_url: input.image_url,
    mobile_image_url: input.mobile_image_url || null,
    link_url: input.link_url || null,
    sort_order: input.sort_order ?? 0,
    is_active: input.is_active ?? true,
  }]);

  if (error) return { error: error.message };
  return { error: null };
}

/** 배너 수정 */
export async function updateBanner(
  id: string,
  input: {
    title?: string;
    image_url?: string;
    mobile_image_url?: string | null;
    link_url?: string | null;
    sort_order?: number;
    is_active?: boolean;
  }
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("banners")
    .update(input)
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

/** 배너 삭제 */
export async function deleteBanner(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("banners")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

/** 배너 이미지 업로드 */
export async function uploadBannerImage(file: File): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("banner-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from("banner-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
