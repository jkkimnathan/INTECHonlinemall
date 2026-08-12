import type { Metadata } from "next";
import { getPageBannerServer } from "@/lib/supabase/page-banners.server";
import NoticeClient from "./NoticeClient";

export const metadata: Metadata = {
  title: "공지사항",
  description: "인텍앤컴퍼니 공식몰의 공지사항과 안내를 확인하세요.",
  alternates: { canonical: "/notice" },
};

// 배너를 서버에서 함께 렌더 (페이지와 동시에 표시) + ISR 캐싱
export const revalidate = 120;

export default async function NoticePage() {
  const banner = await getPageBannerServer("notice");
  return <NoticeClient banner={banner} />;
}
