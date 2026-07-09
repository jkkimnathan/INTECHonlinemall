"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getAllTimeDeals,
  createTimeDeal,
  updateTimeDeal,
  deleteTimeDeal,
  addTimeDealItem,
  removeTimeDealItem,
  TimeDeal,
  TimeDealItem,
} from "@/lib/supabase/timedeals";
import { getProducts } from "@/lib/supabase/products";
import { Product } from "@/types/product";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Zap,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";

type DealWithItems = TimeDeal & { items: TimeDealItem[] };

export default function AdminTimeDealsPage() {
  const [deals, setDeals] = useState<DealWithItems[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Deal form
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [dealTitle, setDealTitle] = useState("");
  const [dealEndTime, setDealEndTime] = useState("");
  const [dealSortOrder, setDealSortOrder] = useState("0");
  const [dealIsActive, setDealIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Item form
  const [showItemFormFor, setShowItemFormFor] = useState<string | null>(null);
  const [itemProductId, setItemProductId] = useState("");
  const [itemDealPrice, setItemDealPrice] = useState("");
  const [itemDealQuantity, setItemDealQuantity] = useState("");

  // Expanded deals
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const loadData = async () => {
    const [dealData, productData] = await Promise.all([
      getAllTimeDeals(),
      getProducts(),
    ]);
    setDeals(dealData);
    setProducts(productData);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    Promise.all([getAllTimeDeals(), getProducts()]).then(([dealData, productData]) => {
      if (!alive) return;
      setDeals(dealData);
      setProducts(productData);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const resetDealForm = () => {
    setDealTitle("");
    setDealEndTime("");
    setDealSortOrder("0");
    setDealIsActive(true);
    setEditingDealId(null);
    setShowDealForm(false);
    setError("");
  };

  const resetItemForm = () => {
    setItemProductId("");
    setItemDealPrice("");
    setItemDealQuantity("");
    setShowItemFormFor(null);
    setError("");
  };

  const startEditDeal = (deal: DealWithItems) => {
    setDealTitle(deal.title);
    const dt = new Date(deal.endTime);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setDealEndTime(local);
    setDealSortOrder(String(deal.sortOrder));
    setDealIsActive(deal.isActive);
    setEditingDealId(deal.id);
    setShowDealForm(true);
    setError("");
  };

  const handleDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!dealTitle.trim() || !dealEndTime) return;
    setSubmitting(true);

    const endTimeISO = new Date(dealEndTime).toISOString();

    if (editingDealId) {
      const ok = await updateTimeDeal(editingDealId, {
        title: dealTitle.trim(),
        endTime: endTimeISO,
        isActive: dealIsActive,
        sortOrder: Number(dealSortOrder),
      });
      if (!ok) {
        setError("수정 실패. 권한을 확인해주세요.");
        setSubmitting(false);
        return;
      }
    } else {
      const result = await createTimeDeal({
        title: dealTitle.trim(),
        endTime: endTimeISO,
        isActive: dealIsActive,
        sortOrder: Number(dealSortOrder),
      });
      if (result.error) {
        setError(`등록 실패: ${result.error}`);
        setSubmitting(false);
        return;
      }
    }

    resetDealForm();
    setSubmitting(false);
    loadData();
  };

  const handleDeleteDeal = async (id: string) => {
    if (!confirm("이 타임딜과 포함된 모든 상품이 삭제됩니다. 계속하시겠습니까?")) return;
    await deleteTimeDeal(id);
    loadData();
  };

  const handleToggleDeal = async (deal: DealWithItems) => {
    await updateTimeDeal(deal.id, { isActive: !deal.isActive });
    loadData();
  };

  const handleAddItem = async (dealId: string) => {
    setError("");
    if (!itemProductId || !itemDealPrice || !itemDealQuantity) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    const product = products.find((p) => p.id === itemProductId);
    if (!product) return;

    if (Number(itemDealQuantity) > product.stock) {
      setError(`타임딜 수량(${itemDealQuantity})이 재고(${product.stock})보다 많습니다.`);
      return;
    }

    setSubmitting(true);
    const result = await addTimeDealItem({
      dealId,
      productId: itemProductId,
      dealPrice: Number(itemDealPrice),
      dealQuantity: Number(itemDealQuantity),
    });
    setSubmitting(false);

    if (result.error) {
      setError(`추가 실패: ${result.error}`);
      return;
    }

    resetItemForm();
    loadData();
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm("이 상품을 타임딜에서 제거하시겠습니까?")) return;
    await removeTimeDealItem(itemId);
    loadData();
  };

  const getProduct = (pid: string) => products.find((p) => p.id === pid);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 선택한 상품 정보로 자동 할인율 계산
  const selectedProduct = products.find((p) => p.id === itemProductId);
  const currentPrice = selectedProduct
    ? selectedProduct.salePrice || selectedProduct.price
    : 0;
  const dealDiscount =
    currentPrice && itemDealPrice
      ? Math.round(((currentPrice - Number(itemDealPrice)) / currentPrice) * 100)
      : 0;

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
          <h1 className="text-2xl font-bold text-[#1d1d1f]">타임딜 관리</h1>
          <p className="text-sm text-[#86868b] mt-1">총 {deals.length}건</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => {
            resetDealForm();
            setShowDealForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          타임딜 생성
        </Button>
      </div>

      {/* 딜 생성/수정 폼 */}
      {showDealForm && (
        <form
          onSubmit={handleDealSubmit}
          className="bg-white rounded-xl border p-6 mb-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1d1d1f]">
              {editingDealId ? "타임딜 수정" : "새 타임딜"}
            </h2>
            <button type="button" onClick={resetDealForm}>
              <X className="h-5 w-5 text-[#a1a1aa]" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3f3f46] mb-1">
              타임딜명 <span className="text-red-500">*</span>
            </label>
            <Input
              value={dealTitle}
              onChange={(e) => setDealTitle(e.target.value)}
              placeholder="예: 주말 특가 타임딜"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                종료 시간 <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                value={dealEndTime}
                onChange={(e) => setDealEndTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3f3f46] mb-1">
                정렬 순서
              </label>
              <Input
                type="number"
                value={dealSortOrder}
                onChange={(e) => setDealSortOrder(e.target.value)}
                min={0}
              />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <button
                type="button"
                onClick={() => setDealIsActive(!dealIsActive)}
              >
                {dealIsActive ? (
                  <ToggleRight className="h-6 w-6 text-green-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-[#a1a1aa]" />
                )}
              </button>
              <span className="text-sm text-[#3f3f46]">
                {dealIsActive ? "활성" : "비활성"}
              </span>
            </div>
          </div>

          {error && showDealForm && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetDealForm}>
              취소
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingDealId ? "수정" : "생성"}
            </Button>
          </div>
        </form>
      )}

      {/* 딜 목록 */}
      {deals.length === 0 ? (
        <div className="bg-white rounded-xl border text-center py-16 text-[#a1a1aa]">
          등록된 타임딜이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => {
            const isExpired = new Date(deal.endTime) < new Date();
            const endDate = new Date(deal.endTime);
            const isOpen = expanded.has(deal.id);

            return (
              <div
                key={deal.id}
                className={`bg-white rounded-xl border overflow-hidden ${isExpired ? "opacity-60" : ""}`}
              >
                {/* 딜 헤더 */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <button
                    onClick={() => toggleExpand(deal.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className={
                            isExpired
                              ? "bg-gray-100 text-[#86868b]"
                              : deal.isActive
                              ? "bg-[#ecfdf5] text-[#047857]"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {isExpired ? "만료" : deal.isActive ? "활성" : "비활성"}
                        </Badge>
                        <span className="text-xs text-[#a1a1aa]">
                          ~{endDate.toLocaleString("ko-KR")}
                        </span>
                        <Badge className="bg-[#EEF4FF] text-[#1A56DB]">
                          {deal.items.length}개 상품
                        </Badge>
                      </div>
                      <p className="font-semibold text-[#1d1d1f] truncate">
                        {deal.title}
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-[#a1a1aa]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#a1a1aa]" />
                    )}
                  </button>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleDeal(deal)}
                    >
                      {deal.isActive ? (
                        <ToggleRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-[#a1a1aa]" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditDeal(deal)}
                    >
                      <Pencil className="h-4 w-4 text-[#a1a1aa]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDeal(deal.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* 딜 아이템 (펼침) */}
                {isOpen && (
                  <div className="border-t bg-gray-50">
                    {deal.items.length > 0 && (
                      <div className="divide-y">
                        {deal.items.map((item) => {
                          const p = getProduct(item.productId);
                          if (!p) return null;
                          const basePrice = p.salePrice || p.price;
                          const discount = Math.round(
                            ((basePrice - item.dealPrice) / basePrice) * 100
                          );
                          const isSoldOut = item.soldCount >= item.dealQuantity;

                          return (
                            <div
                              key={item.id}
                              className="px-4 py-3 flex items-center gap-4"
                            >
                              <Package className="h-4 w-4 text-[#a1a1aa] flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#1d1d1f] truncate">
                                  [{p.brand}] {p.name}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-[#86868b]">
                                  <span>
                                    {basePrice.toLocaleString()}원 →{" "}
                                    <span className="text-red-600 font-semibold">
                                      {item.dealPrice.toLocaleString()}원
                                    </span>{" "}
                                    ({discount}% 추가할인)
                                  </span>
                                  <span>
                                    수량: {item.soldCount}/{item.dealQuantity}
                                  </span>
                                  {isSoldOut && (
                                    <Badge className="bg-gray-800 text-white text-[10px]">
                                      완판
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 아이템 추가 버튼 / 폼 */}
                    {showItemFormFor === deal.id ? (
                      <div className="p-4 border-t space-y-3">
                        <h3 className="text-sm font-semibold text-[#3f3f46]">
                          상품 추가
                        </h3>
                        <div>
                          <label className="block text-xs font-medium text-[#3f3f46] mb-1">
                            상품 선택
                          </label>
                          <select
                            value={itemProductId}
                            onChange={(e) => {
                              setItemProductId(e.target.value);
                              setItemDealPrice("");
                            }}
                            className="w-full h-9 border rounded-md px-3 text-sm"
                          >
                            <option value="">상품을 선택하세요</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.brand}] {p.name} — {(p.salePrice || p.price).toLocaleString()}원 (재고: {p.stock})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#3f3f46] mb-1">
                              타임딜 최종가 (원) *
                            </label>
                            <Input
                              type="number"
                              value={itemDealPrice}
                              onChange={(e) => setItemDealPrice(e.target.value)}
                              placeholder={
                                currentPrice
                                  ? `현재가: ${currentPrice.toLocaleString()}`
                                  : "0"
                              }
                              min={0}
                            />
                            {dealDiscount > 0 && (
                              <p className="text-xs text-red-500 mt-1">
                                추가 {dealDiscount}% 할인
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#3f3f46] mb-1">
                              타임딜 수량 *
                            </label>
                            <Input
                              type="number"
                              value={itemDealQuantity}
                              onChange={(e) =>
                                setItemDealQuantity(e.target.value)
                              }
                              placeholder={
                                selectedProduct
                                  ? `재고: ${selectedProduct.stock}`
                                  : "0"
                              }
                              min={1}
                              max={selectedProduct?.stock || undefined}
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={submitting}
                              onClick={() => handleAddItem(deal.id)}
                            >
                              {submitting && (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              )}
                              추가
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={resetItemForm}
                            >
                              취소
                            </Button>
                          </div>
                        </div>

                        {error && showItemFormFor === deal.id && (
                          <p className="text-sm text-red-500">{error}</p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-[#86868b]"
                          onClick={() => {
                            resetItemForm();
                            setShowItemFormFor(deal.id);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          상품 추가
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
