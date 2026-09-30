import { api, apiCall } from './client';

export interface LoyaltyData {
  points: number;
  tier: 'Silver' | 'Gold' | 'Platinum';
  nextTier: string;
  progressPercent: number;
  worthInRupees: number;
  transactions: Array<{
    id: string;
    points: number;
    balanceAfterPoints: number;
    source: string;
    description: string;
    createdAt: string;
  }>;
}

export async function apiGetLoyalty(): Promise<LoyaltyData> {
  return apiCall(
    () => ({
      points: 1250,
      tier: 'Gold',
      nextTier: 'Platinum',
      progressPercent: 70,
      worthInRupees: 125,
      transactions: [],
    }),
    async () => {
      const res = await api<{ success: boolean; data: LoyaltyData }>('/account/loyalty');
      return res.data;
    }
  );
}
