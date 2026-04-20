/**
 * 홈페이지 데이터를 서버에서 병렬로 프리페칭
 * 클라이언트 워터폴을 제거하여 로딩 속도 개선
 */
import { createClient } from "@/lib/supabase/server";
import { Banner } from "./banners";
import { MainImageBanner, BannerPosition } from "./main-image-banners";
import { TimeDeal, TimeDealItem } from "./timedeals";
import { toProduct } from "./product-utils";
import { Product } from "@/types/product";

// 공지/이벤트 - 티커에서 필요한 최소 필드만
interface TickerNotice { id: string; title: string; }
interface TickerEvent { id: string; title: string; }

interface HomePageData {
  banners: Banner[];
  mainImageBanners: MainImageBanner[];
  timeDeals: (TimeDeal & { items: TimeDealItem[] })[];
  timeDealProducts: Product[];
  notices: TickerNotice[];
  events: TickerEvent[];
}

export async function getHomePageData(): Promise<HomePageData> {
  const supabase = await createClient();

  // 모든 데이터를 병렬로 가져오기
  const [
    bannersResult,
    mainBannersResult,
    timeDealsResult,
    noticesResult,
    eventsResult,
  ] = await Promise.all([
    supabase
      .from("banners")
      .select("id, title, image_url, mobile_image_url, link_url, sort_order, is_active, created_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("main_image_banners")
      .select("id, position, image_url, link_url, title, sort_order, is_active, created_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("time_deals")
      .select("id, title, end_time, is_active, sort_order, created_at")
      .eq("is_active", true)
      .gte("end_time", new Date().toISOString())
      .order("sort_order", { ascending: true }),
    supabase
      .from("notices")
      .select("id, title")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("events")
      .select("id, title")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const banners: Banner[] = (bannersResult.data || []).map((row) => ({
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    mobileImageUrl: row.mobile_image_url,
    linkUrl: row.link_url,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));

  const mainImageBanners: MainImageBanner[] = (mainBannersResult.data || []).map((row) => ({
    id: row.id,
    position: row.position as BannerPosition,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    title: row.title,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));

  // 타임딜 아이템 + 상품 가져오기
  const deals = timeDealsResult.data || [];
  let timeDealItems: TimeDealItem[] = [];
  let timeDealProducts: Product[] = [];

  if (deals.length > 0) {
    const dealIds = deals.map((d) => d.id);
    const itemsResult = await supabase
      .from("time_deal_items")
      .select("id, deal_id, product_id, deal_price, deal_quantity, sold_count, created_at")
      .in("deal_id", dealIds);

    timeDealItems = (itemsResult.data || []).map((row) => ({
      id: row.id,
      dealId: row.deal_id,
      productId: row.product_id,
      dealPrice: row.deal_price,
      dealQuantity: row.deal_quantity,
      soldCount: row.sold_count,
      createdAt: row.created_at,
    }));

    const productIds = [...new Set(timeDealItems.map((i) => i.productId))];
    if (productIds.length > 0) {
      const prodsResult = await supabase
        .from("products")
        .select("id, name, slug, brand, category, price, sale_price, images, stock, is_featured")
        .in("id", productIds);
      timeDealProducts = (prodsResult.data || []).map(toProduct);
    }
  }

  const timeDeals: (TimeDeal & { items: TimeDealItem[] })[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    endTime: d.end_time,
    isActive: d.is_active,
    sortOrder: d.sort_order,
    createdAt: d.created_at,
    items: timeDealItems.filter((i) => i.dealId === d.id),
  }));

  const notices: TickerNotice[] = (noticesResult.data || []).map((row) => ({
    id: row.id,
    title: row.title,
  }));

  const events: TickerEvent[] = (eventsResult.data || []).map((row) => ({
    id: row.id,
    title: row.title,
  }));

  return {
    banners,
    mainImageBanners,
    timeDeals,
    timeDealProducts,
    notices,
    events,
  };
}
