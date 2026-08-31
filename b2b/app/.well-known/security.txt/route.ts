/** RFC 9116 security.txt — 보안 취약점 제보 창구 안내 (보안 감사 반영) */
export const dynamic = 'force-static'
export const revalidate = 86400

export function GET() {
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://ipcb2bmall.com'
  const body = [
    'Contact: mailto:event@intechn.com',
    `Expires: ${expires.toISOString()}`,
    'Preferred-Languages: ko, en',
    `Canonical: ${base}/.well-known/security.txt`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
