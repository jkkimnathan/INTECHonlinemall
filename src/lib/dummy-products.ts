import { Product } from "@/types/product";

/** 임시 더미 상품 데이터 (추후 Supabase로 교체) */
export const dummyProducts: Product[] = [
  {
    id: "1",
    name: "Intel Core i7-14700K",
    slug: "intel-core-i7-14700k",
    brand: "INTEL",
    category: "CPU",
    condition: "new",
    description:
      "14세대 인텔 코어 i7 프로세서. 20코어(8P+12E) / 28쓰레드, 기본 3.4GHz / 부스트 5.6GHz. 게이밍과 크리에이터 작업 모두에 최적화된 고성능 데스크탑 CPU.",
    specs: {
      소켓: "LGA 1700",
      코어: "20코어 (8P+12E)",
      쓰레드: "28",
      "기본 클럭": "3.4GHz",
      "부스트 클럭": "5.6GHz",
      TDP: "125W",
      "내장 그래픽": "Intel UHD 770",
    },
    price: 489000,
    salePrice: 459000,
    images: [],
    stock: 25,
    isNew: true,
    isSale: true,
    isFeatured: true,
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    name: "ASUS ROG STRIX B760-F GAMING WIFI",
    slug: "asus-rog-strix-b760-f-gaming-wifi",
    brand: "ASUS",
    category: "메인보드",
    condition: "new",
    description:
      "ASUS ROG STRIX B760-F GAMING WIFI 메인보드. 인텔 12/13/14세대 CPU 지원, DDR5 메모리, PCIe 5.0, WiFi 6E 내장.",
    specs: {
      소켓: "LGA 1700",
      칩셋: "Intel B760",
      폼팩터: "ATX",
      메모리: "DDR5 x4 (최대 128GB)",
      "확장 슬롯": "PCIe 5.0 x16",
      네트워크: "2.5G LAN + WiFi 6E",
    },
    price: 329000,
    salePrice: null,
    images: [],
    stock: 15,
    isNew: true,
    isSale: false,
    isFeatured: true,
    createdAt: "2025-01-20",
  },
  {
    id: "3",
    name: "MANLI GeForce RTX 4070 SUPER D6 12GB",
    slug: "manli-geforce-rtx-4070-super",
    brand: "MANLI",
    category: "그래픽카드",
    condition: "new",
    description:
      "MANLI GeForce RTX 4070 SUPER. DLSS 3.0, 레이 트레이싱 지원. 12GB GDDR6X, QHD 게이밍에 최적화.",
    specs: {
      GPU: "AD104",
      "CUDA 코어": "7168",
      메모리: "12GB GDDR6X",
      "메모리 버스": "192-bit",
      "부스트 클럭": "2475MHz",
      TDP: "220W",
      출력: "HDMI 2.1 x1, DP 1.4a x3",
    },
    price: 859000,
    salePrice: 799000,
    images: [],
    stock: 8,
    isNew: false,
    isSale: true,
    isFeatured: true,
    createdAt: "2025-02-01",
  },
  {
    id: "4",
    name: "ASRock B760M Pro RS/D4",
    slug: "asrock-b760m-pro-rs-d4",
    brand: "ASRock",
    category: "메인보드",
    condition: "new",
    description:
      "ASRock B760M Pro RS DDR4 메인보드. 인텔 12/13/14세대 CPU 지원, DDR4 메모리 호환으로 합리적인 가격의 고성능 보드.",
    specs: {
      소켓: "LGA 1700",
      칩셋: "Intel B760",
      폼팩터: "Micro-ATX",
      메모리: "DDR4 x4 (최대 128GB)",
      "확장 슬롯": "PCIe 4.0 x16",
      네트워크: "1G LAN",
    },
    price: 189000,
    salePrice: 169000,
    images: [],
    stock: 30,
    isNew: false,
    isSale: true,
    isFeatured: true,
    createdAt: "2025-01-10",
  },
  {
    id: "5",
    name: "Intel Core i5-14400F",
    slug: "intel-core-i5-14400f",
    brand: "INTEL",
    category: "CPU",
    condition: "new",
    description:
      "14세대 인텔 코어 i5 프로세서. 10코어(6P+4E) / 16쓰레드. 내장 그래픽 없는 F 모델로 가성비 최강 게이밍 CPU.",
    specs: {
      소켓: "LGA 1700",
      코어: "10코어 (6P+4E)",
      쓰레드: "16",
      "기본 클럭": "2.5GHz",
      "부스트 클럭": "4.7GHz",
      TDP: "65W",
      "내장 그래픽": "없음 (F 모델)",
    },
    price: 249000,
    salePrice: null,
    images: [],
    stock: 50,
    isNew: true,
    isSale: false,
    isFeatured: true,
    createdAt: "2025-02-05",
  },
  {
    id: "6",
    name: "ASUS TUF GAMING A620M-PLUS",
    slug: "asus-tuf-gaming-a620m-plus",
    brand: "ASUS",
    category: "메인보드",
    condition: "new",
    description:
      "ASUS TUF GAMING A620M-PLUS. AMD AM5 소켓, DDR5 지원. 내구성과 가성비를 모두 잡은 TUF 시리즈.",
    specs: {
      소켓: "AM5",
      칩셋: "AMD A620",
      폼팩터: "Micro-ATX",
      메모리: "DDR5 x2 (최대 64GB)",
      "확장 슬롯": "PCIe 4.0 x16",
      네트워크: "1G LAN",
    },
    price: 159000,
    salePrice: 139000,
    images: [],
    stock: 20,
    isNew: false,
    isSale: true,
    isFeatured: false,
    createdAt: "2025-01-25",
  },
  {
    id: "7",
    name: "MANLI GeForce RTX 4060 Ti D6 8GB",
    slug: "manli-geforce-rtx-4060-ti",
    brand: "MANLI",
    category: "그래픽카드",
    condition: "new",
    description:
      "MANLI GeForce RTX 4060 Ti. FHD~QHD 게이밍에 적합한 미드레인지 그래픽카드. DLSS 3.0 지원.",
    specs: {
      GPU: "AD106",
      "CUDA 코어": "4352",
      메모리: "8GB GDDR6",
      "메모리 버스": "128-bit",
      "부스트 클럭": "2535MHz",
      TDP: "160W",
      출력: "HDMI 2.1 x1, DP 1.4a x3",
    },
    price: 569000,
    salePrice: 529000,
    images: [],
    stock: 12,
    isNew: true,
    isSale: true,
    isFeatured: true,
    createdAt: "2025-02-10",
  },
  {
    id: "8",
    name: "ASRock Z790 Taichi Lite",
    slug: "asrock-z790-taichi-lite",
    brand: "ASRock",
    category: "메인보드",
    condition: "new",
    description:
      "ASRock Z790 Taichi Lite. 인텔 12/13/14세대 지원 플래그십 메인보드. DDR5, PCIe 5.0, 고급 전원부 설계.",
    specs: {
      소켓: "LGA 1700",
      칩셋: "Intel Z790",
      폼팩터: "ATX",
      메모리: "DDR5 x4 (최대 192GB)",
      "확장 슬롯": "PCIe 5.0 x16",
      네트워크: "2.5G LAN + WiFi 6E",
    },
    price: 459000,
    salePrice: null,
    images: [],
    stock: 5,
    isNew: true,
    isSale: false,
    isFeatured: false,
    createdAt: "2025-02-15",
  },
  {
    id: "9",
    name: "TOSHIBA MG10ACA20TE 20TB",
    slug: "toshiba-mg10aca20te-20tb",
    brand: "TOSHIBA",
    category: "HDD",
    condition: "new",
    description:
      "도시바 엔터프라이즈 HDD 20TB. 높은 신뢰성과 대용량 스토리지. NAS 및 서버용에 최적화.",
    specs: {
      용량: "20TB",
      인터페이스: "SATA 6Gb/s",
      RPM: "7200",
      캐시: "512MB",
      폼팩터: "3.5인치",
    },
    price: 489000,
    salePrice: 449000,
    images: [],
    stock: 18,
    isNew: false,
    isSale: true,
    isFeatured: true,
    createdAt: "2025-01-28",
  },
  {
    id: "10",
    name: "Microsoft Surface Pro 9",
    slug: "microsoft-surface-pro-9",
    brand: "Microsoft",
    category: "기타",
    condition: "new",
    description:
      "마이크로소프트 서피스 프로 9. 13인치 PixelSense 디스플레이, 12세대 인텔 코어 탑재 2-in-1 태블릿 PC.",
    specs: {
      프로세서: "Intel Core i5-1245U",
      메모리: "8GB LPDDR5",
      저장장치: "256GB SSD",
      디스플레이: '13" PixelSense (2880x1920)',
      OS: "Windows 11 Pro",
      무게: "879g",
    },
    price: 1590000,
    salePrice: null,
    images: [],
    stock: 10,
    isNew: true,
    isSale: false,
    isFeatured: true,
    createdAt: "2025-02-20",
  },
  {
    id: "11",
    name: "MSI MAG B760 TOMAHAWK WIFI DDR5",
    slug: "msi-mag-b760-tomahawk-wifi-ddr5",
    brand: "MSI",
    category: "메인보드",
    condition: "new",
    description:
      "MSI MAG B760 TOMAHAWK WIFI. DDR5 메모리 지원, WiFi 6E 내장, 듀얼 M.2 슬롯의 가성비 게이밍 보드.",
    specs: {
      소켓: "LGA 1700",
      칩셋: "Intel B760",
      폼팩터: "ATX",
      메모리: "DDR5 x4 (최대 128GB)",
      "확장 슬롯": "PCIe 4.0 x16",
      네트워크: "2.5G LAN + WiFi 6E",
    },
    price: 279000,
    salePrice: 259000,
    images: [],
    stock: 22,
    isNew: true,
    isSale: true,
    isFeatured: true,
    createdAt: "2025-02-18",
  },
  {
    id: "12",
    name: "Intel Core i9-14900K",
    slug: "intel-core-i9-14900k",
    brand: "INTEL",
    category: "CPU",
    condition: "new",
    description:
      "14세대 인텔 코어 i9 최상위 프로세서. 24코어(8P+16E) / 32쓰레드, 최대 6.0GHz 부스트.",
    specs: {
      소켓: "LGA 1700",
      코어: "24코어 (8P+16E)",
      쓰레드: "32",
      "기본 클럭": "3.2GHz",
      "부스트 클럭": "6.0GHz",
      TDP: "125W",
      "내장 그래픽": "Intel UHD 770",
    },
    price: 689000,
    salePrice: 649000,
    images: [],
    stock: 10,
    isNew: false,
    isSale: true,
    isFeatured: false,
    createdAt: "2025-01-05",
  },
  // 리퍼비쉬 상품
  {
    id: "13",
    name: "[리퍼] ASUS ROG STRIX RTX 3080 O10G",
    slug: "refurb-asus-rog-strix-rtx-3080",
    brand: "ASUS",
    category: "그래픽카드",
    condition: "refurbished",
    description:
      "ASUS ROG STRIX RTX 3080 리퍼비쉬 제품. 공식 A/S 6개월 보증. 외관 상태 양호, 성능 테스트 완료.",
    specs: {
      GPU: "GA102",
      "CUDA 코어": "8704",
      메모리: "10GB GDDR6X",
      "메모리 버스": "320-bit",
      상태: "리퍼비쉬 (A급)",
      보증: "6개월",
    },
    price: 650000,
    salePrice: 499000,
    images: [],
    stock: 3,
    isNew: false,
    isSale: true,
    isFeatured: false,
    createdAt: "2025-03-01",
  },
  {
    id: "14",
    name: "[리퍼] ASRock B660M-HDV",
    slug: "refurb-asrock-b660m-hdv",
    brand: "ASRock",
    category: "메인보드",
    condition: "refurbished",
    description:
      "ASRock B660M-HDV 리퍼비쉬 제품. 인텔 12/13세대 지원, 간단한 시스템 구성에 적합. A/S 3개월 보증.",
    specs: {
      소켓: "LGA 1700",
      칩셋: "Intel B660",
      폼팩터: "Micro-ATX",
      메모리: "DDR4 x2 (최대 64GB)",
      상태: "리퍼비쉬 (A급)",
      보증: "3개월",
    },
    price: 99000,
    salePrice: 69000,
    images: [],
    stock: 5,
    isNew: false,
    isSale: true,
    isFeatured: false,
    createdAt: "2025-03-05",
  },
  {
    id: "15",
    name: "MSI GeForce RTX 4060 VENTUS 2X BLACK OC",
    slug: "msi-geforce-rtx-4060-ventus-2x",
    brand: "MSI",
    category: "그래픽카드",
    condition: "new",
    description:
      "MSI RTX 4060 VENTUS 2X BLACK OC. 듀얼팬 쿨링, FHD 게이밍에 최적화된 보급형 그래픽카드.",
    specs: {
      GPU: "AD107",
      "CUDA 코어": "3072",
      메모리: "8GB GDDR6",
      "메모리 버스": "128-bit",
      "부스트 클럭": "2490MHz",
      TDP: "115W",
      출력: "HDMI 2.1 x1, DP 1.4a x3",
    },
    price: 439000,
    salePrice: 399000,
    images: [],
    stock: 15,
    isNew: true,
    isSale: true,
    isFeatured: false,
    createdAt: "2025-02-25",
  },
  {
    id: "16",
    name: "TOSHIBA P300 2TB (HDWD120)",
    slug: "toshiba-p300-2tb",
    brand: "TOSHIBA",
    category: "HDD",
    condition: "new",
    description:
      "도시바 P300 데스크탑 HDD 2TB. 가정용/사무용 PC에 적합한 가성비 하드디스크.",
    specs: {
      용량: "2TB",
      인터페이스: "SATA 6Gb/s",
      RPM: "7200",
      캐시: "64MB",
      폼팩터: "3.5인치",
    },
    price: 79000,
    salePrice: null,
    images: [],
    stock: 40,
    isNew: false,
    isSale: false,
    isFeatured: false,
    createdAt: "2025-01-18",
  },
];

/** 상품 필터/검색 함수 */
export function getProducts(options?: {
  brand?: string;
  category?: string;
  condition?: "new" | "refurbished";
  isSale?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "newest" | "name";
}) {
  let filtered = [...dummyProducts];

  if (options?.brand) {
    filtered = filtered.filter(
      (p) => p.brand.toLowerCase() === options.brand!.toLowerCase()
    );
  }
  if (options?.category) {
    filtered = filtered.filter((p) => p.category === options.category);
  }
  if (options?.condition) {
    filtered = filtered.filter((p) => p.condition === options.condition);
  }
  if (options?.isSale) {
    filtered = filtered.filter((p) => p.isSale);
  }
  if (options?.isFeatured) {
    filtered = filtered.filter((p) => p.isFeatured);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // 정렬
  switch (options?.sortBy) {
    case "price-asc":
      filtered.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
      break;
    case "price-desc":
      filtered.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
      break;
    case "newest":
      filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "name":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return filtered;
}

/** 단일 상품 조회 */
export function getProductBySlug(slug: string) {
  return dummyProducts.find((p) => p.slug === slug) || null;
}

/** 카테고리 목록 추출 */
export function getCategories() {
  const categories = [...new Set(dummyProducts.map((p) => p.category))];
  return categories.sort();
}

/** 브랜드 목록 추출 */
export function getBrands() {
  const brands = [...new Set(dummyProducts.map((p) => p.brand))];
  return brands.sort();
}
