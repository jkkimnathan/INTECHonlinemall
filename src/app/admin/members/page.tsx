"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Crown } from "lucide-react";

// 임시 회원 데이터
const dummyMembers = [
  { id: "u1", name: "홍길동", email: "hong@test.com", phone: "010-1234-5678", grade: "VIP", points: 45000, orders: 12, joinDate: "2024-06-15" },
  { id: "u2", name: "김영희", email: "kim@test.com", phone: "010-2345-6789", grade: "골드", points: 23000, orders: 8, joinDate: "2024-09-20" },
  { id: "u3", name: "이철수", email: "lee@test.com", phone: "010-3456-7890", grade: "실버", points: 12000, orders: 4, joinDate: "2025-01-10" },
  { id: "u4", name: "박민수", email: "park@test.com", phone: "010-4567-8901", grade: "일반", points: 3000, orders: 1, joinDate: "2025-02-28" },
  { id: "u5", name: "최지은", email: "choi@test.com", phone: "010-5678-9012", grade: "실버", points: 8500, orders: 3, joinDate: "2025-01-25" },
  { id: "u6", name: "정수현", email: "jung@test.com", phone: "010-6789-0123", grade: "일반", points: 1000, orders: 1, joinDate: "2025-03-01" },
];

const gradeColors: Record<string, string> = {
  일반: "bg-gray-100 text-gray-700",
  실버: "bg-gray-200 text-gray-800",
  골드: "bg-yellow-100 text-yellow-800",
  VIP: "bg-purple-100 text-purple-800",
};

export default function AdminMembersPage() {
  const [search, setSearch] = useState("");
  const members = dummyMembers.filter(
    (m) =>
      m.name.includes(search) ||
      m.email.includes(search) ||
      m.phone.includes(search)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">회원 관리</h1>

      {/* 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{dummyMembers.length}</p>
          <p className="text-xs text-gray-500">전체 회원</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {dummyMembers.filter((m) => m.grade === "VIP").length}
          </p>
          <p className="text-xs text-gray-500">VIP</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {dummyMembers.filter((m) => m.grade === "골드").length}
          </p>
          <p className="text-xs text-gray-500">골드</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {dummyMembers.filter((m) => m.joinDate >= "2025-03-01").length}
          </p>
          <p className="text-xs text-gray-500">이번 달 신규</p>
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
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">회원</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">연락처</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">등급</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">적립금</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">주문수</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">가입일</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                    {member.phone}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={gradeColors[member.grade]}>
                      <Crown className="h-3 w-3 mr-1" />
                      {member.grade}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    {member.points.toLocaleString()}P
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    {member.orders}건
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-500">
                    {member.joinDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
          총 {members.length}명
        </div>
      </div>
    </div>
  );
}
