import { getPageBannerServer } from "@/lib/supabase/page-banners.server";
import CommunityClient from "./CommunityClient";

// 배너를 서버에서 함께 렌더 (페이지와 동시에 표시) + ISR 캐싱
export const revalidate = 120;

export default async function CommunityPage() {
  const banner = await getPageBannerServer("community");
  return <CommunityClient banner={banner} />;
}
