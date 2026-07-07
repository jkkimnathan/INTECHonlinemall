"use client";

import { useState, useEffect, useRef } from "react";
import { BRAND_SUBCATEGORIES, SubcategoryNode } from "@/config/brand-subcategories";
import { ChevronRight } from "lucide-react";

interface Props {
  brand: string;
  value: string | null;
  onChange: (value: string | null) => void;
}

/**
 * 브랜드별 하위 카테고리 캐스케이딩 드롭다운
 * value는 " > " 구분자로 전체 경로를 저장 (예: "그래픽카드 > NVIDIA GeForce > RTX 50 Series")
 */
export default function BrandSubcategorySelect({ brand, value, onChange }: Props) {
  const tree = BRAND_SUBCATEGORIES[brand];
  const maxDepth = getMaxDepth(tree || []);

  // 각 레벨에서 선택된 값
  const [selections, setSelections] = useState<string[]>([]);
  const isInitialMount = useRef(true);

  // value(경로 문자열)가 바뀔 때 selections 복원
  useEffect(() => {
    if (value) {
      setSelections(value.split(" > "));
    } else {
      setSelections([]);
    }
  }, [value, brand]);

  // 브랜드가 바뀌면 초기화 (최초 마운트 시 스킵)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onChange(null);
    setSelections([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  if (!tree || tree.length === 0) {
    return (
      <p className="text-xs text-gray-400 mt-1">
        이 브랜드에는 세부 카테고리가 없습니다.
      </p>
    );
  }

  // 각 레벨에서 보여줄 옵션 노드들 계산
  const levels: { nodes: SubcategoryNode[]; selected: string | undefined }[] = [];
  let currentNodes = tree;

  for (let depth = 0; depth < maxDepth; depth++) {
    if (!currentNodes || currentNodes.length === 0) break;

    const selected = selections[depth];
    levels.push({ nodes: currentNodes, selected });

    if (selected) {
      const found = currentNodes.find((n) => n.label === selected);
      if (found?.children) {
        currentNodes = found.children;
      } else {
        break; // 리프 노드 도달
      }
    } else {
      break; // 이 레벨에서 아직 선택 안 됨
    }
  }

  const handleSelect = (depth: number, label: string) => {
    // "선택하세요" 선택 시 해당 레벨 이하를 잘라내고 상위 경로로 동기화
    if (!label) {
      const truncated = selections.slice(0, depth);
      setSelections(truncated);
      onChange(truncated.length > 0 ? truncated.join(" > ") : null);
      return;
    }

    const newSelections = selections.slice(0, depth);
    newSelections[depth] = label;
    setSelections(newSelections);

    // 선택한 노드가 리프인지 확인
    let nodes = tree;
    for (let i = 0; i <= depth; i++) {
      const found = nodes.find((n) => n.label === newSelections[i]);
      if (!found) break;
      if (i === depth) {
        if (!found.children || found.children.length === 0) {
          // 리프 → 전체 경로를 value로 전달
          onChange(newSelections.join(" > "));
        } else {
          // 아직 하위가 있음 → null
          onChange(null);
        }
      } else {
        nodes = found.children || [];
      }
    }
  };

  return (
    <div className="space-y-2">
      {levels.map((level, depth) => (
        <div key={depth} className="flex items-center gap-2">
          {depth > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
          )}
          <select
            value={level.selected || ""}
            onChange={(e) => handleSelect(depth, e.target.value)}
            className="flex-1 h-9 border rounded-md px-3 text-sm bg-white"
          >
            <option value="">선택하세요</option>
            {level.nodes.map((node) => (
              <option key={node.label} value={node.label}>
                {node.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {value && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {value}
          </span>
          <button
            type="button"
            onClick={() => {
              setSelections([]);
              onChange(null);
            }}
            className="text-xs text-gray-400 hover:text-red-500"
          >
            초기화
          </button>
        </div>
      )}
    </div>
  );
}

function getMaxDepth(nodes: SubcategoryNode[]): number {
  if (!nodes || nodes.length === 0) return 0;
  let max = 1;
  for (const node of nodes) {
    if (node.children) {
      max = Math.max(max, 1 + getMaxDepth(node.children));
    }
  }
  return max;
}
