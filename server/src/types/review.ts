export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  text: string;
  images?: string[];
  verifiedBuyer: boolean;
  helpfulCount: number;
  fit?: 'Runs Small' | 'True to Size' | 'Runs Large';
  orderId?: string;
  createdAt: string;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}
