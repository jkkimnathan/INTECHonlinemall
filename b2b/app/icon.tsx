import { ImageResponse } from 'next/og'

// 브라우저 탭 파비콘 — 기본 Next/Vercel 아이콘 대체 (iPC B2B Mall)
export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#18181B',
          borderRadius: 7,
          color: '#FFFFFF',
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: -0.5,
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        iPC
      </div>
    ),
    { ...size },
  )
}
