import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin 은 미들웨어가 서버에서 차단하므로 robots 에 노출하지 않는다
        // (robots 는 접근통제가 아니며 경로 존재만 알려줌 — 감사 지적 반영)
        disallow: ["/checkout", "/order/", "/mypage", "/cart", "/wishlist"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
