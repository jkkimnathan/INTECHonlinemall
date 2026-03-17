import { Shield, Truck, CreditCard, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "정품 보증",
    description: "공식 수입사 직영몰 100% 정품",
  },
  {
    icon: Truck,
    title: "빠른 배송",
    description: "평일 오후 2시 이전 주문 당일 출고",
  },
  {
    icon: CreditCard,
    title: "안전한 결제",
    description: "다양한 결제수단 & 보안 결제",
  },
  {
    icon: Headphones,
    title: "A/S 보장",
    description: "전문 기술 지원 & 빠른 A/S",
  },
];

export default function Features() {
  return (
    <section className="py-10 bg-white border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <feature.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
