import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RECENTLY_VIEWED_MAX } from '../utils/constants';

interface RecentlyViewedStore {
  productIds: string[];
  add: (productId: string) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      productIds: [],
      add: (productId) =>
        set((state) => {
          const filtered = state.productIds.filter((id) => id !== productId);
          return {
            productIds: [productId, ...filtered].slice(0, RECENTLY_VIEWED_MAX),
          };
        }),
      clear: () => set({ productIds: [] }),
    }),
    { name: 'stylebazaar-recently-viewed' }
  )
);
