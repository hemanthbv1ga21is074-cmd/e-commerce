import { api, apiCall } from './client';
import { coupons as mockCoupons } from '../../data/coupons';
import type { Coupon } from '../../types';

export interface CouponValidationResponse {
  valid: boolean;
  coupon?: Coupon;
  discount: number;
  discountInPaise: number;
  message: string;
}

export async function apiGetCoupons(): Promise<Coupon[]> {
  return apiCall(
    () => mockCoupons,
    async () => {
      const res = await api<{ success: boolean; data: Coupon[] }>('/coupons');
      return res.data;
    }
  );
}

export async function apiValidateCoupon(
  code: string,
  subtotalInPaise: number,
  items?: Array<{ productId: string; size?: string; quantity: number }>
): Promise<CouponValidationResponse> {
  return apiCall(
    () => {
      const found = mockCoupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
      if (!found) {
        return { valid: false, discount: 0, discountInPaise: 0, message: `Coupon '${code}' is invalid.` };
      }
      const subtotalRs = Math.round(subtotalInPaise / 100);
      if (subtotalRs < found.minCartValue) {
        return { valid: false, discount: 0, discountInPaise: 0, message: `Minimum cart value of ₹${found.minCartValue} required.` };
      }
      let discountRs = found.type === 'percent' ? Math.round((subtotalRs * found.value) / 100) : found.value;
      if (found.maxDiscount) discountRs = Math.min(discountRs, found.maxDiscount);
      return {
        valid: true,
        coupon: found,
        discount: discountRs,
        discountInPaise: discountRs * 100,
        message: `Coupon '${found.code}' applied! You save ₹${discountRs}.`,
      };
    },
    async () => {
      const res = await api<{ success: boolean; data: CouponValidationResponse }>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotalInPaise, items }),
      });
      return res.data;
    }
  );
}
