import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/supabase/events.server";
import { siteConfig } from "@/config/site";
import EventDetailClient from "./EventDetailClient";

// 이벤트 상세 ISR 캐싱 (300초)
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return { title: "이벤트" };
  }

  const description = event.description.slice(0, 120);

  return {
    title: event.title,
    description,
    alternates: { canonical: `/event/${id}` },
    openGraph: {
      title: event.title,
      description,
      url: `${siteConfig.url}/event/${id}`,
      type: "article",
      ...(event.imageUrl && { images: [{ url: event.imageUrl }] }),
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  return <EventDetailClient event={event} />;
}
