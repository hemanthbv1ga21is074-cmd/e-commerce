/**
 * Admin API service — supports both mock and real backend.
 *
 * Real backend endpoints:
 *   GET /api/admin/orders
 *   PATCH /api/admin/orders/:id/status
 *   GET /api/admin/inventory
 *   PATCH /api/admin/inventory/:productId/:size
 */
import { apiCall, api } from './client';
import type { Order } from '../../types';

export interface AdminOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InventoryVariant {
  variantId: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  brand: string;
  size: string;
  stock: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  mrp: number;
  price: number;
  image: string;
}

export interface AdminInventoryResponse {
  variants: InventoryVariant[];
  summary: {
    totalVariants: number;
    lowStockVariants: number;
    outOfStockVariants: number;
    threshold: number;
  };
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getAdminOrders(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AdminOrdersResponse> {
  return apiCall(
    () => ({
      orders: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    }),
    async () => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());

      const res = await api<{ success: boolean; data: AdminOrdersResponse }>(
        `/admin/orders?${q.toString()}`
      );
      return res.data;
    }
  );
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: string,
  message?: string
): Promise<Order> {
  return apiCall(
    () => {
      throw new Error('Real backend required for admin status updates.');
    },
    async () => {
      const res = await api<{ success: boolean; data: Order }>(
        `/admin/orders/${orderId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, message }),
        }
      );
      return res.data;
    }
  );
}

export async function getAdminInventory(params?: {
  lowStockOnly?: boolean;
  threshold?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AdminInventoryResponse> {
  return apiCall(
    () => ({
      variants: [],
      summary: {
        totalVariants: 0,
        lowStockVariants: 0,
        outOfStockVariants: 0,
        threshold: 5,
      },
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 1,
    }),
    async () => {
      const q = new URLSearchParams();
      if (params?.lowStockOnly) q.set('lowStockOnly', 'true');
      if (params?.threshold) q.set('threshold', params.threshold.toString());
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());

      const res = await api<{ success: boolean; data: AdminInventoryResponse }>(
        `/admin/inventory?${q.toString()}`
      );
      return res.data;
    }
  );
}

export async function updateVariantStock(
  productId: string,
  size: string,
  stock: number
): Promise<{ productId: string; size: string; stock: number; updated: boolean }> {
  return apiCall(
    () => ({ productId, size, stock, updated: true }),
    async () => {
      const res = await api<{
        success: boolean;
        data: { productId: string; size: string; stock: number; updated: boolean };
      }>(`/admin/inventory/${productId}/${size}`, {
        method: 'PATCH',
        body: JSON.stringify({ stock }),
      });
      return res.data;
    }
  );
}
