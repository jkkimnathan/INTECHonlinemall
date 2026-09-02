import { ImageResponse } from "next/og";

// 브라우저 탭/주소창 파비콘 — 인텍 공식 2줄 워드마크(파랑)를 흰 타일에 배치
export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const buf = await fetch(new URL("./intech-logo-square.png", import.meta.url)).then((r) =>
    r.arrayBuffer()
  );
  const logo = `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
          borderRadius: 6,
        }}
      >
        <img src={logo} alt="" width={26} height={26} style={{ width: 26, height: 26 }} />
      </div>
    ),
    { ...size }
  );
}
