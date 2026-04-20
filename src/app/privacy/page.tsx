import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${siteConfig.name} 개인정보처리방침`,
};

const { contact } = siteConfig;

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">개인정보처리방침</h1>
          <p className="text-gray-300 mt-2">개인정보의 처리 및 보호에 관한 사항</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border p-6 md:p-10 prose prose-sm prose-gray max-w-none">
          <p>
            {contact.companyName}(이하 &quot;회사&quot;)은(는) 정보주체의 자유와 권리 보호를 위해
            「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다.
          </p>

          <h2>1. 개인정보의 처리 목적</h2>
          <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
          <ul>
            <li><strong>회원 가입 및 관리:</strong> 회원제 서비스 이용에 따른 본인 확인, 개인 식별, 불량회원 부정 이용 방지</li>
            <li><strong>재화 또는 서비스 제공:</strong> 물품 배송, 서비스 제공, 콘텐츠 제공, 맞춤 서비스 제공, 본인 인증</li>
            <li><strong>고충 처리:</strong> 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보</li>
            <li><strong>마케팅 및 광고:</strong> 이벤트 및 광고성 정보 제공, 서비스 이용 통계</li>
          </ul>

          <h2>2. 개인정보의 처리 및 보유기간</h2>
          <p>
            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 보유·이용기간 내에서 개인정보를 처리·보유합니다.
          </p>
          <ul>
            <li>회원 가입 정보: 회원 탈퇴 시까지</li>
            <li>전자상거래 관련 기록
              <ul>
                <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
              </ul>
            </li>
          </ul>

          <h2>3. 처리하는 개인정보의 항목</h2>
          <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
          <ul>
            <li><strong>필수항목:</strong> 이메일, 비밀번호, 이름, 연락처</li>
            <li><strong>선택항목:</strong> 주소</li>
            <li><strong>자동 수집항목:</strong> IP 주소, 쿠키, 방문 기록, 서비스 이용 기록</li>
          </ul>

          <h2>4. 개인정보의 제3자 제공</h2>
          <p>
            회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
          </p>
          <ul>
            <li><strong>배송 업체:</strong> 주문 상품 배송을 위해 수령인 정보(이름, 연락처, 주소) 제공</li>
          </ul>

          <h2>5. 개인정보처리의 위탁</h2>
          <p>회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
          <ul>
            <li>결제 처리: PG사(추후 연동 시 명시)</li>
            <li>배송 업무: 택배사</li>
          </ul>

          <h2>6. 개인정보의 파기</h2>
          <p>
            회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
          </p>

          <h2>7. 정보주체의 권리·의무 및 행사방법</h2>
          <p>이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
          <ol>
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리정지 요구</li>
          </ol>

          <h2>8. 개인정보의 안전성 확보 조치</h2>
          <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
          <ul>
            <li>비밀번호의 암호화</li>
            <li>해킹 등에 대비한 기술적 대책</li>
            <li>개인정보에 대한 접근 제한</li>
            <li>개인정보 처리 직원의 최소화</li>
          </ul>

          <h2>9. 개인정보 보호책임자</h2>
          <ul>
            <li>성명: {contact.ceo}</li>
            <li>연락처: {contact.phone}</li>
            <li>이메일: {contact.email}</li>
          </ul>

          <h2>10. 개인정보 처리방침 변경</h2>
          <p>
            이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는
            변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </p>

          <div className="mt-8 pt-6 border-t text-sm text-gray-500">
            <p>시행일: 2025년 3월 1일</p>
            <p className="mt-1">{contact.companyName} | 대표: {contact.ceo}</p>
            <p>{contact.address}</p>
            <p>고객센터: {contact.phone} | 이메일: {contact.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
