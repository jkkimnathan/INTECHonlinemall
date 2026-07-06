import { createClient } from "./client";

export interface TimeDeal {
  id: string;
  title: string;
  endTime: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface TimeDealItem {
  id: string;
  dealId: string;
  productId: string;
  dealPrice: number;
  dealQuantity: number;
  soldCount: number;
  createdAt: string;
}

interface TimeDealRow {
  id: string;
  title: string;
  end_time: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface TimeDealItemRow {
  id: string;
  deal_id: string;
  product_id: string;
  deal_price: number;
  deal_quantity: number;
  sold_count: number;
  created_at: string;
}

function toTimeDeal(row: TimeDealRow): TimeDeal {
  return {
    id: row.id,
    title: row.title,
    endTime: row.end_time,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function toTimeDealItem(row: TimeDealItemRow): TimeDealItem {
  return {
    id: row.id,
    dealId: row.deal_id,
    productId: row.product_id,
    dealPrice: row.deal_price,
    dealQuantity: row.deal_quantity,
    soldCount: row.sold_count,
    createdAt: row.created_at,
  };
}

/** 활성 타임딜 조회 (프론트용) - 딜 + 아이템 한번에 */
export async function getActiveTimeDeals(): Promise<
  (TimeDeal & { items: TimeDealItem[] })[]
> {
  const supabase = createClient();
  const { data: deals, error } = await supabase
    .from("time_deals")
    .select("*")
    .eq("is_active", true)
    .gte("end_time", new Date().toISOString())
    .order("sort_order", { ascending: true });

  if (error || !deals || deals.length === 0) return [];

  const dealIds = deals.map((d: TimeDealRow) => d.id);
  const { data: items } = await supabase
    .from("time_deal_items")
    .select("*")
    .in("deal_id", dealIds);

  const itemsByDeal: Record<string, TimeDealItem[]> = {};
  for (const item of (items || []) as TimeDealItemRow[]) {
    if (!itemsByDeal[item.deal_id]) itemsByDeal[item.deal_id] = [];
    itemsByDeal[item.deal_id].push(toTimeDealItem(item));
  }

  return deals.map((d: TimeDealRow) => ({
    ...toTimeDeal(d),
    items: itemsByDeal[d.id] || [],
  }));
}

/** 전체 타임딜 조회 (관리자용) */
export async function getAllTimeDeals(): Promise<
  (TimeDeal & { items: TimeDealItem[] })[]
> {
  const supabase = createClient();
  const { data: deals, error } = await supabase
    .from("time_deals")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !deals || deals.length === 0) return [];

  const dealIds = deals.map((d: TimeDealRow) => d.id);
  const { data: items } = await supabase
    .from("time_deal_items")
    .select("*")
    .in("deal_id", dealIds);

  const itemsByDeal: Record<string, TimeDealItem[]> = {};
  for (const item of (items || []) as TimeDealItemRow[]) {
    if (!itemsByDeal[item.deal_id]) itemsByDeal[item.deal_id] = [];
    itemsByDeal[item.deal_id].push(toTimeDealItem(item));
  }

  return deals.map((d: TimeDealRow) => ({
    ...toTimeDeal(d),
    items: itemsByDeal[d.id] || [],
  }));
}

/** 타임딜 생성 */
export async function createTimeDeal(input: {
  title: string;
  endTime: string;
  isActive?: boolean;
  sortOrder?: number;
}): Promise<{ data: TimeDeal | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("time_deals")
    .insert({
      title: input.title,
      end_time: input.endTime,
      is_active: input.isActive ?? true,
      sort_order: input.sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: "생성 실패" };
  return { data: toTimeDeal(data), error: null };
}

/** 타임딜 수정 */
export async function updateTimeDeal(
  id: string,
  input: {
    title?: string;
    endTime?: string;
    isActive?: boolean;
    sortOrder?: number;
  }
): Promise<boolean> {
  const supabase = createClient();
  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.endTime !== undefined) updates.end_time = input.endTime;
  if (input.isActive !== undefined) updates.is_active = input.isActive;
  if (input.sortOrder !== undefined) updates.sort_order = input.sortOrder;

  const { data, error } = await supabase.from("time_deals").update(updates).eq("id", id).select("id");
  return !error && (data?.length ?? 0) > 0;
}

/** 타임딜 삭제 (아이템도 cascade 삭제) */
export async function deleteTimeDeal(id: string): Promise<boolean> {
  const supabase = createClient();
  // 먼저 아이템 삭제
  await supabase.from("time_deal_items").delete().eq("deal_id", id);
  const { data, error } = await supabase.from("time_deals").delete().eq("id", id).select("id");
  return !error && (data?.length ?? 0) > 0;
}

/** 딜 아이템 추가 */
export async function addTimeDealItem(input: {
  dealId: string;
  productId: string;
  dealPrice: number;
  dealQuantity: number;
}): Promise<{ data: TimeDealItem | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("time_deal_items")
    .insert({
      deal_id: input.dealId,
      product_id: input.productId,
      deal_price: input.dealPrice,
      deal_quantity: input.dealQuantity,
      sold_count: 0,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: "추가 실패" };
  return { data: toTimeDealItem(data), error: null };
}

/** 딜 아이템 수정 */
export async function updateTimeDealItem(
  id: string,
  input: { dealPrice?: number; dealQuantity?: number; soldCount?: number }
): Promise<boolean> {
  const supabase = createClient();
  const updates: Record<string, unknown> = {};
  if (input.dealPrice !== undefined) updates.deal_price = input.dealPrice;
  if (input.dealQuantity !== undefined) updates.deal_quantity = input.dealQuantity;
  if (input.soldCount !== undefined) updates.sold_count = input.soldCount;

  const { data, error } = await supabase.from("time_deal_items").update(updates).eq("id", id).select("id");
  return !error && (data?.length ?? 0) > 0;
}

/** 딜 아이템 삭제 */
export async function removeTimeDealItem(id: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.from("time_deal_items").delete().eq("id", id).select("id");
  return !error && (data?.length ?? 0) > 0;
}
