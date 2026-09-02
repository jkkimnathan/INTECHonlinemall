import { siteConfig } from "@/config/site";

export const dynamic = "force-static";
export const revalidate = 86400;

/** RFC 9116 security.txt — 보안 취약점 제보 창구 안내 */
export function GET() {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const body = [
    `Contact: mailto:${siteConfig.contact.email}`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: ko, en",
    `Canonical: ${siteConfig.url}/.well-known/security.txt`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
