"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * 페이지 배너 배경 이미지 — 부드러운 페이드인.
 *
 * 이미지가 로드되기 전에는 부모 컨테이너의 배경(브랜드 그라데이션)이 보이고,
 * 로드가 끝나면 0.5초 페이드로 자연스럽게 나타난다.
 * "글씨 먼저 보이고 이미지가 나중에 툭 뜨는" 어색함을 없애기 위한 컴포넌트.
 * (캐시된 이미지는 hydration 전에 이미 complete 상태이므로 ref에서 즉시 표시)
 */
export default function BannerImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority
      quality={70}
      sizes="100vw"
      onLoad={() => setLoaded(true)}
      ref={(img) => {
        if (img?.complete) setLoaded(true);
      }}
      className={`object-cover transition-opacity duration-500 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
