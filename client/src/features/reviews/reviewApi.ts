import { api } from "../../lib/api";
import type { Review } from "./reviewTypes";

export const fetchProductReviews = async (productId: string): Promise<Review[]> => {
  const res = await api.get(`/reviews/product/${productId}`);
  return res.data.reviews;
};

export const createReviewRequest = async (
  productId: string,
  data: { rating: number; comment: string },
): Promise<Review> => {
  const res = await api.post(`/reviews/product/${productId}`, data);
  return res.data.review;
};

export const deleteReviewRequest = async (reviewId: string) => {
  const res = await api.delete(`/reviews/${reviewId}`);
  return res.data;
};