# 운영·출시 가이드 (INTECH 자사몰)

이 문서 하나로 **보안 적용 → 어드민 설정 → 출시 → 부하검증**까지 끝낼 수 있게 정리했습니다.
전문 지식 없이 순서대로 따라 하시면 됩니다.

---

## 0. 환경변수 (필수 2개)

Vercel → 프로젝트 → Settings → Environment Variables 에 입력:

| 이름 | 값 위치 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 같은 화면 → `anon public` 키 |

> 이 두 개만 있으면 됩니다. **service_role 키는 코드/환경에 절대 넣지 마세요** (이 프로젝트는 사용하지 않습니다).

---

## 1. 보안 적용 (Supabase에서 SQL 2개 실행) — ⚠️ 출시 전 필수

Supabase Dashboard → **SQL Editor** → 아래 순서로 각 파일 내용을 붙여넣고 **Run**.

1. `src/lib/supabase/security_migration.sql` — RLS 정책·Q&A 비밀글 보호 (이전에 실행했다면 건너뛰어도 됨. 다시 실행해도 안전)
2. `src/lib/supabase/security_migration_v2.sql` — **이번에 추가된 핵심 보안**
   - 주문 금액/재고/적립금 서버 검증 (`create_order`)
   - 적립금·등급·관리자 권한 **자가 위조 차단** (프로필 트리거)
   - 구매자만 리뷰 작성 (`review_create`)
   - 비회원 주문조회 서버 검증 (`order_lookup`)
   - 성능·검색 인덱스

두 파일 모두 **여러 번 실행해도 안전**(idempotent)하게 작성돼 있습니다.

### 적용 확인 (선택)
SQL Editor에서:
```sql
select proname from pg_proc where proname in
  ('create_order','review_create','order_lookup','protect_profile_columns');
-- 4개가 모두 보이면 정상
```

---

## 2. 어드민(관리자) 설정 — "누구나 쉽게 관리"

관리자 권한은 **JWT의 app_metadata.is_admin** 으로만 부여됩니다(클라이언트에서 조작 불가 = 안전).

### 2-1. 관리자로 지정할 계정 만들기
1. 사이트에서 평소처럼 **회원가입** (예: `admin@intechonline.kr`)
2. Supabase → **Authentication → Users** 에서 그 사용자를 찾습니다.

### 2-2. 관리자 권한 부여 (SQL 한 줄)
Supabase → SQL Editor 에서 이메일만 바꿔 실행:
```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"is_admin": true}'::jsonb
where email = 'admin@intechonline.kr';
```
> 실행 후 해당 계정은 **다시 로그인**하면 관리자로 인식됩니다.
> 권한 회수는 `true` 를 `false` 로 바꿔 다시 실행.

### 2-3. 관리자로 할 수 있는 것
`/admin` 접속 시(관리자만 통과):
- 상품 등록/수정/삭제, 이미지 업로드
- 배너/이벤트/공지/타임딜/홈섹션/Q&A 관리
- 주문 상태 변경, 회원 조회

모든 관리자 쓰기는 DB의 `is_admin()` 정책으로도 이중 보호됩니다(앱을 우회해도 막힘).

---

## 3. 출시 전 체크리스트

- [ ] 환경변수 2개 입력 (0번)
- [ ] SQL 마이그레이션 2개 실행 (1번)
- [ ] `create_order` 등 함수 4개 생성 확인
- [ ] 관리자 계정 1개 이상 지정 (2번)
- [ ] Storage 버킷 `product-images`, `banner-images` 존재 + public 읽기
      (정책은 `security_migration.sql` 7번 섹션에서 설정됨)
- [ ] 테스트 주문 1건: 로그인 → 장바구니 → 주문 → 주문완료/조회 정상
- [ ] 비회원 주문조회: 주문번호+전화번호로 조회되는지
- [ ] 리뷰: 구매한 상품에만 작성되는지, 미구매 상품은 막히는지
- [ ] 관리자 아닌 계정으로 `/admin` 접근 시 홈으로 튕기는지
- [ ] Daum 주소검색 팝업이 열리는지 (CSP 수정 반영됨)

---

## 4. 부하 검증 (동시접속 수백~수천)

`load-tests/README.md` 참고. 요약:
```bash
# 페이지(CDN/ISR) 부하
BASE_URL=https://<site> k6 run load-tests/browse-pages.js
# 데이터 계층(DB) 부하 — 스테이징 권장
SUPABASE_URL=... SUPABASE_ANON_KEY=... k6 run load-tests/api-read.js
```
임계값(p95<0.8s, 오류<1%)을 넘으면 README의 "병목 체크리스트"를 따르세요.

---

## 5. 알아두면 좋은 보안 설계 (요약)

- **service_role 키 미사용** — 클라이언트 노출 위험 원천 차단
- **RLS 우선** — 앱 코드를 우회해도 DB가 막는 최종 방어선
- **관리자 판별 = JWT app_metadata** — 클라이언트 위조 불가
- **금액·재고·적립금 = 서버 재계산** — 브라우저가 보낸 값 불신
- **적립금/등급/관리자 = 트리거로 자가수정 차단**
- **Q&A 비밀글 비밀번호 = bcrypt 해시** + 서버 검증
- **보안 헤더** — HSTS·CSP·X-Frame-Options DENY·nosniff 적용
