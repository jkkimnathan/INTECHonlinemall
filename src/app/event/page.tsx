import { getPageBannerServer } from "@/lib/supabase/page-banners.server";
import EventClient from "./EventClient";

// 배너를 서버에서 함께 렌더 (페이지와 동시에 표시) + ISR 캐싱
export const revalidate = 120;

export default async function EventPage() {
  const banner = await getPageBannerServer("event");
  return <EventClient banner={banner} />;
}
