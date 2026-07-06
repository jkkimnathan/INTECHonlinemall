import { createClient } from "./client";
import { validateImageFile } from "@/lib/security";

export interface SiteEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  imageUrl: string | null;
  createdAt: string;
}

interface EventRow {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  image_url: string | null;
  created_at: string;
}

function toSiteEvent(row: EventRow): SiteEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  };
}

export async function getEvents(): Promise<SiteEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(toSiteEvent);
}

export async function getEventById(id: string): Promise<SiteEvent | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toSiteEvent(data);
}

export async function createEvent(input: {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: string;
  imageUrl?: string;
}): Promise<SiteEvent | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      title: input.title,
      description: input.description,
      start_date: input.startDate,
      end_date: input.endDate,
      status: input.status ?? "진행중",
      image_url: input.imageUrl ?? null,
    })
    .select()
    .single();

  if (error || !data) return null;
  return toSiteEvent(data);
}

export async function updateEvent(
  id: string,
  input: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    imageUrl?: string | null;
  }
): Promise<boolean> {
  const supabase = createClient();
  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.startDate !== undefined) updates.start_date = input.startDate;
  if (input.endDate !== undefined) updates.end_date = input.endDate;
  if (input.status !== undefined) updates.status = input.status;
  if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;

  const { error } = await supabase.from("events").update(updates).eq("id", id);
  return !error;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  return !error;
}

/** 이벤트 이미지 업로드 */
export async function uploadEventImage(file: File): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  // 래스터 이미지만 허용 (SVG/HTML 등 스크립트 실행 가능 파일 차단)
  const { ext, error: fileErr } = validateImageFile(file);
  if (fileErr) return { url: null, error: fileErr };
  const path = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
