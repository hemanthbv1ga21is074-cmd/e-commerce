import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Review } from '../types';

interface ReviewStore {
  reviews: Review[];
  addReview: (data: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) => Review;
  getProductReviews: (productId: string) => Review[];
  voteHelpful: (reviewId: string) => void;
  hasUserReviewed: (productId: string, userId: string) => boolean;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'user-demo-1',
    userName: 'Rahul Sharma',
    rating: 5,
    title: 'Superb fabric and crisp fit!',
    text: 'The cotton fabric is breathable and holds shape even after several washes. Perfect for Bangalore summer. True to size!',
    fit: 'True to Size',
    verifiedBuyer: true,
    helpfulCount: 24,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userId: 'user-102',
    userName: 'Vikram Joshi',
    rating: 4,
    title: 'Value for money',
    text: 'Color is slightly darker than the product photos, but the stitching and collar structure are top notch.',
    fit: 'True to Size',
    verifiedBuyer: true,
    helpfulCount: 11,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-3',
    productId: 'prod-2',
    userId: 'user-103',
    userName: 'Ananya Deshmukh',
    rating: 5,
    title: 'Stunning embroidery and comfortable drape',
    text: 'Wore it for Diwali celebrations at office and received endless compliments. Pair with silver jhumkas for the best festive look.',
    fit: 'True to Size',
    verifiedBuyer: true,
    helpfulCount: 38,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      reviews: INITIAL_REVIEWS,

      addReview: (data) => {
        const newReview: Review = {
          ...data,
          id: `rev-${Date.now()}`,
          helpfulCount: 0,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          reviews: [newReview, ...state.reviews],
        }));

        return newReview;
      },

      getProductReviews: (productId) => {
        return get().reviews.filter((r) => r.productId === productId);
      },

      voteHelpful: (reviewId) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
          ),
        }));
      },

      hasUserReviewed: (productId, userId) => {
        return get().reviews.some(
          (r) => r.productId === productId && r.userId === userId
        );
      },
    }),
    { name: 'stylebazaar-reviews' }
  )
);
