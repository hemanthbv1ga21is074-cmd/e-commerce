import { api, apiCall } from './client';

export interface WishlistResponse {
  productIds: string[];
  products: any[];
}

export async function apiGetWishlist(): Promise<string[]> {
  return apiCall(
    () => [],
    async () => {
      const res = await api<{ success: boolean; data: WishlistResponse }>('/wishlist');
      return res.data.productIds;
    }
  );
}

export async function apiAddToWishlist(productId: string): Promise<string[]> {
  return apiCall(
    () => [],
    async () => {
      const res = await api<{ success: boolean; data: string[] }>('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      return res.data;
    }
  );
}

export async function apiToggleWishlist(productId: string): Promise<{ items: string[]; added: boolean }> {
  return apiCall(
    () => ({ items: [], added: true }),
    async () => {
      const res = await api<{ success: boolean; data: { items: string[]; added: boolean } }>('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      return res.data;
    }
  );
}

export async function apiRemoveFromWishlist(productId: string): Promise<string[]> {
  return apiCall(
    () => [],
    async () => {
      const res = await api<{ success: boolean; data: string[] }>(`/wishlist/${productId}`, {
        method: 'DELETE',
      });
      return res.data;
    }
  );
}

export async function apiMergeWishlist(productIds: string[]): Promise<string[]> {
  return apiCall(
    () => [],
    async () => {
      const res = await api<{ success: boolean; data: string[] }>('/wishlist/merge', {
        method: 'POST',
        body: JSON.stringify({ productIds }),
      });
      return res.data;
    }
  );
}
