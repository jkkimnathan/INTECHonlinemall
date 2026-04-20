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
