import { Metadata } from "next";

export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description:
    "주문·결제·배송·교환/반품·회원 등 인텍앤컴퍼니 공식몰 이용 중 자주 묻는 질문을 모았습니다.",
  alternates: { canonical: "/faq" },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
