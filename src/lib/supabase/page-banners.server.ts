import { createClient } from "./server";

export interface PageBannerData {
  title: string;
  subtitle: string;
  imageUrl: string | null;
}

/** 서버 컴포넌트에서 페이지 배너 조회 */
export async function getPageBannerServer(pageKey: string): Promise<PageBannerData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_banners")
    .select("title, subtitle, image_url")
    .eq("page_key", pageKey)
    .single();

  if (error || !data) return null;
  return {
    title: data.title,
    subtitle: data.subtitle,
    imageUrl: data.image_url,
  };
}
