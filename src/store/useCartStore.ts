import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Coupon } from '../types';
import { useWishlistStore } from './useWishlistStore';

interface CartStore {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  deliveryPincode: string;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  updateSize: (productId: string, oldSize: string, newSize: string, newStock: number) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  setDeliveryPincode: (pincode: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  moveToWishlist: (productId: string, size: string) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      deliveryPincode: '560001',

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.size === item.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.size === item.size
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.maxStock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        })),

      updateQuantity: (productId, size, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i
          ),
        })),

      updateSize: (productId, oldSize, newSize, newStock) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === oldSize
              ? { ...i, size: newSize, maxStock: newStock }
              : i
          ),
        })),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

      removeCoupon: () => set({ appliedCoupon: null }),

      setDeliveryPincode: (pincode) => set({ deliveryPincode: pincode }),

      clearCart: () => set({ items: [], appliedCoupon: null }),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      moveToWishlist: (productId, size) => {
        // Add to wishlist if not already wishlisted
        const wishlist = useWishlistStore.getState();
        if (!wishlist.isWishlisted(productId)) {
          wishlist.toggle(productId);
        }

        // Remove from bag
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        }));
      },
    }),
    { name: 'stylebazaar-cart' }
  )
);
