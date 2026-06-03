import Image from "next/image";

interface Props {
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  /** 이미지 없을 때 기본 그라데이션 CSS (예: "from-red-600 to-orange-500") */
  gradientClass: string;
  /** 이미지 없을 때 서브타이틀 색상 (예: "text-red-100") */
  subtitleColor?: string;
  /** 영문 eyebrow 라벨 (Manrope) */
  eyebrow?: string;
}

export default function PageBannerHeader({
  title,
  subtitle,
  imageUrl,
  gradientClass,
  subtitleColor = "text-white/80",
  eyebrow,
}: Props) {
  if (imageUrl) {
    return (
      <div className="relative h-[200px] md:h-[300px] overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            {eyebrow && (
              <div className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 mb-3">
                {eyebrow}
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.025em]">{title}</h1>
            <p className="text-white/80 mt-2">{subtitle}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r ${gradientClass} text-white`}>
      <div className="container mx-auto px-4 py-12">
        {eyebrow && (
          <div className={`font-en text-[11px] font-bold uppercase tracking-[0.14em] mb-3 ${subtitleColor}`}>
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.025em]">{title}</h1>
        <p className={`${subtitleColor} mt-2`}>{subtitle}</p>
      </div>
    </div>
  );
}
