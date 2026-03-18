import { Metadata } from "next";

export const metadata: Metadata = {
  title: "비회원 주문조회",
  description: "주문번호와 연락처로 주문 내역을 조회하세요",
  robots: { index: false },
};

export default function LookupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
