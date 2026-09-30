import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: string[]; // product IDs
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (productId) =>
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items.filter((id) => id !== productId)
            : [...state.items, productId],
        })),

      isWishlisted: (productId) => get().items.includes(productId),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: 'stylebazaar-wishlist' }
  )
);
