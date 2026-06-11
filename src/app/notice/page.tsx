import { getPageBannerServer } from "@/lib/supabase/page-banners.server";
import NoticeClient from "./NoticeClient";

// 배너를 서버에서 함께 렌더 (페이지와 동시에 표시) + ISR 캐싱
export const revalidate = 120;

export default async function NoticePage() {
  const banner = await getPageBannerServer("notice");
  return <NoticeClient banner={banner} />;
}
