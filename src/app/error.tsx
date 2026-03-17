"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4">
      <p className="text-5xl font-bold text-gray-200">오류</p>
      <h1 className="text-xl font-bold text-gray-900 mt-4">
        문제가 발생했습니다
      </h1>
      <p className="text-sm text-gray-500 mt-2 text-center">
        잠시 후 다시 시도해 주세요.
      </p>
      <Button className="mt-6" onClick={() => reset()}>
        다시 시도
      </Button>
    </div>
  );
}
