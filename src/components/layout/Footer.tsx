import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const quickLinks = [
  { title: "공지사항", href: "/notice" },
  { title: "자주 묻는 질문", href: "/faq" },
  { title: "1:1 문의", href: "/inquiry" },
  { title: "배송안내", href: "/shipping" },
  { title: "교환/반품 안내", href: "/returns" },
  { title: "비회원 주문조회", href: "/order/lookup" },
];

export default function Footer() {
  const { contact } = siteConfig;

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* 브랜드 배너 */}
      <div className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-5">
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

      {/* 메인 푸터 - 3컬럼 */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* 좌측: 회사 정보 */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">회사정보</h3>
            <div className="space-y-2.5 text-sm text-gray-400">
              <p>
                <span className="text-gray-500">상호</span>{" "}
                <span className="text-gray-300">{contact.companyName}</span>
              </p>
              <p>
                <span className="text-gray-500">대표</span>{" "}
                <span className="text-gray-300">{contact.ceo}</span>
              </p>
              <p>
                <span className="text-gray-500">사업자등록번호</span>{" "}
                <span className="text-gray-300">{contact.businessNumber}</span>
              </p>
              <div className="flex items-start gap-1.5">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                <span className="text-gray-300">{contact.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {contact.email}
                </a>
              </div>
            </div>
          </div>

          {/* 중앙: 고객센터 */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">고객센터</h3>
            <div className="flex items-center gap-2 mb-3">
              <Phone className="h-5 w-5 text-blue-400" />
              <a
                href={`tel:${contact.phone}`}
                className="text-2xl font-bold text-white tracking-wide"
              >
                {contact.phone}
              </a>
            </div>
            <div className="space-y-1.5 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-500 shrink-0" />
                <span>{contact.csHours}</span>
              </div>
              <p className="pl-5.5 text-gray-500">{contact.csLunch}</p>
              <p className="pl-5.5 text-gray-500 text-xs">
                (주말/공휴일 휴무)
              </p>
            </div>
          </div>

          {/* 우측: 빠른 링크 */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">빠른 링크</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 하단: 법적 고지 + 저작권 */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500 text-center md:text-left">
              &copy; {new Date().getFullYear()} {contact.companyName}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <Link href="/terms" className="hover:text-gray-300 transition-colors">
                이용약관
              </Link>
              <Link href="/privacy" className="hover:text-gray-300 transition-colors font-semibold">
                개인정보처리방침
              </Link>
            </div>
          </div>
          <p className="text-[11px] text-gray-600 text-center mt-3">
            전자상거래 등에서의 소비자보호에 관한 법률에 의한 통신판매업
          </p>
        </div>
      </div>
    </footer>
  );
}
