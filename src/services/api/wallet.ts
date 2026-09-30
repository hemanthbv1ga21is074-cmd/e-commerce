import { api, apiCall } from './client';
import type { WalletTransaction } from '../../types';

export interface WalletData {
  balanceInPaise: number;
  balance: number;
  transactions: WalletTransaction[];
}

export interface GiftCardRedeemResponse {
  success: boolean;
  redeemedAmount: number;
  newWalletBalance: number;
  message: string;
}

export async function apiGetWallet(): Promise<WalletData> {
  return apiCall(
    () => ({
      balanceInPaise: 100000,
      balance: 1000,
      transactions: [],
    }),
    async () => {
      const res = await api<{ success: boolean; data: WalletData }>('/account/wallet');
      return res.data;
    }
  );
}

export async function apiTopUpWallet(amount: number): Promise<WalletData> {
  return apiCall(
    () => ({
      balanceInPaise: amount * 100,
      balance: amount,
      transactions: [],
    }),
    async () => {
      const res = await api<{ success: boolean; data: { balanceInPaise: number; balance: number; entry: WalletTransaction } }>(
        '/account/wallet/topup',
        {
          method: 'POST',
          body: JSON.stringify({ amount, amountInPaise: amount * 100 }),
        }
      );
      return {
        balanceInPaise: res.data.balanceInPaise,
        balance: res.data.balance,
        transactions: [res.data.entry],
      };
    }
  );
}

export async function apiRedeemGiftCard(code: string, pin: string): Promise<GiftCardRedeemResponse> {
  return apiCall(
    () => {
      let amount = 500;
      if (code.toUpperCase().includes('1000')) amount = 1000;
      if (code.toUpperCase().includes('2026')) amount = 2500;
      return {
        success: true,
        redeemedAmount: amount,
        newWalletBalance: 1000 + amount,
        message: `Gift card successfully redeemed! ₹${amount} added to your StyleBazaar Wallet.`,
      };
    },
    async () => {
      const res = await api<{ success: boolean; data: GiftCardRedeemResponse }>(
        '/account/wallet/redeem-giftcard',
        {
          method: 'POST',
          body: JSON.stringify({ code, pin }),
        }
      );
      return res.data;
    }
  );
}
