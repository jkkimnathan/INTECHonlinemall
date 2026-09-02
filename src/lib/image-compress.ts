/**
 * 업로드 전 클라이언트 이미지 자동 리사이즈·압축.
 *
 * 관리자가 원본 그대로(수 MB) 올리면 배너/상품 이미지 로딩이 느려지는
 * 근본 원인을 업로드 시점에 해결한다:
 *  - 최대 폭 제한(기본 2400px, 풀와이드 데스크탑 기준 충분)
 *  - WebP 재인코딩(품질 0.82)
 *  - GIF(애니메이션)는 변환하지 않고 원본 유지
 *  - 이미 작고(300KB 미만) 폭도 작은 파일은 그대로 통과
 *  - 압축 결과가 원본보다 크면 원본 유지
 *  - 어떤 단계든 실패하면 원본을 그대로 업로드(기능 우선, 조용한 폴백)
 */
const SKIP_BELOW_BYTES = 300 * 1024;
const WEBP_QUALITY = 0.82;

export async function compressImage(file: File, maxWidth = 2400): Promise<File> {
  try {
    if (typeof window === "undefined") return file; // 서버 호출 방어
    if (file.type === "image/gif") return file; // 애니메이션 보존

    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, maxWidth / width);

    // 충분히 작으면 재인코딩 불필요
    if (file.size < SKIP_BELOW_BYTES && scale === 1) {
      bitmap.close();
      return file;
    }

    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
    );
    // 인코딩 실패 또는 브라우저가 webp 미지원(png 폴백으로 커지는 경우 포함) → 원본 유지
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}
