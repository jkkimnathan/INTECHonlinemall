/**
 * 새 견적 요청 작성 페이지
 *
 * ?product=<slug> 로 진입하면(intechonline.kr 전용관 → "견적 요청")
 * lib/solutions.ts 의 프리셋으로 폼을 미리 채운다.
 */
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { requireDealer } from '@/lib/auth/dealer'
import { createClient } from '@/lib/supabase/server'
import { getSolutionPreset, applySolutionOptions } from '@/lib/solutions'
import QuoteRequestForm from '@/components/dealer/quotes/QuoteRequestForm'
import type { DealerAddress } from '@/types/database'

interface Props {
  searchParams: Promise<{ product?: string; brand?: string; config?: string }>
}

export default async function NewQuoteRequestPage({ searchParams }: Props) {
  const session = await requireDealer()
  const supabase = await createClient()
  const { product, brand, config } = await searchParams
  const basePreset = getSolutionPreset(product)
  const preset = basePreset ? applySolutionOptions(basePreset, { brand, config }) : null

  // 배송지 목록
  const { data: addresses } = await supabase
    .from('dealer_addresses')
    .select('*')
    .eq('dealer_id', session.dealer.id)
    .order('is_default', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dealer/quotes"
        className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 w-fit"
      >
        <ArrowLeft className="size-4" />
        견적 목록
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">새 견적 요청</h1>
        <p className="text-sm text-zinc-500">
          {preset
            ? '전용관 상품 정보가 미리 입력되어 있습니다. 수량과 요청사항을 확인해주세요.'
            : '원하는 PC 구성과 조건을 입력해주세요'}
        </p>
      </div>

      {preset && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-zinc-900">{preset.name} 전용관 견적</p>
            <p className="text-zinc-600">{preset.tagline}</p>
            <a
              href={preset.landingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-blue-600 hover:underline"
            >
              제품 소개 페이지 보기 &rarr;
            </a>
          </div>
        </div>
      )}

      <QuoteRequestForm
        addresses={(addresses ?? []) as DealerAddress[]}
        dealerId={session.dealer.id}
        preset={preset?.form ?? null}
      />
    </div>
  )
}
