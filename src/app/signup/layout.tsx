import { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입",
  description: "인텍앤컴퍼니몰 회원가입",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
