import { createClient } from "./client";

export interface QnaItem {
  id: string;
  userId: string | null;
  authorName: string;
  category: string;
  title: string;
  content: string;
  isAnswered: boolean;
  answerContent: string | null;
  answerDate: string | null;
  isSecret: boolean;
  password: string | null;
  createdAt: string;
}

interface QnaRow {
  id: string;
  user_id: string | null;
  author_name: string;
  category: string;
  title: string;
  content: string;
  is_answered: boolean;
  answer_content: string | null;
  answer_date: string | null;
  is_secret: boolean | null;
  password: string | null;
  created_at: string;
}

function toQnaItem(row: QnaRow): QnaItem {
  return {
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    category: row.category,
    title: row.title,
    content: row.content,
    isAnswered: row.is_answered,
    answerContent: row.answer_content,
    answerDate: row.answer_date,
    isSecret: row.is_secret ?? false,
    password: row.password ?? null,
    createdAt: row.created_at,
  };
}

export async function getQnaList(): Promise<QnaItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("qna")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(toQnaItem);
}

export async function createQna(input: {
  userId: string;
  authorName: string;
  category: string;
  title: string;
  content: string;
  isSecret?: boolean;
  password?: string;
}): Promise<QnaItem | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("qna")
    .insert({
      user_id: input.userId,
      author_name: input.authorName,
      category: input.category,
      title: input.title,
      content: input.content,
      is_secret: input.isSecret ?? false,
      password: input.password || null,
    })
    .select()
    .single();

  if (error || !data) return null;
  return toQnaItem(data);
}

export async function answerQna(
  id: string,
  answerContent: string
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("qna")
    .update({
      is_answered: true,
      answer_content: answerContent,
      answer_date: new Date().toISOString(),
    })
    .eq("id", id);
  return !error;
}

export async function deleteQna(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("qna").delete().eq("id", id);
  return !error;
}
