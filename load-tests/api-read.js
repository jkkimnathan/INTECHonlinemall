// ============================================================
// k6 부하 테스트 — Supabase 데이터 계층(PostgREST) 직접 부하
//
// 브라우저가 실제로 호출하는 Supabase REST/RPC 엔드포인트에 부하를 걸어
// DB·커넥션 풀러(pooler)·RLS·인덱스의 병목을 직접 검증한다.
// (browse-pages.js 는 ISR 캐시된 HTML만 보므로 DB 부하를 못 봄)
//
// 실행:
//   SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_ANON_KEY=eyJ... \
//   k6 run load-tests/api-read.js
//
// 주의: anon 키는 공개키이며 RLS 로 보호되므로 노출돼도 안전하지만,
//       부하는 반드시 스테이징/테스트 프로젝트에 거는 것을 권장.
// ============================================================
import http from "k6/http";
import { check } from "k6";
import { Rate } from "k6/metrics";

const URL = (__ENV.SUPABASE_URL || "").replace(/\/$/, "");
const KEY = __ENV.SUPABASE_ANON_KEY || "";

if (!URL || !KEY) {
  throw new Error("SUPABASE_URL 과 SUPABASE_ANON_KEY 환경변수가 필요합니다.");
}

const errorRate = new Rate("errors");

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  Accept: "application/json",
};

export const options = {
  scenarios: {
    db_read: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 100 },
        { duration: "1m", target: 400 },
        { duration: "2m", target: 800 },
        { duration: "1m", target: 800 },
        { duration: "30s", target: 0 },
      ],
      gracefulRampDown: "20s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<600", "p(99)<1500"],
    errors: ["rate<0.01"],
  },
};

const SEARCH = ["intel", "rtx", "asus", "메인보드"];

export default function () {
  // 1) 상품 목록 (최신순)
  let res = http.get(
    `${URL}/rest/v1/products?select=*&order=created_at.desc&limit=24`,
    { headers, tags: { name: "products_list" } }
  );
  errorRate.add(!check(res, { "products 200": (r) => r.status === 200 }));

  // 2) 검색 (ILIKE → pg_trgm 인덱스 검증)
  const q = SEARCH[Math.floor(Math.random() * SEARCH.length)];
  res = http.get(
    `${URL}/rest/v1/products?select=*&or=(name.ilike.*${q}*,brand.ilike.*${q}*)`,
    { headers, tags: { name: "products_search" } }
  );
  errorRate.add(!check(res, { "search 200": (r) => r.status === 200 }));

  // 3) 상품 상세 (slug 단건)
  res = http.get(
    `${URL}/rest/v1/products?select=*&slug=eq.intel-core-i7-14700k`,
    { headers, tags: { name: "product_by_slug" } }
  );
  errorRate.add(!check(res, { "detail 200": (r) => r.status === 200 }));

  // 4) Q&A 목록 RPC
  res = http.post(
    `${URL}/rest/v1/rpc/qna_list`,
    "{}",
    { headers: { ...headers, "Content-Type": "application/json" }, tags: { name: "qna_list" } }
  );
  errorRate.add(!check(res, { "qna 200": (r) => r.status === 200 }));
}
