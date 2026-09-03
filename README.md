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

Supabase Dashboard → SQL Editor에서 아래 파일을 **순서대로** 실행합니다.
(이미 적용한 파일은 건너뛰어도 됩니다 — 각 파일 상단 주석에 선행 조건 명시)

1. `security_migration.sql` — RLS 정책 + Q&A 보안 RPC
2. `order_security_migration.sql` — create_order RPC + 주문 직접 INSERT 차단
3. `payment_migration.sql` — 토스페이먼츠 연동 + 주문 서버 재설계
4. `payment_migration_fix.sql` — 상태 enum·포인트 트리거 보완
5. `payment_hardening_migration.sql` — 결제 안정화 (취소처리중/환불확인필요/만료 상태, 멱등키, payment_events)
6. `constraints_migration.sql` — 데이터 무결성 제약 + 비밀글 열람 시도 제한
7. `reviews_verified_migration.sql` — 실구매자만 리뷰 작성
8. `detail_html_migration.sql` — 상품 상세페이지 HTML 등록 컬럼(`products.detail_html`)

**검증**: `payment_hardening_verify.sql`을 실행해 결과에 `FAIL` 행이 없으면 정상입니다.

### 2. 환경변수 (Vercel → Settings → Environment Variables)

| 변수 | 값 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public 키 | |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role 키 | 서버 전용, 절대 공개 금지 |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 결제위젯 클라이언트 키 | 심사 통과 후 `live_gck_...`로 교체 |
| `TOSS_SECRET_KEY` | 결제위젯 시크릿 키 | 서버 전용 · `live_gsk_...`로 교체 |
| `CRON_SECRET` | 임의의 긴 랜덤 문자열 | 대사(reconcile) 크론 인증용 |

환경변수 변경 후에는 **재배포**해야 반영됩니다.

### 3. 토스페이먼츠 설정 (개발자센터)

- **API 키**: 상점(MID) → API 키에서 라이브 결제위젯 키 확인 → 위 환경변수에 입력
- **웹훅 등록**: 개발자센터 → 웹훅 → 엔드포인트 `https://<도메인>/api/payments/webhook`
  등록, 구독 이벤트 `PAYMENT_STATUS_CHANGED` (웹훅 본문은 신뢰하지 않고 서버가
  토스 조회 API로 재검증하므로 별도 시크릿 불필요)
- ⚠️ 가상계좌는 현재 미지원 (결제위젯 노출 수단에서 가상계좌 비활성 권장)

### 4. 대사(자동 점검) 크론

`vercel.json`에 매일 1회(`/api/cron/reconcile`) 크론이 등록돼 있습니다.
Vercel이 `CRON_SECRET` 환경변수를 설정하면 자동으로 `Authorization: Bearer` 헤더를
붙여 호출합니다. 승인 불명확 주문·오래된 결제대기·환불확인필요 주문을 자동 정리합니다.

### 5. Supabase Auth 설정

- 비밀번호 재설정: Authentication → URL Configuration의 **Redirect URLs**에
  `https://<도메인>/reset-password` 추가
- 이메일 인증(Confirm email) 사용 시 Site URL 확인

### 6. 라이브 전환 후 확인 (실결제 스모크 테스트)

- 소액 상품 실결제 → 주문완료 페이지 도달 + 관리자 주문 목록에 '결제완료' 표시
- 관리자에서 해당 주문 '취소' → 토스 대시보드에서 환불 확인 (카드 승인취소는 영업일 3~5일)
- 토스 개발자센터 → 웹훅 로그에서 전송 성공(2xx) 확인
