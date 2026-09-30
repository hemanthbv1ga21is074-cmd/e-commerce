/**
 * Pincodes API service — supports both mock and real backend.
 *
 * Real backend endpoint:
 *   GET /api/pincodes/:pincode/serviceability
 */
import { apiCall, api } from './client';
import { pincodeMap } from '../../data/pincodes';

export interface DeliveryInfo {
  deliverable: boolean;
  city: string;
  state: string;
  estimatedDays: number;
  codAvailable: boolean;
  estimatedDate: string;
}

interface ServiceabilityResponse {
  success: boolean;
  data: DeliveryInfo;
}

/* ─── checkDelivery ─── */
export async function checkDelivery(pincode: string): Promise<DeliveryInfo | null> {
  return apiCall(
    () => {
      const data = pincodeMap[pincode];
      if (!data) {
        // Fallback for unknown valid Indian pincodes
        const firstDigit = parseInt(pincode[0]);
        if (pincode.length === 6 && !isNaN(firstDigit) && firstDigit >= 1 && firstDigit <= 9) {
          const est = new Date();
          est.setDate(est.getDate() + 6);
          return {
            deliverable: true,
            city: 'Your City',
            state: 'Your State',
            estimatedDays: 6,
            codAvailable: true,
            estimatedDate: est.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            }),
          };
        }
        return null;
      }

      const est = new Date();
      est.setDate(est.getDate() + data.estimatedDays);
      return {
        ...data,
        estimatedDate: est.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      };
    },
    async () => {
      try {
        const res = await api<ServiceabilityResponse>(`/pincodes/${pincode}/serviceability`);
        return res.data;
      } catch (e: unknown) {
        if (e instanceof Error && (e.message.includes('404') || e.message.includes('not deliverable'))) {
          return null;
        }
        throw e;
      }
    }
  );
}
