/**
 * 상품 상세 HTML sanitize (서버 전용)
 *
 * 관리자가 붙여넣은 벤더 상세 HTML 을 표시하기 전에 위험 요소를 제거한다.
 * - script / iframe / object / embed / style 블록 및 on* 이벤트 속성 제거
 * - 링크는 https/http/mailto/tel 만 허용, 새 창 링크에는 rel=noopener 강제
 * - 이미지는 https/http/data 만 허용, 지연 로딩(loading=lazy) 자동 부여
 * - 인라인 style 속성은 유지 (레이아웃/색상용). 전역 <style> 블록은 페이지 전체에
 *   영향을 줄 수 있어 제거한다.
 *
 * 반드시 서버 컴포넌트/서버 코드에서만 import 할 것 (클라이언트 번들 크기 방지).
 */
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  "img",
  "h1",
  "h2",
  "span",
  "section",
  "article",
  "figure",
  "figcaption",
  "center",
  "font",
  "u",
  "s",
  "sub",
  "sup",
  "small",
  "mark",
  "picture",
  "source",
];

const COMMON_ATTRS = [
  "style",
  "class",
  "id",
  "align",
  "valign",
  "width",
  "height",
  "bgcolor",
  "color",
  "border",
  "cellpadding",
  "cellspacing",
  "colspan",
  "rowspan",
  "title",
  "lang",
  "dir",
];

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    "*": COMMON_ATTRS,
    a: [...COMMON_ATTRS, "href", "name", "target", "rel"],
    img: [...COMMON_ATTRS, "src", "alt", "srcset", "sizes", "loading", "decoding"],
    source: ["srcset", "sizes", "type", "media"],
    font: ["size", "face", "color", "style"],
    td: [...COMMON_ATTRS, "nowrap"],
    th: [...COMMON_ATTRS, "scope", "nowrap"],
  },
  allowedSchemes: ["https", "http", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["https", "http", "data"],
    source: ["https", "http", "data"],
  },
  allowProtocolRelative: false,
  // script/style/iframe 등 허용되지 않은 태그는 내용까지 버린다 (기본 nonTextTags 에 script/style 포함)
  disallowedTagsMode: "discard",
  enforceHtmlBoundary: true,
  // src 가 제거된(허용되지 않은 스킴) 이미지는 빈 태그로 남기지 않는다
  exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
  transformTags: {
    img: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, loading: "lazy", decoding: "async" },
    }),
    a: (tagName, attribs) => {
      const next = { ...attribs };
      if (next.target === "_blank") next.rel = "noopener noreferrer";
      else delete next.target;
      return { tagName, attribs: next };
    },
  },
};

/** 표시용으로 정화된 HTML 반환. 비어 있으면 빈 문자열 */
export function sanitizeDetailHtml(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "";
  return sanitizeHtml(raw, SANITIZE_OPTIONS).trim();
}
