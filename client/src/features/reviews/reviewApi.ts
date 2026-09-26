import { api } from "../../lib/api";
import type { Review } from "./reviewTypes";

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const fetchProductReviews = async (
  productId: string,
  page = 1,
): Promise<{
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const res = await api.get(`/reviews/product/${productId}`, {
    params: { page, limit: 10 },
  });
  return res.data;
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
