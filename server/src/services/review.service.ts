import { reviews as initialReviews } from '../data/reviews.js';
import { products } from '../data/products.js';
import { inMemoryOrders } from './order.service.js';
import { ledgerService } from './ledger.service.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import type { Review } from '../types/index.js';

export interface CreateReviewInput {
  rating: number;
  title: string;
  text: string;
  fit?: 'Runs Small' | 'True to Size' | 'Runs Large';
  images?: string[];
  orderId?: string;
}

export class ReviewService {
  private allReviews: Review[] = [...initialReviews];

  async getReviewsByProductId(productId: string): Promise<Review[]> {
    return this.allReviews
      .filter((r) => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addReview(
    productId: string,
    userId: string,
    userName: string,
    input: CreateReviewInput
  ): Promise<Review> {
    if (!input.rating || input.rating < 1 || input.rating > 5) {
      throw new BadRequestError('Rating must be an integer between 1 and 5.');
    }
    if (!input.title || !input.title.trim()) {
      throw new BadRequestError('Review title is required.');
    }
    if (!input.text || !input.text.trim()) {
      throw new BadRequestError('Review text is required.');
    }

    // Check product exists
    const prod = products.find((p) => p.id === productId || p.slug === productId);
    if (!prod) {
      throw new NotFoundError(`Product not found with ID: ${productId}`);
    }

    // Verify buyer status
    let isVerified = Boolean(input.orderId);
    if (!isVerified) {
      // Check if user has an order containing this product
      isVerified = inMemoryOrders.some(
        (o) => o.userId === userId && o.items.some((i) => i.productId === prod.id)
      );
    }

function stripHtml(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

    const cleanTitle = stripHtml(input.title);
    const cleanText = stripHtml(input.text);

    if (!cleanTitle) {
      throw new BadRequestError('Review title is required.');
    }
    if (!cleanText) {
      throw new BadRequestError('Review text is required.');
    }

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: prod.id,
      userId,
      userName: userName || 'Verified Customer',
      rating: Math.round(input.rating),
      title: cleanTitle,
      text: cleanText,
      fit: input.fit || 'True to Size',
      images: input.images && input.images.length > 0 ? input.images : undefined,
      verifiedBuyer: isVerified,
      helpfulCount: 0,
      orderId: input.orderId,
      createdAt: new Date().toISOString(),
    };

    this.allReviews.unshift(newReview);

    // Recalculate product rating and count mathematically
    const oldCount = prod.ratingCount || 0;
    const oldRating = prod.rating || 5;
    const newCount = oldCount + 1;
    const newRating = Math.round(((oldRating * oldCount + newReview.rating) / newCount) * 10) / 10;
    prod.rating = newRating;
    prod.ratingCount = newCount;

    // Award 50 bonus loyalty points for writing a review
    try {
      await ledgerService.addLoyaltyPoints(userId, 50, 'REVIEW_REWARD');
    } catch {
      // Ignore if loyalty reward fails
    }

    return newReview;
  }

  async voteHelpful(reviewId: string): Promise<{ reviewId: string; helpfulCount: number }> {
    const rev = this.allReviews.find((r) => r.id === reviewId);
    if (!rev) {
      throw new NotFoundError(`Review not found with ID: ${reviewId}`);
    }

    rev.helpfulCount += 1;
    return {
      reviewId: rev.id,
      helpfulCount: rev.helpfulCount,
    };
  }
}

export const reviewService = new ReviewService();
