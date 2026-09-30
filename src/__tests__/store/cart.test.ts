import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import type { CartItem, Coupon } from '../../types';

describe('useCartStore & useWishlistStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useWishlistStore.getState().clear();
  });

  const sampleItem: CartItem = {
    productId: 'm1',
    slug: 'oversized-cotton-tshirt',
    title: 'Oversized Cotton Tee',
    brand: 'Zephyr',
    price: 599,
    mrp: 1199,
    size: 'M',
    color: 'White',
    quantity: 1,
    maxStock: 5,
  };

  it('adds an item to cart and aggregates quantity on re-add', () => {
    const store = useCartStore.getState();
    store.addItem(sampleItem);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);

    // Adding same item with same size should increase quantity
    useCartStore.getState().addItem(sampleItem);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('updates item quantity and clamps to stock', () => {
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().updateQuantity('m1', 'M', 4);
    expect(useCartStore.getState().items[0].quantity).toBe(4);

    // Should clamp to maxStock (5)
    useCartStore.getState().updateQuantity('m1', 'M', 10);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('updates item size', () => {
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().updateSize('m1', 'M', 'L', 8);
    expect(useCartStore.getState().items[0].size).toBe('L');
    expect(useCartStore.getState().items[0].maxStock).toBe(8);
  });

  it('moves item to wishlist and removes from cart', () => {
    useCartStore.getState().addItem(sampleItem);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useWishlistStore.getState().isWishlisted('m1')).toBe(false);

    useCartStore.getState().moveToWishlist('m1', 'M');

    // Should be removed from cart
    expect(useCartStore.getState().items).toHaveLength(0);
    // Should be in wishlist
    expect(useWishlistStore.getState().isWishlisted('m1')).toBe(true);
  });

  it('applies and removes coupons', () => {
    const coupon: Coupon = {
      id: 'c1',
      code: 'SAVE100',
      type: 'flat',
      value: 100,
      minCartValue: 500,
      description: 'Save 100',
      expiresAt: '2099-01-01T00:00:00Z',
    };

    useCartStore.getState().applyCoupon(coupon);
    expect(useCartStore.getState().appliedCoupon?.code).toBe('SAVE100');

    useCartStore.getState().removeCoupon();
    expect(useCartStore.getState().appliedCoupon).toBeNull();
  });
});
