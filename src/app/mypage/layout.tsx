import { Metadata } from "next";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "주문내역, 회원정보 관리",
  robots: { index: false },
};

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
