import { ImageResponse } from "next/og";

// 브라우저 탭/주소창 파비콘. 기본 Next/Vercel 아이콘 대체.
// 작은 크기에선 워드마크가 안 읽히므로 네이비 타일 + "IN" 모노그램을 사용한다.
export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F172A",
          borderRadius: 7,
          color: "#FFFFFF",
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: -1,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        IN
      </div>
    ),
    { ...size }
  );
}
