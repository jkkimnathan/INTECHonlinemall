"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MainImageBanner,
  BannerPosition,
} from "@/lib/supabase/main-image-banners";

interface Props {
  banners?: MainImageBanner[];
}

function BannerImage({ banner }: { banner: MainImageBanner }) {
  const img = (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-100">
      <Image
        src={banner.imageUrl}
        alt={banner.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 33vw, 200px"
      />
    </div>
  );

  if (banner.linkUrl) {
    return (
      <Link href={banner.linkUrl} className="block w-full h-full">
        {img}
      </Link>
    );
  }
  return img;
}

function CenterRollingBanner({ banners }: { banners: MainImageBanner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  // 배열이 줄어들어도 인덱스가 범위를 벗어나지 않도록 보정
  const safeIndex = currentIndex % banners.length;
  const banner = banners[safeIndex];

  const img = (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-100">
      <Image
        src={banner.imageUrl}
        alt={banner.title}
        fill
        className="object-cover transition-opacity duration-700"
        sizes="(max-width: 768px) 50vw, 400px"
        priority
      />
    </div>
  );

  const content = banner.linkUrl ? (
    <Link href={banner.linkUrl} className="block w-full h-full">
      {img}
    </Link>
  ) : (
    img
  );

  return (
    <div className="relative w-full h-full">
      {content}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === safeIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MainImageBannerSection({ banners: initialBanners = [] }: Props) {
  if (initialBanners.length === 0) return null;

  const getByPosition = (pos: BannerPosition) =>
    initialBanners.filter((b) => b.position === pos);

  const left1 = getByPosition("left-1")[0];
  const left2 = getByPosition("left-2")[0];
  const left3 = getByPosition("left-3")[0];
  const centerBanners = getByPosition("center");
  const right1 = getByPosition("right-1")[0];
  const right2 = getByPosition("right-2")[0];
  const right3 = getByPosition("right-3")[0];

  const leftBanners = [left1, left2, left3].filter(Boolean);
  const rightBanners = [right1, right2, right3].filter(Boolean);

  if (leftBanners.length === 0 && centerBanners.length === 0 && rightBanners.length === 0) {
    return null;
  }

  const sideBanners = [...leftBanners, ...rightBanners];

  return (
    <section className="pt-8 pb-4 bg-white">
      <div className="container mx-auto px-4">
        {/* 데스크탑: 7컬럼 그리드 */}
        <div className="hidden md:grid grid-cols-7 gap-3 h-[420px] overflow-hidden">
          {/* Left: 큰 배너 + 작은 배너 2개 (칼럼 높이에 맞게 채움) */}
          <div className="col-span-2 flex flex-col gap-3 h-full">
            {left1 && (
              <div className="flex-1 min-h-0">
                <BannerImage banner={left1} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              {left2 && (
                <div className="aspect-square">
                  <BannerImage banner={left2} />
                </div>
              )}
              {left3 && (
                <div className="aspect-square">
                  <BannerImage banner={left3} />
                </div>
              )}
            </div>
          </div>

          {/* Center rolling banner */}
          <div className="col-span-3 h-full">
            <CenterRollingBanner banners={centerBanners} />
          </div>

          {/* Right: 큰 배너 + 작은 배너 2개 */}
          <div className="col-span-2 flex flex-col gap-3 h-full">
            {right1 && (
              <div className="flex-1 min-h-0">
                <BannerImage banner={right1} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              {right2 && (
                <div className="aspect-square">
                  <BannerImage banner={right2} />
                </div>
              )}
              {right3 && (
                <div className="aspect-square">
                  <BannerImage banner={right3} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 모바일: 센터 배너 + 좌우 배너 2열 그리드 */}
        <div className="md:hidden space-y-3">
          {centerBanners.length > 0 && (
            <div className="aspect-[4/5] w-full">
              <CenterRollingBanner banners={centerBanners} />
            </div>
          )}
          {sideBanners.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {sideBanners.map((banner) => (
                <div key={banner.id} className="aspect-square">
                  <BannerImage banner={banner} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
