/**
 * Reviews API service — supports both mock and real backend.
 *
 * Real backend endpoints:
 *   GET /api/products/:id/reviews
 *   POST /api/products/:id/reviews
 *   POST /api/reviews/:id/vote
 */
import { apiCall, api } from './client';
import { reviews as allReviews } from '../../data/reviews';
import type { Review } from '../../types';

interface ReviewsResponse {
  success: boolean;
  data: Review[];
}

export interface CreateReviewInput {
  rating: number;
  title: string;
  text: string;
  fit?: 'Runs Small' | 'True to Size' | 'Runs Large';
  images?: string[];
  orderId?: string;
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  return apiCall(
    () => allReviews.filter((r) => r.productId === productId),
    async () => {
      const res = await api<ReviewsResponse>(`/products/${productId}/reviews`);
      return res.data;
    }
  );
}

export async function submitProductReview(
  productId: string,
  input: CreateReviewInput
): Promise<Review> {
  return apiCall(
    () => {
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        productId,
        userId: 'usr-demo-1',
        userName: 'Rahul Sharma',
        rating: input.rating,
        title: input.title,
        text: input.text,
        fit: input.fit || 'True to Size',
        images: input.images,
        orderId: input.orderId,
        verifiedBuyer: true,
        helpfulCount: 0,
        createdAt: new Date().toISOString(),
      };
      return newReview;
    },
    async () => {
      const res = await api<{ success: boolean; data: Review }>(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.data;
    }
  );
}

export async function voteReviewHelpful(
  reviewId: string
): Promise<{ reviewId: string; helpfulCount: number }> {
  return apiCall(
    () => ({ reviewId, helpfulCount: 1 }),
    async () => {
      const res = await api<{ success: boolean; data: { reviewId: string; helpfulCount: number } }>(
        `/reviews/${reviewId}/vote`,
        { method: 'POST' }
      );
      return res.data;
    }
  );
}
