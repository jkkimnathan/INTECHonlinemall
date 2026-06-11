"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createProduct, uploadProductImage, ProductInput } from "@/lib/supabase/products";
import { Product } from "@/types/product";
import { ArrowLeft, Upload, X, Loader2, ImageIcon, Star, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import BrandSubcategorySelect from "@/components/admin/BrandSubcategorySelect";

const CATEGORIES: Product["category"][] = [
  "CPU", "메인보드", "그래픽카드", "메모리", "SSD", "HDD",
  "파워서플라이", "케이스", "쿨러", "모니터", "키보드", "마우스", "조립PC", "기타",
];

const BRANDS = ["INTEL", "ASUS", "MANLI", "ASRock", "TOSHIBA", "Microsoft", "iPC"];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 기본 정보
  const [name, setName] = useState("");
  const [brand, setBrand] = useState(BRANDS[0]);
  const [customBrand, setCustomBrand] = useState("");
  const [category, setCategory] = useState<Product["category"]>("CPU");
  const [condition, setCondition] = useState<Product["condition"]>("new");

  // 가격/재고
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");

  // 세부카테고리
  const [subcategory, setSubcategory] = useState<string | null>(null);

  // 추천상품
  const [isFeatured, setIsFeatured] = useState(false);

  // 이미지
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<"thumbnail" | "additional" | "detail" | null>(null);

  const finalBrand = brand === "__custom__" ? customBrand : brand;

  async function handleUpload(
    files: FileList | null,
    type: "thumbnail" | "additional" | "detail"
  ) {
    if (!files?.length) return;
    setUploading(type);
    setError("");

    for (const file of Array.from(files)) {
      const maxSize = type === "detail" ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`파일 크기가 ${type === "detail" ? "20MB" : "5MB"}를 초과합니다.`);
        setUploading(null);
        return;
      }

      const { url, error: uploadErr } = await uploadProductImage(file);
      if (uploadErr) {
        setError(`업로드 실패: ${uploadErr}`);
        setUploading(null);
        return;
      }
      if (!url) continue;

      if (type === "thumbnail") {
        setThumbnail(url);
      } else if (type === "additional") {
        setAdditionalImages((prev) => {
          if (prev.length >= 9) return prev;
          return [...prev, url];
        });
      } else {
        setDetailImages((prev) => [...prev, url]);
      }
    }
    setUploading(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("상품명을 입력하세요.");
    if (!finalBrand.trim()) return setError("브랜드를 입력하세요.");
    if (!price || isNaN(Number(price))) return setError("올바른 가격을 입력하세요.");
    if (!stock || isNaN(Number(stock))) return setError("올바른 재고를 입력하세요.");

    const allImages = thumbnail ? [thumbnail, ...additionalImages] : additionalImages;
    const hasSale = salePrice !== "" && Number(salePrice) > 0;

    const input: ProductInput = {
      name: name.trim(),
      slug: condition === "refurbished" ? `${slugify(name)}-refurbished` : slugify(name),
      brand: finalBrand.trim(),
      category,
      condition,
      description: "",
      specs: {},
      price: Number(price),
      sale_price: hasSale ? Number(salePrice) : null,
      images: allImages,
      detail_images: detailImages,
      stock: Number(stock),
      is_new: true,
      is_sale: hasSale,
      is_featured: isFeatured,
      subcategory: subcategory || null,
    };

    setSaving(true);
    const { error: createErr } = await createProduct(input);
    setSaving(false);

    if (createErr) {
      setError(`등록 실패: ${createErr}`);
      return;
    }

    router.push("/admin/products");
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">상품 등록</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-gray-900 mb-4">기본 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상품명 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: Intel Core i7-14700K"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    브랜드 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full h-10 border rounded-md px-3 text-sm"
                  >
                    {BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="__custom__">직접 입력...</option>
                  </select>
                  {brand === "__custom__" && (
                    <Input
                      className="mt-2"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      placeholder="브랜드명 입력"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Product["category"])}
                    className="w-full h-10 border rounded-md px-3 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품 상태</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as Product["condition"])}
                    className="w-full h-10 border rounded-md px-3 text-sm"
                  >
                    <option value="new">신품</option>
                    <option value="refurbished">리퍼비쉬</option>
                  </select>
                </div>
              </div>

              {/* 세부 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  세부 카테고리
                </label>
                <BrandSubcategorySelect
                  brand={finalBrand}
                  value={subcategory}
                  onChange={setSubcategory}
                />
              </div>
            </div>
          </div>

          {/* 가격 / 재고 */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-gray-900 mb-4">가격 / 재고</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상품 가격 (원) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="예: 489000"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">할인가 (원)</label>
                <Input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="미입력 시 할인 없음"
                  min={0}
                />
                {salePrice && price && Number(salePrice) < Number(price) && (
                  <p className="text-xs text-green-600 mt-1">
                    {Math.round(((Number(price) - Number(salePrice)) / Number(price)) * 100)}% 할인
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  재고 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="예: 50"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* 추천상품 설정 */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-gray-900 mb-4">노출 설정</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
              >
                {isFeatured ? (
                  <ToggleRight className="h-6 w-6 text-green-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400" />
                )}
              </button>
              <div>
                <span className="text-sm font-medium text-gray-700">추천상품</span>
                <p className="text-xs text-gray-400">활성화하면 메인 페이지 추천상품에 노출됩니다.</p>
              </div>
            </div>
          </div>

          {/* 대표 이미지 (썸네일) */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <h2 className="font-bold text-gray-900">대표 이미지 (썸네일)</h2>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              상품 목록, 검색 결과에 표시되는 메인 이미지입니다. 1장만 등록됩니다.
              <br />권장: 800 × 800px (1:1 정사각형) · JPG/PNG/WebP · 최대 5MB
            </p>

            {thumbnail ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnail}
                  alt="대표 이미지"
                  className="w-48 h-48 object-cover rounded-lg border"
                />
                <Badge className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px]">대표</Badge>
                <button
                  type="button"
                  onClick={() => setThumbnail(null)}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { handleUpload(e.target.files, "thumbnail"); e.target.value = ""; }}
                  disabled={uploading !== null}
                />
                {uploading === "thumbnail" ? (
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-300 mb-2" />
                    <span className="text-xs text-gray-500">클릭하여 업로드</span>
                    <span className="text-[10px] text-gray-400 mt-1">JPG, PNG, WEBP (5MB)</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* 추가 이미지 */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-gray-900 mb-1">추가 이미지</h2>
            <p className="text-xs text-gray-400 mb-4">
              상품 상세 페이지의 이미지 슬라이더에 표시됩니다. 최대 9장.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {additionalImages.map((url, i) => (
                <div key={url} className="relative group aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`추가 ${i + 1}`} className="w-full h-full object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => setAdditionalImages(additionalImages.filter((u) => u !== url))}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}

              {additionalImages.length < 9 && (
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleUpload(e.target.files, "additional");
                      e.target.value = "";
                    }}
                    disabled={uploading !== null}
                  />
                  {uploading === "additional" ? (
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-300 mb-1" />
                      <span className="text-[10px] text-gray-400">{additionalImages.length}/9</span>
                    </>
                  )}
                </label>
              )}
            </div>

            {additionalImages.length === 0 && (
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                <ImageIcon className="h-4 w-4" />
                <span>추가 이미지가 없어도 등록 가능합니다.</span>
              </div>
            )}
          </div>

          {/* 상세페이지 이미지 */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-gray-900 mb-1">상세페이지</h2>
            <p className="text-xs text-gray-400 mb-4">
              상품 상세 페이지 하단에 세로로 이어지는 상세 설명 이미지입니다. 순서대로 표시됩니다.
            </p>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleUpload(e.target.files, "detail");
                  e.target.value = "";
                }}
                disabled={uploading !== null}
              />
              {uploading === "detail" ? (
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
              ) : (
                <Upload className="h-8 w-8 text-gray-300 mb-2" />
              )}
              <span className="text-sm text-gray-500">
                {uploading === "detail" ? "업로드 중..." : "클릭하여 상세 이미지 추가"}
              </span>
              <span className="text-xs text-gray-400 mt-1">여러 파일 동시 선택 가능</span>
            </label>

            {detailImages.length > 0 && (
              <div className="space-y-3">
                {detailImages.map((url, i) => (
                  <div key={url} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`상세 ${i + 1}`}
                      className="w-full rounded-lg border"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {i + 1}번째
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailImages(detailImages.filter((u) => u !== url))}
                      className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {detailImages.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <ImageIcon className="h-4 w-4" />
                <span>상세 이미지가 없으면 상품 설명 텍스트만 표시됩니다.</span>
              </div>
            )}
          </div>

          {/* 등록 버튼 */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-base"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                "상품 등록"
              )}
            </Button>
            <Link href="/admin/products">
              <Button type="button" variant="outline" className="h-12 px-8">
                취소
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
