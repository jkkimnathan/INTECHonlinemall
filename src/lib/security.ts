/** 입력값 sanitize - HTML 태그 제거 */
export function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/** like/ilike 패턴용 이스케이프 - %, _ 와일드카드를 리터럴로 처리 */
export function escapeLikePattern(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

/** 검색어 sanitize - PostgREST or() 필터 예약문자(,()) 제거 + like 와일드카드 이스케이프 */
export function sanitizeSearchTerm(term: string): string {
  return escapeLikePattern(term.replace(/[,()]/g, " ")).trim();
}

/** 업로드 허용 이미지 확장자 */
const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "avif"];

/** 이미지 파일 확장자 검증 - 허용 목록 외에는 null 반환 */
export function getSafeImageExtension(fileName: string): string | null {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext) ? ext : null;
}

/** 비밀번호 강도 검증 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return { valid: false, error: "비밀번호는 8자 이상이어야 합니다." };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, error: "비밀번호에 영문자를 포함해주세요." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "비밀번호에 숫자를 포함해주세요." };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: "비밀번호에 특수문자를 포함해주세요." };
  }
  return { valid: true };
}

/** 이메일 형식 검증 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** 전화번호 형식 검증 */
export function validatePhone(phone: string): boolean {
  return /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(phone.replace(/-/g, ""));
}

/** 주문 금액 서버 검증용 - 가격 범위 체크 */
export function validatePrice(price: number): boolean {
  return Number.isFinite(price) && price >= 0 && price <= 100_000_000;
}

/** 수량 검증 */
export function validateQuantity(qty: number): boolean {
  return Number.isInteger(qty) && qty >= 1 && qty <= 999;
}
