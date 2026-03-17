import { Metadata } from "next";

export const metadata: Metadata = {
  title: "주문/결제",
  description: "주문 및 결제 페이지",
  robots: { index: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
