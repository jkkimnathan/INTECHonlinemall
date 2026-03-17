import { Metadata } from "next";

export const metadata: Metadata = {
  title: "위시리스트",
  description: "관심 상품 목록",
  robots: { index: false },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
