import { ImageResponse } from "next/og";

// iOS 홈화면·북마크용 아이콘(180px). 인텍 화이트 워드마크를 네이비 타일 위에 배치.
// 로고는 같은 폴더의 PNG를 번들에서 직접 읽는다(네트워크 의존 없음).
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const logoBuf = await fetch(new URL("./intech-logo-white.png", import.meta.url)).then((r) =>
    r.arrayBuffer()
  );
  const logo = `data:image/png;base64,${Buffer.from(logoBuf).toString("base64")}`;

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
          borderRadius: 40,
          padding: 22,
        }}
      >
        <img src={logo} alt="" style={{ width: "100%", height: "auto" }} />
      </div>
    ),
    { ...size }
  );
}
