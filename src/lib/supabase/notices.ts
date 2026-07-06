import { createClient } from "./client";
import { getSafeImageExtension } from "@/lib/security";

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  imageUrl: string | null;
  createdAt: string;
}

interface NoticeRow {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  image_url: string | null;
  created_at: string;
}

function toNotice(row: NoticeRow): Notice {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    isPinned: row.is_pinned,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  };
}

export async function getNotices(): Promise<Notice[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];
  return data.map(toNotice);
}

export async function getNoticeById(id: string): Promise<Notice | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toNotice(data);
}

export async function createNotice(input: {
  title: string;
  content: string;
  category: string;
  isPinned?: boolean;
  imageUrl?: string | null;
}): Promise<Notice | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notices")
    .insert({
      title: input.title,
      content: input.content,
      category: input.category,
      is_pinned: input.isPinned ?? false,
      image_url: input.imageUrl || null,
    })
    .select()
    .single();

  if (error || !data) return null;
  return toNotice(data);
}

export async function updateNotice(
  id: string,
  input: { title?: string; content?: string; category?: string; isPinned?: boolean; imageUrl?: string | null }
): Promise<boolean> {
  const supabase = createClient();
  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.content !== undefined) updates.content = input.content;
  if (input.category !== undefined) updates.category = input.category;
  if (input.isPinned !== undefined) updates.is_pinned = input.isPinned;
  if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;

  const { data, error } = await supabase.from("notices").update(updates).eq("id", id).select("id");
  return !error && (data?.length ?? 0) > 0;
}

export async function deleteNotice(id: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.from("notices").delete().eq("id", id).select("id");
  return !error && (data?.length ?? 0) > 0;
}

/** 공지 이미지 업로드 */
export async function uploadNoticeImage(file: File): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  const ext = getSafeImageExtension(file.name);
  if (!ext) return { url: null, error: "지원하지 않는 이미지 형식입니다." };
  const path = `notices/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
