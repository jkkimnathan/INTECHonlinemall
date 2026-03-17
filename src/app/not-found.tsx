import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4">
      <p className="text-6xl font-bold text-gray-200">404</p>
      <h1 className="text-xl font-bold text-gray-900 mt-4">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-sm text-gray-500 mt-2 text-center">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <div className="flex gap-3 mt-6">
        <Link href="/">
          <Button>홈으로 가기</Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">전체상품 보기</Button>
        </Link>
      </div>
    </div>
  );
}
