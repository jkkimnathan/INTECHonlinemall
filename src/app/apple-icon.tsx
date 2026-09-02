import { ImageResponse } from "next/og";

// iOS 홈화면·북마크용 아이콘(180px) — 인텍 공식 2줄 워드마크(파랑)를 흰 타일에 배치
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
        }}
      >
        <img src={logo} alt="" width={148} height={148} style={{ width: 148, height: 148 }} />
      </div>
    ),
    { ...size }
  );
}
