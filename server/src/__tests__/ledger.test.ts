import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { ledgerService, calculateTier } from '../services/ledger.service.js';

describe('Phase 5C: StyleBazaar Wallet, Loyalty Points, Gift Cards & Ledgers', () => {
  let authToken = '';
  let userId = '';
  const testEmail = `ledger-user-${Date.now()}@stylebazaar.com`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Ledger Tester',
      email: testEmail,
      password: testPassword,
      phone: '9876540000',
    });

    authToken = regRes.body.data.accessToken;
    userId = regRes.body.data.user.id;
  });

  // ==========================================
  // 1. Wallet Balance & Top-up Tests
  // ==========================================
  describe('Wallet Ledger & Top-up', () => {
    it('GET /api/account/wallet - retrieves initial balance and empty ledger', async () => {
      const res = await request(app)
        .get('/api/account/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('balanceInPaise');
      expect(res.body.data).toHaveProperty('balance');
      expect(Array.isArray(res.body.data.transactions)).toBe(true);
    });

    it('POST /api/account/wallet/topup - credits balance and records append-only ledger entry', async () => {
      const topupAmount = 500; // ₹500
      const res = await request(app)
        .post('/api/account/wallet/topup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: topupAmount });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.balanceInPaise).toBeGreaterThanOrEqual(topupAmount * 100);
      expect(res.body.data.balance).toBeGreaterThanOrEqual(topupAmount);

      // Verify the transaction was recorded in history
      const historyRes = await request(app)
        .get('/api/account/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(historyRes.body.data.transactions.length).toBeGreaterThan(0);
      const topTx = historyRes.body.data.transactions[0];
      expect(topTx.type).toBe('credit');
      expect(topTx.amount).toBe(topupAmount);
      expect(topTx.source).toBe('TOPUP');
    });

    it('debitWallet - prevents debiting more than available balance', async () => {
      const walletState = await ledgerService.getWalletBalanceAndHistory(userId);
      const excessiveAmount = walletState.balanceInPaise + 10000000; // Far exceeds balance

      await expect(
        ledgerService.debitWallet(userId, excessiveAmount, 'ORDER_PAYMENT', 'Test excessive debit')
      ).rejects.toThrow('Insufficient wallet balance');
    });
  });

  // ==========================================
  // 2. Gift Card Redemption Tests
  // ==========================================
  describe('Gift Card Redemption Engine', () => {
    it('POST /api/account/wallet/redeem-giftcard - rejects invalid PIN', async () => {
      const res = await request(app)
        .post('/api/account/wallet/redeem-giftcard')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'SBGIFT500', pin: '0000' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('Invalid Gift Card PIN');
    });

    it('POST /api/account/wallet/redeem-giftcard - rejects non-existent card', async () => {
      const res = await request(app)
        .post('/api/account/wallet/redeem-giftcard')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'INVALIDGIFT999', pin: '1234' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('invalid');
    });

    it('POST /api/account/wallet/redeem-giftcard - successfully redeems valid card and credits wallet', async () => {
      const beforeWallet = await ledgerService.getWalletBalanceAndHistory(userId);

      const res = await request(app)
        .post('/api/account/wallet/redeem-giftcard')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'SBGIFT500', pin: '1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.redeemedAmount).toBe(500);
      expect(res.body.data.redeemedAmountInPaise).toBe(50000);
      expect(res.body.data.newWalletBalanceInPaise).toBe(beforeWallet.balanceInPaise + 50000);

      // Verify second redemption attempt fails
      const duplicateRes = await request(app)
        .post('/api/account/wallet/redeem-giftcard')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'SBGIFT500', pin: '1234' });

      expect(duplicateRes.status).toBe(400);
      expect(duplicateRes.body.error.message).toContain('already been redeemed');
    });
  });

  // ==========================================
  // 3. Loyalty Points & Tier Engine Tests
  // ==========================================
  describe('Loyalty & Tier Engine', () => {
    it('calculates tier transitions accurately based on thresholds', () => {
      expect(calculateTier(0).tier).toBe('Silver');
      expect(calculateTier(500).tier).toBe('Silver');
      expect(calculateTier(1000).tier).toBe('Gold');
      expect(calculateTier(4999).tier).toBe('Gold');
      expect(calculateTier(5000).tier).toBe('Platinum');
      expect(calculateTier(12000).tier).toBe('Platinum');
    });

    it('GET /api/account/loyalty - retrieves current tier and point transactions', async () => {
      const res = await request(app)
        .get('/api/account/loyalty')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('points');
      expect(res.body.data).toHaveProperty('tier');
      expect(res.body.data).toHaveProperty('worthInRupees');
      expect(res.body.data).toHaveProperty('progressPercent');
    });

    it('addLoyaltyPoints - automatically upgrades member tier upon crossing threshold', async () => {
      // Award 1500 points (crosses Gold threshold 1000)
      await ledgerService.addLoyaltyPoints(userId, 1500, 'TEST_BONUS');

      const loyaltyState = await ledgerService.getLoyaltyBalanceAndHistory(userId);
      expect(loyaltyState.points).toBeGreaterThanOrEqual(1500);
      expect(loyaltyState.tier).toBe('Gold');

      // Award another 4000 points (total > 5000, crosses Platinum threshold)
      await ledgerService.addLoyaltyPoints(userId, 4000, 'TEST_BONUS_2');
      const platinumState = await ledgerService.getLoyaltyBalanceAndHistory(userId);
      expect(platinumState.points).toBeGreaterThanOrEqual(5500);
      expect(platinumState.tier).toBe('Platinum');
    });
  });
});
