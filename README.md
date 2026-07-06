This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 배포 체크리스트 (INTECH 온라인몰)

### 1. Supabase SQL 마이그레이션 (순서대로 1회 실행)

Supabase Dashboard → SQL Editor에서 아래 파일을 순서대로 실행합니다.

1. `src/lib/supabase/security_migration.sql` — RLS 정책 + Q&A 보안 RPC (이미 적용된 환경이면 재실행해도 안전)
2. `src/lib/supabase/order_security_migration.sql` — **주문 무결성 필수**:
   - `create_order` RPC: 금액·재고·포인트를 서버에서 재계산/검증 (저장소에 편입된 표준 정의)
   - `orders` 직접 INSERT 정책 제거 (금액 위변조 주문 차단 — 주문 생성은 RPC 전용)
   - `qna_unlock` 브루트포스 완화, 리뷰 구매자 검증 정책

> ⚠️ `order_security_migration.sql`을 실행하지 않으면 주문 생성이 실패하거나
> (RPC 부재), 로그인 사용자가 임의 금액으로 주문을 직접 INSERT할 수 있습니다.

### 2. 환경변수 (Vercel → Settings → Environment Variables)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Supabase Auth 설정

- 비밀번호 재설정: Authentication → URL Configuration의 **Redirect URLs**에
  `https://<도메인>/reset-password` 추가 (이메일 재설정 링크 랜딩 페이지)
- 이메일 인증(Confirm email)을 사용하는 경우 사이트 URL이 올바른지 확인

### 4. 배포 후 확인

- 장바구니 → 주문서 → 주문 완료 흐름 (로그인 상태)
- 관리자(`/admin`) 접근이 관리자 계정에서만 가능한지
- 비밀번호 찾기 메일 수신 및 재설정 동작
