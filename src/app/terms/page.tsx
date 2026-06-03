import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "이용약관",
  description: `${siteConfig.name} 이용약관`,
};

const { contact } = siteConfig;

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">이용약관</h1>
          <p className="text-gray-300 mt-2">서비스 이용에 관한 약관</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border p-6 md:p-10 prose prose-sm prose-gray max-w-none">
          <h2>제1조 (목적)</h2>
          <p>
            본 약관은 {contact.companyName}(이하 &quot;회사&quot;)이 운영하는 {siteConfig.name}(이하 &quot;몰&quot;)에서 제공하는
            인터넷 관련 서비스를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>

          <h2>제2조 (정의)</h2>
          <ol>
            <li>&quot;몰&quot;이란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.</li>
            <li>&quot;이용자&quot;란 &quot;몰&quot;에 접속하여 이 약관에 따라 &quot;몰&quot;이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
            <li>&quot;회원&quot;이란 &quot;몰&quot;에 개인정보를 제공하여 회원등록을 한 자로서, &quot;몰&quot;의 정보를 지속적으로 제공받으며 서비스를 이용할 수 있는 자를 말합니다.</li>
          </ol>

          <h2>제3조 (약관의 명시와 개정)</h2>
          <ol>
            <li>&quot;몰&quot;은 이 약관의 내용과 상호, 영업소 소재지, 대표자의 성명, 사업자등록번호, 연락처 등을 이용자가 알 수 있도록 &quot;몰&quot;의 초기 서비스화면에 게시합니다.</li>
            <li>&quot;몰&quot;은 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
            <li>개정된 약관은 적용일자 7일 이전부터 공지합니다.</li>
          </ol>

          <h2>제4조 (서비스의 제공 및 변경)</h2>
          <ol>
            <li>&quot;몰&quot;은 다음과 같은 업무를 수행합니다.
              <ul>
                <li>재화 또는 용역에 대한 정보 제공 및 구매계약의 체결</li>
                <li>구매계약이 체결된 재화 또는 용역의 배송</li>
                <li>기타 &quot;몰&quot;이 정하는 업무</li>
              </ul>
            </li>
            <li>&quot;몰&quot;은 재화의 품절 또는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 재화의 내용을 변경할 수 있습니다.</li>
          </ol>

          <h2>제5조 (서비스의 중단)</h2>
          <p>
            &quot;몰&quot;은 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
          </p>

          <h2>제6조 (회원가입)</h2>
          <ol>
            <li>이용자는 &quot;몰&quot;이 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.</li>
            <li>&quot;몰&quot;은 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.</li>
          </ol>

          <h2>제7조 (회원 탈퇴 및 자격 상실 등)</h2>
          <ol>
            <li>회원은 &quot;몰&quot;에 언제든지 탈퇴를 요청할 수 있으며 &quot;몰&quot;은 즉시 회원탈퇴를 처리합니다.</li>
            <li>회원이 다음 각 호의 사유에 해당하는 경우, &quot;몰&quot;은 회원자격을 제한 및 정지시킬 수 있습니다.
              <ul>
                <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                <li>&quot;몰&quot;을 이용하여 구입한 재화의 대금을 기일 내에 지급하지 않는 경우</li>
                <li>다른 사람의 &quot;몰&quot; 이용을 방해하거나 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
              </ul>
            </li>
          </ol>

          <h2>제8조 (구매신청)</h2>
          <p>
            이용자는 &quot;몰&quot;에서 다음 방법에 의하여 구매를 신청합니다.
          </p>
          <ol>
            <li>재화 등의 검색 및 선택</li>
            <li>성명, 주소, 전화번호, 배송지 정보 입력</li>
            <li>약관내용, 청약철회 등에 대한 확인</li>
            <li>결제방법 선택 및 결제</li>
          </ol>

          <h2>제9조 (배송)</h2>
          <ol>
            <li>&quot;몰&quot;은 이용자가 구매한 재화에 대해 배송수단, 비용, 기간 등을 명시합니다.</li>
            <li>평일 오후 2시 이전 결제 완료된 주문은 당일 출고를 원칙으로 합니다.</li>
          </ol>

          <h2>제10조 (환급)</h2>
          <p>
            &quot;몰&quot;은 이용자가 구매신청한 재화가 품절 등의 사유로 인도 또는 제공할 수 없을 때에는 그 사유를 이용자에게 통지하고
            사전에 재화 대금을 받은 경우에는 대금을 받은 날부터 3영업일 이내에 환급합니다.
          </p>

          <h2>제11조 (청약철회 등)</h2>
          <ol>
            <li>&quot;몰&quot;과 재화 등의 구매에 관한 계약을 체결한 이용자는 수령한 날로부터 7일 이내에 청약의 철회를 할 수 있습니다.</li>
            <li>이용자는 재화 등을 배송 받은 경우 다음 각호에 해당하는 경우에는 반품 및 교환을 할 수 없습니다.
              <ul>
                <li>이용자에게 책임 있는 사유로 재화가 멸실 또는 훼손된 경우</li>
                <li>이용자의 사용 또는 일부 소비에 의하여 재화의 가치가 현저히 감소한 경우</li>
                <li>포장을 개봉한 경우 재판매가 곤란한 경우</li>
              </ul>
            </li>
          </ol>

          <h2>제12조 (개인정보보호)</h2>
          <p>
            &quot;몰&quot;은 이용자의 개인정보를 수집할 때 서비스 제공에 필요한 최소한의 개인정보를 수집합니다.
            자세한 내용은 개인정보처리방침을 참조하시기 바랍니다.
          </p>

          <h2>제13조 (분쟁해결)</h2>
          <p>
            &quot;몰&quot;은 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다.
            다만, 신속한 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 통보합니다.
          </p>

          <div className="mt-8 pt-6 border-t text-sm text-[#86868b]">
            <p>시행일: 2025년 3월 1일</p>
            <p className="mt-1">{contact.companyName} | 대표: {contact.ceo}</p>
            <p>{contact.address}</p>
            <p>사업자등록번호: {contact.businessNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
