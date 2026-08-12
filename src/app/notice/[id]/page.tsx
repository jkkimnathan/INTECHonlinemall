import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNoticeById } from "@/lib/supabase/notices.server";
import { siteConfig } from "@/config/site";
import NoticeDetailClient from "./NoticeDetailClient";

// 공지 상세 ISR 캐싱 (300초)
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const notice = await getNoticeById(id);

  if (!notice) {
    return { title: "공지사항" };
  }

  const description = notice.content.slice(0, 120);

  return {
    title: notice.title,
    description,
    alternates: { canonical: `/notice/${id}` },
    openGraph: {
      title: notice.title,
      description,
      url: `${siteConfig.url}/notice/${id}`,
      type: "article",
      ...(notice.imageUrl && { images: [{ url: notice.imageUrl }] }),
    },
  };
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await getNoticeById(id);

  if (!notice) {
    notFound();
  }

  return <NoticeDetailClient notice={notice} />;
}
