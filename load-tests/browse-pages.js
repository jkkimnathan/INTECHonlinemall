// ============================================================
// k6 부하 테스트 — 실제 사용자 브라우징 시나리오 (Next.js 페이지)
//
// 홈 → 상품목록 → 상품상세 → 검색 순으로 둘러보는 트래픽을 모사한다.
// 공개 페이지는 ISR 캐시되므로 CDN/서버 응답성과 캐시 적중을 검증한다.
//
// 실행:
//   BASE_URL=https://your-site.com k6 run load-tests/browse-pages.js
//
// 동시접속 규모 조절: 아래 stages 의 target(가상 사용자 수) 을 조정.
//   - 수백 명:  target 300
//   - 수천 명:  target 2000  (부하 생성 머신 사양 충분해야 함)
// ============================================================
import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = (__ENV.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const errorRate = new Rate("errors");
const pageLoad = new Trend("page_load_ms", true);

export const options = {
  scenarios: {
    ramp_browsing: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 200 },   // 워밍업
        { duration: "1m", target: 500 },    // 증가
        { duration: "2m", target: 1000 },   // 목표 동시접속
        { duration: "1m", target: 1000 },   // 유지 (지속 부하)
        { duration: "30s", target: 0 },     // 감소
      ],
      gracefulRampDown: "20s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<800", "p(99)<2000"], // 95%는 0.8s, 99%는 2s 이내
    errors: ["rate<0.01"],                            // 오류율 1% 미만
    http_req_failed: ["rate<0.01"],
  },
};

// 실제 시드된 상품 slug (seed.sql 기준). 배포 데이터에 맞게 조정 가능.
const SLUGS = [
  "intel-core-i7-14700k",
  "asus-rog-strix-b760-f-gaming-wifi",
  "manli-geforce-rtx-4070-super",
  "intel-core-i9-14900k",
  "toshiba-mg10aca20te-20tb",
];
const SEARCH_TERMS = ["intel", "rtx", "asus", "ssd", "메인보드"];

function visit(path, name) {
  const res = http.get(`${BASE_URL}${path}`, { tags: { name } });
  pageLoad.add(res.timings.duration);
  const ok = check(res, { [`${name} 200`]: (r) => r.status === 200 });
  errorRate.add(!ok);
  return res;
}

export default function () {
  group("home", () => visit("/", "home"));
  sleep(Math.random() * 2 + 1);

  group("products", () => visit("/products", "products"));
  sleep(Math.random() * 2 + 1);

  group("product_detail", () => {
    const slug = SLUGS[Math.floor(Math.random() * SLUGS.length)];
    visit(`/products/${slug}`, "product_detail");
  });
  sleep(Math.random() * 2 + 1);

  group("search", () => {
    const q = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
    visit(`/search?q=${encodeURIComponent(q)}`, "search");
  });
  sleep(Math.random() * 3 + 1);
}
