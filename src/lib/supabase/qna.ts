import { createClient } from "./client";

export interface QnaItem {
  id: string;
  authorName: string;
  category: string;
  title: string;
  /** 비밀글은 잠금 해제 전까지 null (서버에서 제거되어 내려옴) */
  content: string | null;
  isAnswered: boolean;
  answerContent: string | null;
  answerDate: string | null;
  isSecret: boolean;
  /** 현재 로그인 사용자가 작성자인지 (서버 판정) */
  isMine: boolean;
  createdAt: string;
}

interface QnaRpcRow {
  id: string;
  author_name: string;
  category: string;
  title: string;
  content: string | null;
  is_answered: boolean;
  answer_content: string | null;
  answer_date: string | null;
  is_secret: boolean;
  created_at: string;
  is_mine: boolean;
}

function toQnaItem(row: QnaRpcRow): QnaItem {
  return {
    id: String(row.id),
    authorName: row.author_name,
    category: row.category,
    title: row.title,
    content: row.content,
    isAnswered: row.is_answered,
    answerContent: row.answer_content,
    answerDate: row.answer_date,
    isSecret: row.is_secret ?? false,
    isMine: row.is_mine ?? false,
    createdAt: row.created_at,
  };
}

/** 목록 조회 — 서버 RPC가 비밀글의 본문/답변을 제거하고 반환 (비밀번호는 절대 내려오지 않음) */
export async function getQnaList(): Promise<QnaItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("qna_list");

  if (error || !data) return [];
  return (data as QnaRpcRow[]).map(toQnaItem);
}

/** 작성 — 서버 RPC가 비밀번호를 bcrypt 해시로 저장 */
export async function createQna(input: {
  authorName: string;
  category: string;
  title: string;
  content: string;
  isSecret?: boolean;
  password?: string;
}): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.rpc("qna_create", {
    p_author_name: input.authorName,
    p_category: input.category,
    p_title: input.title,
    p_content: input.content,
    p_is_secret: input.isSecret ?? false,
    p_password: input.password || null,
  });
  return !error;
}

export type UnlockResult =
  | { status: "ok"; content: string; answerContent: string | null }
  | { status: "wrong" }
  | { status: "locked"; retryAfter: number };

/** 비밀글 열람 — 서버에서 비밀번호 검증 + 시도 횟수 제한 후에만 본문 반환 */
export async function unlockQna(id: string, password: string): Promise<UnlockResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("qna_unlock", {
    p_id: id,
    p_password: password,
  });

  if (error || !data) return { status: "wrong" };
  const row = data as {
    ok: boolean;
    code?: string;
    retry_after?: number;
    content?: string;
    answer_content?: string | null;
  };

  if (row.ok) {
    return { status: "ok", content: row.content ?? "", answerContent: row.answer_content ?? null };
  }
  if (row.code === "LOCKED") {
    return { status: "locked", retryAfter: row.retry_after ?? 600 };
  }
  return { status: "wrong" };
}

export async function answerQna(
  id: string,
  answerContent: string
): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("qna")
    .update({
      is_answered: true,
      answer_content: answerContent,
      answer_date: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id");
  return !error && (data?.length ?? 0) > 0;
}

export async function deleteQna(id: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.from("qna").delete().eq("id", id).select("id");
  return !error && (data?.length ?? 0) > 0;
}
