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
 * 이미지 업로드 검증 — 래스터 이미지만 허용.
 * SVG/HTML 등 스크립트 실행 가능한 형식이 공개 스토리지에 올라가는 것을 차단한다.
 * 통과 시 안전한 소문자 확장자를 반환, 실패 시 에러 메시지를 반환.
 */
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function validateImageFile(file: File): { ext: string | null; error: string | null } {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return { ext: null, error: "JPG/PNG/WebP/GIF/AVIF 이미지만 업로드할 수 있습니다." };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { ext: null, error: "파일 크기는 20MB 이하여야 합니다." };
  }
  return { ext, error: null };
}

/**
 * 검색어 sanitize — PostgREST `.or()` 필터 인젝션 방지.
 * 콤마/괄호/점/별표 등 PostgREST·LIKE 특수문자를 제거하고 길이를 제한한다.
 */
export function sanitizeSearchTerm(term: string): string {
  return term
    .replace(/[%_,()*:."'\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}
