import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, WalletTransaction } from '../types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  loginAsDemoUser: () => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addWalletBalance: (amount: number, description?: string) => void;
  deductWalletBalance: (amount: number, description?: string) => boolean;
  deductLoyaltyPoints: (points: number) => void;
}

export const DEMO_USER: User = {
  id: 'usr-demo-1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '9876543210',
  gender: 'Male',
  birthday: '1996-08-15',
  alternatePhone: '9876500000',
  avatar: '',
  addresses: [],
  walletBalance: 750,
  loyaltyPoints: 1450,
  loyaltyTier: 'Gold',
  createdAt: '2025-01-10T10:00:00Z',
  walletTransactions: [
    {
      id: 'tx-1',
      type: 'credit',
      amount: 500,
      description: 'Welcome Bonus Credited',
      date: '2026-09-15T12:00:00Z',
    },
    {
      id: 'tx-2',
      type: 'credit',
      amount: 250,
      description: 'Cashback on Order #SB-892419',
      date: '2026-09-22T14:30:00Z',
    },
  ],
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (user) => set({ user, isAuthenticated: true }),

      loginAsDemoUser: () => set({ user: DEMO_USER, isAuthenticated: true }),

      logout: () => set({ user: null, isAuthenticated: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      addWalletBalance: (amount, description = 'Wallet Top-up') =>
        set((state) => {
          if (!state.user) return {};
          const newTx: WalletTransaction = {
            id: `tx-${Date.now()}`,
            type: 'credit',
            amount,
            description,
            date: new Date().toISOString(),
          };
          return {
            user: {
              ...state.user,
              walletBalance: state.user.walletBalance + amount,
              walletTransactions: [newTx, ...(state.user.walletTransactions || [])],
            },
          };
        }),

      deductWalletBalance: (amount, description = 'Used on Order') => {
        const currentUser = get().user;
        if (!currentUser || currentUser.walletBalance < amount) return false;
        const newTx: WalletTransaction = {
          id: `tx-${Date.now()}`,
          type: 'debit',
          amount,
          description,
          date: new Date().toISOString(),
        };
        set({
          user: {
            ...currentUser,
            walletBalance: currentUser.walletBalance - amount,
            walletTransactions: [newTx, ...(currentUser.walletTransactions || [])],
          },
        });
        return true;
      },

      deductLoyaltyPoints: (points) =>
        set((state) => {
          if (!state.user) return {};
          return {
            user: {
              ...state.user,
              loyaltyPoints: Math.max(0, state.user.loyaltyPoints - points),
            },
          };
        }),
    }),
    { name: 'stylebazaar-auth' }
  )
);
