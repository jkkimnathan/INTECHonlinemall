import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "인텍앤컴퍼니몰 - IT 하드웨어 공식 수입사 직영몰";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          인텍앤컴퍼니몰
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            marginBottom: 40,
          }}
        >
          INTEL · ASUS · MANLI · ASRock · Microsoft · iPC
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#60a5fa",
            background: "rgba(59, 130, 246, 0.15)",
            padding: "12px 32px",
            borderRadius: 12,
          }}
        >
          공식 수입사 직영몰 | 정품 보증 | A/S 보장
        </div>
      </div>
    ),
    { ...size }
  );
}
