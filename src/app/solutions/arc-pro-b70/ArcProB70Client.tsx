"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { MemoryStick, Gauge, Activity, Zap } from "lucide-react";
import {
  ARC_PRO_B70_QUOTE_URL as QUOTE_URL,
  ARC_PRO_B70_PRICE_LABEL as PRICE,
  ARC_PRO_B70_CTA_LABEL as CTA,
} from "@/config/solutions";
import s from "./ArcProB70.module.css";

const ASSET = "/solutions/arc-pro-b70";

const PX = "clamp(16px,4vw,48px)";
const PY = "clamp(96px,12vw,160px)";

// ─── 콘텐츠 (확정 카피, 임의 수정 금지 — ASUS UGen B70 Sales Kit v1.1 기준) ───
const TABS = [
  {
    label: "로컬 LLM 추론",
    body: "클라우드 의존 없이 데이터를 사내에 두고, 24GB 카드에 올라가지 않는 모델을 구동합니다. 듀얼 B70(64GB)은 llama.cpp SYCL에서 MoE 모델을 단일 카드 54.7 tok/s로, 80B급 모델을 43.4 tok/s로 처리합니다. 원클릭 스크립트로 4장 구성 540 tok/s 추론 서버를 세울 수 있습니다.",
    stack: "스택: llama.cpp SYCL · vLLM XPU · Ollama",
  },
  {
    label: "에이전트 동시성",
    body: "멀티 에이전트 환경에서 병목은 연산이 아니라 메모리로 옮겨갑니다. 32GB는 KV 캐시의 빈틈을 채웁니다. Backend.AI 테스트에서 32 동시 요청 처리량이 RTX Pro 4000 대비 1.25배였고, 컨텍스트가 길어지고 동시성이 높아질수록 격차는 더 벌어집니다. Backend.AI는 2026년 6월부터 B70을 공식 지원합니다.",
    stack: "스택: Backend.AI · vLLM",
  },
  {
    label: "RAG · 임베딩",
    body: "규제 산업에서 흔한 프라이빗 벡터 검색과 문서 Q&A. 듀얼 B70(64GB)에 e5-mistral-7b를 올리고 FastAPI로 OpenAI 호환 엔드포인트를 제공합니다. eRacks는 법률·의료·공공·금융 RAG에 B70을 채택했으며 HIPAA, FedRAMP, PCI 요구사항을 충족합니다.",
    stack: "스택: IPEX-LLM · TEI · FastAPI",
  },
  {
    label: "이미지 · 영상 생성",
    body: "더 큰 이미지·영상 모델을 로컬에서 돌리고, 워크플로우 규모가 VRAM에 갇히지 않습니다. Civitai는 B70/B65를 \"ComfyUI의 가성비 왕\"이라 평했고, LTX-Video는 OpenVINO IR FP16으로 2초 클립을 3.4초에 생성합니다. 실무에서는 한 장은 영상, 한 장은 LLM에 할당하는 구성이 일반적입니다.",
    stack: "스택: ComfyUI · Wan 2.2 · LTX · OpenVINO",
  },
] as const;

const SPECS = [
  { k: "GPU 아키텍처", v: "Intel Xe2 · TSMC 5nm (N5) · 32 Xe-코어 · 256 XMX AI 엔진" },
  { k: "AI 연산", v: "최대 367 TOPS (INT8)" },
  { k: "메모리", v: "32GB GDDR6 ECC · 256-bit · 608 GB/s" },
  { k: "부스트 클럭", v: "2,800 MHz" },
  { k: "인터페이스", v: "PCIe 5.0 x16 (네이티브)" },
  { k: "디스플레이 출력", v: "DisplayPort 2.1 UHBR13.5 ×3 · HDMI 2.1b ×1 · 최대 7680×4320 @120Hz" },
  { k: "소비 전력", v: "TBP 290W" },
  { k: "폼팩터", v: "풀하이트 · 2슬롯" },
  { k: "멀티 GPU", v: "최대 4장 · 128GB VRAM" },
  { k: "소프트웨어", v: "Intel Extension for PyTorch · oneAPI · OpenVINO · Vulkan · vLLM XPU · llama.cpp SYCL" },
] as const;

const STATS = [
  { Icon: MemoryStick, label: "VRAM", num: "32", unit: "GB", desc: "GDDR6 ECC · 256-bit" },
  { Icon: Gauge, label: "AI 연산", num: "367", unit: "TOPS", desc: "INT8 · 256 XMX 엔진" },
  { Icon: Activity, label: "대역폭", num: "608", unit: "GB/s", desc: "추론 최적화 메모리 서브시스템" },
  { Icon: Zap, label: "소비 전력", num: "290", unit: "W", desc: "TBP · 2슬롯 풀하이트" },
] as const;

const VRAM_BARS = [
  { name: "8B 모델", val: "9.6GB", w: "30%" },
  { name: "13B 모델", val: "15.6GB", w: "48.75%" },
  { name: "27B 모델", val: "32.4GB", w: "100%" },
] as const;

const PERF_STATS = [
  { num: "4.75×", title: "첫 토큰 응답 속도 (TTFT)", src: "A사 워크스테이션 GPU 대비 · Puget Systems" },
  { num: "93K", title: "컨텍스트 윈도우", src: "32GB VRAM 기준 · Intel 공식" },
  { num: "369", title: "tokens/s · 50 동시 요청", src: "vLLM · Level1Techs" },
  { num: "4.1×", title: "달러당 최대 모델 파라미터", src: "B사 플래그십 GPU 대비 · Newegg 2026/06" },
] as const;

const CMP_A = "rgba(124,128,136,0.5)";
const CMP_B = "rgba(124,128,136,0.35)";

const TTFT_BARS = [
  { name: "Intel Arc Pro B70", val: "0.08s", w: "21%", main: true, fill: undefined },
  { name: "B사 워크스테이션 GPU", val: "0.17s", w: "45%", main: false, fill: CMP_A },
  { name: "A사 워크스테이션 GPU", val: "0.38s", w: "100%", main: false, fill: CMP_B },
] as const;

const TPS_BARS = [
  { name: "Intel Arc Pro B70", val: "123", w: "100%", main: true, fill: undefined },
  { name: "A사 워크스테이션 GPU", val: "115", w: "93.5%", main: false, fill: CMP_A },
  { name: "B사 워크스테이션 GPU", val: "115", w: "93.5%", main: false, fill: CMP_B },
] as const;

const ROI_BARS = [
  { name: "로컬 B70 ×4 · 27B 모델", val: "$3.18", w: "12.7%", main: true, fill: undefined },
  { name: "클라우드 프론티어 모델 (출력)", val: "$25.00", w: "100%", main: false, fill: "rgba(124,128,136,0.45)" },
] as const;

const LINEUP = [
  {
    brand: "intel",
    logo: `${ASSET}/logo-intel.png`,
    logoAlt: "INTEL",
    logoW: 3000,
    logoH: 1217,
    img: `${ASSET}/intel-b70-ref.png`,
    imgAlt: "Intel Arc Pro B70 레퍼런스",
    name: ["Intel Arc Pro B70", "레퍼런스"],
    desc: "Intel 순정 블로워 설계. 멀티 GPU 구성에 최적화된 2슬롯 표준 폼팩터.",
  },
  {
    brand: "asrock",
    logo: `${ASSET}/logo-asrock.png`,
    logoAlt: "ASRock",
    logoW: 500,
    logoH: 127,
    img: `${ASSET}/asrock-creator-2.jpg`,
    imgAlt: "ASRock Intel Arc Pro B70 Creator 32GB",
    name: ["ASRock Arc Pro B70", "Creator 32GB"],
    desc: "Precision by Design. 크리에이터 워크스테이션을 위한 골드 라인 마감, 3년 품질보증.",
  },
  {
    brand: "asus",
    logo: `${ASSET}/logo-asus.png`,
    logoAlt: "ASUS",
    logoW: 802,
    logoH: 420,
    img: `${ASSET}/asus-ugen-b70.png`,
    imgAlt: "ASUS UGen Intel Arc Pro B70 32G",
    name: ["ASUS UGen Arc Pro", "B70 32G"],
    desc: "ASUS UGen AI 가속기 라인업의 코어 시리즈. MuseBox · Multi-LM Tuner 소프트웨어 번들.",
  },
] as const;

const SYSTEMS = [
  {
    config: "single",
    img: `${ASSET}/scene-dev.jpg`,
    alt: "개인 개발자 워크스테이션",
    tag: "싱글 카드 · 32GB",
    title: "Prosumer",
    sub: "개인 전문가 · AI 개발자",
    body: "16GB 카드로는 14B를 넘는 모델이나 고정밀 추론에서 막힙니다. 32GB 한 장이면 27B 미만 모델 대부분을 그대로 올리고, 최적화 시 더 큰 모델도 구동합니다.",
  },
  {
    config: "dual",
    img: `${ASSET}/scene-studio.jpg`,
    alt: "소규모 스튜디오",
    tag: "듀얼 카드 · 64GB",
    title: "Studio",
    sub: "소규모 기업 · 크리에이티브 스튜디오",
    body: "클라우드 추론은 쓸수록 비용이 오르고 민감한 데이터가 밖으로 나갑니다. 듀얼 카드 64GB는 80B급 모델을 43.4 tok/s로 구동하며, 모든 데이터를 사내에 둡니다.",
  },
  {
    config: "multi",
    img: `${ASSET}/scene-enterprise.jpg`,
    alt: "기업 AI 인프라",
    tag: "멀티 카드 · 128GB",
    title: "Enterprise",
    sub: "기업 부서 단위 AI 팀",
    body: "클라우드 API는 백만 토큰당 수십 달러, 컴플라이언스 부담은 별도입니다. 4장 128GB 구성은 원클릭 스크립트로 540 tok/s 추론 서버를 세우고, 장기 비용을 낮춥니다.",
  },
] as const;

const FRAMEWORKS = [
  "Intel LLM Scaler / vLLM XPU",
  "llama.cpp SYCL · Vulkan",
  "Ollama",
  "OpenVINO · oneAPI",
  "PyTorch XPU",
  "ComfyUI",
  "Backend.AI",
] as const;

const MODELS = [
  "Llama 3.1 / 3.2 (8B–70B)",
  "Qwen 3.x (7B–80B)",
  "DeepSeek-R1 Distill",
  "Mistral · Mixtral",
  "gpt-oss (20B, 120B)",
  "Whisper-large-v3",
  "InternVL3.5",
] as const;

/** 페이지 내 앵커: html { scroll-behavior:smooth } 를 전역에 추가하지 않고 JS로 부드럽게 이동 */
function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.getAttribute("href")?.slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  e.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  window.history.pushState(null, "", `#${id}`);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (t - a) / (b - a)));

interface BarRow {
  name: string;
  val: string;
  w: string;
  main: boolean;
  fill?: string;
}

function BarList({ rows, gap, large }: { rows: readonly BarRow[]; gap: number; large?: boolean }) {
  return (
    <div className="flex flex-col" style={{ gap }}>
      {rows.map((b) => (
        <div key={b.name}>
          <div
            className={`mb-2 flex justify-between text-[14px]${b.main ? "" : " text-[#B7BAC1]"}`}
          >
            <span className={b.main ? "font-bold" : undefined}>{b.name}</span>
            <span className={`tabular-nums${b.main ? " font-bold" : ""}`}>{b.val}</span>
          </div>
          <div
            data-reveal
            className={`${s.bar}${large ? ` ${s.barLg}` : ""}`}
            style={{ "--w": b.w } as CSSProperties}
            role="img"
            aria-label={`${b.name} ${b.val}`}
          >
            <span className={s.barFill} style={b.fill ? { background: b.fill } : undefined} />
          </div>
        </div>
      ))}
    </div>
  );
}

interface Props {
  /** next/font/google(Onest) CSS 변수 클래스 */
  fontClassName?: string;
}

export default function ArcProB70Client({ fontClassName = "" }: Props) {
  const [tab, setTab] = useState(0);
  const tabsId = useId();

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const stageBgRef = useRef<HTMLDivElement>(null);
  const stageImgRef = useRef<HTMLDivElement>(null);
  const stageImg2Ref = useRef<HTMLDivElement>(null);
  const stageImg3Ref = useRef<HTMLDivElement>(null);
  const stageText1Ref = useRef<HTMLParagraphElement>(null);
  const stageText2Ref = useRef<HTMLParagraphElement>(null);
  const stageCapRef = useRef<HTMLParagraphElement>(null);
  const hdrRef = useRef(0);

  // 사이트 공통 헤더(sticky) 높이 실측 → --hdr (서브네비/스테이지 sticky 오프셋)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const header = document.querySelector<HTMLElement>("header.sticky");
    if (!header) return;
    const apply = () => {
      const h = Math.round(header.getBoundingClientRect().height);
      hdrRef.current = h;
      root.style.setProperty("--hdr", `${h}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  // 스크롤 리빌 + 스크롤 스테이지 (refs만 변경, 프레임당 React 상태 없음)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const IN = s.in;
    const revealEls = () => Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduce) {
      revealEls().forEach((el) => el.classList.add(IN));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(IN);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls().forEach((el) => io.observe(el));

    // 폴백: 뷰포트 안에 이미 있는 요소는 즉시 표시 (옵저버 지연/미발화 대비)
    const revealVisible = () => {
      const vh = window.innerHeight;
      revealEls().forEach((el) => {
        if (el.classList.contains(IN)) return;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add(IN);
      });
    };

    // 핸드오프 Component.updateStage() 를 --hdr(사이트 헤더) 보정만 추가해 그대로 이식
    const updateStage = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const hdr = hdrRef.current;
      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight - hdr; // 사이트 헤더를 제외한 유효 뷰포트
      const total = rect.height - vh;
      const p = Math.min(1, Math.max(0, (hdr - rect.top) / total));
      const bg = stageBgRef.current;
      const img = stageImgRef.current;
      // 배경: rgb(11,12,14) → rgb(14,18,26), p .35→.75
      const c = seg(p, 0.35, 0.75);
      if (bg)
        bg.style.backgroundColor = `rgb(${Math.round(lerp(11, 14, c))},${Math.round(lerp(12, 18, c))},${Math.round(lerp(14, 26, c))})`;
      if (img) {
        const grow = seg(p, 0, 0.3);
        const shrink = seg(p, 0.35, 0.8);
        img.style.opacity = String(Math.min(1, grow * 1.6));
        img.style.transform = `scale(${lerp(lerp(0.7, 1.1, grow), 0.6, shrink)}) translateY(${lerp(lerp(80, 0, grow), -30, shrink)}px)`;
      }
      // 레이어: Intel(base) → ASRock in(.42→.55)×out(.66→.78) → ASUS UGen in(.66→.78)
      const i2 = stageImg2Ref.current;
      const i3 = stageImg3Ref.current;
      if (i2) i2.style.opacity = String(seg(p, 0.42, 0.55) * (1 - seg(p, 0.66, 0.78)));
      if (i3) i3.style.opacity = String(seg(p, 0.66, 0.78));
      const cap = stageCapRef.current;
      if (cap) cap.style.opacity = String(seg(p, 0.45, 0.6) * (1 - seg(p, 0.9, 0.98)));
      const off = Math.min(200, vh * 0.3);
      const t1 = stageText1Ref.current;
      const t2 = stageText2Ref.current;
      if (t1) {
        const i = seg(p, 0.05, 0.2);
        const o = seg(p, 0.3, 0.45);
        t1.style.opacity = String(i * (1 - o));
        t1.style.transform = `translateY(${lerp(30, 0, i) - o * 30 - off}px)`;
      }
      if (t2) {
        const i = seg(p, 0.55, 0.72);
        t2.style.opacity = String(i);
        t2.style.transform = `translateY(${lerp(30, 0, i) - off}px)`;
      }
    };

    let ticking = false;
    const tick = () => {
      ticking = false;
      updateStage();
      revealVisible();
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    tick();
    const timers = [300, 1200, 3000].map((t) => setTimeout(tick, t));

    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const h2Display = `${s.gradBlue} ${s.onest} m-0 font-extrabold tracking-[-0.04em] leading-none`;
  const h2Size = { fontSize: "clamp(44px,7vw,96px)" } as const;
  const subhead = "font-bold tracking-[-0.02em] leading-[1.3]";
  const subheadSize = { fontSize: "clamp(20px,2.2vw,28px)" } as const;

  return (
    <div ref={rootRef} className={`${s.root} ${fontClassName}`}>
      {/* 0. 서브네비 */}
      <nav className={s.subnav} aria-label="Intel Arc Pro B70 페이지 내 이동">
        <div
          className="mx-auto flex h-[52px] max-w-[1280px] items-center justify-between"
          style={{ padding: `0 ${PX}` }}
        >
          <div className="flex items-baseline gap-[10px]">
            <span className={`${s.onest} text-[16px] font-bold tracking-[-0.02em]`}>Intel Arc Pro B70</span>
            <span className="text-[12px] text-[#7C8088]">32GB · 로컬 AI 전용관</span>
          </div>
          <div className="flex items-center gap-5">
            <div className={`${s.subnavLinks} flex items-center gap-5`}>
              <a href="#lineup" className={s.subnavLink} onClick={onAnchorClick}>라인업</a>
              <a href="#specs" className={s.subnavLink} onClick={onAnchorClick}>사양</a>
            </div>
            <a
              href={QUOTE_URL}
              rel="noopener"
              className={s.btnWhite}
              style={{ fontSize: 13, padding: "7px 18px" }}
            >
              {CTA}
            </a>
          </div>
        </div>
      </nav>

      {/* 1. 히어로 */}
      <section className={s.hero}>
        <Image
          src={`${ASSET}/bg-streaks.jpg`}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", opacity: 0.7 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,12,14,0.6) 0%, rgba(11,12,14,0.1) 40%, rgba(11,12,14,0.9) 100%)",
          }}
        />
        <div className="relative text-center" style={{ padding: `clamp(56px,9vh,110px) ${PX} 0` }}>
          <div data-reveal className="flex justify-center">
            <Image
              src={`${ASSET}/logo-intel.png`}
              alt="INTEL"
              width={3000}
              height={1217}
              priority
              className={`${s.logoInvert} h-[22px] w-auto`}
            />
          </div>
          <h1
            data-reveal
            className={`${s.onest} font-extrabold tracking-[-0.04em] leading-none`}
            style={{ margin: "24px 0 0", fontSize: "clamp(44px,8vw,108px)" }}
          >
            Arc Pro B70
          </h1>
          <p
            data-reveal
            className={`${s.gradBlue} font-extrabold tracking-[-0.03em] leading-[1.3] [text-wrap:pretty]`}
            style={{ margin: "22px 0 0", fontSize: "clamp(22px,3vw,38px)" }}
          >
            32GB. 로컬 AI의 새로운 기준.
          </p>
        </div>
        <div className="relative flex flex-1 items-center justify-center" style={{ padding: `32px ${PX}` }}>
          <Image
            data-reveal="scale"
            src={`${ASSET}/intel-b70-ref-cut.png`}
            alt="Intel Arc Pro B70"
            width={1024}
            height={1024}
            priority
            sizes="(max-width: 900px) 80vw, 720px"
            className={s.heroImg}
          />
        </div>
        <div className="relative text-center" style={{ padding: `0 ${PX} clamp(40px,7vh,72px)` }}>
          <div data-reveal className="flex flex-wrap justify-center gap-3">
            <a href={QUOTE_URL} rel="noopener" className={s.btnWhite} style={{ fontSize: 16, padding: "14px 32px" }}>
              {CTA}
            </a>
            <a href="#lineup" className={s.btnOutline} onClick={onAnchorClick}>
              라인업 보기
            </a>
          </div>
          <p data-reveal className="mt-4 text-[14px] text-[#B7BAC1]">
            Intel 레퍼런스 · ASRock Creator · ASUS UGen — 공식 수입사 인텍앤컴퍼니
          </p>
        </div>
      </section>

      {/* 2. 스크롤 스테이지: 세 모델 크로스페이드 */}
      <section ref={stageRef} className={s.stageWrap} aria-label="Intel Arc Pro B70 라인업 소개">
        <div ref={stageBgRef} className={s.stage}>
          <p ref={stageText1Ref} className={s.stageText} style={{ opacity: 0 }}>
            클라우드 없이, <span className={s.gradBlue}>32GB</span>의 여유로
            <br />
            27B 모델을 내 데스크에서.
          </p>
          <p ref={stageText2Ref} className={s.stageText} style={{ opacity: 0 }}>
            하나의 GPU,
            <br />
            세 가지 선택.
          </p>
          <div ref={stageImgRef} className={s.stageImg} style={{ opacity: 0 }}>
            <Image
              src={`${ASSET}/intel-b70-ref-cut.png`}
              alt="Intel Arc Pro B70 레퍼런스"
              width={1024}
              height={1024}
              sizes="(max-width: 900px) 84vw, 820px"
              className={`${s.stageShadow} block h-auto w-full`}
            />
            <div ref={stageImg2Ref} className={s.stageLayer}>
              <Image
                src={`${ASSET}/asrock-creator-2-cut.png`}
                alt="ASRock Intel Arc Pro B70 Creator 32GB"
                width={1000}
                height={1000}
                sizes="(max-width: 900px) 84vw, 820px"
                className={`${s.stageShadow} block h-auto w-full`}
              />
            </div>
            <div ref={stageImg3Ref} className={`${s.stageLayer} ${s.stageLayerAsus}`}>
              <Image
                src={`${ASSET}/asus-ugen-b70.png`}
                alt="ASUS UGen Intel Arc Pro B70 32G"
                width={1672}
                height={941}
                sizes="(max-width: 900px) 84vw, 820px"
                className={`${s.stageShadow} block h-auto w-full`}
              />
            </div>
          </div>
          <p ref={stageCapRef} className={s.stageCaption}>
            Intel 레퍼런스 · ASRock Creator · ASUS UGen
          </p>
        </div>
      </section>

      {/* 3. 핵심 사양 카드 4열 */}
      <section id="why" className="mx-auto max-w-[1280px]" style={{ padding: `clamp(80px,10vw,120px) ${PX} 0` }}>
        <div className={`${s.g4} gap-5`}>
          {STATS.map(({ Icon, label, num, unit, desc }) => (
            <div key={label} data-reveal className={s.statCard}>
              <div className={s.statIcon}>
                <Icon size={28} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div>
                <div className="text-[12px] text-[#7C8088]">{label}</div>
                <div
                  className={`${s.gradBlue} font-extrabold tracking-[-0.03em] leading-[1.1]`}
                  style={{ fontSize: "clamp(26px,2.6vw,34px)" }}
                >
                  {num}
                  <span className="ml-1 text-[0.6em]">{unit}</span>
                </div>
                <div className="mt-1 text-[13px] text-[#B7BAC1]">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Why 32GB */}
      <section className="mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
        <div className={`${s.g2} items-start`} style={{ gap: "clamp(40px,6vw,96px)" }}>
          <div>
            <h2 data-reveal className={h2Display} style={h2Size}>
              Why 32GB
            </h2>
            <p
              data-reveal
              className="leading-[1.6] text-[#B7BAC1] [text-wrap:pretty]"
              style={{ margin: "28px 0 0", fontSize: "clamp(17px,2vw,24px)" }}
            >
              AI 모델은 메모리에 통째로 올라가야 돌아갑니다. 16GB 카드는 14B를 넘는 모델이나 고정밀 추론에서 한계에 닿고, 부족한 VRAM은 데이터를 시스템 메모리로 밀어내며 성능을 10배 이상 떨어뜨립니다. 32GB는 27B급 모델 대부분을 양자화 없이 담고, 긴 컨텍스트와 멀티 에이전트의 KV 캐시까지 여유를 남깁니다.
            </p>
          </div>
          <div data-reveal className={s.chartCard}>
            <div className="text-[13px] font-semibold tracking-[0.02em] text-[#7C8088]">
              모델 크기별 필요 VRAM (INT8 기준)
            </div>
            <div className="mt-7 flex flex-col gap-[22px]">
              {VRAM_BARS.map((b) => (
                <div key={b.name}>
                  <div className="mb-2 flex justify-between text-[14px]">
                    <span className="font-semibold">{b.name}</span>
                    <span className="tabular-nums text-[#B7BAC1]">{b.val}</span>
                  </div>
                  <div
                    data-reveal
                    className={s.bar}
                    style={{ "--w": b.w } as CSSProperties}
                    role="img"
                    aria-label={`${b.name} ${b.val}`}
                  >
                    <span className={s.barFill} />
                  </div>
                </div>
              ))}
            </div>
            <div className="relative mt-4 h-[22px] text-[11px] text-[#7C8088]">
              <span className={s.refline} style={{ left: "50%" }}>16GB 카드</span>
              <span className={s.refline} style={{ left: "75%" }}>24GB 카드</span>
              <span className="absolute right-0 font-bold leading-[2.2] text-[#3D9BE9]">B70 32GB</span>
            </div>
            <p className="mt-6 text-[12px] leading-[1.6] text-[#4E525A]">
              가중치 기준 추정치(파라미터 × 정밀도 바이트). 실제 운용 시 컨텍스트 길이·KV 캐시·배치 크기에 따라 약 20% 이상의 추가 메모리가 필요합니다. 출처: ASUS UGen B70 Sales Kit.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Performance */}
      <section className="bg-[#0E0F12]">
        <div className="mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
          <h2 data-reveal className={h2Display} style={h2Size}>
            Performance
          </h2>
          <p data-reveal className={`mt-5 ${subhead}`} style={subheadSize}>
            제3자 검증으로 확인된 추론 성능.
          </p>
          <div className={`${s.g4} mt-16 gap-5`}>
            {PERF_STATS.map((st) => (
              <div key={st.num} data-reveal className={s.perfStat}>
                <div
                  className={`${s.gradBlue} ${s.onest} font-extrabold tracking-[-0.04em] leading-none`}
                  style={{ fontSize: "clamp(44px,5vw,72px)" }}
                >
                  {st.num}
                </div>
                <div className="mt-[14px] text-[15px] font-semibold">{st.title}</div>
                <p className="mt-[6px] text-[13px] leading-[1.6] text-[#7C8088]">{st.src}</p>
              </div>
            ))}
          </div>
          <div className={`${s.g2} mt-16 gap-5`}>
            <div data-reveal className={s.panelCard}>
              <div className="text-[13px] font-semibold text-[#7C8088]">첫 토큰 지연 시간 (초, 낮을수록 좋음)</div>
              <div className="mt-6">
                <BarList rows={TTFT_BARS} gap={18} />
              </div>
            </div>
            <div data-reveal className={s.panelCard}>
              <div className="text-[13px] font-semibold text-[#7C8088]">토큰 생성 속도 (tok/s, 높을수록 좋음)</div>
              <div className="mt-6">
                <BarList rows={TPS_BARS} gap={18} />
              </div>
            </div>
          </div>
          <p className="mt-6 text-[12px] leading-[1.6] text-[#4E525A]">
            출처: Puget Systems Intel Arc Pro B70 Review (2026/06), Intel 공식 벤치마크, Level1Techs, Newegg.com 2026/06/29. 테스트 환경·모델·양자화 설정에 따라 결과는 달라질 수 있습니다.
          </p>
        </div>
      </section>

      {/* 6. Local LLM (탭) */}
      <section className="mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
        <div className="max-w-[880px]">
          <h2 data-reveal className={h2Display} style={h2Size}>
            Local LLM
          </h2>
          <p
            data-reveal
            className="leading-[1.6] text-[#B7BAC1] [text-wrap:pretty]"
            style={{ margin: "32px 0 0", fontSize: "clamp(17px,2vw,24px)" }}
          >
            데이터는 PC 밖으로 나가지 않고, 토큰 비용은 청구되지 않습니다. Intel Arc Pro B70은 llama.cpp, vLLM, Ollama, OpenVINO 등 검증된 스택 위에서 Llama, Qwen, DeepSeek, gpt-oss 같은 오픈 모델을 그대로 구동합니다. 카드를 더하면 64GB, 128GB로 확장됩니다.
          </p>
        </div>
        <div className="text-center" style={{ marginTop: "clamp(56px,7vw,88px)" }}>
          <div
            data-reveal
            role="tablist"
            aria-label="Local LLM 활용 방식"
            className="inline-flex flex-wrap justify-center border-b border-[rgba(255,255,255,0.1)]"
            style={{ gap: "clamp(16px,3vw,40px)" }}
          >
            {TABS.map((t, i) => (
              <button
                key={t.label}
                type="button"
                role="tab"
                id={`${tabsId}-tab-${i}`}
                aria-selected={tab === i}
                aria-controls={`${tabsId}-panel`}
                tabIndex={tab === i ? 0 : -1}
                className={s.tab}
                onClick={() => setTab(i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const next = (i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
                    setTab(next);
                    document.getElementById(`${tabsId}-tab-${next}`)?.focus();
                  }
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div
            data-reveal
            role="tabpanel"
            id={`${tabsId}-panel`}
            aria-labelledby={`${tabsId}-tab-${tab}`}
          >
            <p
              className="mx-auto max-w-[760px] leading-[1.7] text-[#E6E8EB] [text-wrap:pretty]"
              style={{ margin: "36px auto 0", fontSize: "clamp(16px,1.9vw,21px)", minHeight: "6em" }}
            >
              {TABS[tab].body}
            </p>
            <p className="mx-auto mt-5 text-[13px] text-[#7C8088]">{TABS[tab].stack}</p>
          </div>
        </div>
      </section>

      {/* 7. Lineup */}
      <section id="lineup" className="bg-[#0E0F12]">
        <div className="mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
          <div className="text-center">
            <h2 data-reveal className={h2Display} style={h2Size}>
              Lineup
            </h2>
            <p data-reveal className={`mt-5 ${subhead}`} style={subheadSize}>
              같은 B70, 세 브랜드의 마감.
            </p>
          </div>
          <div className={`${s.g3} mx-auto mt-16 max-w-[1080px] items-stretch gap-5`}>
            {LINEUP.map((m) => (
              <div key={m.brand} data-reveal className={s.lineCard}>
                <div className={s.lineTile}>
                  <Image
                    src={m.img}
                    alt={m.imgAlt}
                    fill
                    sizes="(max-width: 900px) 100vw, 360px"
                    style={{ objectFit: "contain", padding: 16 }}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-[10px] p-6">
                  <Image
                    src={m.logo}
                    alt={m.logoAlt}
                    width={m.logoW}
                    height={m.logoH}
                    className={`${s.logoInvert} h-4 w-auto self-start`}
                  />
                  <div className="text-[18px] font-bold tracking-[-0.02em] leading-[1.3]">
                    {m.name[0]}
                    <br />
                    {m.name[1]}
                  </div>
                  <p className="m-0 text-[13px] leading-[1.6] text-[#7C8088]">{m.desc}</p>
                  <div className="mt-auto pt-3 text-[14px] font-semibold text-[#B7BAC1]">{PRICE}</div>
                  <a href={`${QUOTE_URL}&brand=${m.brand}`} rel="noopener" className={s.quoteLink}>
                    이 모델로 견적 요청 →
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-[12px] text-[#4E525A]">
            세 모델 모두 동일한 Intel Arc Pro B70 GPU · 32GB GDDR6 ECC · 290W TBP 사양을 공유합니다. 쿨링 설계와 보증 정책은 브랜드별로 다릅니다.
          </p>
        </div>
      </section>

      {/* 8. Systems */}
      <section className="mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
        <div className="max-w-[880px]">
          <h2 data-reveal className={h2Display} style={h2Size}>
            Systems
          </h2>
          <p data-reveal className={`mt-5 ${subhead}`} style={subheadSize}>
            한 장에서 네 장까지. 규모에 맞게.
          </p>
        </div>
        <div className={`${s.g3} mt-16 items-stretch gap-5`}>
          {SYSTEMS.map((c) => (
            <div key={c.config} data-reveal className={s.lineCard}>
              <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
                <Image
                  src={c.img}
                  alt={c.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-7">
                <span className={s.pill}>{c.tag}</span>
                <div
                  className={`${s.gradBlue} ${s.onest} font-extrabold tracking-[-0.03em] leading-[1.05]`}
                  style={{ fontSize: "clamp(28px,2.6vw,36px)" }}
                >
                  {c.title}
                </div>
                <div className="text-[17px] font-bold tracking-[-0.02em]">{c.sub}</div>
                <p className="m-0 text-[14px] leading-[1.7] text-[#B7BAC1] [text-wrap:pretty]">{c.body}</p>
                <a href={`${QUOTE_URL}&config=${c.config}`} rel="noopener" className={`${s.quoteLink} mt-auto pt-2`}>
                  이 구성으로 견적 요청 →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. ROI */}
      <section className="bg-[#0E0F12]">
        <div
          className={`${s.g2} mx-auto max-w-[1280px] items-center`}
          style={{ padding: `${PY} ${PX}`, gap: "clamp(40px,6vw,96px)" }}
        >
          <div>
            <h2 data-reveal className={h2Display} style={h2Size}>
              4.2개월
            </h2>
            <p data-reveal className={`mt-5 ${subhead}`} style={subheadSize}>
              클라우드 API 대비 투자 회수 기간.
            </p>
            <p
              data-reveal
              className="mt-6 leading-[1.7] text-[#B7BAC1] [text-wrap:pretty]"
              style={{ fontSize: "clamp(15px,1.7vw,18px)" }}
            >
              10명이 월 2,000만 토큰씩 쓰는 팀 기준. 4장 B70 시스템($18,400)으로 27B 모델을 돌리면 백만 토큰당 전기료 포함 $3.18. 프론티어 클라우드 모델의 출력 토큰 단가 $25와 비교하면 월 $4,364이 절감됩니다. 그 이후는 데이터 프라이버시와 오프라인 가용성이 덤으로 남습니다.
            </p>
          </div>
          <div data-reveal className={s.panelCard}>
            <div className="text-[13px] font-semibold text-[#7C8088]">백만 토큰당 비용</div>
            <div className="mt-6">
              <BarList rows={ROI_BARS} gap={22} large />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[rgba(255,255,255,0.08)] pt-6">
              <div>
                <div className="text-[12px] text-[#7C8088]">월 절감액</div>
                <div className="mt-1 text-[22px] font-extrabold tracking-[-0.02em] tabular-nums">$4,364</div>
              </div>
              <div>
                <div className="text-[12px] text-[#7C8088]">초기 하드웨어</div>
                <div className="mt-1 text-[22px] font-extrabold tracking-[-0.02em] tabular-nums">$18,400</div>
              </div>
            </div>
            <p className="mt-5 text-[12px] leading-[1.6] text-[#4E525A]">
              출처: Puget Systems 2026/06, Anthropic 공시 가격 2026/07. 사용량·전기료·모델 선택에 따라 달라집니다.
            </p>
          </div>
        </div>
      </section>

      {/* 10. Software */}
      <section className="mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
        <div className={`${s.g2} items-start`} style={{ gap: "clamp(40px,6vw,96px)" }}>
          <div>
            <h2 data-reveal className={h2Display} style={h2Size}>
              Software
            </h2>
            <p data-reveal className={`mt-5 ${subhead}`} style={subheadSize}>
              이미 쓰는 스택, 그대로.
            </p>
            <p
              data-reveal
              className="mt-6 leading-[1.7] text-[#B7BAC1] [text-wrap:pretty]"
              style={{ fontSize: "clamp(15px,1.7vw,18px)" }}
            >
              Intel LLM Scaler 컨테이너 하나로 vLLM XPU 환경이 완성됩니다. INT4·FP8 온라인 양자화가 내장되어 외부 CUDA 양자화 툴이 필요 없고, PyTorch XPU는 2025년 GA 이후 정식 지원됩니다.
            </p>
          </div>
          <div className="flex flex-col gap-8">
            <div data-reveal>
              <div className="mb-[14px] text-[13px] font-semibold text-[#7C8088]">지원 프레임워크</div>
              <div className="flex flex-wrap gap-2">
                {FRAMEWORKS.map((f) => (
                  <span key={f} className={s.pillFw}>{f}</span>
                ))}
              </div>
            </div>
            <div data-reveal>
              <div className="mb-[14px] text-[13px] font-semibold text-[#7C8088]">검증된 모델</div>
              <div className="flex flex-wrap gap-2">
                {MODELS.map((m) => (
                  <span key={m} className={s.pillModel}>{m}</span>
                ))}
              </div>
              <p className="mt-4 text-[13px] text-[#7C8088]">최대 검증 사례: Qwen3-Coder 80B @ 43.4 tok/s (듀얼 카드)</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. 주요 사양 */}
      <section id="specs" className="mx-auto max-w-[880px]" style={{ padding: `${PY} ${PX}` }}>
        <h2
          data-reveal
          className="m-0 text-center font-extrabold tracking-[-0.03em]"
          style={{ fontSize: "clamp(28px,3.5vw,40px)" }}
        >
          주요 사양
        </h2>
        <dl data-reveal className="mt-12 border-t border-[rgba(61,155,233,0.3)]">
          {SPECS.map((row) => (
            <div key={row.k} className={s.specRow}>
              <dt className="text-[14px] font-semibold text-[#3D9BE9]">{row.k}</dt>
              <dd className="m-0 text-[14px] leading-[1.6] text-[#E6E8EB]">{row.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-[12px] leading-[1.6] text-[#4E525A]">
          공통 GPU 사양 기준. 브랜드별 쿨링·클럭·보증 조건은 각 제품 상세를 확인해 주세요.
        </p>
      </section>

      {/* 12. 견적 CTA */}
      <section id="buy" className="relative overflow-hidden">
        <Image
          src={`${ASSET}/bg-streaks.jpg`}
          alt=""
          fill
          sizes="100vw"
          className="pointer-events-none"
          style={{ objectFit: "cover", opacity: 0.5 }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg,#0B0C0E 0%,rgba(11,12,14,0.3) 50%,#0B0C0E 100%)" }}
        />
        <div className="relative mx-auto max-w-[1280px] text-center" style={{ padding: `${PY} ${PX}` }}>
          <Image
            data-reveal
            src={`${ASSET}/intech-logo-white.png`}
            alt="INTECH & Company"
            width={800}
            height={361}
            className="mx-auto h-6 w-auto"
          />
          <h2
            data-reveal
            className="mt-7 font-extrabold tracking-[-0.03em] leading-[1.1]"
            style={{ fontSize: "clamp(32px,5vw,64px)" }}
          >
            공식 수입사 직영몰에서
            <br />
            만나보세요.
          </h2>
          <p data-reveal className="mt-5 text-[15px] text-[#B7BAC1]">정품 보증 | 공식 수입사 직영 | A/S 보장</p>
          <div data-reveal className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href={QUOTE_URL} rel="noopener" className={s.btnWhite} style={{ fontSize: 16, padding: "14px 36px" }}>
              {CTA}
            </a>
          </div>
          <p data-reveal className="mt-4 text-[13px] text-[#7C8088]">기업·대량구매 견적은 인텍 B2B몰 회원 전용입니다.</p>
        </div>
      </section>
    </div>
  );
}
