import { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description: "인텍앤컴퍼니몰 회원 로그인",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
