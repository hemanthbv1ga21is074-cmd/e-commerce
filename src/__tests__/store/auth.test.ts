import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('starts as unauthenticated with null user', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('logs in as demo user correctly', () => {
    useAuthStore.getState().loginAsDemoUser();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe('Rahul Sharma');
    expect(useAuthStore.getState().user?.loyaltyTier).toBe('Gold');
  });

  it('updates profile details correctly', () => {
    useAuthStore.getState().loginAsDemoUser();
    useAuthStore.getState().updateUser({ name: 'Rahul S. Verma', birthday: '1995-10-20' });

    const updated = useAuthStore.getState().user;
    expect(updated?.name).toBe('Rahul S. Verma');
    expect(updated?.birthday).toBe('1995-10-20');
  });

  it('adds wallet balance and appends transaction', () => {
    useAuthStore.getState().loginAsDemoUser();
    const initialBalance = useAuthStore.getState().user?.walletBalance || 0;
    const initialTxCount = useAuthStore.getState().user?.walletTransactions?.length || 0;

    useAuthStore.getState().addWalletBalance(500, 'Test Recharge');

    expect(useAuthStore.getState().user?.walletBalance).toBe(initialBalance + 500);
    expect(useAuthStore.getState().user?.walletTransactions?.length).toBe(initialTxCount + 1);
    expect(useAuthStore.getState().user?.walletTransactions?.[0].description).toBe('Test Recharge');
  });

  it('logs out and resets state', () => {
    useAuthStore.getState().loginAsDemoUser();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
