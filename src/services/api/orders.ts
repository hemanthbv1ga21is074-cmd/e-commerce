import { api, apiBlob, apiCall, API_BASE } from './client';
import type { Order } from '../../types';

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    variantId?: string;
    size: string;
    color?: string;
    quantity: number;
  }>;
  addressId?: string;
  shippingAddressText?: string;
  couponCode?: string;
  paymentMethod?: 'COD' | 'WALLET' | 'TEST_PAYMENT';
  useWallet?: boolean;
  usePoints?: boolean;
}

export async function apiCreateOrder(
  payload: CreateOrderPayload,
  idempotencyKey?: string,
  mockOrder?: Order
): Promise<Order> {
  return apiCall(
    () => {
      if (!mockOrder) {
        throw new Error('Mock order not provided');
      }
      return mockOrder;
    },
    async () => {
      const headers: Record<string, string> = {};
      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }

      const res = await api<{ success: boolean; data: Order }>('/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      return res.data;
    }
  );
}

export async function apiGetOrders(): Promise<Order[]> {
  return apiCall(
    () => [],
    async () => {
      const res = await api<{ success: boolean; data: Order[] }>('/orders');
      return res.data;
    }
  );
}

export async function apiGetOrderById(id: string): Promise<Order | null> {
  return apiCall(
    () => null,
    async () => {
      const res = await api<{ success: boolean; data: Order }>(`/orders/${id}`);
      return res.data;
    }
  );
}

export async function apiCancelOrder(id: string, reason?: string): Promise<Order> {
  return apiCall(
    () => {
      throw new Error('Mock cancel order not directly supported via apiCall');
    },
    async () => {
      const res = await api<{ success: boolean; data: Order }>(`/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      return res.data;
    }
  );
}

export function getInvoiceUrl(orderId: string): string {
  return `${API_BASE}/orders/${orderId}/invoice`;
}

export async function apiDownloadInvoice(orderId: string): Promise<Blob> {
  return apiBlob(`/orders/${orderId}/invoice`);
}
