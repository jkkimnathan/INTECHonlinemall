import { Metadata } from "next";

export const metadata: Metadata = {
  title: "검색",
  description: "상품 검색",
  robots: { index: false },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
