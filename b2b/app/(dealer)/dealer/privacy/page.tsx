import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보 수집 및 이용 동의 (거래처 가입) | iPC B2B Mall',
  robots: { index: false, follow: false },
}

/** 거래처 가입신청 시 동의받는 개인정보 수집·이용 동의 전문 (영구 URL) */
export default function DealerPrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold">개인정보 수집 및 이용 동의</h1>
      <p className="mt-2 text-sm text-zinc-500">
        시행일: 2026-09-01 · 버전 1.0 · 거래처 가입신청에 적용
      </p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-700">
        <div>
          <h2 className="font-semibold text-zinc-900">1. 수집하는 항목</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>사업자 정보: 상호, 사업자등록번호, 대표자명, 업태, 종목, 대표 전화, 주소(우편번호 포함)</li>
            <li>담당자 정보: 성명, 이메일, 휴대폰 번호, 직책</li>
            <li>증빙 서류: 사업자등록증 사본</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900">2. 수집·이용 목적</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>거래처 가입 심사 및 승인 여부 결정</li>
            <li>거래처 계정 발급·관리 및 본인 확인</li>
            <li>견적·주문·납품·정산 등 B2B 거래 이행과 관련 안내</li>
            <li>세금계산서 발행 등 법령상 의무 이행</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900">3. 보유 및 이용 기간</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>가입이 승인되지 않은 경우: 심사 종료 후 지체 없이 파기</li>
            <li>거래처 회원: 거래 관계 종료(탈퇴·계약 종료) 시까지</li>
            <li>단, 관계 법령에 따라 보존이 필요한 정보는 해당 기간 동안 보관
              (전자상거래법상 계약·대금결제 기록 5년, 세법상 거래 기록 5년 등)</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900">4. 동의를 거부할 권리</h2>
          <p className="mt-2">
            귀하는 개인정보 수집·이용에 대한 동의를 거부할 수 있습니다. 다만 위 항목은
            거래처 심사와 계정 발급에 필수적인 정보이므로, 동의하지 않을 경우 가입신청이
            제한됩니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900">5. 개인정보 처리 책임</h2>
          <p className="mt-2">
            처리자: (주)인텍앤컴퍼니 · 문의: 1544-6549 · 이메일: event@intechn.com
            <br />
            수집된 사업자등록증 등 증빙 서류는 심사 담당자만 열람할 수 있으며, 비공개
            저장소에 보관됩니다.
          </p>
        </div>
      </section>

      <p className="mt-10 text-xs text-zinc-400">
        본 동의서의 개정 이력과 이전 버전 열람이 필요하시면 고객센터로 문의해주세요.
      </p>
    </div>
  )
}
