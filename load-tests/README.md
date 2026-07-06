# 부하 테스트 (동시접속 수백~수천 명 검증)

이 몰의 트래픽은 두 계층으로 나뉩니다. 각각 따로 테스트해야 진짜 병목이 보입니다.

| 계층 | 무엇을 보나 | 스크립트 |
|---|---|---|
| **Next.js 페이지 (ISR/CDN)** | 서버렌더·캐시 적중·정적 자산 응답성 | `browse-pages.js` |
| **Supabase 데이터 계층 (PostgREST/DB)** | RLS·인덱스·커넥션 풀러 병목 | `api-read.js` |

> 브라우저는 페이지 HTML(ISR 캐시)을 받은 뒤, **클라이언트에서 Supabase를 직접 호출**합니다.
> 그래서 `browse-pages.js`(HTML만 봄)만으로는 DB 부하를 알 수 없어 `api-read.js`가 반드시 필요합니다.

## 1. 설치

```bash
# macOS
brew install k6
# 또는 https://k6.io/docs/get-started/installation/
```

## 2. 실행

```bash
# (A) 페이지 브라우징 부하 — 배포된 사이트 URL 대상
BASE_URL=https://<your-site> k6 run load-tests/browse-pages.js

# (B) Supabase 데이터 계층 부하 — 반드시 스테이징 프로젝트 권장
SUPABASE_URL=https://<project>.supabase.co \
SUPABASE_ANON_KEY=<anon public key> \
k6 run load-tests/api-read.js
```

동시접속 규모는 각 스크립트 `options.scenarios[...].stages` 의 `target`(가상 사용자 수)으로 조절합니다. 기본값은 최대 1000(페이지)/800(API)입니다. 수천 명을 테스트하려면 target을 올리고, 부하 생성 머신이 충분한지(또는 k6 Cloud/분산 실행) 확인하세요.

## 3. 합격 기준(threshold) — 스크립트에 내장

- 페이지: p95 < 800ms, p99 < 2s, 오류율 < 1%
- API: p95 < 600ms, p99 < 1.5s, 오류율 < 1%

임계값을 넘으면 k6가 실패로 종료합니다.

## 4. 병목이 보이면 — 해결 체크리스트

1. **Supabase 커넥션 풀러 사용 확인**
   동시접속이 많으면 Postgres 직결(5432)은 커넥션 고갈로 무너집니다.
   클라이언트는 anon 키로 PostgREST(HTTP)를 쓰므로 기본적으로 풀러 뒤에 있지만,
   서버측 연결을 추가할 경우 반드시 **Transaction 모드 pooler(6543)** 를 사용하세요.
   (Supabase Dashboard → Database → Connection Pooling)

2. **인덱스 적용 확인** — `security_migration_v2.sql` 의 F 섹션 인덱스가 실행됐는지.
   특히 검색은 `pg_trgm` GIN 인덱스가 없으면 풀스캔으로 느려집니다.
   `explain analyze` 로 seq scan 이 도는지 점검.

3. **ISR 캐시 적중률** — 페이지 응답 헤더 `x-nextjs-cache: HIT` 확인.
   MISS가 잦으면 `revalidate` 값을 늘리세요(공개 페이지는 이미 서버렌더+ISR).

4. **이미지/정적자산** — Vercel/CDN 캐시가 도는지, 이미지가 `next/image`로
   최적화되는지 확인.

5. **읽기 부하 분산** — 트래픽이 매우 크면 Supabase read replica 또는
   상품/배너 같은 공개 데이터의 캐시 TTL 상향을 검토.

## 5. 쓰기(주문) 부하 — 별도 주의

주문 생성(`create_order`)은 로그인 토큰이 필요하고 재고를 차감(행 잠금)하므로,
읽기 부하와 성격이 다릅니다. 부하 테스트 시:

- 테스트 전용 사용자/상품(대량 재고)로만 진행하고, 끝난 뒤 데이터를 정리하세요.
- `create_order`는 상품 행에 `FOR UPDATE` 잠금을 걸어 **동일 상품 동시주문을
  직렬화**합니다(초과판매 방지). 즉 인기상품에 주문이 몰리면 그 상품에 한해
  순차 처리되는 것이 정상입니다 — 이는 정합성을 위한 의도된 동작입니다.
