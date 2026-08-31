import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'B2B 거래 약관 | iPC B2B Mall',
  robots: { index: false, follow: false },
}

/** 거래처 가입신청 시 동의받는 B2B 거래 약관 전문 (영구 URL) */
export default function DealerTermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold">B2B 거래 약관</h1>
      <p className="mt-2 text-sm text-zinc-500">시행일: 2026-09-01 · 버전 1.0</p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-700">
        <div>
          <h2 className="font-semibold text-zinc-900">제1조 (목적)</h2>
          <p className="mt-2">
            본 약관은 (주)인텍앤컴퍼니(이하 &quot;회사&quot;)가 운영하는 iPC B2B Mall(이하
            &quot;몰&quot;)에서 회사와 거래처 회원(이하 &quot;거래처&quot;) 간에 이루어지는
            견적, 주문, 납품, 대금 지급 등 B2B 거래의 조건과 절차를 정함을 목적으로 합니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900">제2조 (거래처 자격과 계정)</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>거래처 가입은 사업자등록을 보유한 법인 또는 개인사업자에 한하며, 회사의 심사·승인을 거쳐 확정됩니다.</li>
            <li>계정 정보(로그인 자격)의 관리 책임은 거래처에 있으며, 제3자에게 양도·대여할 수 없습니다.</li>
            <li>담당자 변경·퇴사 시 거래처는 지체 없이 회사에 통지하거나 계정을 회수해야 합니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900">제3조 (가격과 견적)</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>몰에 표시되는 가격은 거래처별 계약 조건에 따라 다를 수 있으며, 제3자에게 공개·재배포할 수 없습니다.</li>
            <li>견적서는 기재된 유효기간 내에서만 효력을 가지며, 유효기간 경과 시 재견적이 필요합니다.</li>
            <li>환율·시장 상황 급변 등 불가피한 사유가 있는 경우 회사는 견적을 조정·철회할 수 있습니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900">제4조 (주문과 납품)</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>주문은 몰을 통한 신청과 회사의 승인으로 성립합니다. 재고·여신 상태에 따라 승인이 거절될 수 있습니다.</li>
            <li>납기는 주문 승인 시 안내되며, 천재지변·수급 차질 등 불가항력 사유 발생 시 조정될 수 있습니다.</li>
            <li>거래처는 수령 즉시 수량·외관을 검수하고, 하자 발견 시 수령일로부터 7일 이내에 통지해야 합니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900">제5조 (대금 지급)</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>대금은 회사와 거래처 간 합의된 결제 조건(선결제·여신 등)에 따릅니다.</li>
            <li>여신 한도 초과 또는 지급 지연 시 회사는 신규 주문을 제한할 수 있습니다.</li>
            <li>세금계산서는 관련 법령에 따라 발행됩니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900">제6조 (반품·교환·A/S)</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>초기 불량(DOA)은 수령일로부터 7일 이내 접수 시 교환 또는 환불 처리합니다.</li>
            <li>리퍼 제품은 상품 페이지에 표시된 등급·보증 조건을 따릅니다.</li>
            <li>단순 변심에 의한 반품은 미개봉 상품에 한하며, 왕복 운송비는 거래처가 부담합니다.</li>
            <li>제조사 보증이 적용되는 상품의 A/S는 제조사 정책을 우선 적용합니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900">제7조 (책임의 제한)</h2>
          <p className="mt-2">
            회사는 고의 또는 중대한 과실이 없는 한, 거래처의 영업 손실 등 간접 손해에
            대해서는 책임을 지지 않습니다. 회사의 배상 책임은 해당 주문의 대금을 한도로
            합니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-900">제8조 (약관의 변경과 관할)</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>회사는 약관을 변경할 수 있으며, 변경 시 시행일 7일 전(거래처에 불리한 변경은 30일 전)까지 몰에 공지합니다.</li>
            <li>본 약관에 관한 분쟁은 회사 본점 소재지를 관할하는 법원을 제1심 관할 법원으로 합니다.</li>
          </ul>
        </div>
      </section>

      <p className="mt-10 text-xs text-zinc-400">
        문의: (주)인텍앤컴퍼니 · 1544-6549 · event@intechn.com
      </p>
    </div>
  )
}
