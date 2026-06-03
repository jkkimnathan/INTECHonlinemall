-- 16개 상품 데이터 시드
-- Supabase SQL Editor에서 1회 실행

INSERT INTO public.products (id, name, slug, brand, category, condition, description, specs, price, sale_price, images, stock, is_new, is_sale, is_featured, created_at) VALUES
('1', 'Intel Core i7-14700K', 'intel-core-i7-14700k', 'INTEL', 'CPU', 'new',
 '14세대 인텔 코어 i7 프로세서. 20코어(8P+12E) / 28쓰레드, 기본 3.4GHz / 부스트 5.6GHz. 게이밍과 크리에이터 작업 모두에 최적화된 고성능 데스크탑 CPU.',
 '{"소켓":"LGA 1700","코어":"20코어 (8P+12E)","쓰레드":"28","기본 클럭":"3.4GHz","부스트 클럭":"5.6GHz","TDP":"125W","내장 그래픽":"Intel UHD 770"}',
 489000, 459000, '{}', 25, true, true, true, '2025-01-15T00:00:00Z'),

('2', 'ASUS ROG STRIX B760-F GAMING WIFI', 'asus-rog-strix-b760-f-gaming-wifi', 'ASUS', '메인보드', 'new',
 'ASUS ROG STRIX B760-F GAMING WIFI 메인보드. 인텔 12/13/14세대 CPU 지원, DDR5 메모리, PCIe 5.0, WiFi 6E 내장.',
 '{"소켓":"LGA 1700","칩셋":"Intel B760","폼팩터":"ATX","메모리":"DDR5 x4 (최대 128GB)","확장 슬롯":"PCIe 5.0 x16","네트워크":"2.5G LAN + WiFi 6E"}',
 329000, NULL, '{}', 15, true, false, true, '2025-01-20T00:00:00Z'),

('3', 'MANLI GeForce RTX 4070 SUPER D6 12GB', 'manli-geforce-rtx-4070-super', 'MANLI', '그래픽카드', 'new',
 'MANLI GeForce RTX 4070 SUPER. DLSS 3.0, 레이 트레이싱 지원. 12GB GDDR6X, QHD 게이밍에 최적화.',
 '{"GPU":"AD104","CUDA 코어":"7168","메모리":"12GB GDDR6X","메모리 버스":"192-bit","부스트 클럭":"2475MHz","TDP":"220W","출력":"HDMI 2.1 x1, DP 1.4a x3"}',
 859000, 799000, '{}', 8, false, true, true, '2025-02-01T00:00:00Z'),

('4', 'ASRock B760M Pro RS/D4', 'asrock-b760m-pro-rs-d4', 'ASRock', '메인보드', 'new',
 'ASRock B760M Pro RS DDR4 메인보드. 인텔 12/13/14세대 CPU 지원, DDR4 메모리 호환으로 합리적인 가격의 고성능 보드.',
 '{"소켓":"LGA 1700","칩셋":"Intel B760","폼팩터":"Micro-ATX","메모리":"DDR4 x4 (최대 128GB)","확장 슬롯":"PCIe 4.0 x16","네트워크":"1G LAN"}',
 189000, 169000, '{}', 30, false, true, true, '2025-01-10T00:00:00Z'),

('5', 'Intel Core i5-14400F', 'intel-core-i5-14400f', 'INTEL', 'CPU', 'new',
 '14세대 인텔 코어 i5 프로세서. 10코어(6P+4E) / 16쓰레드. 내장 그래픽 없는 F 모델로 가성비 최강 게이밍 CPU.',
 '{"소켓":"LGA 1700","코어":"10코어 (6P+4E)","쓰레드":"16","기본 클럭":"2.5GHz","부스트 클럭":"4.7GHz","TDP":"65W","내장 그래픽":"없음 (F 모델)"}',
 249000, NULL, '{}', 50, true, false, true, '2025-02-05T00:00:00Z'),

('6', 'ASUS TUF GAMING A620M-PLUS', 'asus-tuf-gaming-a620m-plus', 'ASUS', '메인보드', 'new',
 'ASUS TUF GAMING A620M-PLUS. AMD AM5 소켓, DDR5 지원. 내구성과 가성비를 모두 잡은 TUF 시리즈.',
 '{"소켓":"AM5","칩셋":"AMD A620","폼팩터":"Micro-ATX","메모리":"DDR5 x2 (최대 64GB)","확장 슬롯":"PCIe 4.0 x16","네트워크":"1G LAN"}',
 159000, 139000, '{}', 20, false, true, false, '2025-01-25T00:00:00Z'),

('7', 'MANLI GeForce RTX 4060 Ti D6 8GB', 'manli-geforce-rtx-4060-ti', 'MANLI', '그래픽카드', 'new',
 'MANLI GeForce RTX 4060 Ti. FHD~QHD 게이밍에 적합한 미드레인지 그래픽카드. DLSS 3.0 지원.',
 '{"GPU":"AD106","CUDA 코어":"4352","메모리":"8GB GDDR6","메모리 버스":"128-bit","부스트 클럭":"2535MHz","TDP":"160W","출력":"HDMI 2.1 x1, DP 1.4a x3"}',
 569000, 529000, '{}', 12, true, true, true, '2025-02-10T00:00:00Z'),

('8', 'ASRock Z790 Taichi Lite', 'asrock-z790-taichi-lite', 'ASRock', '메인보드', 'new',
 'ASRock Z790 Taichi Lite. 인텔 12/13/14세대 지원 플래그십 메인보드. DDR5, PCIe 5.0, 고급 전원부 설계.',
 '{"소켓":"LGA 1700","칩셋":"Intel Z790","폼팩터":"ATX","메모리":"DDR5 x4 (최대 192GB)","확장 슬롯":"PCIe 5.0 x16","네트워크":"2.5G LAN + WiFi 6E"}',
 459000, NULL, '{}', 5, true, false, false, '2025-02-15T00:00:00Z'),

('9', 'TOSHIBA MG10ACA20TE 20TB', 'toshiba-mg10aca20te-20tb', 'TOSHIBA', 'HDD', 'new',
 '도시바 엔터프라이즈 HDD 20TB. 높은 신뢰성과 대용량 스토리지. NAS 및 서버용에 최적화.',
 '{"용량":"20TB","인터페이스":"SATA 6Gb/s","RPM":"7200","캐시":"512MB","폼팩터":"3.5인치"}',
 489000, 449000, '{}', 18, false, true, true, '2025-01-28T00:00:00Z'),

('10', 'Microsoft Surface Pro 9', 'microsoft-surface-pro-9', 'Microsoft', '기타', 'new',
 '마이크로소프트 서피스 프로 9. 13인치 PixelSense 디스플레이, 12세대 인텔 코어 탑재 2-in-1 태블릿 PC.',
 '{"프로세서":"Intel Core i5-1245U","메모리":"8GB LPDDR5","저장장치":"256GB SSD","디스플레이":"13\" PixelSense (2880x1920)","OS":"Windows 11 Pro","무게":"879g"}',
 1590000, NULL, '{}', 10, true, false, true, '2025-02-20T00:00:00Z'),

('11', 'MSI MAG B760 TOMAHAWK WIFI DDR5', 'msi-mag-b760-tomahawk-wifi-ddr5', 'MSI', '메인보드', 'new',
 'MSI MAG B760 TOMAHAWK WIFI. DDR5 메모리 지원, WiFi 6E 내장, 듀얼 M.2 슬롯의 가성비 게이밍 보드.',
 '{"소켓":"LGA 1700","칩셋":"Intel B760","폼팩터":"ATX","메모리":"DDR5 x4 (최대 128GB)","확장 슬롯":"PCIe 4.0 x16","네트워크":"2.5G LAN + WiFi 6E"}',
 279000, 259000, '{}', 22, true, true, true, '2025-02-18T00:00:00Z'),

('12', 'Intel Core i9-14900K', 'intel-core-i9-14900k', 'INTEL', 'CPU', 'new',
 '14세대 인텔 코어 i9 최상위 프로세서. 24코어(8P+16E) / 32쓰레드, 최대 6.0GHz 부스트.',
 '{"소켓":"LGA 1700","코어":"24코어 (8P+16E)","쓰레드":"32","기본 클럭":"3.2GHz","부스트 클럭":"6.0GHz","TDP":"125W","내장 그래픽":"Intel UHD 770"}',
 689000, 649000, '{}', 10, false, true, false, '2025-01-05T00:00:00Z'),

('13', '[리퍼] ASUS ROG STRIX RTX 3080 O10G', 'refurb-asus-rog-strix-rtx-3080', 'ASUS', '그래픽카드', 'refurbished',
 'ASUS ROG STRIX RTX 3080 리퍼비쉬 제품. 공식 A/S 6개월 보증. 외관 상태 양호, 성능 테스트 완료.',
 '{"GPU":"GA102","CUDA 코어":"8704","메모리":"10GB GDDR6X","메모리 버스":"320-bit","상태":"리퍼비쉬 (A급)","보증":"6개월"}',
 650000, 499000, '{}', 3, false, true, false, '2025-03-01T00:00:00Z'),

('14', '[리퍼] ASRock B660M-HDV', 'refurb-asrock-b660m-hdv', 'ASRock', '메인보드', 'refurbished',
 'ASRock B660M-HDV 리퍼비쉬 제품. 인텔 12/13세대 지원, 간단한 시스템 구성에 적합. A/S 3개월 보증.',
 '{"소켓":"LGA 1700","칩셋":"Intel B660","폼팩터":"Micro-ATX","메모리":"DDR4 x2 (최대 64GB)","상태":"리퍼비쉬 (A급)","보증":"3개월"}',
 99000, 69000, '{}', 5, false, true, false, '2025-03-05T00:00:00Z'),

('15', 'MSI GeForce RTX 4060 VENTUS 2X BLACK OC', 'msi-geforce-rtx-4060-ventus-2x', 'MSI', '그래픽카드', 'new',
 'MSI RTX 4060 VENTUS 2X BLACK OC. 듀얼팬 쿨링, FHD 게이밍에 최적화된 보급형 그래픽카드.',
 '{"GPU":"AD107","CUDA 코어":"3072","메모리":"8GB GDDR6","메모리 버스":"128-bit","부스트 클럭":"2490MHz","TDP":"115W","출력":"HDMI 2.1 x1, DP 1.4a x3"}',
 439000, 399000, '{}', 15, true, true, false, '2025-02-25T00:00:00Z'),

('16', 'TOSHIBA P300 2TB (HDWD120)', 'toshiba-p300-2tb', 'TOSHIBA', 'HDD', 'new',
 '도시바 P300 데스크탑 HDD 2TB. 가정용/사무용 PC에 적합한 가성비 하드디스크.',
 '{"용량":"2TB","인터페이스":"SATA 6Gb/s","RPM":"7200","캐시":"64MB","폼팩터":"3.5인치"}',
 79000, NULL, '{}', 40, false, false, false, '2025-01-18T00:00:00Z')

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 홈 섹션(iPC / 리퍼몰 쇼케이스) 콘텐츠 테이블
-- Supabase SQL Editor에서 1회 실행 (테이블이 없으면 홈은 코드 기본값으로 표시됨)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.home_sections (
  key text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 (홈 노출용)
DROP POLICY IF EXISTS "home_sections read" ON public.home_sections;
CREATE POLICY "home_sections read" ON public.home_sections
  FOR SELECT USING (true);

-- 쓰기 허용 (admin 화면에서 저장 — 다른 운영 테이블과 동일 정책)
DROP POLICY IF EXISTS "home_sections write" ON public.home_sections;
CREATE POLICY "home_sections write" ON public.home_sections
  FOR ALL USING (true) WITH CHECK (true);
