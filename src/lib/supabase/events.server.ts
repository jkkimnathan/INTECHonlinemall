import { createPublicClient } from "@/lib/supabase/server-public";
import type { SiteEvent } from "./events";

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

/** 단일 이벤트 조회 (Server Component용, 쿠키 미사용 → ISR 캐싱 가능) */
export async function getEventById(id: string): Promise<SiteEvent | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toSiteEvent(data);
}
