import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { orderService } from '../services/order.service.js';
import { products } from '../data/products.js';

describe('Sub-Phase 5D: Admin Management & Reviews API', () => {
  let customerToken: string;
  let adminToken: string;
  let testOrderId: string;
  let testProductId: string;

  beforeAll(async () => {
    // 1. Authenticate regular customer
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul@example.com', password: 'Password123!' });
    customerToken = custRes.body.data.accessToken;

    // 2. Authenticate store administrator
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@stylebazaar.com', password: 'Admin123!' });
    adminToken = adminRes.body.data.accessToken;

    testProductId = products[0].id;

    // 3. Create a test order for admin testing
    const order = await orderService.createOrder({
      userId: 'usr-demo-1',
      items: [
        {
          productId: testProductId,
          size: products[0].sizes[0].name,
          quantity: 1,
        },
      ],
      paymentMethod: 'COD',
      shippingAddressText: '123 Test Street, Bengaluru, Karnataka 560001',
    });
    testOrderId = order.id;
  });

  describe('Product Reviews & Helpful Voting', () => {
    it('GET /api/products/:id/reviews - retrieves existing reviews for a product', async () => {
      const res = await request(app).get(`/api/products/${testProductId}/reviews`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/products/:id/reviews - rejects unauthenticated review submissions', async () => {
      const res = await request(app)
        .post(`/api/products/${testProductId}/reviews`)
        .send({
          rating: 5,
          title: 'Great product!',
          text: 'Super comfy and fit nicely.',
        });

      expect(res.status).toBe(401);
    });

    it('POST /api/products/:id/reviews - rejects invalid rating (< 1 or > 5)', async () => {
      const res = await request(app)
        .post(`/api/products/${testProductId}/reviews`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 6,
          title: 'Invalid Rating',
          text: 'This should fail.',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Rating must be an integer between 1 and 5');
    });

    it('POST /api/products/:id/reviews - customer can submit a verified review and recalculate ratings', async () => {
      const initialCount = products[0].ratingCount;

      const res = await request(app)
        .post(`/api/products/${testProductId}/reviews`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 5,
          title: 'Exceptional craftsmanship & fitting!',
          text: 'The fabric quality is beyond expectations. Fits true to size and looks great.',
          fit: 'True to Size',
          orderId: testOrderId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.verifiedBuyer).toBe(true);
      expect(res.body.data.fit).toBe('True to Size');

      // Product ratings should be updated
      expect(products[0].ratingCount).toBe(initialCount + 1);
      expect(typeof products[0].rating).toBe('number');
    });

    it('POST /api/reviews/:id/vote - upvotes a helpful review', async () => {
      // Get latest review
      const listRes = await request(app).get(`/api/products/${testProductId}/reviews`);
      const reviewId = listRes.body.data[0].id;
      const initialHelpful = listRes.body.data[0].helpfulCount;

      const voteRes = await request(app).post(`/api/reviews/${reviewId}/vote`);

      expect(voteRes.status).toBe(200);
      expect(voteRes.body.success).toBe(true);
      expect(voteRes.body.data.helpfulCount).toBe(initialHelpful + 1);
    });
  });

  describe('Admin Order Lifecycle Management', () => {
    it('GET /api/admin/orders - blocks unauthenticated requests', async () => {
      const res = await request(app).get('/api/admin/orders');
      expect(res.status).toBe(401);
    });

    it('GET /api/admin/orders - blocks non-admin customers with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Admin privileges required');
    });

    it('GET /api/admin/orders - allows admin to view paginated order list', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      expect(res.body.data.orders.length).toBeGreaterThan(0);
      expect(res.body.data.total).toBeGreaterThan(0);
    });

    it('PATCH /api/admin/orders/:id/status - admin advances order through state machine', async () => {
      // 1. PLACED -> CONFIRMED
      const res1 = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED', message: 'Order verified by warehouse.' });

      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe('confirmed');

      // 2. CONFIRMED -> PACKED
      const res2 = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PACKED', message: 'Package sealed with safety tape.' });

      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('packed');

      // 3. PACKED -> SHIPPED
      const res3 = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SHIPPED', message: 'Dispatched via Delhivery Express.' });

      expect(res3.status).toBe(200);
      expect(res3.body.data.status).toBe('shipped');

      // 4. SHIPPED -> OUT_FOR_DELIVERY
      const res4 = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'OUT_FOR_DELIVERY', message: 'Courier is out for delivery.' });

      expect(res4.status).toBe(200);
      expect(res4.body.data.status).toBe('out_for_delivery');

      // 5. OUT_FOR_DELIVERY -> DELIVERED (sets COD paymentStatus to PAID)
      const res5 = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'DELIVERED', message: 'Delivered to customer doorstep.' });

      expect(res5.status).toBe(200);
      expect(res5.body.data.status).toBe('delivered');
      expect(res5.body.data.paymentStatus).toBe('PAID');
    });

    it('PATCH /api/admin/orders/:id/status - prevents invalid state transitions', async () => {
      // Cannot jump backwards or transition from DELIVERED to PLACED
      const res = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PLACED' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid status transition');
    });
  });

  describe('Admin Inventory Management', () => {
    it('GET /api/admin/inventory - blocks non-admin users', async () => {
      const res = await request(app)
        .get('/api/admin/inventory')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('GET /api/admin/inventory - admin inspects variants, stocks, and low stock metrics', async () => {
      const res = await request(app)
        .get('/api/admin/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.variants)).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.totalVariants).toBeGreaterThan(0);
      expect(typeof res.body.data.summary.lowStockVariants).toBe('number');
    });

    it('GET /api/admin/inventory?lowStockOnly=true - filters only variants with low stock', async () => {
      const res = await request(app)
        .get('/api/admin/inventory?lowStockOnly=true&threshold=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const variant of res.body.data.variants) {
        expect(variant.stock).toBeLessThanOrEqual(10);
      }
    });

    it('PATCH /api/admin/inventory/:productId/:size - admin updates variant stock quantity', async () => {
      const targetSize = products[0].sizes[0].name;

      const res = await request(app)
        .patch(`/api/admin/inventory/${testProductId}/${targetSize}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 42 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stock).toBe(42);

      // Verify product data reflects new stock
      const updatedSize = products[0].sizes.find(
        (s) => s.name.toLowerCase() === targetSize.toLowerCase()
      );
      expect(updatedSize?.stock).toBe(42);
    });

    it('PATCH /api/admin/inventory/:productId/:size - rejects negative stock values', async () => {
      const targetSize = products[0].sizes[0].name;

      const res = await request(app)
        .patch(`/api/admin/inventory/${testProductId}/${targetSize}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: -5 });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Stock must be a non-negative number');
    });
  });
});
