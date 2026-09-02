/**
 * 전용관(솔루션) 견적 프리셋
 *
 * intechonline.kr 의 AI 솔루션 전용관(/solutions/<slug>)에서
 * "견적 요청" CTA 로 넘어올 때 `/dealer/quotes/new?product=<slug>` 형태로 진입한다.
 * 이 파일의 프리셋으로 RFQ 폼(제목·용도·사양·요구사항)을 미리 채운다.
 *
 * 새 전용관(예: Intel Arc Pro B70)을 추가할 때는 여기에 항목만 추가하면 된다.
 * 서버/클라이언트 양쪽에서 import 가능하도록 순수 데이터만 둔다.
 */
import { createEmptySpec } from '@/types/database'
import type { StandardPcSpec } from '@/types/database'

export interface SolutionPreset {
  /** URL 슬러그 (?product=) */
  slug: string
  /** 표시명 */
  name: string
  /** 짧은 설명 (폼 상단 안내 배너) */
  tagline: string
  /** RFQ 폼 프리필 값 */
  form: {
    title: string
    /** QuoteRequestForm 의 PURPOSE_OPTIONS value 중 하나 */
    purpose: 'office' | 'development' | 'video_editing' | 'rendering' | 'gaming' | 'server' | 'etc'
    quantity: number
    requirements: string
    specJson: StandardPcSpec
  }
  /** 전용관 소개 페이지 (intechonline.kr) */
  landingUrl: string
}

const INTECH_MALL = 'https://intechonline.kr'

function gr1xSpec(): StandardPcSpec {
  const spec = createEmptySpec()
  spec.cpu = { name: 'NVIDIA Grace CPU 20코어 (RTX Spark 슈퍼칩 통합)', qty: 1 }
  spec.gpu = { name: 'NVIDIA Blackwell RTX GPU 6,144 CUDA 코어 (FP4 최대 1 PFLOPS)', qty: 1 }
  spec.ram = { name: '128GB 통합 메모리 LPDDR5X', qty: 1 }
  spec.etc = [
    { label: '폼팩터', name: 'ASUS ProArt GR1X 미니 데스크톱 (150mm)', qty: 1 },
    { label: '네트워크', name: '10GbE', qty: 1 },
    { label: '확장', name: 'PCIe 5.0', qty: 1 },
    { label: '전력', name: '140W', qty: 1 },
  ]
  return spec
}

export const SOLUTION_PRESETS: Record<string, SolutionPreset> = {
  'proart-gr1x': {
    slug: 'proart-gr1x',
    name: 'ASUS ProArt GR1X',
    tagline: 'NVIDIA RTX Spark 슈퍼칩 탑재 AI 미니 워크스테이션 · 2026년 가을 출시 예정',
    landingUrl: `${INTECH_MALL}/solutions/proart-gr1x`,
    form: {
      title: 'ASUS ProArt GR1X (NVIDIA RTX Spark) 견적 요청',
      purpose: 'development',
      quantity: 1,
      requirements: [
        '[전용관 견적] ASUS ProArt GR1X — NVIDIA RTX Spark 슈퍼칩 AI 미니 워크스테이션',
        '',
        '희망 마감(실버/블랙): ',
        '희망 수량 / 납품 시기: ',
        '용도(로컬 LLM 추론·크리에이티브·개발 등): ',
        '기타 요청사항: ',
      ].join('\n'),
      specJson: gr1xSpec(),
    },
  },
  // 'arc-pro-b70': 디자인 확정 후 추가 예정 (Intel · ASRock · ASUS / 단품·시스템)
}

/** 슬러그로 프리셋 조회 (없거나 형식이 이상하면 null) */
export function getSolutionPreset(slug: string | undefined | null): SolutionPreset | null {
  if (!slug || !/^[a-z0-9-]{1,40}$/.test(slug)) return null
  return SOLUTION_PRESETS[slug] ?? null
}
