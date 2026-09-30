import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  calcDiscountPercent,
  calcMrpTotal,
  calcSubtotal,
  calcTotalDiscount,
  calcDeliveryFee,
  applyCoupon,
  calcPricingBreakdown,
} from '../../utils/price';
import type { CartItem, Coupon } from '../../types';

describe('Pricing Engine Utilities', () => {
  const sampleItems: CartItem[] = [
    {
      productId: 'p1',
      slug: 'cotton-tshirt',
      title: 'Cotton T-Shirt',
      brand: 'Zephyr',
      price: 499,
      mrp: 999,
      size: 'M',
      color: 'Navy',
      image: '',
      quantity: 2,
      maxStock: 10,
    },
    {
      productId: 'p2',
      slug: 'slim-fit-jeans',
      title: 'Slim Fit Jeans',
      brand: 'IronForge',
      price: 1299,
      mrp: 2499,
      size: '32',
      color: 'Black',
      image: '',
      quantity: 1,
      maxStock: 5,
    },
  ];

  it('correctly formats INR prices', () => {
    const formatted = formatPrice(1299);
    expect(formatted).toContain('1,299');
    expect(formatted).toContain('₹');
  });

  it('calculates discount percentage correctly', () => {
    expect(calcDiscountPercent(1000, 500)).toBe(50);
    expect(calcDiscountPercent(2000, 1500)).toBe(25);
    expect(calcDiscountPercent(0, 100)).toBe(0);
  });

  it('calculates cart totals correctly', () => {
    // 999*2 + 2499*1 = 1998 + 2499 = 4497
    expect(calcMrpTotal(sampleItems)).toBe(4497);
    // 499*2 + 1299*1 = 998 + 1299 = 2297
    expect(calcSubtotal(sampleItems)).toBe(2297);
    // 4497 - 2297 = 2200
    expect(calcTotalDiscount(sampleItems)).toBe(2200);
  });

  it('handles free delivery above threshold', () => {
    expect(calcDeliveryFee(1200)).toBe(0); // >= 999 is free
    expect(calcDeliveryFee(500)).toBe(49); // < 999 charges 49
  });

  it('applies flat coupons properly', () => {
    const coupon: Coupon = {
      id: 'c1',
      code: 'FLAT100',
      type: 'flat',
      value: 100,
      minCartValue: 500,
      description: 'Flat 100 off',
      expiresAt: '2099-01-01T00:00:00Z',
    };

    const result = applyCoupon(coupon, 1000, sampleItems, false);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(100);
  });

  it('rejects coupon if minCartValue is not met', () => {
    const coupon: Coupon = {
      id: 'c2',
      code: 'BIGSAVINGS',
      type: 'flat',
      value: 500,
      minCartValue: 3000,
      description: 'Flat 500 off on 3000',
      expiresAt: '2099-01-01T00:00:00Z',
    };

    const result = applyCoupon(coupon, 1500, sampleItems, false);
    expect(result.valid).toBe(false);
    expect(result.discount).toBe(0);
  });

  it('respects first-order restrictions', () => {
    const coupon: Coupon = {
      id: 'c3',
      code: 'WELCOME100',
      type: 'flat',
      value: 100,
      minCartValue: 500,
      description: 'Welcome bonus',
      firstOrderOnly: true,
      expiresAt: '2099-01-01T00:00:00Z',
    };

    // User is NOT first order
    const resultInvalid = applyCoupon(coupon, 1000, sampleItems, false);
    expect(resultInvalid.valid).toBe(false);

    // User IS first order
    const resultValid = applyCoupon(coupon, 1000, sampleItems, true);
    expect(resultValid.valid).toBe(true);
    expect(resultValid.discount).toBe(100);
  });

  it('computes full pricing breakdown correctly', () => {
    const breakdown = calcPricingBreakdown(sampleItems);
    expect(breakdown.mrpTotal).toBe(4497);
    expect(breakdown.subtotal).toBe(2297);
    expect(breakdown.deliveryFee).toBe(0); // 2297 > 999
    expect(breakdown.finalTotal).toBe(2297);
    expect(breakdown.itemCount).toBe(3);
  });
});
