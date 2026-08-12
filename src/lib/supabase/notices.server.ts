import { createPublicClient } from "@/lib/supabase/server-public";
import type { Notice } from "./notices";

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

/** 단일 공지 조회 (Server Component용, 쿠키 미사용 → ISR 캐싱 가능) */
export async function getNoticeById(id: string): Promise<Notice | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toNotice(data);
}
