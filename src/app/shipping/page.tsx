import { Metadata } from "next";
import { Truck, Clock, Package, MapPin, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "배송 안내",
  description: "인텍앤컴퍼니몰 배송 안내",
};

export default function ShippingPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">배송 안내</h1>
          <p className="text-green-100 mt-2">빠르고 안전한 배송을 약속합니다</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* 당일출고 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">당일 출고 안내</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>- <strong>평일(월~금) 오후 2시 이전</strong> 결제 완료된 주문은 <strong className="text-green-600">당일 출고</strong>됩니다.</li>
            <li>- 오후 2시 이후 결제된 주문은 다음 영업일에 출고됩니다.</li>
            <li>- 주말 및 공휴일에는 출고가 진행되지 않으며, 다음 영업일에 순차 출고됩니다.</li>
            <li>- 재고 부족, 주문 폭주 등의 사유로 출고가 지연될 경우 별도 안내드립니다.</li>
          </ul>
        </div>

        {/* 배송비 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">배송비 안내</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">구분</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">조건</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">배송비</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 text-gray-900">일반 배송</td>
                  <td className="px-4 py-3 text-gray-600">50,000원 이상 구매</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">무료</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-900">일반 배송</td>
                  <td className="px-4 py-3 text-gray-600">50,000원 미만 구매</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">3,000원</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-900">도서산간 지역</td>
                  <td className="px-4 py-3 text-gray-600">제주 및 도서산간</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">추가 3,000원~5,000원</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 배송 기간 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">배송 소요 기간</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>- <strong>서울/수도권:</strong> 출고 다음 날 도착 (1일)</li>
            <li>- <strong>지방:</strong> 출고 후 2~3일 소요</li>
            <li>- <strong>도서산간:</strong> 출고 후 3~5일 소요</li>
          </ul>
          <p className="text-xs text-gray-400 mt-3">* 택배사 사정, 천재지변 등으로 배송이 지연될 수 있습니다.</p>
        </div>

        {/* 배송 추적 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">배송 추적</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>- 출고 완료 시 등록된 연락처로 송장번호가 발송됩니다.</li>
            <li>- <strong>마이페이지 &gt; 주문 내역</strong>에서 배송 상태를 확인할 수 있습니다.</li>
            <li>- 비회원은 <strong>비회원 주문조회</strong>에서 주문번호와 연락처로 조회 가능합니다.</li>
          </ul>
        </div>

        {/* 주의사항 */}
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h2 className="text-lg font-bold text-yellow-800">유의사항</h2>
          </div>
          <ul className="space-y-1.5 text-sm text-yellow-800">
            <li>- 부재 시 경비실 또는 택배함에 보관될 수 있습니다. 배송 메모를 활용해주세요.</li>
            <li>- 상품 수령 시 외관 손상 여부를 반드시 확인해주세요.</li>
            <li>- 배송 관련 문의: 고객센터 1544-6549 (평일 09:30~17:00)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
