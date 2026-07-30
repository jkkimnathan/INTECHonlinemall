import "server-only";

/**
 * 토스페이먼츠 코어 API 헬퍼 (서버 전용).
 *
 * 모든 호출에 명시적 timeout을 걸고, 승인/취소에는 저장된 멱등키를 사용한다.
 * timeout·네트워크 오류는 "실패"가 아니라 "불명확"으로 취급해야 하므로
 * 호출부가 구분할 수 있게 TossTimeoutError를 따로 던진다.
 */

const TOSS_API = "https://api.tosspayments.com/v1/payments";

const CONFIRM_TIMEOUT_MS = 10_000;
const CANCEL_TIMEOUT_MS = 10_000;
const INQUIRY_TIMEOUT_MS = 7_000;

export class TossTimeoutError extends Error {
  constructor(message = "토스 API 응답 시간 초과") {
    super(message);
    this.name = "TossTimeoutError";
  }
}

export interface TossPayment {
  paymentKey: string;
  orderId: string;
  status: string; // READY | IN_PROGRESS | WAITING_FOR_DEPOSIT | DONE | CANCELED | PARTIAL_CANCELED | ABORTED | EXPIRED
  totalAmount: number;
  currency: string;
  method?: string;
  approvedAt?: string;
  easyPay?: { provider?: string };
  cancels?: { cancelAmount: number; canceledAt: string }[];
}

export interface TossResult {
  ok: boolean;
  status: number;
  data: TossPayment & { code?: string; message?: string };
}

function authHeader(): string {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) throw new Error("TOSS_SECRET_KEY가 설정되지 않았습니다 (.env.local 확인)");
  return `Basic ${Buffer.from(`${secret}:`).toString("base64")}`;
}

async function tossFetch(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown; idempotencyKey?: string; timeoutMs: number }
): Promise<TossResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), init.timeoutMs);
  try {
    const headers: Record<string, string> = {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    };
    if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;

    const res = await fetch(`${TOSS_API}${path}`, {
      method: init.method,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") throw new TossTimeoutError();
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** 결제 승인. idempotencyKey는 주문별로 DB에 저장된 값을 사용할 것. */
export function tossConfirm(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
  idempotencyKey: string;
}): Promise<TossResult> {
  return tossFetch("/confirm", {
    method: "POST",
    body: { paymentKey: params.paymentKey, orderId: params.orderId, amount: params.amount },
    idempotencyKey: params.idempotencyKey,
    timeoutMs: CONFIRM_TIMEOUT_MS,
  });
}

/** 결제 취소. idempotencyKey는 주문별로 DB에 저장된 취소 키를 사용할 것. */
export function tossCancel(params: {
  paymentKey: string;
  cancelReason: string;
  idempotencyKey: string;
}): Promise<TossResult> {
  return tossFetch(`/${encodeURIComponent(params.paymentKey)}/cancel`, {
    method: "POST",
    body: { cancelReason: params.cancelReason.slice(0, 200) },
    idempotencyKey: params.idempotencyKey,
    timeoutMs: CANCEL_TIMEOUT_MS,
  });
}

/** 결제 조회 (paymentKey 기준) */
export function tossGetPayment(paymentKey: string): Promise<TossResult> {
  return tossFetch(`/${encodeURIComponent(paymentKey)}`, {
    method: "GET",
    timeoutMs: INQUIRY_TIMEOUT_MS,
  });
}

/** 결제 조회 (주문번호 기준) — paymentKey를 모르는 대사 작업에서 사용 */
export function tossGetPaymentByOrderId(orderId: string): Promise<TossResult> {
  return tossFetch(`/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    timeoutMs: INQUIRY_TIMEOUT_MS,
  });
}

/**
 * 승인 실패 응답 중 "결과 불명확/처리 중" 계열 — claim과 멱등키를 유지하고
 * 조회 API로 최종 상태를 확인해야 하는 코드들.
 *
 * - IDEMPOTENT_REQUEST_PROCESSING (409): 같은 멱등키 요청이 아직 처리 중.
 *   확정 실패가 아니므로 절대 claim 해제/키 회전을 하면 안 된다 (중복 과금 위험).
 * - ALREADY_PROCESSED_PAYMENT: 이미 처리된 결제 — 승인됐을 수 있으므로 조회로 확인.
 * - PROVIDER_ERROR / FAILED_INTERNAL_SYSTEM_PROCESSING: 토스/기관 내부 오류 — 결과 불명.
 */
const UNSETTLED_CONFIRM_CODES = [
  "IDEMPOTENT_REQUEST_PROCESSING",
  "ALREADY_PROCESSED_PAYMENT",
  "PROVIDER_ERROR",
  "FAILED_INTERNAL_SYSTEM_PROCESSING",
];

/**
 * 승인 실패가 "확정 실패(과금 없음)"인지 "불명확(조회 필요)"인지 분류한다.
 * true = 불명확/처리 중 → claim·멱등키 유지 + 조회 복구.
 * false = 확정 실패(카드 거절 등) → claim 해제 + 멱등키 회전 후 재시도 허용.
 */
export function isUnsettledConfirmError(httpStatus: number, code?: string): boolean {
  if (httpStatus >= 500) return true;
  return !!code && UNSETTLED_CONFIRM_CODES.includes(code);
}

/** 허용 결제수단 (가상계좌는 선택 A에 따라 미지원) */
const ALLOWED_METHODS = ["카드", "계좌이체", "간편결제", "휴대폰"];

/**
 * 승인 응답 검증. 통과하지 못하면 사유 문자열을 반환한다 (null이면 정상).
 * WAITING_FOR_DEPOSIT(가상계좌 발급)은 입금 완료가 아니므로 결제완료로 취급하지 않는다.
 */
export function validateApprovedPayment(
  payment: TossPayment,
  expected: { paymentKey: string; orderId: string; amount: number }
): string | null {
  if (!payment || typeof payment !== "object") return "EMPTY_RESPONSE";
  if (payment.paymentKey !== expected.paymentKey) return "PAYMENT_KEY_MISMATCH";
  if (payment.orderId !== expected.orderId) return "ORDER_ID_MISMATCH";
  if (payment.totalAmount !== expected.amount) return "AMOUNT_MISMATCH";
  if (payment.currency !== "KRW") return "CURRENCY_NOT_KRW";
  if (payment.status === "WAITING_FOR_DEPOSIT") return "VIRTUAL_ACCOUNT_NOT_SUPPORTED";
  if (payment.status !== "DONE") return `STATUS_NOT_DONE:${payment.status}`;
  if (payment.method === "가상계좌") return "VIRTUAL_ACCOUNT_NOT_SUPPORTED";
  if (payment.method && !ALLOWED_METHODS.includes(payment.method)) {
    return `METHOD_NOT_ALLOWED:${payment.method}`;
  }
  return null;
}

/** 토스 응답의 결제수단을 내부 payment_method 값으로 변환 */
export function mapTossMethod(toss: { method?: string; easyPay?: { provider?: string } }): string {
  switch (toss.method) {
    case "카드": return "card";
    case "계좌이체": return "transfer";
    case "가상계좌": return "virtual";
    case "간편결제": {
      const provider = toss.easyPay?.provider || "";
      if (provider.includes("카카오")) return "kakaopay";
      if (provider.includes("네이버")) return "naverpay";
      if (provider.includes("토스")) return "tosspay";
      return "card";
    }
    default: return "card";
  }
}

/** 입력 형식 검증: 토스 paymentKey (영숫자/-/_ 최대 200자) */
export function isValidPaymentKey(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= 200 && /^[A-Za-z0-9_-]+$/.test(v);
}

/** 입력 형식 검증: 내부 주문번호 (ORD- + uuid 형식, 최대 64자) */
export function isValidOrderId(v: unknown): v is string {
  return typeof v === "string" && v.length <= 64 && /^ORD-[A-Za-z0-9-]+$/.test(v);
}
