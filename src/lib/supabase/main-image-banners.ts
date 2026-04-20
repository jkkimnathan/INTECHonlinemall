import { createClient } from "./client";

export type BannerPosition = "left-1" | "left-2" | "left-3" | "center" | "right-1" | "right-2" | "right-3";

export interface MainImageBanner {
  id: string;
  position: BannerPosition;
  imageUrl: string;
  linkUrl: string | null;
  title: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface BannerRow {
  id: string;
  position: string;
  image_url: string;
  link_url: string | null;
  title: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

function toBanner(row: BannerRow): MainImageBanner {
  return {
    id: row.id,
    position: row.position as BannerPosition,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    title: row.title,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

/** 활성 배너 조회 (프론트) */
export async function getActiveMainImageBanners(): Promise<MainImageBanner[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("main_image_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map(toBanner);
}

/** 전체 배너 조회 (관리자) */
export async function getAllMainImageBanners(): Promise<MainImageBanner[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("main_image_banners")
    .select("*")
    .order("position", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map(toBanner);
}

export async function createMainImageBanner(input: {
  position: BannerPosition;
  imageUrl: string;
  linkUrl?: string;
  title: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<MainImageBanner | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("main_image_banners")
    .insert({
      position: input.position,
      image_url: input.imageUrl,
      link_url: input.linkUrl || null,
      title: input.title,
      sort_order: input.sortOrder ?? 0,
      is_active: input.isActive ?? true,
    })
    .select()
    .single();

  if (error || !data) return null;
  return toBanner(data);
}

export async function updateMainImageBanner(
  id: string,
  input: {
    position?: BannerPosition;
    imageUrl?: string;
    linkUrl?: string | null;
    title?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
): Promise<boolean> {
  const supabase = createClient();
  const updates: Record<string, unknown> = {};
  if (input.position !== undefined) updates.position = input.position;
  if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;
  if (input.linkUrl !== undefined) updates.link_url = input.linkUrl;
  if (input.title !== undefined) updates.title = input.title;
  if (input.sortOrder !== undefined) updates.sort_order = input.sortOrder;
  if (input.isActive !== undefined) updates.is_active = input.isActive;

  const { error } = await supabase.from("main_image_banners").update(updates).eq("id", id);
  return !error;
}

export async function deleteMainImageBanner(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("main_image_banners").delete().eq("id", id);
  return !error;
}

/** 이미지 업로드 */
export async function uploadMainImageBannerImage(file: File): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `main-banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
