import { createClient } from "./client";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  createdAt: string;
}

interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  content: string;
  created_at: string;
}

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    userName: row.user_name,
    rating: row.rating,
    content: row.content,
    createdAt: row.created_at,
  };
}

/** 상품별 리뷰 조회 */
export async function getReviewsByProductId(productId: string): Promise<Review[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];
  return data.map(toReview);
}

/** 유저가 해당 상품을 구매했는지 확인 */
export async function hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, items")
    .eq("user_id", userId);

  if (error || !data) return false;

  for (const order of data) {
    const items = order.items as { product?: { id: string } }[];
    if (items?.some((item) => item.product?.id === productId)) {
      return true;
    }
  }
  return false;
}

/** 유저가 이미 리뷰를 작성했는지 확인 */
export async function hasReviewed(userId: string, productId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .limit(1);

  if (error || !data) return false;
  return data.length > 0;
}

/** 리뷰 작성 */
export async function createReview(input: {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
}): Promise<{ data: Review | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: input.productId,
      user_id: input.userId,
      user_name: input.userName,
      rating: input.rating,
      content: input.content,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: "리뷰 저장 실패" };
  return { data: toReview(data), error: null };
}

/** 리뷰 삭제 (본인만) */
export async function deleteReview(reviewId: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) return { error: error.message };
  return { error: null };
}
