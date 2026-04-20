/**
 * 브랜드별 하위 카테고리 계층 구조
 * children이 있으면 하위 레벨, 없으면 최종 선택지(리프)
 */
export interface SubcategoryNode {
  label: string;
  children?: SubcategoryNode[];
}

export const BRAND_SUBCATEGORIES: Record<string, SubcategoryNode[]> = {
  INTEL: [
    { label: "15세대" },
    { label: "14세대" },
    { label: "13세대" },
    { label: "12세대" },
  ],

  ASUS: [
    {
      label: "그래픽카드",
      children: [
        {
          label: "NVIDIA GeForce",
          children: [
            { label: "RTX 50 Series" },
            { label: "RTX 40 Series" },
            { label: "RTX 30 Series" },
            { label: "GTX, GT Series" },
          ],
        },
        {
          label: "AMD Radeon",
          children: [
            { label: "RX 9000 Series" },
            { label: "RX 7000 Series" },
          ],
        },
      ],
    },
    {
      label: "메인보드",
      children: [
        {
          label: "INTEL",
          children: [
            {
              label: "800 Series",
              children: [
                { label: "Z890" },
                { label: "B860" },
                { label: "H810" },
              ],
            },
            {
              label: "700 Series",
              children: [
                { label: "Z790" },
                { label: "B760" },
              ],
            },
            {
              label: "600 Series",
              children: [
                { label: "Z690" },
                { label: "B660" },
                { label: "H610" },
              ],
            },
          ],
        },
        {
          label: "AMD",
          children: [
            {
              label: "800 Series",
              children: [
                { label: "X870" },
                { label: "B850" },
                { label: "B840" },
              ],
            },
            {
              label: "600 Series",
              children: [
                { label: "X670" },
                { label: "B650" },
                { label: "A620" },
              ],
            },
          ],
        },
      ],
    },
  ],

  MANLI: [
    {
      label: "그래픽카드",
      children: [
        {
          label: "NVIDIA GeForce",
          children: [
            { label: "RTX 50 Series" },
            { label: "RTX 40 Series" },
            { label: "RTX 30 Series" },
            { label: "GTX, GT Series" },
          ],
        },
      ],
    },
  ],

  ASRock: [
    {
      label: "INTEL",
      children: [
        {
          label: "800 Series",
          children: [
            { label: "Z890" },
            { label: "B860" },
            { label: "H810" },
          ],
        },
        {
          label: "700 Series",
          children: [
            { label: "Z790" },
            { label: "B760" },
          ],
        },
        {
          label: "600 Series",
          children: [
            { label: "Z690" },
            { label: "B660" },
            { label: "H610" },
          ],
        },
      ],
    },
  ],

  Microsoft: [
    { label: "Windows" },
    { label: "Office" },
  ],

  iPC: [
    { label: "Entry" },
    { label: "Mainstream" },
    { label: "Performance" },
    { label: "Highend" },
  ],
};
