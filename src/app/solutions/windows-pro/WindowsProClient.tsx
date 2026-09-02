"use client";

import { useEffect, useId, useRef, useState, type ComponentType } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Building2,
  Settings2,
  MonitorSmartphone,
  PackageCheck,
  Layers,
  Box,
  Cpu,
  Building,
  ArrowRight,
  ArrowUpRight,
  Phone,
  FileText,
  Shield,
  Monitor,
  Laptop,
  type LucideProps,
} from "lucide-react";
import {
  WINDOWS_PRO_QUOTE_URL as QUOTE_URL,
  B2B_REGISTER_URL as REGISTER_URL,
  WINDOWS_PRO_PRICE_FPP as PRICE_FPP,
  WINDOWS_PRO_PRICE_DSP as PRICE_DSP,
  WINDOWS_PRO_PRICE_VOLUME as PRICE_VOLUME,
  WINDOWS_PRO_CTA_LABEL as CTA,
} from "@/config/solutions";
import s from "./WindowsPro.module.css";

const ASSET = "/solutions/windows-pro";

const PX = "clamp(16px,4vw,48px)";
const PY = "clamp(96px,12vw,160px)";

type Icon = ComponentType<LucideProps>;

// ─── 콘텐츠 (확정 카피, 임의 수정 금지 — Microsoft Home vs Pro 공식 자료 기준) ───
const PRO_FEATURES: readonly { Icon: Icon; title: string; body: string }[] = [
  {
    Icon: ShieldCheck,
    title: "BitLocker 드라이브 암호화",
    body: "노트북을 잃어버려도 데이터는 잠겨 있습니다. TPM 기반 전체 디스크 암호화와 USB 매체 암호화(BitLocker To Go).",
  },
  {
    Icon: Building2,
    title: "도메인 · Microsoft Entra 조인",
    body: "회사 계정 하나로 모든 PC에 로그인. Active Directory와 Entra ID(구 Azure AD)에 연결해 사용자·권한을 중앙에서 관리합니다.",
  },
  {
    Icon: Settings2,
    title: "그룹 정책 · MDM 관리",
    body: "업데이트 시점, 앱 설치 권한, USB 차단까지 IT 팀이 정책으로 배포합니다. Intune 등 MDM 등록과 Windows Update for Business 지원.",
  },
  {
    Icon: MonitorSmartphone,
    title: "원격 데스크톱 호스트",
    body: "사무실 PC에 집에서 접속합니다. Home은 접속만 가능하고, 접속을 받는 호스트 기능은 Pro부터입니다.",
  },
  {
    Icon: PackageCheck,
    title: "Windows Autopilot",
    body: "박스에서 꺼내 전원을 켜면 회사 설정이 자동으로 내려옵니다. 신규 입사자 PC 세팅에 IT 인력이 붙지 않아도 됩니다.",
  },
  {
    Icon: Layers,
    title: "Hyper-V · Windows Sandbox",
    body: "개발·검증용 가상 머신을 별도 소프트웨어 없이 구동. 의심스러운 파일은 일회용 샌드박스에서 안전하게 열어봅니다.",
  },
];

const PRO_MINI = [
  { title: "Windows Hello for Business", body: "얼굴·지문·PIN 기반 무비밀번호 로그인" },
  { title: "Windows Information Protection", body: "회사 데이터와 개인 데이터 분리" },
  { title: "키오스크 · 할당된 액세스", body: "매장·전시용 단일 앱 모드" },
  { title: "최대 2TB RAM · 2 CPU", body: "워크스테이션급 하드웨어 지원" },
] as const;

interface Device {
  /** B2B RFQ 프리필 키 (`&tier=`) */
  key: string;
  tier: string;
  name: string;
  target: string;
  spec: string;
  /** 실제 제품컷 확보 시 경로만 넣으면 플레이스홀더 대신 렌더 (예: `${ASSET}/ipc-entry.png`) */
  image?: string;
  imageAlt?: string;
}

// 모델명·사양은 예시 — 실제 유통 라인업으로 교체 예정
const DESKTOPS: readonly Device[] = [
  {
    key: "entry",
    tier: "Entry",
    name: "iPC Pro Entry",
    target: "사무·행정 · 문서 중심 업무",
    spec: "Intel Core i5 · 16GB DDR5 · 512GB NVMe · 내장 그래픽 · 무소음 소형 케이스 · Windows 11 Pro",
  },
  {
    key: "mainstream",
    tier: "Mainstream",
    name: "iPC Pro Mainstream",
    target: "기획·디자인 · 멀티태스킹",
    spec: "Intel Core i7 · 32GB DDR5 · 1TB NVMe · 전문가용 그래픽 옵션 · 듀얼 모니터 출력 · Windows 11 Pro",
  },
  {
    key: "performance",
    tier: "Performance",
    name: "iPC Pro Performance",
    target: "개발·영상·CAD · 로컬 AI",
    spec: "Intel Core i9 · 64GB DDR5 · 2TB NVMe · Intel Arc Pro / RTX 워크스테이션 GPU · ECC 옵션 · Windows 11 Pro",
  },
];

const LAPTOPS: readonly Device[] = [
  {
    key: "expertbook14",
    tier: "14형 · 1.0kg대",
    name: "ASUS ExpertBook 14",
    target: "외근·영업 · 이동이 많은 직군",
    spec: "Intel Core Ultra 5 · 16GB · 512GB · 군용 내구성 규격 · 지문 인식 · Windows 11 Pro",
  },
  {
    key: "expertbook16",
    tier: "16형",
    name: "ASUS ExpertBook 16",
    target: "사무·재무 · 넓은 화면 작업",
    spec: "Intel Core Ultra 7 · 32GB · 1TB · 숫자 키패드 · 프라이버시 셔터 웹캠 · Windows 11 Pro",
  },
  {
    key: "proart",
    tier: "모바일 워크스테이션",
    name: "ASUS ProArt · ExpertBook Pro",
    target: "디자인·개발 · 고성능 이동 업무",
    spec: "Intel Core Ultra 9 · 64GB · 2TB · 전문가용 외장 GPU · 색 정확도 인증 디스플레이 · Windows 11 Pro",
  },
];

const DEVICE_TABS: readonly { label: string; PlaceholderIcon: Icon; items: readonly Device[] }[] = [
  { label: "iPC 데스크톱", PlaceholderIcon: Monitor, items: DESKTOPS },
  { label: "ASUS 노트북", PlaceholderIcon: Laptop, items: LAPTOPS },
];

const STEPS = [
  { num: "01", title: "요구 사양 상담", body: "부서별 업무 유형과 수량, 예산에 맞춰 iPC·노트북 구성을 제안합니다." },
  { num: "02", title: "라이선스 확정", body: "디바이스 탑재(OEM) 또는 별도 구매(FPP·볼륨) 중 조직에 맞는 방식을 안내합니다." },
  { num: "03", title: "조립 · 사전 설정", body: "Windows 11 Pro 설치, 정품 인증, 드라이버, 요청 시 자산 태그 부착까지 마쳐 출고합니다." },
  { num: "04", title: "납품 · A/S", body: "일괄 납품 후 공식 수입사 직접 A/S. 세금계산서·거래명세서 발행." },
] as const;

const LICENSES: readonly { key: string; Icon: Icon; title: string; body: string; price: string }[] = [
  {
    key: "fpp",
    Icon: Box,
    title: "Windows 11 Pro FPP (처음사용자용)",
    body: "USB 패키지. PC를 바꿔도 라이선스가 따라갑니다. 개인 사업자·소규모 팀에 적합.",
    price: PRICE_FPP,
  },
  {
    key: "dsp",
    Icon: Cpu,
    title: "Windows 11 Pro DSP (OEM)",
    body: "하드웨어와 함께 구매하는 조건의 설치용 라이선스. 새 PC 조립·대량 구매 시 가장 경제적.",
    price: PRICE_DSP,
  },
  {
    key: "volume",
    Icon: Building,
    title: "볼륨 라이선스 · Pro 업그레이드",
    body: "5대 이상 조직용. Home → Pro 업그레이드, CSP 구독형 라이선스, 라이선스 감사 대응 문서까지 지원.",
    price: PRICE_VOLUME,
  },
];

const CTA_INFO: readonly { Icon: Icon; text: string }[] = [
  { Icon: Phone, text: "1544-6549 · 평일 09:30 ~ 17:00" },
  { Icon: FileText, text: "세금계산서 · 거래명세서 · 라이선스 증서 발행" },
  { Icon: Shield, text: "정품 보증 | 공식 수입사 직영 | A/S 보장" },
];

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

export default function WindowsProClient({ fontClassName = "" }: Props) {
  const [tab, setTab] = useState(0);
  const tabsId = useId();

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const stageBgRef = useRef<HTMLDivElement>(null);
  const stageImgRef = useRef<HTMLDivElement>(null);
  const stageImg2Ref = useRef<HTMLDivElement>(null);
  const stageBaseRef = useRef<HTMLDivElement>(null);
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
      // 배경: 라이트 rgb(245,245,247) → 다크 rgb(29,29,31), p .4→.75
      const c = seg(p, 0.4, 0.75);
      if (bg)
        bg.style.backgroundColor = `rgb(${Math.round(lerp(245, 29, c))},${Math.round(lerp(245, 29, c))},${Math.round(lerp(247, 31, c))})`;
      // 텍스트 가시도 먼저 계산 (이미지 디밍/하강에 사용)
      const t1In = seg(p, 0.05, 0.2);
      const t1Out = seg(p, 0.3, 0.45);
      const t1Op = t1In * (1 - t1Out);
      const t2In = seg(p, 0.6, 0.78);
      const t2Op = t2In;
      const textOp = Math.max(t1Op, t2Op);
      if (img) {
        const grow = seg(p, 0, 0.3);
        const shrink = seg(p, 0.35, 0.8);
        // 텍스트가 떠 있는 동안 이미지를 흐리게(최대 70%) + 아래로 밀어(최대 70px) 겹침 방지
        // 텍스트 구간에서도 이미지는 보이게(최대 40%만 흐림) — 겹침 방지는 하강(120px)·헤일로가 담당
        img.style.opacity = String(Math.min(1, grow * 1.6) * (1 - 0.4 * textOp));
        img.style.transform = `scale(${lerp(lerp(0.7, 1.05, grow), 0.62, shrink)}) translateY(${lerp(lerp(80, 0, grow), -20, shrink) + 120 * textOp}px)`;
      }
      // 레이어: 태블릿(base) → Surface 2-in-1 크로스페이드 (.5→.66). 두 장이 동시에 보이지 않게 베이스는 사라짐
      const x = seg(p, 0.48, 0.7); // 크로스페이드를 더 천천히
      const i2 = stageImg2Ref.current;
      if (i2) i2.style.opacity = String(x);
      const base = stageBaseRef.current;
      if (base) base.style.opacity = String(1 - x);
      const cap = stageCapRef.current;
      if (cap) cap.style.opacity = String(seg(p, 0.55, 0.7) * (1 - seg(p, 0.9, 0.98)));
      // 텍스트는 이미지 중심보다 충분히 위에 (겹침 방지)
      const off = Math.min(200, vh * 0.27);
      const t1 = stageText1Ref.current;
      const t2 = stageText2Ref.current;
      if (t1) {
        t1.style.opacity = String(t1Op);
        t1.style.transform = `translateY(${lerp(30, 0, t1In) - t1Out * 30 - off}px)`;
      }
      if (t2) {
        t2.style.opacity = String(t2Op);
        t2.style.transform = `translateY(${lerp(30, 0, t2In) - off}px)`;
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

  const h2Base = `${s.onest} m-0 font-extrabold tracking-[-0.04em] leading-none`;
  const h2Light = `${s.gradLight} ${h2Base}`;
  const h2Dark = `${s.gradDark} ${h2Base}`;
  const h2Size = { fontSize: "clamp(44px,7vw,96px)" } as const;
  const subhead = "font-bold tracking-[-0.02em] leading-[1.3]";
  const subheadSize = { fontSize: "clamp(20px,2.2vw,28px)" } as const;

  return (
    <div ref={rootRef} className={`${s.root} ${fontClassName}`}>
      {/* 0. 서브네비 (라이트) */}
      <nav className={s.subnav} aria-label="Windows Pro Device 페이지 내 이동">
        <div
          className="mx-auto flex h-[52px] max-w-[1280px] items-center justify-between"
          style={{ padding: `0 ${PX}` }}
        >
          <div className="flex items-baseline gap-[10px]">
            <span className={`${s.onest} text-[16px] font-bold tracking-[-0.02em]`}>Windows Pro Device</span>
            <span className="text-[12px] text-[#6E6E73]">기업용 디바이스 · 인텍앤컴퍼니</span>
          </div>
          <div className="flex items-center gap-5">
            <div className={`${s.subnavLinks} flex items-center gap-5`}>
              <a href="#devices" className={s.subnavLink} onClick={onAnchorClick}>디바이스</a>
              <a href="#license" className={s.subnavLink} onClick={onAnchorClick}>Windows 단품</a>
            </div>
            <a
              href={QUOTE_URL}
              rel="noopener"
              className={s.btnBlack}
              style={{ fontSize: 13, padding: "7px 18px" }}
            >
              {CTA}
            </a>
          </div>
        </div>
      </nav>

      {/* 1. 히어로 (다크, 풀블리드) */}
      <section className={s.hero}>
        <Image
          src={`${ASSET}/bg-bloom-wave.png`}
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
              "linear-gradient(180deg, rgba(11,18,32,0.55) 0%, rgba(11,18,32,0.05) 45%, rgba(11,18,32,0.7) 100%)",
          }}
        />
        <div className="relative text-center" style={{ padding: `clamp(56px,9vh,110px) ${PX} 0` }}>
          <div data-reveal className="flex items-center justify-center gap-[14px]">
            <Image
              src={`${ASSET}/logo-microsoft-white.png`}
              alt="Microsoft"
              width={1408}
              height={301}
              priority
              className="h-[22px] w-auto"
            />
            <span className="h-[18px] w-px bg-[rgba(255,255,255,0.3)]" aria-hidden="true" />
            <span className={`${s.onest} text-[15px] font-bold tracking-[-0.01em] text-[#C7C7CC]`}>
              Windows 11 Pro
            </span>
          </div>
          <h1
            data-reveal
            className={`${s.onest} font-extrabold tracking-[-0.04em] leading-none`}
            style={{ margin: "24px 0 0", fontSize: "clamp(44px,8vw,108px)" }}
          >
            Pro Device
          </h1>
          <p
            data-reveal
            className={`${s.gradHero} font-extrabold tracking-[-0.03em] leading-[1.3] [text-wrap:pretty]`}
            style={{ margin: "22px 0 0", fontSize: "clamp(22px,3vw,38px)" }}
          >
            업무용 PC는, 처음부터 Pro로.
          </p>
          <p
            data-reveal
            className="mx-auto max-w-[640px] leading-[1.6] text-[#C7C7CC] [text-wrap:pretty]"
            style={{ margin: "20px auto 0", fontSize: "clamp(15px,1.7vw,19px)" }}
          >
            Windows 11 Pro가 기본 탑재된 iPC 데스크톱과 ASUS 비즈니스 노트북. 공식 수입사가 정품 라이선스부터 배포, A/S까지 책임집니다.
          </p>
        </div>
        <div className="relative flex flex-1 items-center justify-center" style={{ padding: `24px ${PX} 0` }}>
          <Image
            data-reveal="scale"
            src={`${ASSET}/laptop-cut.png`}
            alt="Windows 11 Pro 노트북"
            width={1600}
            height={820}
            priority
            sizes="(max-width: 900px) 90vw, 920px"
            className={s.heroImg}
          />
        </div>
        <div className="relative text-center" style={{ padding: `0 ${PX} clamp(40px,7vh,72px)` }}>
          <div data-reveal className="flex flex-wrap justify-center gap-3">
            <a href={QUOTE_URL} rel="noopener" className={s.btnWhite} style={{ fontSize: 16, padding: "14px 32px" }}>
              {CTA}
            </a>
            <a href="#pro" className={s.btnOutline} onClick={onAnchorClick}>
              Pro가 다른 이유
            </a>
          </div>
          <p data-reveal className="mt-4 text-[14px] text-[#A1A1A6]">
            Windows 11 Pro 단품(FPP · DSP · 볼륨 라이선스) 별도 구매 가능
          </p>
        </div>
      </section>

      {/* 2. 스크롤 스테이지 (라이트 → 다크) */}
      <section ref={stageRef} className={s.stageWrap} aria-label="Windows 11 Pro 디바이스 소개">
        <div ref={stageBgRef} className={s.stage}>
          <p ref={stageText1Ref} className={`${s.stageText} ${s.stageText1}`} style={{ opacity: 0 }}>
            Home 에디션으로는 안 되는 것들이
            <br />
            <span className={s.gradOnLight}>기업에는 필수</span>입니다.
          </p>
          <p ref={stageText2Ref} className={`${s.stageText} ${s.stageText2}`} style={{ opacity: 0 }}>
            데스크톱도, 노트북도.
            <br />
            Pro로 통일하세요.
          </p>
          <div ref={stageImgRef} className={s.stageImg} style={{ opacity: 0 }}>
            <div ref={stageBaseRef} className={s.stageBaseWrap}>
              <Image
                src={`${ASSET}/tablet-cut.png`}
                alt="Windows 11 Pro 태블릿"
                width={1600}
                height={918}
                sizes="(max-width: 900px) 84vw, 820px"
                className={`${s.stageBase} block h-auto w-full`}
              />
            </div>
            <div ref={stageImg2Ref} className={s.stageLayer}>
              <Image
                src={`${ASSET}/surface-cut.png`}
                alt="Windows 11 Pro 2-in-1"
                width={1600}
                height={1284}
                sizes="(max-width: 900px) 70vw, 690px"
                className={`${s.stageLayerImg} block h-auto w-full`}
              />
            </div>
          </div>
          <p ref={stageCapRef} className={s.stageCaption}>
            데스크톱 · 노트북 · 2-in-1 태블릿, 모두 Windows 11 Pro
          </p>
        </div>
      </section>

      {/* 3. Why Pro (다크) */}
      <section id="pro" className={s.darkSection}>
        <Image
          src={`${ASSET}/bg-bloom-blur.png`}
          alt=""
          fill
          sizes="100vw"
          className="pointer-events-none"
          style={{ objectFit: "cover", opacity: 0.35 }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg,#0B1220 0%,rgba(11,18,32,0.4) 40%,#0B1220 100%)" }}
        />
        <div className="relative mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
          <div className="max-w-[880px]">
            <h2 data-reveal className={h2Dark} style={h2Size}>
              Why Pro
            </h2>
            <p
              data-reveal
              className="leading-[1.6] text-[#C7C7CC] [text-wrap:pretty]"
              style={{ margin: "32px 0 0", fontSize: "clamp(17px,2vw,24px)" }}
            >
              Windows 11 Pro는 Home과 같은 화면 위에 기업이 요구하는 보안·관리·연결 기능을 더한 에디션입니다. 회사 계정으로 로그인하고, 디스크를 암호화하고, IT 팀이 원격으로 정책을 배포하는 일이 Home에서는 불가능하고 Pro에서는 기본입니다.
            </p>
          </div>
          <div className={`${s.g3} mt-16 gap-5`}>
            {PRO_FEATURES.map(({ Icon, title, body }) => (
              <div key={title} data-reveal className={s.proCard}>
                <div className={s.proIcon}>
                  <Icon size={24} aria-hidden="true" />
                </div>
                <div className="mt-5 text-[19px] font-bold tracking-[-0.02em]">{title}</div>
                <p className="m-0 mt-[10px] text-[14px] leading-[1.7] text-[#A1A1A6]">{body}</p>
              </div>
            ))}
          </div>
          <div className={`${s.g4} mt-5 gap-5`}>
            {PRO_MINI.map((m) => (
              <div key={m.title} data-reveal className={s.proMini}>
                <div className="text-[14px] font-bold">{m.title}</div>
                <p className="m-0 mt-[6px] text-[13px] leading-[1.6] text-[#A1A1A6]">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Devices (라이트, 탭) */}
      <section id="devices" className="mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
        <div className="max-w-[880px]">
          <h2 data-reveal className={h2Light} style={h2Size}>
            Devices
          </h2>
          <p data-reveal className={`mt-5 ${subhead}`} style={subheadSize}>
            Windows 11 Pro 기본 탑재. 켜면 바로 업무.
          </p>
          <p
            data-reveal
            className="mt-5 leading-[1.7] text-[#6E6E73] [text-wrap:pretty]"
            style={{ fontSize: "clamp(15px,1.7vw,18px)" }}
          >
            인텍앤컴퍼니가 직접 조립하는 iPC 데스크톱과 공식 수입하는 ASUS 비즈니스 노트북에 정품 Windows 11 Pro를 설치해 출고합니다. 라이선스 인증, 드라이버, 초기 설정까지 마친 상태로 도착합니다.
          </p>
        </div>
        <div
          role="tablist"
          aria-label="디바이스 종류"
          className="mt-14 flex gap-2 border-b border-[#E5E5EA]"
        >
          {DEVICE_TABS.map((t, i) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              id={`${tabsId}-tab-${i}`}
              aria-selected={tab === i}
              aria-controls={`${tabsId}-panel-${i}`}
              tabIndex={tab === i ? 0 : -1}
              className={s.tab}
              onClick={() => setTab(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next = (i + (e.key === "ArrowRight" ? 1 : DEVICE_TABS.length - 1)) % DEVICE_TABS.length;
                  setTab(next);
                  document.getElementById(`${tabsId}-tab-${next}`)?.focus();
                }
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        {DEVICE_TABS.map((t, i) => (
          <div
            key={t.label}
            role="tabpanel"
            id={`${tabsId}-panel-${i}`}
            aria-labelledby={`${tabsId}-tab-${i}`}
            hidden={tab !== i}
            className={`${s.g3} mt-10 items-stretch gap-5`}
          >
            {t.items.map((d) => (
              <div key={d.key} data-reveal className={s.devCard}>
                <div className={s.devTile}>
                  {d.image ? (
                    <Image
                      src={d.image}
                      alt={d.imageAlt ?? d.name}
                      fill
                      sizes="(max-width: 900px) 100vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <>
                      <t.PlaceholderIcon size={40} strokeWidth={1.5} aria-hidden="true" />
                      <span className={s.devTileCaption}>제품 이미지 준비 중</span>
                    </>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-7">
                  <span className={s.pill}>{d.tier}</span>
                  <div className="text-[22px] font-extrabold tracking-[-0.03em] leading-[1.2]">{d.name}</div>
                  <div className="text-[14px] font-semibold text-[#424245]">{d.target}</div>
                  <p className="m-0 text-[14px] leading-[1.7] text-[#6E6E73]">{d.spec}</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-[13px] text-[#6E6E73]">Windows 11 Pro 포함</span>
                    <a
                      href={`${QUOTE_URL}&tier=${d.key}`}
                      rel="noopener"
                      className={`${s.linkWin} text-[13px]`}
                      aria-label={`${d.name} 견적 받기`}
                    >
                      견적 받기
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <p className="mt-6 text-[12px] text-[#A1A1A6]">
          구성은 견적 시 요구 사양에 맞춰 조정됩니다. 표기 사양은 대표 구성 예시입니다.
        </p>
      </section>

      {/* 5. Deployment (서피스 #F5F5F7) */}
      <section className="bg-[#F5F5F7]">
        <div className="mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
          <div className="text-center">
            <h2 data-reveal className={h2Light} style={h2Size}>
              Deployment
            </h2>
            <p data-reveal className={`mt-5 ${subhead}`} style={subheadSize}>
              견적에서 배포까지, 한 곳에서.
            </p>
          </div>
          <div className={`${s.g4} mt-16 gap-5`}>
            {STEPS.map((st) => (
              <div key={st.num} data-reveal className={s.stepCard}>
                <div
                  className={`${s.gradLight} ${s.onest} text-[40px] font-extrabold tracking-[-0.04em] leading-none`}
                >
                  {st.num}
                </div>
                <div className="mt-4 text-[18px] font-bold tracking-[-0.02em]">{st.title}</div>
                <p className="m-0 mt-2 text-[14px] leading-[1.7] text-[#6E6E73]">{st.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Windows 단품 (라이트, 2열) */}
      <section id="license" className="mx-auto max-w-[1280px]" style={{ padding: `${PY} ${PX}` }}>
        <div className={`${s.g2} items-start`} style={{ gap: "clamp(40px,6vw,96px)" }}>
          <div>
            <div data-reveal className="flex items-center gap-3">
              <Image
                src={`${ASSET}/logo-microsoft.png`}
                alt="Microsoft"
                width={447}
                height={104}
                className="h-5 w-auto"
              />
              <span className="text-[13px] font-semibold text-[#6E6E73]">공식 수입사 정품 라이선스</span>
            </div>
            <h2 data-reveal className={h2Light} style={{ ...h2Size, margin: "20px 0 0" }}>
              Windows
              <br />
              단품 구매
            </h2>
            <p
              data-reveal
              className="mt-6 leading-[1.7] text-[#6E6E73] [text-wrap:pretty]"
              style={{ fontSize: "clamp(15px,1.7vw,18px)" }}
            >
              이미 쓰고 있는 PC가 있다면 Windows 11 Pro만 따로 구매할 수 있습니다. Home에서 Pro로 업그레이드하거나, 자체 조립 PC에 새로 설치하거나, 조직 전체 라이선스를 한 번에 정리하는 세 가지 경우 모두 지원합니다.
            </p>
            <a
              data-reveal
              href={QUOTE_URL}
              rel="noopener"
              className={`${s.linkWin} mt-7 text-[15px]`}
            >
              라이선스 견적 문의 <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="flex flex-col gap-4">
            {LICENSES.map(({ key, Icon, title, body, price }) => (
              <div key={key} data-reveal className={s.licCard}>
                <div className={s.licIcon}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[18px] font-bold tracking-[-0.02em]">{title}</div>
                  <p className="m-0 mt-2 text-[14px] leading-[1.7] text-[#6E6E73]">{body}</p>
                  <div className="mt-[10px] text-[14px] font-semibold">{price}</div>
                  <a
                    href={`${QUOTE_URL}&license=${key}`}
                    rel="noopener"
                    className={s.licLink}
                    aria-label={`${title} 견적 문의`}
                  >
                    이 라이선스로 견적 문의 <ArrowRight size={14} aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. 견적 CTA (다크) */}
      <section id="quote" className={s.darkSection}>
        <Image
          src={`${ASSET}/bg-bloom-dark.jpg`}
          alt=""
          fill
          sizes="100vw"
          className="pointer-events-none"
          style={{ objectFit: "cover", objectPosition: "left center", opacity: 0.5 }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(11,18,32,0.2) 0%, rgba(11,18,32,0.85) 55%, #0B1220 100%)" }}
        />
        <div className="relative mx-auto max-w-[1280px] text-center" style={{ padding: `${PY} ${PX}` }}>
          <Image
            data-reveal
            src={`${ASSET}/intech-logo-white.png`}
            alt="INTECH & Company"
            width={800}
            height={361}
            className="mx-auto h-[22px] w-auto"
          />
          <h2
            data-reveal
            className="mt-7 font-extrabold tracking-[-0.03em] leading-[1.1]"
            style={{ fontSize: "clamp(32px,5vw,64px)" }}
          >
            견적은 B2B몰에서
            <br />
            바로 요청하세요.
          </h2>
          <p
            data-reveal
            className="mx-auto mt-5 max-w-[640px] leading-[1.7] text-[#A1A1A6] [text-wrap:pretty]"
            style={{ fontSize: "clamp(15px,1.7vw,18px)" }}
          >
            기업 고객 전용 ipcb2bmall.com에서 디바이스와 Windows 라이선스 견적을 요청하고, 거래처 등록 후 견적서·발주·세금계산서를 한 곳에서 관리하세요.
          </p>
          <div data-reveal className="mt-9 flex flex-wrap justify-center gap-3">
            <a href={QUOTE_URL} rel="noopener" className={s.btnWhite} style={{ fontSize: 16, padding: "14px 36px" }}>
              B2B몰에서 견적 요청 <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a href={REGISTER_URL} rel="noopener" className={s.btnOutlineCta}>
              거래처 등록
            </a>
          </div>
          <div
            data-reveal
            className="mt-12 flex flex-wrap justify-center text-[14px] text-[#C7C7CC]"
            style={{ gap: "clamp(20px,4vw,48px)" }}
          >
            {CTA_INFO.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-[10px]">
                <Icon size={16} className="text-[#38A7FF]" aria-hidden="true" />
                <span>{text}</span>
              </div>
            ))}
          </div>
          <p data-reveal className="mt-4 text-[13px] text-[#A1A1A6]">기업·대량구매 견적은 인텍 B2B몰 회원 전용입니다.</p>
        </div>
      </section>
    </div>
  );
}
