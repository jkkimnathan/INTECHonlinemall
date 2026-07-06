"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Crown, Loader2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  points: number;
  createdAt: string;
}

const gradeColors: Record<string, string> = {
  일반: "bg-gray-100 text-[#3f3f46]",
  실버: "bg-gray-200 text-[#1d1d1f]",
  골드: "bg-yellow-100 text-yellow-800",
  VIP: "bg-purple-100 text-purple-800",
};

export default function AdminMembersPage() {
  const [search, setSearch] = useState("");
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setAllMembers(
            data.map((p) => ({
              id: p.id as string,
              name: (p.name as string) || "",
              email: (p.email as string) || "",
              phone: (p.phone as string) || "",
              grade: (p.grade as string) || "일반",
              points: (p.points as number) || 0,
              createdAt: (p.created_at as string) || "",
            }))
          );
        }
        setLoading(false);
      });
  }, []);

  const keyword = search.toLowerCase();
  const members = allMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(keyword) ||
      m.email.toLowerCase().includes(keyword) ||
      m.phone.includes(search)
  );

  const now = new Date();
  const newThisMonth = allMembers.filter((m) => {
    if (!m.createdAt) return false;
    const d = new Date(m.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#a1a1aa]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">회원 관리</h1>

      {/* 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-[#1d1d1f]">{allMembers.length}</p>
          <p className="text-xs text-[#86868b]">전체 회원</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {allMembers.filter((m) => m.grade === "VIP").length}
          </p>
          <p className="text-xs text-[#86868b]">VIP</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {allMembers.filter((m) => m.grade === "골드").length}
          </p>
          <p className="text-xs text-[#86868b]">골드</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {newThisMonth}
          </p>
          <p className="text-xs text-[#86868b]">이번 달 신규</p>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative max-w-sm mb-4">
        <Input
          placeholder="이름, 이메일, 연락처 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
      </div>

      {/* 테이블 */}
      {members.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[#86868b]">
            {search ? "검색 결과가 없습니다." : "아직 가입한 회원이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-[#86868b]">회원</th>
                  <th className="text-left px-4 py-3 font-medium text-[#86868b] hidden md:table-cell">연락처</th>
                  <th className="text-center px-4 py-3 font-medium text-[#86868b]">등급</th>
                  <th className="text-right px-4 py-3 font-medium text-[#86868b] hidden sm:table-cell">적립금</th>
                  <th className="text-center px-4 py-3 font-medium text-[#86868b] hidden lg:table-cell">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1d1d1f]">{member.name || "(이름 없음)"}</p>
                      <p className="text-xs text-[#a1a1aa]">{member.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-[#3f3f46]">
                      {member.phone || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={gradeColors[member.grade] || gradeColors["일반"]}>
                        <Crown className="h-3 w-3 mr-1" />
                        {member.grade}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      {member.points.toLocaleString()}P
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell text-[#86868b]">
                      {member.createdAt
                        ? new Date(member.createdAt).toLocaleDateString("ko-KR")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-[#86868b]">
            총 {members.length}명
          </div>
        </div>
      )}
    </div>
  );
}
