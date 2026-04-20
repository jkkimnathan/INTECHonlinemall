import { Metadata } from "next";
import { RotateCcw, CheckCircle, XCircle, AlertTriangle, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "교환/반품 안내",
  description: "인텍앤컴퍼니몰 교환/반품 안내",
};

export default function ReturnsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">교환/반품 안내</h1>
          <p className="text-orange-100 mt-2">안심하고 구매하세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* 교환/반품 기간 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">교환/반품 기간</h2>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">상품 수령 후 7일 이내</p>
            <p className="text-sm text-blue-500 mt-1">고객센터로 접수 후 진행</p>
          </div>
        </div>

        {/* 가능한 경우 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900">교환/반품이 가능한 경우</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">&#10003;</span>
              상품 수령 후 7일 이내 미사용/미개봉 상태인 경우
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">&#10003;</span>
              상품이 표시·광고 내용과 다르게 이행된 경우 (수령 후 3개월 이내)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">&#10003;</span>
              배송 중 파손 또는 불량 상품인 경우
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">&#10003;</span>
              개봉 후 미사용 상태로 모든 구성품이 보존된 경우
            </li>
          </ul>
        </div>

        {/* 불가능한 경우 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">교환/반품이 불가능한 경우</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">&#10007;</span>
              고객의 사용 또는 소비에 의해 상품 가치가 감소한 경우
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">&#10007;</span>
              시간 경과에 의해 재판매가 곤란할 정도로 상품 가치가 감소한 경우
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">&#10007;</span>
              포장을 개봉하여 재판매가 불가능한 경우 (CPU, 메모리 등 밀봉 제품)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">&#10007;</span>
              구성품이 분실되거나 훼손된 경우
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">&#10007;</span>
              수령일로부터 7일이 경과한 경우
            </li>
          </ul>
        </div>

        {/* 배송비 부담 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900">배송비 부담</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">사유</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">배송비 부담</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 text-gray-900">상품 불량 / 오배송</td>
                  <td className="px-4 py-3 font-bold text-green-600">판매자 부담 (무료)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-900">고객 변심 (단순 반품)</td>
                  <td className="px-4 py-3 font-bold text-gray-900">구매자 부담 (왕복 6,000원)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-900">고객 변심 (교환)</td>
                  <td className="px-4 py-3 font-bold text-gray-900">구매자 부담 (왕복 6,000원)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 절차 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">교환/반품 절차</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center">
            <div className="flex-1 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
              <p className="text-sm font-medium text-gray-900">고객센터 접수</p>
              <p className="text-xs text-gray-500 mt-1">1544-6549 전화 또는 커뮤니티 문의</p>
            </div>
            <div className="text-gray-300 text-xl hidden sm:block">&rarr;</div>
            <div className="flex-1 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">2</div>
              <p className="text-sm font-medium text-gray-900">상품 회수</p>
              <p className="text-xs text-gray-500 mt-1">안내된 주소로 상품 발송</p>
            </div>
            <div className="text-gray-300 text-xl hidden sm:block">&rarr;</div>
            <div className="flex-1 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">3</div>
              <p className="text-sm font-medium text-gray-900">검수</p>
              <p className="text-xs text-gray-500 mt-1">상품 상태 확인 (1~2일)</p>
            </div>
            <div className="text-gray-300 text-xl hidden sm:block">&rarr;</div>
            <div className="flex-1 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">4</div>
              <p className="text-sm font-medium text-gray-900">교환/환불 처리</p>
              <p className="text-xs text-gray-500 mt-1">교환 발송 또는 환불 처리</p>
            </div>
          </div>
        </div>

        {/* 문의 */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 text-center">
          <Phone className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="font-bold text-gray-900">교환/반품 관련 문의</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">1544-6549</p>
          <p className="text-sm text-gray-500 mt-1">평일 09:30 ~ 17:00 (점심 12:00 ~ 13:00)</p>
        </div>
      </div>
    </div>
  );
}
