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

function b70Spec(): StandardPcSpec {
  const spec = createEmptySpec()
  spec.gpu = { name: 'Intel Arc Pro B70 32GB GDDR6 ECC (256-bit, 608 GB/s, 367 TOPS INT8)', qty: 1 }
  spec.etc = [
    { label: '브랜드', name: 'Intel 레퍼런스 / ASRock Creator / ASUS UGen 중 선택', qty: 1 },
    { label: '구성', name: '단품 GPU 또는 시스템(싱글 32GB · 듀얼 64GB · 멀티 128GB)', qty: 1 },
    { label: '전력', name: '290W TBP · 2슬롯 풀하이트', qty: 1 },
  ]
  return spec
}

function windowsProSpec(): StandardPcSpec {
  const spec = createEmptySpec()
  spec.os = { name: 'Windows 11 Pro (정품 · 기업용)', qty: 1 }
  spec.etc = [
    { label: '디바이스', name: 'iPC 데스크톱(Entry/Mainstream/Performance) 또는 ASUS 비즈니스 노트북 중 선택', qty: 1 },
    { label: '라이선스', name: '디바이스 탑재 또는 단품(FPP / DSP / 볼륨 라이선스·Pro 업그레이드)', qty: 1 },
    { label: '배포 지원', name: '요구 사양 상담 → 라이선스 확정 → 조립·사전 설정 → 납품·A/S', qty: 1 },
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
  'arc-pro-b70': {
    slug: 'arc-pro-b70',
    name: 'Intel Arc Pro B70 32GB',
    tagline: '로컬 AI 워크스테이션 GPU · Intel 레퍼런스 / ASRock Creator / ASUS UGen · 단품·시스템 견적',
    landingUrl: `${INTECH_MALL}/solutions/arc-pro-b70`,
    form: {
      title: 'Intel Arc Pro B70 32GB 견적 요청',
      purpose: 'development',
      quantity: 1,
      requirements: [
        '[전용관 견적] Intel Arc Pro B70 32GB — 로컬 AI 추론용 워크스테이션 GPU',
        '',
        '희망 브랜드(Intel 레퍼런스 / ASRock Creator 32GB / ASUS UGen B70 32G): ',
        '구성(단품 GPU / 싱글 32GB 시스템 / 듀얼 64GB / 멀티 128GB): ',
        '희망 수량 / 납품 시기: ',
        '용도(로컬 LLM 추론·에이전트 동시성·RAG·이미지/영상 생성 등): ',
        '기타 요청사항: ',
      ].join('\n'),
      specJson: b70Spec(),
    },
  },
  'windows-pro': {
    slug: 'windows-pro',
    name: 'Windows Pro Device',
    tagline: 'Windows 11 Pro 기업용 데스크톱·노트북 + Windows 단품 라이선스(FPP·DSP·볼륨) 견적',
    landingUrl: `${INTECH_MALL}/solutions/windows-pro`,
    form: {
      title: 'Windows 11 Pro 기업용 디바이스 견적 요청',
      purpose: 'office',
      quantity: 1,
      requirements: [
        '[전용관 견적] Windows Pro Device — Windows 11 Pro 탑재 기업용 디바이스 / 단품 라이선스',
        '',
        '희망 디바이스(iPC Entry / iPC Mainstream / iPC Performance / ASUS ExpertBook 14 / ASUS ExpertBook 16 / ASUS ProArt·ExpertBook Pro): ',
        '라이선스 형태(디바이스 탑재 / FPP / DSP / 볼륨 라이선스·Pro 업그레이드): ',
        '희망 수량 / 납품 시기: ',
        '사용 부서·용도(사무 / 개발 / 디자인 등) 및 도메인·MDM 환경: ',
        '기타 요청사항(사전 설정·이미지 배포·A/S 조건 등): ',
      ].join('\n'),
      specJson: windowsProSpec(),
    },
  },
}

/** 전용관 CTA 에서 함께 넘어오는 선택값 (?brand=, ?config=) 라벨 */
const OPTION_LABELS: Record<string, Record<string, string>> = {
  brand: {
    intel: 'Intel 레퍼런스',
    asrock: 'ASRock Creator 32GB',
    asus: 'ASUS UGen B70 32G',
  },
  config: {
    gpu: '단품 GPU',
    single: '싱글 32GB 시스템',
    dual: '듀얼 64GB 시스템',
    multi: '멀티 128GB 시스템',
  },
  tier: {
    entry: 'iPC Entry 데스크톱',
    mainstream: 'iPC Mainstream 데스크톱',
    performance: 'iPC Performance 데스크톱',
    expertbook14: 'ASUS ExpertBook 14',
    expertbook16: 'ASUS ExpertBook 16',
    proart: 'ASUS ProArt · ExpertBook Pro',
  },
  license: {
    fpp: 'FPP (처음사용자용)',
    dsp: 'DSP (OEM)',
    volume: '볼륨 라이선스 · Pro 업그레이드',
  },
}

/**
 * ?brand= / ?config= 값이 있으면 프리셋 요구사항의 해당 줄을 채워 넣는다.
 * 알 수 없는 값은 무시(프리셋 원본 유지). 원본 객체는 변경하지 않는다.
 */
export function applySolutionOptions(
  preset: SolutionPreset,
  opts: { brand?: string | null; config?: string | null; tier?: string | null; license?: string | null },
): SolutionPreset {
  const brand = opts.brand ? OPTION_LABELS.brand[opts.brand] : undefined
  const config = opts.config ? OPTION_LABELS.config[opts.config] : undefined
  const tier = opts.tier ? OPTION_LABELS.tier[opts.tier] : undefined
  const license = opts.license ? OPTION_LABELS.license[opts.license] : undefined
  if (!brand && !config && !tier && !license) return preset

  let requirements = preset.form.requirements
  if (brand) requirements = requirements.replace(/^(희망 브랜드\([^)]*\): ).*$/m, `$1${brand}`)
  if (config) requirements = requirements.replace(/^(구성\([^)]*\): ).*$/m, `$1${config}`)
  if (tier) requirements = requirements.replace(/^(희망 디바이스\([^)]*\): ).*$/m, `$1${tier}`)
  if (license) requirements = requirements.replace(/^(라이선스 형태\([^)]*\): ).*$/m, `$1${license}`)

  const specJson: StandardPcSpec = {
    ...preset.form.specJson,
    etc: preset.form.specJson.etc.map((e) => {
      if (brand && e.label === '브랜드') return { ...e, name: brand }
      if (config && e.label === '구성') return { ...e, name: config }
      if (tier && e.label === '디바이스') return { ...e, name: tier }
      if (license && e.label === '라이선스') return { ...e, name: license }
      return e
    }),
  }

  const suffix = brand ?? tier ?? license
  return {
    ...preset,
    form: {
      ...preset.form,
      title: suffix ? `${preset.form.title} — ${suffix}` : preset.form.title,
      requirements,
      specJson,
    },
  }
}

/** 슬러그로 프리셋 조회 (없거나 형식이 이상하면 null) */
export function getSolutionPreset(slug: string | undefined | null): SolutionPreset | null {
  if (!slug || !/^[a-z0-9-]{1,40}$/.test(slug)) return null
  return SOLUTION_PRESETS[slug] ?? null
}
