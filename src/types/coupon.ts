export type CouponType = 'percent' | 'flat';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minCartValue: number;
  maxDiscount?: number;
  categoryRestriction?: string[];
  brandRestriction?: string[];
  firstOrderOnly?: boolean;
  expiresAt: string;
  description: string;
  bankRestriction?: string;
  stackable?: boolean;
}
