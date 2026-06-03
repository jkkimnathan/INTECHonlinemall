"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllOrders, updateOrderStatus } from "@/lib/supabase/orders";
import { Order, OrderStatus } from "@/types/order";
import { Eye, Package, Loader2 } from "lucide-react";
import { showToast } from "@/components/ui/toast";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

const statusColors: Record<string, string> = {
  결제완료: "bg-blue-100 text-[#1A56DB]",
  배송준비: "bg-yellow-100 text-yellow-700",
  배송중: "bg-[#fff7ed] text-[#c2410c]",
  배송완료: "bg-[#ecfdf5] text-[#047857]",
  취소: "bg-red-100 text-red-700",
  "교환/반품": "bg-gray-100 text-[#3f3f46]",
};

const statusOptions: OrderStatus[] = [
  "결제완료",
  "배송준비",
  "배송중",
  "배송완료",
  "취소",
  "교환/반품",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("전체");

  useEffect(() => {
    getAllOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const { error } = await updateOrderStatus(orderId, status);
    if (error) {
      showToast(`상태 변경 실패: ${error}`, "error");
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const filtered =
    filter === "전체"
      ? orders
      : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#a1a1aa]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">주문 관리</h1>

      {/* 필터 */}
      <div className="flex gap-2 flex-wrap mb-4">
        <Button
          variant={filter === "전체" ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => setFilter("전체")}
        >
          전체 ({orders.length})
        </Button>
        {statusOptions.map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          return (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setFilter(status)}
            >
              {status} ({count})
            </Button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[#86868b]">
            {filter === "전체"
              ? "아직 주문이 없습니다. 쇼핑몰에서 테스트 주문을 해보세요."
              : `'${filter}' 상태의 주문이 없습니다.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-[#86868b]">
                    주문번호
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[#86868b] hidden md:table-cell">
                    상품
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-[#86868b]">
                    결제금액
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-[#86868b]">
                    상태
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-[#86868b] hidden sm:table-cell">
                    날짜
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-[#86868b]">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs">{order.id}</p>
                      <p className="text-xs text-[#a1a1aa]">
                        {order.shipping.name}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-[#1d1d1f] truncate max-w-[200px]">
                        {order.items[0]?.product.name}
                        {order.items.length > 1 &&
                          ` 외 ${order.items.length - 1}건`}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as OrderStatus
                          )
                        }
                        className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${statusColors[order.status]}`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-xs text-[#86868b]">
                      {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/order/${order.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-3.5 w-3.5 text-[#a1a1aa]" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-[#86868b]">
            총 {filtered.length}건
          </div>
        </div>
      )}
    </div>
  );
}
