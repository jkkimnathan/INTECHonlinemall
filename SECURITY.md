# 보안 점검 결과 및 조치 내역

전체 코드/SQL/설정을 점검한 결과와 이번에 적용한 조치를 정리합니다.
구조: **Next.js(App Router) + Supabase** — 대부분의 데이터 접근이 클라이언트에서
anon 키 + **RLS 정책**으로 이뤄지므로, DB 레벨 방어가 최종 방어선입니다.

적용 방법은 `OPERATIONS.md` 참고. SQL 2개를 Supabase에서 실행해야 아래 조치가 활성화됩니다.

---

## 🔴 심각 — 조치 완료

| # | 이슈 | 조치 |
|---|---|---|
| 1 | **적립금/등급/관리자 권한 자가 위조** — `profiles` RLS가 행 소유권만 검사해 사용자가 자기 `points`/`grade`/`is_admin` 을 API로 직접 수정 가능(무료 결제 등) | `protect_profile_columns` **트리거**로 일반 사용자는 name/phone 만 변경 가능, 민감 컬럼은 서버가 고정 |
| 2 | **`create_order` RPC 미버전관리** — 주문 보안의 핵심 함수가 리포에 없음 | `security_migration_v2.sql` 로 **버전관리**. 서버가 가격·배송비·적립금 재계산 |
| 3 | **주문 직접 INSERT 우회** — RPC를 우회해 0원 주문 삽입 + 재고 미차감 가능(독립 리뷰에서 발견) | `orders_insert_own` 정책 **제거** → 주문은 `create_order` 단일 경로만 |
| 4 | **금액/재고 클라이언트 신뢰** — 브라우저가 보낸 subtotal/total 사용 | 서버가 상품 DB 가격으로 **재계산**, 재고 **행잠금(FOR UPDATE)** 으로 초과판매 방지 |

## 🟠 중간 — 조치 완료

| # | 이슈 | 조치 |
|---|---|---|
| 5 | **미구매자 리뷰 작성 + 작성자명 사칭** — 클라이언트만 검증 | `review_create` RPC 로 **구매 서버검증**, 작성자명 서버 지정 |
| 6 | **검색 필터 인젝션** — 검색어를 PostgREST `.or()` 에 그대로 보간 | `sanitizeSearchTerm()` 으로 특수문자 제거·길이 제한 |
| 7 | **비회원 주문조회 IDOR 소지** — 전화번호 대조가 클라이언트에서 수행 | `order_lookup` RPC 로 주문번호+전화번호 **서버 대조** |
| 8 | **관리자 이미지 업로드 형식 무검증** — SVG/HTML 업로드 시 저장형 XSS 가능 | `validateImageFile()` 로 래스터 이미지 MIME 화이트리스트 + 20MB 제한 |
| 9 | **Daum 주소검색이 CSP에 차단됨** — 체크아웃 주소검색 동작 불가 | CSP 에 Daum 도메인 허용(script/img/connect/frame-src) |

## 🟡 낮음 / 정보성

| # | 이슈 | 상태 |
|---|---|---|
| 10 | 관리자 판별 이중 소스(`profiles.is_admin` vs JWT) | 실제 권한은 JWT `app_metadata` 만 사용(안전). 트리거로 `profiles.is_admin` 자가수정도 차단됨 |
| 11 | 로그인/회원가입 rate limit이 실질 무력(인증은 Supabase 직결) | Supabase Auth 자체 Rate Limit 설정에 의존 — 대시보드에서 상향 권장 |
| 12 | Supabase 원문 에러 메시지 노출 | 핵심 경로(주문/리뷰/QnA)는 RPC가 한국어 친화 메시지를 raise 하도록 개선 |
| 13 | 의존성(postcss transitive, moderate) | Next 업데이트 시 함께 해소 권장 |

---

## ✅ 원래도 잘 되어 있던 부분

- **service_role 키 미사용** — 클라이언트 노출 위험 없음
- **RLS 우선 설계** + 관리자 판별을 서버 전용 JWT `app_metadata` 로 (클라 조작 불가)
- **Q&A 비밀글 비밀번호 bcrypt 해시** + 서버 검증
- **JSON-LD XSS 방어**(`jsonLdString` 이스케이프)
- **보안 헤더** — HSTS·X-Frame-Options DENY·nosniff·Permissions-Policy

---

## 검증 방법 요약

- 코드/타입/빌드: `npx tsc --noEmit`, `npm run build` — 통과
- 마이그레이션: 독립 보안 리뷰(Postgres 관점) 수행 → 발견된 치명 결함(#3) 및
  가용성 버그(리뷰 검증 jsonb 형태) 반영 완료
- 부하: `load-tests/` k6 스크립트로 동시접속 검증(운영 URL 필요)

## 남은 권장(운영자 액션)

1. `OPERATIONS.md` 순서대로 SQL 2개 실행 + 어드민 지정
2. Supabase → Authentication → Rate Limits 상향
3. Next.js/의존성 정기 업데이트(`npm audit`)
