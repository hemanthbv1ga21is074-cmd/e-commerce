import type { Coupon } from '../types';

export const coupons: Coupon[] = [
  { id: 'c1', code: 'WELCOME100', type: 'flat', value: 100, minCartValue: 999, description: '₹100 off on your first order. Min cart ₹999.', firstOrderOnly: true, expiresAt: '2027-12-31T23:59:59Z', stackable: false },
  { id: 'c2', code: 'FLAT15', type: 'percent', value: 15, minCartValue: 1499, maxDiscount: 500, description: '15% off up to ₹500. Min cart ₹1,499.', firstOrderOnly: false, expiresAt: '2027-06-30T23:59:59Z', stackable: false },
  { id: 'c3', code: 'ETHNIC20', type: 'percent', value: 20, minCartValue: 1999, maxDiscount: 800, description: '20% off on ethnic wear. Min cart ₹1,999.', firstOrderOnly: false, expiresAt: '2027-03-31T23:59:59Z', categoryRestriction: ['Ethnic Wear', 'Kurtas & Sets', 'Sarees'], stackable: false },
  { id: 'c4', code: 'ZEPHYR200', type: 'flat', value: 200, minCartValue: 1499, description: '₹200 off on Zephyr products. Min cart ₹1,499.', firstOrderOnly: false, expiresAt: '2027-06-30T23:59:59Z', brandRestriction: ['Zephyr'], stackable: false },
  { id: 'c5', code: 'SAVE500', type: 'flat', value: 500, minCartValue: 2999, description: '₹500 off. Min cart ₹2,999.', firstOrderOnly: false, expiresAt: '2027-06-30T23:59:59Z', stackable: false },
  { id: 'c6', code: 'MEGA30', type: 'percent', value: 30, minCartValue: 3999, maxDiscount: 1200, description: '30% off up to ₹1,200. Min cart ₹3,999.', firstOrderOnly: false, expiresAt: '2027-01-31T23:59:59Z', stackable: false },
];
