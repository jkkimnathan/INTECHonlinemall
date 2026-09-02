"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Cpu, LayoutGrid, Gauge, MemoryStick } from "lucide-react";
import {
  QUOTE_URL,
  PROART_GR1X_PRICE_LABEL as PRICE,
  PROART_GR1X_CTA_LABEL as CTA,
} from "@/config/solutions";
import s from "./ProArtGr1x.module.css";

const ASSET = "/solutions/proart-gr1x";
// ASUS 공식 CDN (빌드 환경에서 다운로드 불가 → next.config remotePatterns 허용)
const SILVER_URL =
  "https://dlcdnwebimgs.asus.com/gain/894d2f2d-3f3f-4850-9934-d553912e9338/w692";
const WINDOWS_AI_URL =
  "https://dlcdnwebimgs.asus.com/files/media/202605/c3379200-8584-4929-b246-ac81e169d1ce/V2/img/ai.jpg";

const PX = "clamp(16px,4vw,48px)";
const PY = "clamp(96px,12vw,160px)";

// ─── 콘텐츠 (확정 카피, 임의 수정 금지) ───
const TABS = [
  {
    label: "로컬 LLM 구동",
    body: "최대 1,200억 파라미터의 LLM을 온전히 기기 안에서 구동합니다. Llama, Gemma, Mistral, Qwen 같은 오픈 모델을 그대로 내려받아 실행하고, Stable Diffusion과 FLUX로 이미지를 생성할 수 있습니다. 128GB 통합 메모리 덕분에 양자화로 모델을 깎아내지 않아도 되고, 종단간 에이전트 워크플로우 전체를 내 데스크에서 완결할 수 있습니다.",
  },
  {
    label: "Windows 통합",
    body: "Adobe Creative Cloud, CapCut, DaVinci Resolve 등 매일 쓰는 Windows 앱 안에 AI 에이전트가 네이티브로 통합됩니다. 새 프로그램을 배우거나 브라우저 탭을 오갈 필요 없이, 작업 중인 앱에서 바로 생성·편집·자동화를 요청합니다. 프롬프트도 결과물도 PC 밖으로 나가지 않으므로 미공개 프로젝트를 다루는 크리에이터와 기업에 안전합니다.",
  },
  {
    label: "NVIDIA AI 풀스택",
    body: "데이터센터에서 쓰이는 NVIDIA AI 소프트웨어 스택을 그대로 데스크에서 씁니다. CUDA, cuDNN, TensorRT-LLM, NIM 마이크로서비스, RTX AI Toolkit까지 — 개발 환경 재구성 없이 연구실 코드가 곧바로 돌아갑니다. 로컬에서 프로토타이핑한 에이전트를 DGX 클라우드로 그대로 올릴 수 있는, 같은 아키텍처의 연속성이 핵심입니다.",
  },
] as const;

const SPECS = [
  { k: "프로세서", v: "NVIDIA RTX Spark 슈퍼칩 (GB10) — 20코어 NVIDIA Grace CPU + Blackwell RTX GPU, NVLink C2C 연결" },
  { k: "GPU", v: "NVIDIA Blackwell 아키텍처 · 6,144 CUDA 코어 · 5세대 Tensor 코어 · RTX 레이 트레이싱 코어" },
  { k: "AI 성능", v: "최대 1 PFLOP (FP4, 스파시티 기준) · 최대 1,200억 파라미터 LLM 로컬 구동" },
  { k: "메모리", v: "128GB 통합 LPDDR5X (CPU·GPU 공유 코히런트 메모리)" },
  { k: "스토리지", v: "M.2 NVMe SSD · PCIe 5.0 x4 확장 슬롯" },
  { k: "네트워킹", v: "10G LAN · Wi-Fi 7 · Bluetooth 5.4" },
  { k: "입출력", v: "USB-C 20Gbps ×3 (DP Alt 지원) · USB-C PD 3.1 180W 전원 입력 · HDMI 2.1" },
  { k: "쿨링", v: "최대 140W 써멀 헤드룸 전용 냉각 설계" },
  { k: "크기 · 컬러", v: "150 × 150 × 51 mm · 실버 / 블랙" },
  { k: "운영체제", v: "Windows 11 (Arm)" },
  { k: "소프트웨어", v: "NVIDIA AI 풀스택 · DLSS · Reflex · G-SYNC · ProArt Creator Hub · MuseTree · StoryCube" },
] as const;

const STATS = [
  { Icon: Cpu, num: "6,144", unit: "코어", label: "Blackwell RTX GPU" },
  { Icon: LayoutGrid, num: "20", unit: "코어", label: "Grace CPU" },
  { Icon: Gauge, num: "1", unit: "페타플롭", label: "FP4 AI 성능" },
  { Icon: MemoryStick, num: "128", unit: "GB", label: "통합 메모리 LPDDR5X" },
] as const;

const TECH = [
  {
    eyebrow: "Compute",
    title: "CUDA",
    body: "전 세계 데이터센터의 AI를 가속하는 그 CUDA가 이 미니 PC에서 네이티브로 실행됩니다. 6,144개의 Blackwell CUDA 코어가 연구실에서 쓰던 코드와 라이브러리를 수정 없이 그대로 돌립니다.",
  },
  {
    eyebrow: "Inference",
    title: "TensorRT",
    body: "5세대 Tensor 코어의 FP4 정밀도로 로컬 LLM 추론을 최적화합니다. 같은 모델을 더 작은 메모리에, 더 빠른 토큰 속도로. 최대 1 PFLOP의 AI 연산이 응답을 기다리는 시간을 없앱니다.",
  },
  {
    eyebrow: "Graphics",
    title: "RTX",
    body: "레이 트레이싱 코어와 DLSS, Reflex, G-SYNC, OptiX까지 RTX 기술 전체를 지원합니다. 렌더링, 시뮬레이션, 게임 어디서든 GeForce RTX 데스크톱과 같은 경험을 제공합니다.",
  },
] as const;

const USES = [
  {
    src: WINDOWS_AI_URL,
    alt: "Windows 워크플로우",
    tag: "일상 업무",
    title: "Windows on Arm",
    sub: "친숙한 Windows, 차세대 파워.",
    body: "쓰던 그대로의 Windows입니다. 매일 쓰는 앱과 워크플로우는 그대로, 그 아래에서 Grace CPU와 Blackwell GPU가 차세대 성능을 냅니다. 새로 배울 것은 없고, 새로 할 수 있는 것만 늘어납니다.",
    pills: [] as readonly string[],
  },
  {
    src: `${ASSET}/nv-creator.png`,
    alt: "크리에이티브 렌더링",
    tag: "크리에이터",
    title: "For Creators",
    sub: "백만 개의 아이디어, 실시간으로.",
    body: "RTX와 NVIDIA Studio로 가속되는 수백 개의 크리에이티브 앱과 AI 툴. 3D 렌더링, 영상 편집, 생성형 워크플로우를 실시간 정밀도로 처리합니다. ProArt Creator Hub, MuseTree, StoryCube와 완전 호환됩니다.",
    pills: [] as readonly string[],
  },
  {
    src: `${ASSET}/nv-gaming.png`,
    alt: "게이밍",
    tag: "게이머",
    title: "Gaming",
    sub: "일이 끝나면, 게임.",
    body: "레이 트레이싱 월드, DLSS 풀 스위트, NVIDIA Reflex, G-SYNC까지. 세계 최고 수준의 게이밍 기술을 그대로 지원합니다.",
    pills: ["RTX 레이 트레이싱", "DLSS", "Reflex", "G-SYNC"] as readonly string[],
  },
] as const;

const BARS = [
  { name: "ProArt GR1X", val: "128GB", w: "100%", main: true, fill: undefined },
  { name: "하이엔드 데스크톱 GPU", val: "24GB", w: "18.75%", main: false, fill: "rgba(138,131,120,0.55)" },
  { name: "게이밍 노트북 GPU", val: "16GB", w: "12.5%", main: false, fill: "rgba(138,131,120,0.4)" },
] as const;

const ENG = [
  { num: "140W", title: "전용 써멀 아키텍처", body: "장시간 렌더링과 AI 학습에도 스로틀링 없이 지속 성능을 유지합니다." },
  { num: "10GbE", title: "유선 네트워킹 내장", body: "스튜디오 협업과 엣지 AI 배포를 위한 고대역폭 전송." },
  { num: "PCIe 5.0", title: "M.2 Gen 5 x4 확장", body: "초고속 스토리지를 필요한 만큼 확장하는 M.2 슬롯." },
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

interface Props {
  /** next/font/google(Onest) CSS 변수 클래스 */
  fontClassName?: string;
}

export default function ProArtGr1xClient({ fontClassName = "" }: Props) {
  const [agentTab, setAgentTab] = useState(0);
  const tabsId = useId();

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const stageBgRef = useRef<HTMLDivElement>(null);
  const stageImgRef = useRef<HTMLDivElement>(null);
  const stageBlackRef = useRef<HTMLDivElement>(null);
  const stageText1Ref = useRef<HTMLParagraphElement>(null);
  const stageText2Ref = useRef<HTMLParagraphElement>(null);
  const stageColorRef = useRef<HTMLParagraphElement>(null);
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
      const t1 = stageText1Ref.current;
      const t2 = stageText2Ref.current;
      // 배경: 블랙 → 웜 다크브라운
      const c = seg(p, 0.35, 0.75);
      if (bg)
        bg.style.backgroundColor = `rgb(${Math.round(lerp(10, 26, c))},${Math.round(lerp(9, 20, c))},${Math.round(lerp(8, 10, c))})`;
      if (img) {
        const grow = seg(p, 0, 0.3);
        const shrink = seg(p, 0.35, 0.8);
        img.style.opacity = String(Math.min(1, grow * 1.6));
        img.style.transform = `scale(${lerp(lerp(0.7, 1.15, grow), 0.55, shrink)}) translateY(${lerp(lerp(80, 0, grow), -40, shrink)}px)`;
      }
      // 블랙 모델 크로스페이드 (다크 전환 구간)
      const bk = stageBlackRef.current;
      if (bk) bk.style.opacity = String(seg(p, 0.45, 0.62));
      const cl = stageColorRef.current;
      if (cl) cl.style.opacity = String(seg(p, 0.5, 0.65) * (1 - seg(p, 0.85, 0.95)));
      const off = Math.min(190, vh * 0.3);
      if (t1) {
        const i = seg(p, 0.05, 0.2);
        const o = seg(p, 0.3, 0.45);
        t1.style.opacity = String(i * (1 - o));
        t1.style.transform = `translateY(${lerp(30, 0, i) - o * 30 - off}px)`;
      }
      if (t2) {
        const i = seg(p, 0.6, 0.8);
        t2.style.opacity = String(i);
        t2.style.transform = `translateY(${lerp(30, 0, i) + off + 10}px)`;
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

  const goldBtn = (extra: CSSProperties): CSSProperties => ({
    fontSize: 16,
    padding: "14px 32px",
    ...extra,
  });

  return (
    <div ref={rootRef} className={`${s.root} ${fontClassName}`}>
      {/* 0. 서브네비 */}
      <nav className={s.subnav} aria-label="ProArt GR1X 페이지 내 이동">
        <div
          className="mx-auto flex h-[52px] max-w-[1280px] items-center justify-between"
          style={{ padding: `0 ${PX}` }}
        >
          <div className="flex items-baseline gap-[10px]">
            <span className={`${s.onest} text-[16px] font-bold tracking-[-0.02em]`}>ProArt GR1X</span>
            <span className="text-[12px] text-[#8A8378]">NVIDIA RTX Spark</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#specs" className={s.subnavLink} onClick={onAnchorClick}>사양</a>
            <span className={`${s.subnavPrice} text-[14px] font-semibold tabular-nums`}>{PRICE}</span>
            <a
              href={QUOTE_URL}
              rel="noopener"
              className={s.btnGold}
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
          src={`${ASSET}/kv-rings.png`}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center bottom" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,9,8,0.72) 0%, rgba(10,9,8,0.15) 45%, rgba(10,9,8,0.55) 100%)",
          }}
        />
        <div className="relative text-center" style={{ padding: `clamp(56px,9vh,110px) ${PX} 0` }}>
          <h1
            data-reveal
            className={`${s.onest} mt-5 font-extrabold tracking-[-0.03em] leading-[1.02]`}
            style={{ fontSize: "clamp(48px,8.5vw,112px)" }}
          >
            ProArt GR1X
          </h1>
          <p
            data-reveal
            className={`${s.gradGold} font-extrabold tracking-[-0.03em] leading-[1.3] [text-wrap:pretty]`}
            style={{ margin: "22px 0 0", fontSize: "clamp(22px,3vw,38px)" }}
          >
            손바닥 위의 AI 슈퍼컴퓨터.
          </p>
        </div>
        <div className="relative flex-1" />
        <div className="relative text-center" style={{ padding: `0 ${PX} clamp(40px,7vh,72px)` }}>
          <div data-reveal className="flex flex-wrap justify-center gap-3">
            <a href={QUOTE_URL} rel="noopener" className={s.btnGold} style={goldBtn({})}>
              {CTA}
            </a>
            <a href="#chip" className={s.btnOutline} onClick={onAnchorClick}>
              더 알아보기
            </a>
          </div>
          <p data-reveal className="mt-4 text-[14px] text-[#C9C2B4]">가격 미정 · 2026년 가을 출시</p>
        </div>
      </section>

      {/* 2. 스크롤 스테이지 */}
      <section ref={stageRef} className={s.stageWrap} aria-label="ProArt GR1X 제품 소개">
        <div ref={stageBgRef} className={s.stage}>
          <Image
            src={`${ASSET}/bg-gold-line.png`}
            alt=""
            fill
            sizes="100vw"
            className="pointer-events-none"
            style={{ objectFit: "cover", opacity: 0.5 }}
          />
          <p ref={stageText1Ref} className={s.stageText} style={{ opacity: 0 }}>
            NVIDIA RTX Spark 슈퍼칩을 탑재한 <span className={s.gradGold}>150mm</span>의 데스크톱.
          </p>
          <p ref={stageText2Ref} className={s.stageText} style={{ opacity: 0, color: "#F5F2EC" }}>
            AI 에이전트, 창작, 게이밍이
            <br />
            이 안에 다 있습니다.
          </p>
          <div ref={stageImgRef} className={s.stageImg} style={{ opacity: 0 }}>
            <Image
              src={SILVER_URL}
              alt="ProArt GR1X 실버"
              width={800}
              height={800}
              sizes="(max-width: 900px) 80vw, 720px"
              className={`${s.stageShadow} block h-auto w-full`}
            />
            <div ref={stageBlackRef} className={`${s.stageBlack} absolute inset-0`} style={{ opacity: 0, willChange: "opacity" }}>
              <Image
                src={`${ASSET}/gr1x-black.png`}
                alt="ProArt GR1X 블랙"
                width={800}
                height={800}
                sizes="(max-width: 900px) 80vw, 720px"
                className={`${s.stageShadow} block h-auto w-full`}
              />
            </div>
          </div>
          <p ref={stageColorRef} className={s.stageCaption}>
            실버 · 블랙, 두 가지 마감.
          </p>
        </div>
      </section>

      {/* 3. 칩 섹션 */}
      <section id="chip" className="relative overflow-hidden">
        <Image
          src={`${ASSET}/nv-chip-exploded.png`}
          alt=""
          width={1859}
          height={655}
          sizes="(max-width: 1400px) 1400px, 100vw"
          className="pointer-events-none absolute left-1/2 top-0 h-auto -translate-x-1/2"
          style={{ width: "max(100%,1400px)", maxWidth: "none", opacity: 0.55, mixBlendMode: "screen" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #0A0908 0%, rgba(10,9,8,0.35) 30%, rgba(10,9,8,0.75) 60%, #0A0908 100%)",
          }}
        />
        <div className="relative mx-auto max-w-[1280px] text-center" style={{ padding: `${PY} ${PX} 0` }}>
          <div data-reveal className={s.eyebrow}>NVIDIA RTX Spark Superchip</div>
          <h2
            data-reveal
            className={`${s.gradGold} mx-auto mt-5 max-w-[900px] font-extrabold tracking-[-0.03em] leading-[1.08]`}
            style={{ fontSize: "clamp(36px,6vw,80px)" }}
          >
            두 개의 두뇌,
            <br />
            하나의 칩.
          </h2>
          <p
            data-reveal
            className="mx-auto max-w-[640px] leading-[1.7] text-[#E8E4DB] [text-wrap:pretty]"
            style={{ margin: "28px auto 0", fontSize: "clamp(15px,1.8vw,19px)" }}
          >
            20코어 NVIDIA Grace CPU와 Blackwell RTX GPU가 NVLink C2C로 연결되어 128GB 메모리를 함께 사용합니다. 최대 1,200억 파라미터의 LLM이 클라우드 없이, 이 칩 위에서 돌아갑니다.
          </p>
          <div data-reveal="scale" className="mx-auto max-w-[1000px]" style={{ marginTop: "clamp(48px,6vw,80px)" }}>
            <Image
              src={`${ASSET}/nv-chip-only.png`}
              alt="NVIDIA RTX Spark 슈퍼칩"
              width={1419}
              height={373}
              sizes="(max-width: 1000px) 100vw, 1000px"
              className="block h-auto w-full rounded-[20px] border border-[rgba(217,185,104,0.18)]"
            />
          </div>
          <div className={`${s.g4} mt-5 gap-5 text-left`}>
            {STATS.map(({ Icon, num, unit, label }) => (
              <div key={label} data-reveal className={s.statCard}>
                <div className={s.statIcon}>
                  <Icon size={28} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[12px] text-[#8A8378]">최대</div>
                  <div
                    className={`${s.gradGold} font-extrabold tracking-[-0.03em] leading-[1.1]`}
                    style={{ fontSize: "clamp(26px,2.6vw,34px)" }}
                  >
                    {num}
                    <span className="ml-1 text-[0.6em]">{unit}</span>
                  </div>
                  <div className="mt-1 text-[13px] text-[#C9C2B4]">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mx-auto max-w-[1280px]" style={{ padding: `clamp(56px,7vw,96px) ${PX} ${PY}` }}>
          <div className={`${s.g3} items-stretch gap-5`}>
            {TECH.map((t) => (
              <div key={t.title} data-reveal className={s.techCard}>
                <div className={s.eyebrow}>{t.eyebrow}</div>
                <div
                  className={`${s.gradGold} ${s.onest} mt-4 font-extrabold tracking-[-0.04em] leading-none`}
                  style={{ fontSize: "clamp(40px,4.6vw,64px)" }}
                >
                  {t.title}
                </div>
                <p
                  className="mt-6 leading-[1.7] text-[#C9C2B4] [text-wrap:pretty]"
                  style={{ fontSize: "clamp(15px,1.4vw,17px)" }}
                >
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Local AI Agent */}
      <section className="mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
        <div className="max-w-[880px]">
          <h2
            data-reveal
            className={`${s.gradGold} ${s.onest} m-0 font-extrabold tracking-[-0.04em] leading-none`}
            style={{ fontSize: "clamp(44px,7.5vw,104px)" }}
          >
            Local AI Agent
          </h2>
          <p
            data-reveal
            className="mt-8 leading-[1.6] text-[#C9C2B4] [text-wrap:pretty]"
            style={{ fontSize: "clamp(17px,2vw,24px)" }}
          >
            ProArt GR1X는 NVIDIA RTX Spark 슈퍼칩과 128GB 통합 메모리로, 클라우드 토큰 없이 프론티어급 AI 모델을 데스크 위에서 구동합니다. AI 에이전트가 Windows 워크플로우 안에서 직접 일하고, 데이터는 PC 밖으로 나가지 않으며, 응답은 네트워크를 기다리지 않습니다. 매일 쓰는 앱 안에서, 내 데이터로, 내 속도로.
          </p>
        </div>
        <div className="text-center" style={{ marginTop: "clamp(56px,7vw,88px)" }}>
          <div
            data-reveal
            role="tablist"
            aria-label="Local AI Agent 활용 방식"
            className="inline-flex border-b border-[rgba(217,185,104,0.18)]"
            style={{ gap: "clamp(20px,4vw,48px)" }}
          >
            {TABS.map((t, i) => (
              <button
                key={t.label}
                type="button"
                role="tab"
                id={`${tabsId}-tab-${i}`}
                aria-selected={agentTab === i}
                aria-controls={`${tabsId}-panel`}
                tabIndex={agentTab === i ? 0 : -1}
                className={s.tab}
                onClick={() => setAgentTab(i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const next = (i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
                    setAgentTab(next);
                    document.getElementById(`${tabsId}-tab-${next}`)?.focus();
                  }
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p
            data-reveal
            role="tabpanel"
            id={`${tabsId}-panel`}
            aria-labelledby={`${tabsId}-tab-${agentTab}`}
            className="mx-auto max-w-[760px] leading-[1.7] text-[#E8E4DB] [text-wrap:pretty]"
            style={{ margin: "36px auto 0", fontSize: "clamp(16px,1.9vw,21px)", minHeight: "6em" }}
          >
            {TABS[agentTab].body}
          </p>
        </div>
      </section>

      {/* 5. 용도별 3열 */}
      <section className="mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
        <div className={`${s.g3} items-stretch gap-5`}>
          {USES.map((u) => (
            <div key={u.title} data-reveal className={s.useCard}>
              <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
                <Image
                  src={u.src}
                  alt={u.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="flex flex-1 flex-col gap-[14px]" style={{ padding: "28px 28px 32px" }}>
                <span className={s.pill}>{u.tag}</span>
                <div
                  className={`${s.gradGold} ${s.onest} font-extrabold tracking-[-0.03em] leading-[1.05]`}
                  style={{ fontSize: "clamp(28px,2.6vw,36px)" }}
                >
                  {u.title}
                </div>
                <div className="text-[17px] font-bold tracking-[-0.02em]">{u.sub}</div>
                <p className="m-0 text-[14px] leading-[1.7] text-[#C9C2B4] [text-wrap:pretty]">{u.body}</p>
                {u.pills.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {u.pills.map((p) => (
                      <span key={p} className={s.pillSm}>{p}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Performance */}
      <section className="bg-[#0D0C0A]">
        <div className="mx-auto max-w-[1080px]" style={{ padding: `${PY} ${PX}` }}>
          <h2
            data-reveal
            className={`${s.gradGold} ${s.onest} m-0 font-extrabold tracking-[-0.04em] leading-none`}
            style={{ fontSize: "clamp(40px,5.5vw,80px)" }}
          >
            Performance
          </h2>
          <p data-reveal className="mt-5 font-bold tracking-[-0.02em] leading-[1.3]" style={{ fontSize: "clamp(20px,2.2vw,28px)" }}>
            메모리가 곧 모델의 크기입니다.
          </p>
          <p
            data-reveal
            className="mt-6 max-w-[600px] leading-[1.7] text-[#C9C2B4] [text-wrap:pretty]"
            style={{ fontSize: "clamp(15px,1.7vw,18px)" }}
          >
            AI 모델은 메모리에 통째로 올라가야 돌아갑니다. 128GB 통합 메모리는 일반 데스크톱 GPU로는 불가능한 규모의 모델을 로컬에서 구동합니다.
          </p>
          <div className="mt-16 flex flex-col gap-9">
            {BARS.map((b) => (
              <div key={b.name}>
                <div className="mb-[10px] flex items-baseline justify-between">
                  <span className={b.main ? "text-[15px] font-bold" : "text-[14px] font-medium text-[#8A8378]"}>{b.name}</span>
                  <span className={b.main ? "text-[15px] font-bold tabular-nums" : "text-[14px] text-[#8A8378] tabular-nums"}>{b.val}</span>
                </div>
                <div
                  data-reveal
                  className={s.bar}
                  style={{ "--w": b.w } as CSSProperties}
                  role="img"
                  aria-label={`${b.name} ${b.val}`}
                >
                  <span className={s.barFill} style={b.fill ? { background: b.fill } : undefined} />
                </div>
              </div>
            ))}
          </div>
          <p
            data-reveal
            className="mt-12 font-bold tracking-[-0.02em] leading-[1.5] [text-wrap:pretty]"
            style={{ fontSize: "clamp(17px,2vw,22px)" }}
          >
            그 결과 — 최대 <span className={s.gradGold}>1,200억 파라미터</span> LLM 추론과{" "}
            <span className={s.gradGold}>90GB+ 대형 3D 씬</span> 렌더링을 이 작은 본체 하나로.
          </p>
          <p className="mt-5 text-[12px] leading-[1.6] text-[#5C574E]">
            GPU 메모리 용량 비교 기준. 일반적인 하이엔드 데스크톱(24GB)·노트북(16GB) GPU 구성과의 단순 용량 비교이며, 실제 구동 가능 모델 크기는 정밀도·양자화 설정에 따라 달라집니다.
          </p>
        </div>
      </section>

      {/* 7. 엔지니어링 */}
      <section>
        <div className="mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
          <h2
            data-reveal
            className="m-0 text-center font-extrabold tracking-[-0.03em] leading-[1.1]"
            style={{ fontSize: "clamp(32px,5vw,64px)" }}
          >
            작지만, 타협은 없습니다.
          </h2>
          <div className={`${s.g3} mt-16 gap-6`}>
            {ENG.map((e) => (
              <div key={e.num} data-reveal className={s.engCard}>
                <div className={`${s.gradGold} font-extrabold tracking-[-0.03em]`} style={{ fontSize: "clamp(28px,3vw,40px)" }}>
                  {e.num}
                </div>
                <div className="mt-2 text-[15px] font-semibold">{e.title}</div>
                <p className="mt-2 text-[14px] leading-[1.6] text-[#8A8378]">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 컬러 */}
      <section className="bg-[#0D0C0A]">
        <div className="mx-auto max-w-[1280px] text-center" style={{ padding: `${PY} ${PX}` }}>
          <h2
            data-reveal
            className="m-0 font-extrabold tracking-[-0.03em] leading-[1.1]"
            style={{ fontSize: "clamp(32px,5vw,64px)" }}
          >
            두 가지 마감.
            <br />
            <span className={s.gradGold}>어느 데스크에도.</span>
          </h2>
          <div className={`${s.g2} mx-auto mt-16 max-w-[1000px] gap-6`}>
            <div data-reveal className={s.colorCard}>
              <Image
                src={SILVER_URL}
                alt="ProArt GR1X 실버"
                width={800}
                height={800}
                sizes="380px"
                className={`${s.colorShadow} mx-auto h-auto w-full max-w-[380px]`}
              />
              <div className="mt-6 text-[17px] font-bold">실버</div>
              <p className="mt-[6px] text-[14px] text-[#8A8378]">밝은 스튜디오를 위한 알루미늄 톤</p>
            </div>
            <div data-reveal className={s.colorCard}>
              <Image
                src={`${ASSET}/gr1x-black.png`}
                alt="ProArt GR1X 블랙"
                width={800}
                height={800}
                sizes="380px"
                className={`${s.colorShadow} mx-auto h-auto w-full max-w-[380px]`}
              />
              <div className="mt-6 text-[17px] font-bold">블랙</div>
              <p className="mt-[6px] text-[14px] text-[#8A8378]">셋업에 스며드는 딥 블랙</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. 주요 사양 */}
      <section id="specs" className="mx-auto max-w-[880px]" style={{ padding: `${PY} ${PX}` }}>
        <h2
          data-reveal
          className="m-0 text-center font-extrabold tracking-[-0.03em]"
          style={{ fontSize: "clamp(28px,3.5vw,40px)" }}
        >
          주요 사양
        </h2>
        <dl data-reveal className="mt-12 border-t border-[rgba(217,185,104,0.22)]">
          {SPECS.map((row) => (
            <div key={row.k} className={s.specRow}>
              <dt className="text-[14px] font-semibold text-[#D9B968]">{row.k}</dt>
              <dd className="m-0 text-[14px] leading-[1.6] text-[#E8E4DB]">{row.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-[12px] leading-[1.6] text-[#5C574E]">
          모든 사양은 사전 공개 정보 기준이며 예고 없이 변경될 수 있습니다. 정확한 출시 사양은 정식 발표를 확인해 주세요.
        </p>
      </section>

      {/* 10. 견적 CTA */}
      <section id="buy" className="relative overflow-hidden">
        <Image
          src={`${ASSET}/bg-gold-line.png`}
          alt=""
          fill
          sizes="100vw"
          className="pointer-events-none"
          style={{ objectFit: "cover" }}
        />
        <div className="relative mx-auto max-w-[1280px] text-center" style={{ padding: `${PY} ${PX}` }}>
          <Image
            data-reveal
            src={`${ASSET}/intech-logo-white.png`}
            alt="INTECH & Company"
            width={53}
            height={24}
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
          <p data-reveal className="mt-5 text-[15px] text-[#C9C2B4]">정품 보증 | 공식 수입사 직영 | A/S 보장</p>
          <div data-reveal className="mt-9 flex flex-wrap items-center justify-center gap-5">
            <span className="text-[22px] font-bold tabular-nums">{PRICE}</span>
            <a href={QUOTE_URL} rel="noopener" className={s.btnGold} style={goldBtn({ padding: "14px 36px" })}>
              {CTA}
            </a>
          </div>
          <p data-reveal className="mt-4 text-[13px] text-[#8A8378]">2026년 가을 출시 예정</p>
          <p data-reveal className="mt-2 text-[13px] text-[#8A8378]">기업·대량구매 견적은 인텍 B2B몰 회원 전용입니다.</p>
        </div>
      </section>
    </div>
  );
}
