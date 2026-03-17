import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Pin } from "lucide-react";

export const metadata: Metadata = {
  title: "공지사항",
  description: "인텍앤컴퍼니몰 공지사항",
};

// 임시 공지사항 데이터
const notices = [
  {
    id: 1,
    title: "인텍앤컴퍼니몰 그랜드 오픈 안내",
    content:
      "안녕하세요. 인텍앤컴퍼니몰이 정식 오픈하였습니다. INTEL, ASUS, MANLI, ASRock, TOSHIBA, Microsoft, MSI 공식 수입사 직영몰로서 최고의 제품과 서비스를 제공하겠습니다.",
    date: "2025-03-01",
    isPinned: true,
    category: "안내",
  },
  {
    id: 2,
    title: "배송 안내 - 평일 오후 2시 이전 주문 당일 출고",
    content:
      "평일(월~금) 오후 2시 이전 결제 완료된 주문은 당일 출고됩니다. 주말/공휴일 주문은 다음 영업일에 출고됩니다.",
    date: "2025-03-01",
    isPinned: true,
    category: "배송",
  },
  {
    id: 3,
    title: "교환/반품 정책 안내",
    content:
      "제품 수령 후 7일 이내 교환 및 반품이 가능합니다. 단, 고객 변심에 의한 반품의 경우 왕복 배송비가 부과됩니다.",
    date: "2025-03-01",
    isPinned: false,
    category: "정책",
  },
  {
    id: 4,
    title: "3월 시스템 점검 안내 (3/20 새벽 2시~5시)",
    content:
      "서버 안정성 향상을 위한 정기 점검이 진행됩니다. 점검 시간 동안 주문 및 결제가 일시 중단됩니다.",
    date: "2025-03-15",
    isPinned: false,
    category: "안내",
  },
  {
    id: 5,
    title: "ASUS 신제품 입고 안내 - ROG STRIX 시리즈",
    content:
      "ASUS ROG STRIX 최신 메인보드 및 그래픽카드가 입고되었습니다. 전체상품 페이지에서 확인하세요.",
    date: "2025-03-10",
    isPinned: false,
    category: "입고",
  },
];

const categoryColors: Record<string, string> = {
  안내: "bg-blue-100 text-blue-700",
  배송: "bg-green-100 text-green-700",
  정책: "bg-gray-100 text-gray-700",
  입고: "bg-purple-100 text-purple-700",
};

export default function NoticePage() {
  const pinnedNotices = notices.filter((n) => n.isPinned);
  const regularNotices = notices.filter((n) => !n.isPinned);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">공지사항</h1>
          <p className="text-gray-300 mt-2">
            중요한 안내사항을 확인하세요
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 고정 공지 */}
        {pinnedNotices.length > 0 && (
          <div className="space-y-3 mb-6">
            {pinnedNotices.map((notice) => (
              <div
                key={notice.id}
                className="bg-white rounded-lg border-2 border-blue-200 p-5"
              >
                <div className="flex items-start gap-3">
                  <Pin className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={categoryColors[notice.category]}>
                        {notice.category}
                      </Badge>
                      <Badge className="bg-blue-50 text-blue-600">고정</Badge>
                    </div>
                    <h2 className="font-bold text-gray-900">{notice.title}</h2>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {notice.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{notice.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 일반 공지 */}
        <div className="bg-white rounded-lg border divide-y">
          {regularNotices.map((notice) => (
            <div key={notice.id} className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={categoryColors[notice.category]}>
                  {notice.category}
                </Badge>
                <span className="text-xs text-gray-400">{notice.date}</span>
              </div>
              <h2 className="font-medium text-gray-900">{notice.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
