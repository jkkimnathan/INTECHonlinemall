"use client";

import { useState, useEffect } from "react";
import { Star, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Review,
  getReviewsByProductId,
  hasPurchasedProduct,
  hasReviewed,
  createReview,
  deleteReview,
} from "@/lib/supabase/reviews";
import { createClient } from "@/lib/supabase/client";

function StarRating({
  rating,
  onRate,
  interactive = false,
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`h-4 w-4 ${
              star <= (hover || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    const data = await getReviewsByProductId(productId);
    setReviews(data);
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      const data = await getReviewsByProductId(productId);
      if (cancelled) return;
      setReviews(data);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      if (user) {
        setUserId(user.id);
        setUserName(
          user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "사용자"
        );

        const [purchased, reviewed] = await Promise.all([
          hasPurchasedProduct(user.id, productId),
          hasReviewed(user.id, productId),
        ]);
        if (cancelled) return;
        setCanReview(purchased && !reviewed);
        setAlreadyReviewed(reviewed);
      }

      setLoading(false);
    };
    init();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) return setError("리뷰 내용을 입력해주세요.");
    if (!userId) return;

    setSubmitting(true);
    const result = await createReview({
      productId,
      userId,
      userName,
      rating,
      content: content.trim(),
    });
    setSubmitting(false);

    if (result.error) {
      setError(`등록 실패: ${result.error}`);
      return;
    }

    setContent("");
    setRating(5);
    setShowForm(false);
    setCanReview(false);
    setAlreadyReviewed(true);
    await loadReviews();
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("리뷰를 삭제하시겠습니까?")) return;
    const { error: err } = await deleteReview(reviewId);
    if (!err) {
      setAlreadyReviewed(false);
      setCanReview(true);
      await loadReviews();
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border mt-6 p-6">
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border mt-6">
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              상품 리뷰 ({reviews.length})
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-sm text-gray-500">
                  {avgRating.toFixed(1)} / 5.0
                </span>
              </div>
            )}
          </div>
          {canReview && !showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              리뷰 작성
            </Button>
          )}
        </div>

        {/* 안내 메시지 */}
        {!userId && (
          <p className="text-sm text-gray-400 mb-4">
            리뷰를 작성하려면 로그인 후 해당 상품을 구매해야 합니다.
          </p>
        )}
        {userId && !canReview && !alreadyReviewed && (
          <p className="text-sm text-gray-400 mb-4">
            이 상품을 구매하신 후 리뷰를 작성할 수 있습니다.
          </p>
        )}
        {alreadyReviewed && (
          <p className="text-sm text-blue-500 mb-4">
            이미 이 상품에 리뷰를 작성하셨습니다.
          </p>
        )}

        {/* 작성 폼 */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="border rounded-lg p-4 mb-6 bg-gray-50"
          >
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                평점
              </label>
              <StarRating rating={rating} onRate={setRating} interactive />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                리뷰 내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="상품 사용 후기를 작성해주세요."
                rows={4}
                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 mb-3">{error}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
              >
                취소
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "등록"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* 리뷰 목록 */}
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            아직 작성된 리뷰가 없습니다.
          </div>
        ) : (
          <div className="divide-y">
            {reviews.map((review) => (
              <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {review.userName}
                      </p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {userId === review.userId && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed ml-11">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
