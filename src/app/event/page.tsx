import type { Metadata } from "next";
import { getPageBannerServer } from "@/lib/supabase/page-banners.server";
import EventClient from "./EventClient";

export const metadata: Metadata = {
  title: "이벤트",
  description: "인텍앤컴퍼니 공식몰의 진행 중인 이벤트와 프로모션을 확인하세요.",
  alternates: { canonical: "/event" },
};

// 배너를 서버에서 함께 렌더 (페이지와 동시에 표시) + ISR 캐싱
export const revalidate = 120;

export default async function EventPage() {
  const banner = await getPageBannerServer("event");
  return <EventClient banner={banner} />;
}
