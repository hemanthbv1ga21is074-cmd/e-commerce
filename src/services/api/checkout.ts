import { api, apiCall } from './client';
import { calcPricingBreakdown } from '../../utils/price';
import type { CartItem, Coupon } from '../../types';

export interface QuoteRequest {
  items: Array<{
    productId: string;
    variantId?: string;
    size: string;
    color?: string;
    quantity: number;
  }>;
  couponCode?: string;
  isCod?: boolean;
  useWallet?: boolean;
  usePoints?: boolean;
  pincode?: string;
}

export interface QuoteBreakdown {
  mrpTotalInPaise: number;
  subtotalInPaise: number;
  productDiscountInPaise: number;
  couponDiscountInPaise: number;
  deliveryFeeInPaise: number;
  codFeeInPaise: number;
  walletDeductionInPaise: number;
  pointsDeductionInPaise: number;
  finalTotalInPaise: number;
  totalSavingsInPaise: number;
  gstIncludedInPaise: number;

  mrpTotal: number;
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  deliveryFee: number;
  codFee: number;
  walletDeduction: number;
  pointsDeduction: number;
  finalTotal: number;
  totalSavings: number;
  itemCount: number;

  couponMessage?: string;
  couponValid?: boolean;
  isCodEligible: boolean;
  codIneligibleReason?: string;
}

export async function apiGetQuote(
  req: QuoteRequest,
  cartItemsForMock: CartItem[] = [],
  mockCoupon?: Coupon | null
): Promise<QuoteBreakdown> {
  return apiCall<QuoteBreakdown>(
    (): QuoteBreakdown => {
      const mockResult = calcPricingBreakdown(cartItemsForMock, {
        coupon: mockCoupon,
        isCod: req.isCod,
        useWallet: req.useWallet,
        usePoints: req.usePoints,
      });

      return {
        mrpTotalInPaise: mockResult.mrpTotal * 100,
        subtotalInPaise: mockResult.subtotal * 100,
        productDiscountInPaise: mockResult.productDiscount * 100,
        couponDiscountInPaise: mockResult.couponDiscount * 100,
        deliveryFeeInPaise: mockResult.deliveryFee * 100,
        codFeeInPaise: mockResult.codFee * 100,
        walletDeductionInPaise: mockResult.walletDeduction * 100,
        pointsDeductionInPaise: mockResult.pointsDeduction * 100,
        finalTotalInPaise: mockResult.finalTotal * 100,
        totalSavingsInPaise: mockResult.totalSavings * 100,
        gstIncludedInPaise: Math.round((mockResult.subtotal * 100 * 12) / 112),

        mrpTotal: mockResult.mrpTotal,
        subtotal: mockResult.subtotal,
        productDiscount: mockResult.productDiscount,
        couponDiscount: mockResult.couponDiscount,
        deliveryFee: mockResult.deliveryFee,
        codFee: mockResult.codFee,
        walletDeduction: mockResult.walletDeduction,
        pointsDeduction: mockResult.pointsDeduction,
        finalTotal: mockResult.finalTotal,
        totalSavings: mockResult.totalSavings,
        itemCount: mockResult.itemCount,

        couponMessage: mockResult.couponMessage,
        couponValid: Boolean(mockCoupon && mockResult.couponDiscount > 0),
        isCodEligible: true,
      };
    },
    async () => {
      const res = await api<{ success: boolean; data: QuoteBreakdown }>('/checkout/quote', {
        method: 'POST',
        body: JSON.stringify(req),
      });
      return res.data;
    }
  );
}
