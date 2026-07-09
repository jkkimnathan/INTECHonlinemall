/**
 * 이미지 업로드 공통 검증 유틸.
 *
 * 확장자·브라우저 accept만 믿지 않고, 실제 파일 내용(매직 바이트)과 용량을 확인한다.
 * 업로드 함수(products/banners/... uploadXxxImage)에서 storage.upload 직전에 호출한다.
 */

/** 허용 이미지 타입과 대표 매직 바이트(파일 시그니처) */
const IMAGE_SIGNATURES: { ext: string; mime: string; check: (b: Uint8Array) => boolean }[] = [
  { ext: "jpg", mime: "image/jpeg", check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", mime: "image/png", check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: "gif", mime: "image/gif", check: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 },
  {
    ext: "webp",
    mime: "image/webp",
    // "RIFF"(52 49 46 46) .... "WEBP"(57 45 42 50)
    check: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    ext: "avif",
    mime: "image/avif",
    // ....(box size) "ftyp"(66 74 79 70) "avif"(61 76 69 66)
    check: (b) => b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 && b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 && b[11] === 0x66,
  },
];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export interface UploadValidation {
  valid: boolean;
  error?: string;
  /** 매직 바이트로 판별한 안전한 확장자 (예: "jpg", "png") */
  ext?: string;
}

/**
 * 파일이 실제 이미지인지(매직 바이트) + 용량이 한도 이내인지 검증한다.
 * 통과 시 신뢰 가능한 확장자를 함께 반환한다.
 */
export async function validateImageFile(
  file: File,
  maxBytes: number = MAX_IMAGE_BYTES
): Promise<UploadValidation> {
  if (!file) return { valid: false, error: "파일이 없습니다." };
  if (file.size === 0) return { valid: false, error: "빈 파일입니다." };
  if (file.size > maxBytes) {
    return { valid: false, error: `파일 용량이 너무 큽니다. 최대 ${Math.floor(maxBytes / 1024 / 1024)}MB까지 업로드할 수 있습니다.` };
  }

  // 앞부분 16바이트만 읽어 시그니처 확인
  let head: Uint8Array;
  try {
    head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  } catch {
    return { valid: false, error: "파일을 읽을 수 없습니다." };
  }

  const match = IMAGE_SIGNATURES.find((sig) => sig.check(head));
  if (!match) {
    return { valid: false, error: "지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP, AVIF 이미지만 업로드할 수 있습니다." };
  }

  return { valid: true, ext: match.ext };
}

/** 업로드 경로용 안전한 파일명 생성 (사용자 파일명 미신뢰, 검증된 확장자 사용) */
export function safeImagePath(prefix: string, ext: string): string {
  const rand = Math.random().toString(36).slice(2);
  return `${prefix}/${Date.now()}-${rand}.${ext}`;
}
