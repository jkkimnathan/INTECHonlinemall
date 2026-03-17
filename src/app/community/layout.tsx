import { Metadata } from "next";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "인텍앤컴퍼니몰 Q&A 게시판 - 상품문의, 배송문의, 교환/반품 문의",
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
