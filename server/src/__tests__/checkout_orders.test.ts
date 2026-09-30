import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { products } from '../data/products.js';

describe('Phase 5B: Cart, Wishlist, Coupons, Pricing Quote & COD Orders', () => {
  let authToken = '';
  const testEmail = 'checkout-test@stylebazaar.com';
  const testPassword = 'Password123!';
  const testProduct = products[0]; // e.g. 'm1' / zephyr-classic-crew-tee

  beforeAll(async () => {
    // Register or login a test customer
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Tester Checkout',
      email: testEmail,
      password: testPassword,
      phone: '9876599999',
    });

    if (regRes.status === 201) {
      authToken = regRes.body.data.accessToken;
    } else {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: testEmail,
        password: testPassword,
      });
      authToken = loginRes.body.data.accessToken;
    }
  });

  // ==========================================
  // 1. Coupons Validation Tests
  // ==========================================
  describe('Coupons API', () => {
    it('GET /api/coupons - returns list of active coupons', async () => {
      const res = await request(app).get('/api/coupons');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/coupons/validate - applies valid coupon when minCartValue met', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'WELCOME100',
          subtotalInPaise: 150000, // ₹1,500
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(true);
      expect(res.body.data.discountInPaise).toBe(10000); // ₹100
      expect(res.body.data.discount).toBe(100);
    });

    it('POST /api/coupons/validate - rejects when subtotal below minCartValue', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'WELCOME100',
          subtotalInPaise: 50000, // ₹500 (below ₹999)
        });

      expect(res.status).toBe(200);
      expect(res.body.data.valid).toBe(false);
      expect(res.body.data.message).toContain('Minimum cart value');
    });

    it('POST /api/coupons/validate - rejects non-existent coupon', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'INVALIDCODE99',
          subtotalInPaise: 200000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.valid).toBe(false);
    });
  });

  // ==========================================
  // 2. Authoritative Pricing Quote Tests
  // ==========================================
  describe('Checkout Pricing Quote API', () => {
    it('POST /api/checkout/quote - calculates subtotal, delivery fee, GST and total in paise', async () => {
      const res = await request(app)
        .post('/api/checkout/quote')
        .send({
          items: [
            {
              productId: testProduct.id,
              size: 'M',
              quantity: 1,
            },
          ],
          isCod: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      expect(data).toHaveProperty('subtotalInPaise');
      expect(data).toHaveProperty('deliveryFeeInPaise');
      expect(data).toHaveProperty('codFeeInPaise');
      expect(data).toHaveProperty('finalTotalInPaise');
      expect(data).toHaveProperty('gstIncludedInPaise');

      // Test product price is 599 -> 59900 paise
      expect(data.subtotalInPaise).toBe(testProduct.price * 100);
      // Below 99900 threshold, so standard delivery fee applies
      expect(data.deliveryFeeInPaise).toBeGreaterThan(0);
      // COD fee applies
      expect(data.codFeeInPaise).toBeGreaterThan(0);
      expect(data.finalTotalInPaise).toBe(
        data.subtotalInPaise + data.deliveryFeeInPaise + data.codFeeInPaise
      );
    });

    it('POST /api/checkout/quote - applies free delivery when subtotal >= ₹999', async () => {
      const res = await request(app)
        .post('/api/checkout/quote')
        .send({
          items: [
            {
              productId: testProduct.id,
              size: 'M',
              quantity: 2, // 599 * 2 = 1198 >= 999
            },
          ],
          isCod: false,
        });

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.deliveryFeeInPaise).toBe(0);
      expect(data.deliveryFee).toBe(0);
      expect(data.codFeeInPaise).toBe(0);
    });
  });

  // ==========================================
  // 3. Cart & Wishlist API Tests
  // ==========================================
  describe('Cart & Wishlist API', () => {
    it('requires authentication for cart & wishlist operations', async () => {
      const unauthCart = await request(app).get('/api/cart');
      expect(unauthCart.status).toBe(401);

      const unauthWishlist = await request(app).get('/api/wishlist');
      expect(unauthWishlist.status).toBe(401);
    });

    it('POST /api/cart - adds an item to cart and returns enriched items', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          size: 'M',
          quantity: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].size).toBe('M');
    });

    it('GET /api/cart - retrieves user cart items', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/wishlist/toggle - toggles item in wishlist', async () => {
      const addRes = await request(app)
        .post('/api/wishlist/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: testProduct.id });

      expect(addRes.status).toBe(200);
      expect(addRes.body.data.added).toBe(true);
      expect(addRes.body.data.items).toContain(testProduct.id);

      const removeRes = await request(app)
        .post('/api/wishlist/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: testProduct.id });

      expect(removeRes.status).toBe(200);
      expect(removeRes.body.data.added).toBe(false);
      expect(removeRes.body.data.items).not.toContain(testProduct.id);
    });
  });

  // ==========================================
  // 4. COD Orders & State Machine Tests
  // ==========================================
  describe('COD Order Placement & Lifecycle', () => {
    let createdOrderId = '';
    const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    it('POST /api/orders - places a COD order and verifies authoritative total and stock', async () => {
      const initialStock = testProduct.sizes.find((s) => s.name === 'M')?.stock || 10;

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          items: [
            {
              productId: testProduct.id,
              size: 'M',
              quantity: 1,
            },
          ],
          shippingAddressText: 'Tester, 123 Fashion Street, Indiranagar, Bengaluru - 560001 (Ph: 9876599999)',
          paymentMethod: 'COD',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const order = res.body.data;
      createdOrderId = order.id;

      expect(order.id).toMatch(/^SB-\d{6}$/);
      expect(order.status).toBe('placed');
      expect(order.paymentMethod).toBe('Cash On Delivery');
      expect(order.totalInPaise).toBeGreaterThan(0);
      expect(order.items.length).toBe(1);
      expect(order.timeline.length).toBeGreaterThan(0);

      // Verify stock was decremented
      const updatedStock = testProduct.sizes.find((s) => s.name === 'M')?.stock;
      expect(updatedStock).toBe(initialStock - 1);
    });

    it('POST /api/orders - idempotency key prevents duplicate order creation', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          items: [
            {
              productId: testProduct.id,
              size: 'M',
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe(createdOrderId);
    });

    it('GET /api/orders - lists user orders including newly placed order', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const found = res.body.data.find((o: any) => o.id === createdOrderId);
      expect(found).toBeDefined();
    });

    it('GET /api/orders/:id - retrieves order details and events', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdOrderId);
      expect(res.body.data.timeline[0].status).toBe('placed');
    });

    it('GET /api/orders/:id/invoice - generates and downloads GST PDF invoice', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrderId}/invoice`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.headers['content-disposition']).toContain(`Invoice-${createdOrderId}.pdf`);
      expect(res.body).toBeInstanceOf(Buffer);
      expect(res.body.length).toBeGreaterThan(100);
    });

    it('POST /api/orders/:id/cancel - cancels order and restores inventory stock', async () => {
      const stockBeforeCancel = testProduct.sizes.find((s) => s.name === 'M')?.stock || 0;

      const res = await request(app)
        .post(`/api/orders/${createdOrderId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Found a better price' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');
      expect(res.body.data.cancellationReason).toBe('Found a better price');

      // Verify inventory restored
      const stockAfterCancel = testProduct.sizes.find((s) => s.name === 'M')?.stock;
      expect(stockAfterCancel).toBe(stockBeforeCancel + 1);
    });
  });
});
