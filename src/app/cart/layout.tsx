import { Metadata } from "next";

export const metadata: Metadata = {
  title: "장바구니",
  description: "장바구니 상품 목록",
  robots: { index: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
