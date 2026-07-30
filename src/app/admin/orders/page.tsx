"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderStatus, PaymentStatus } from "@/types/order";
import { Eye, Package, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { showToast } from "@/components/ui/toast";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

interface OrderSummary {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: string;
  customerName: string;
  firstItemName: string;
  itemCount: number;
}

const statusColors: Record<string, string> = {
  결제대기: "bg-gray-100 text-[#86868b]",
  결제완료: "bg-blue-100 text-[#1A56DB]",
  배송준비: "bg-yellow-100 text-yellow-700",
  배송중: "bg-[#fff7ed] text-[#c2410c]",
  배송완료: "bg-[#ecfdf5] text-[#047857]",
  취소처리중: "bg-orange-100 text-orange-700",
  취소: "bg-red-100 text-red-700",
  환불확인필요: "bg-red-100 text-red-700 font-bold",
  만료: "bg-gray-100 text-[#a1a1aa]",
  "교환/반품": "bg-gray-100 text-[#3f3f46]",
};

/** 배송 상태 변경 select에서 고를 수 있는 값 (결제/취소는 전용 버튼) */
const shippingStatusOptions: OrderStatus[] = ["배송준비", "배송중", "배송완료", "교환/반품"];

const filterTabs: (OrderStatus | "전체")[] = [
  "전체", "결제완료", "배송준비", "배송중", "배송완료",
  "취소처리중", "환불확인필요", "취소", "결제대기", "만료", "교환/반품",
];

const PAGE_SIZE = 20;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "전체">("전체");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (filter !== "전체") params.set("status", filter);
      const res = await fetch(`/api/admin/orders/list?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "주문 목록을 불러오지 못했습니다.", "error");
        return;
      }
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      showToast("주문 목록을 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleShippingStatusChange = async (orderId: string, status: OrderStatus) => {
    setBusyOrderId(orderId);
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "상태 변경에 실패했습니다.", "error");
        return;
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      showToast("상태가 변경되었습니다.", "success");
    } catch {
      showToast("상태 변경에 실패했습니다.", "error");
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleCancel = async (order: OrderSummary) => {
    const confirmed = window.confirm(
      `주문 ${order.id.slice(0, 12)}…을(를) 취소할까요?\n` +
      `결제된 주문은 토스페이먼츠 결제 취소(환불)까지 함께 진행됩니다.`
    );
    if (!confirmed) return;

    setBusyOrderId(order.id);
    try {
      const res = await fetch("/api/admin/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, reason: "관리자 취소" }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "취소에 실패했습니다.", "error");
        fetchOrders(); // 환불확인필요 등 상태 반영
        return;
      }
      showToast("주문이 취소되었습니다. (결제 환불 확인 완료)", "success");
      fetchOrders();
    } catch {
      showToast("취소 요청에 실패했습니다.", "error");
    } finally {
      setBusyOrderId(null);
    }
  };

  const changeFilter = (f: OrderStatus | "전체") => {
    setFilter(f);
    setPage(1);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">주문 관리</h1>

      {/* 필터 */}
      <div className="flex gap-2 flex-wrap mb-4">
        {filterTabs.map((tab) => (
          <Button
            key={tab}
            variant={filter === tab ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => changeFilter(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#a1a1aa]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[#86868b]">
            {filter === "전체"
              ? "아직 주문이 없습니다."
              : `'${filter}' 상태의 주문이 없습니다.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-[#86868b]">주문번호</th>
                  <th className="text-left px-4 py-3 font-medium text-[#86868b] hidden md:table-cell">상품</th>
                  <th className="text-right px-4 py-3 font-medium text-[#86868b]">결제금액</th>
                  <th className="text-center px-4 py-3 font-medium text-[#86868b]">상태</th>
                  <th className="text-center px-4 py-3 font-medium text-[#86868b] hidden sm:table-cell">날짜</th>
                  <th className="text-center px-4 py-3 font-medium text-[#86868b]">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => {
                  const canShip = ["결제완료", "배송준비", "배송중", "배송완료"].includes(order.status);
                  const canCancel = ["결제대기", "결제완료", "배송준비", "환불확인필요"].includes(order.status);
                  const busy = busyOrderId === order.id;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs">{order.id}</p>
                        <p className="text-xs text-[#a1a1aa]">{order.customerName}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-[#1d1d1f] truncate max-w-[200px]">
                          {order.firstItemName}
                          {order.itemCount > 1 && ` 외 ${order.itemCount - 1}건`}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
                            {order.status}
                          </span>
                          {canShip && (
                            <select
                              value={shippingStatusOptions.includes(order.status) ? order.status : ""}
                              disabled={busy}
                              onChange={(e) =>
                                e.target.value &&
                                handleShippingStatusChange(order.id, e.target.value as OrderStatus)
                              }
                              className="text-xs px-1 py-0.5 rounded border text-[#86868b]"
                            >
                              <option value="" disabled>배송 상태 변경</option>
                              {shippingStatusOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell text-xs text-[#86868b]">
                        {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/order/${order.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-3.5 w-3.5 text-[#a1a1aa]" />
                            </Button>
                          </Link>
                          {canCancel && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                              disabled={busy}
                              onClick={() => handleCancel(order)}
                            >
                              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "취소"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between text-sm text-[#86868b]">
            <span>총 {total}건</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="tabular-nums">{page} / {totalPages}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
