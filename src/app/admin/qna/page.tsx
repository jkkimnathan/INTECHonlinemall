"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getQnaList, answerQna, deleteQna, QnaItem } from "@/lib/supabase/qna";
import { showToast } from "@/components/ui/toast";
import { Loader2, Trash2, Send, MessageSquare } from "lucide-react";

export default function AdminQnaPage() {
  const [items, setItems] = useState<QnaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadQna = () => {
    getQnaList().then((data) => {
      setItems(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadQna();
  }, []);

  const handleAnswer = async (id: string) => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    const ok = await answerQna(id, answerText);
    setSubmitting(false);
    if (ok) {
      showToast("답변이 등록되었습니다.");
      setAnsweringId(null);
      setAnswerText("");
      loadQna();
    } else {
      showToast("답변 등록 실패", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deleteQna(id);
    loadQna();
  };

  const unanswered = items.filter((i) => !i.isAnswered).length;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#a1a1aa]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Q&A 관리</h1>
          <p className="text-sm text-[#86868b] mt-1">
            총 {items.length}건 · 미답변{" "}
            <span className="text-red-500 font-semibold">{unanswered}</span>건
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-16 text-[#a1a1aa]">
            등록된 질문이 없습니다.
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-gray-100 text-[#3f3f46] text-xs">
                        {item.category}
                      </Badge>
                      <Badge
                        className={
                          item.isAnswered
                            ? "bg-[#ecfdf5] text-[#047857] text-xs"
                            : "bg-red-100 text-red-700 text-xs"
                        }
                      >
                        {item.isAnswered ? "답변완료" : "미답변"}
                      </Badge>
                      <span className="text-xs text-[#a1a1aa]">
                        {item.authorName} ·{" "}
                        {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <h3 className="font-medium text-[#1d1d1f]">{item.title}</h3>
                    <p className="text-sm text-[#86868b] mt-1 whitespace-pre-line">
                      {item.content}
                    </p>

                    {/* 기존 답변 */}
                    {item.answerContent && (
                      <div className="bg-[#EEF4FF] rounded-lg p-3 mt-3 text-sm">
                        <p className="font-medium text-[#1A56DB] text-xs mb-1">
                          답변 (
                          {item.answerDate
                            ? new Date(item.answerDate).toLocaleDateString(
                                "ko-KR"
                              )
                            : ""}
                          )
                        </p>
                        <p className="text-[#3f3f46] whitespace-pre-line">
                          {item.answerContent}
                        </p>
                      </div>
                    )}

                    {/* 답변 작성 폼 */}
                    {answeringId === item.id && (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="답변을 작성해주세요"
                          rows={3}
                          className="w-full border rounded-md px-3 py-2 text-sm resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAnsweringId(null);
                              setAnswerText("");
                            }}
                          >
                            취소
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#1A56DB] hover:bg-[#1747b4]"
                            disabled={submitting}
                            onClick={() => handleAnswer(item.id)}
                          >
                            {submitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-1" />
                            )}
                            답변 등록
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!item.isAnswered && answeringId !== item.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAnsweringId(item.id);
                          setAnswerText(item.answerContent || "");
                        }}
                      >
                        <MessageSquare className="h-4 w-4 text-[#1A56DB]" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
