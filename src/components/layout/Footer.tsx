import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* 브랜드 배너 */}
      <div className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {siteConfig.brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brand/${brand.slug}`}
                className="text-sm font-semibold text-gray-400 hover:text-white transition-colors tracking-wider"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 푸터 */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div className="md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-3">
              {siteConfig.name}
            </h3>
            <p className="text-sm leading-relaxed mb-3">
              {siteConfig.description}
            </p>
            <div className="text-xs space-y-1 text-gray-400">
              {siteConfig.contact.ceo && (
                <p>대표: {siteConfig.contact.ceo}</p>
              )}
              {siteConfig.contact.businessNumber && (
                <p>사업자등록번호: {siteConfig.contact.businessNumber}</p>
              )}
              <p>주소: {siteConfig.contact.address}</p>
              <p>
                전화: {siteConfig.contact.phone} | 이메일:{" "}
                {siteConfig.contact.email}
              </p>
            </div>
          </div>

          {/* 푸터 네비게이션 */}
          {Object.entries(siteConfig.footerNav).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-3">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 저작권 */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <p className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
