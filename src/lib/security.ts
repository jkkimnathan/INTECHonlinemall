/** 입력값 sanitize - HTML 태그 제거 */
export function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
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

/**
 * 검색어 정규화 - PostgREST `.or()` 필터 문법과 ilike 와일드카드를 깨거나
 * 악용할 수 있는 문자를 제거한다.
 *  - `,` `(` `)` : .or() 조건 구분/그룹 문법을 깨뜨림
 *  - `%` `_`     : ilike 와일드카드 (의도치 않은 매칭)
 *  - `\`         : 이스케이프 문자
 * 길이도 100자로 제한한다. 반환값이 빈 문자열이면 검색을 건너뛴다.
 */
export function sanitizeSearchTerm(input: string): string {
  return input
    .slice(0, 100)
    .replace(/[%_,()\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
