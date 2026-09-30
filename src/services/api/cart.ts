import { api, apiCall } from './client';
import type { CartItem } from '../../types';

export async function apiGetCart(): Promise<CartItem[]> {
  return apiCall(
    () => {
      // In mock mode, the zustand persist store maintains state in localStorage
      return [];
    },
    async () => {
      const res = await api<{ success: boolean; data: CartItem[] }>('/cart');
      return res.data;
    }
  );
}

export async function apiAddToCart(item: {
  productId: string;
  variantId?: string;
  size: string;
  color?: string;
  quantity: number;
}): Promise<CartItem[]> {
  return apiCall(
    () => [],
    async () => {
      const res = await api<{ success: boolean; data: CartItem[] }>('/cart', {
        method: 'POST',
        body: JSON.stringify(item),
      });
      return res.data;
    }
  );
}

export async function apiUpdateCartItem(
  itemId: string,
  updates: { quantity?: number; size?: string }
): Promise<CartItem[]> {
  return apiCall(
    () => [],
    async () => {
      const res = await api<{ success: boolean; data: CartItem[] }>(`/cart/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return res.data;
    }
  );
}

export async function apiRemoveCartItem(itemId: string): Promise<CartItem[]> {
  return apiCall(
    () => [],
    async () => {
      const res = await api<{ success: boolean; data: CartItem[] }>(`/cart/${itemId}`, {
        method: 'DELETE',
      });
      return res.data;
    }
  );
}

export async function apiClearCart(): Promise<void> {
  return apiCall(
    () => {},
    async () => {
      await api('/cart', { method: 'DELETE' });
    }
  );
}

export async function apiMergeCart(
  items: Array<{ productId: string; variantId?: string; size: string; color?: string; quantity: number }>
): Promise<CartItem[]> {
  return apiCall(
    () => [],
    async () => {
      const res = await api<{ success: boolean; data: CartItem[] }>('/cart/merge', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      return res.data;
    }
  );
}
