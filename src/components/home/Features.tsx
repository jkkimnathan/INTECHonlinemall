import { Shield, Truck, CreditCard, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "정품 보증",
    description: "공식 수입사 직영몰 · 100% 정품",
  },
  {
    icon: Truck,
    title: "빠른 배송",
    description: "평일 14시 이전 주문 당일 출고",
  },
  {
    icon: CreditCard,
    title: "안전한 결제",
    description: "다양한 결제수단 · 보안 결제",
  },
  {
    icon: Headphones,
    title: "A/S 보장",
    description: "전문 기술 지원 · 직접 A/S",
  },
];

export default function Features() {
  return (
    <section className="py-9 bg-white border-b border-[#f1f1f3]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`flex items-center gap-3.5 md:px-6 ${
                i < features.length - 1 ? "md:border-r md:border-[#f1f1f3]" : ""
              }`}
            >
              <div className="flex-shrink-0 w-9 h-9 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[#1d1d1f]">
                <feature.icon className="h-[17px] w-[17px]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[13.5px] font-bold text-[#1d1d1f] tracking-[-0.01em]">
                  {feature.title}
                </h3>
                <p className="text-[11.5px] text-[#86868b] mt-0.5 leading-[1.45] break-keep">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
