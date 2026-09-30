import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { products } from '../data/products.js';

describe('Security Audit Regression Suite', () => {
  let userAToken: string;
  let userBToken: string;
  let userBOrder: any;

  beforeAll(async () => {
    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      email: `user_a_${Date.now()}@example.com`,
      password: 'Password123!',
      name: 'User Alpha',
    });
    userAToken = resA.body.data.accessToken;

    // Register User B
    const resB = await request(app).post('/api/auth/register').send({
      email: `user_b_${Date.now()}@example.com`,
      password: 'Password123!',
      name: 'User Beta',
    });
    userBToken = resB.body.data.accessToken;

    // Place an order for User B
    const orderBRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        items: [{ productId: products[0].id, size: products[0].sizes[0].name, quantity: 1 }],
        paymentMethod: 'COD',
        shippingAddressText: 'User B Address, Bengaluru 560001',
      });
    userBOrder = orderBRes.body.data;
  });

  describe('Authorization & IDOR Protection', () => {
    it('User A cannot view User B’s orders via GET /api/orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const containsUserB = res.body.data.some((o: any) => o.id === userBOrder.id);
      expect(containsUserB).toBe(false);
    });

    it('User A is rejected with 403 Forbidden when accessing User B’s order by ID', async () => {
      const res = await request(app)
        .get(`/api/orders/${userBOrder.id}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('You do not have permission');
    });

    it('User A cannot cancel User B’s order', async () => {
      const res = await request(app)
        .post(`/api/orders/${userBOrder.id}/cancel`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ reason: 'Malicious attempt' });

      expect(res.status).toBe(403);
    });
  });

  describe('Financial Data Privacy (Wallet Ledger)', () => {
    it('User A does not see User B’s wallet transactions', async () => {
      // Credit User B's wallet
      await request(app)
        .post('/api/account/wallet/topup')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ amount: 500 });

      // Fetch User A's wallet
      const res = await request(app)
        .get('/api/account/wallet')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      const leaked = res.body.data.transactions.some(
        (tx: any) => tx.description.includes('500') && tx.userId !== undefined && tx.userId !== res.body.data.userId
      );
      expect(leaked).toBe(false);
    });
  });

  describe('Authoritative Pricing & Catalog Integrity', () => {
    it('Rejects non-existent product ID with 404 Not Found', async () => {
      const res = await request(app)
        .post('/api/checkout/quote')
        .send({
          items: [{ productId: 'invalid-nonexistent-sku-999', size: 'M', quantity: 1 }],
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found in catalog');
    });
  });

  describe('Input Validation & XSS Sanitization in Reviews', () => {
    it('Strips HTML script tags from review title and text', async () => {
      const res = await request(app)
        .post(`/api/products/${products[0].id}/reviews`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          rating: 5,
          title: '<b>Crisp Fit</b><script>alert("xss")</script>',
          text: '<p>Super quality fabric!</p><img src="x" onerror="evil()"/>',
          fit: 'True to Size',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).not.toContain('<script>');
      expect(res.body.data.title).toBe('Crisp Fit');
      expect(res.body.data.text).not.toContain('<img');
      expect(res.body.data.text).toBe('Super quality fabric!');
    });
  });
});
