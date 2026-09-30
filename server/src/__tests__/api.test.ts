import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Phase 5A API Endpoints', () => {
  it('GET /api/health - returns 200 and server status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/config - returns feature flags and COD configuration', async () => {
    const res = await request(app).get('/api/config');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(
      expect.objectContaining({
        authPhoneOtpEnabled: false,
        onlinePaymentsEnabled: false,
        codEnabled: true,
        codMaxOrderValuePaise: 500000,
        codFeePaise: 5000,
      })
    );
  });

  it('GET /api/categories/tree - returns category hierarchy', async () => {
    const res = await request(app).get('/api/categories/tree');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('slug');
    expect(res.body.data[0]).toHaveProperty('label');
  });

  it('GET /api/products - returns paginated product listing with filters', async () => {
    const res = await request(app).get('/api/products?gender=men&page=1&limit=6');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeLessThanOrEqual(6);
    expect(res.body.data.total).toBeGreaterThan(0);
    expect(res.body.data.page).toBe(1);
  });

  it('GET /api/products/:slug - returns product details for a valid slug', async () => {
    const res = await request(app).get('/api/products/zenith-oxford-shirt');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.brand).toBe('Zenith');
    expect(res.body.data.price).toBeGreaterThan(0);
  });

  it('GET /api/pincodes/:pincode/serviceability - checks COD delivery serviceability', async () => {
    const res = await request(app).get('/api/pincodes/560001/serviceability');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deliverable).toBe(true);
    expect(res.body.data.codAvailable).toBe(true);
    expect(res.body.data.city).toBe('Bengaluru');
  });

  describe('Authentication Flow (Email & Password)', () => {
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    let accessToken = '';
    let refreshCookie = '';

    it('POST /api/auth/register - successfully creates a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: testEmail,
        password: testPassword,
        name: 'Test Customer',
        phone: '9123456780',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.name).toBe('Test Customer');
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('POST /api/auth/login - authenticates user and sets refresh token cookie', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testEmail,
        password: testPassword,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      accessToken = res.body.data.accessToken;

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      if (Array.isArray(cookies)) {
        refreshCookie = cookies.find((c: string) => c.includes('refreshToken=')) || '';
      } else if (typeof cookies === 'string') {
        refreshCookie = cookies;
      }
      expect(refreshCookie).toContain('refreshToken=');
    });

    it('GET /api/account/profile - accesses protected route using JWT token', async () => {
      const res = await request(app)
        .get('/api/account/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testEmail);
      expect(res.body.data.name).toBe('Test Customer');
    });

    it('POST /api/auth/refresh - rotates refresh token cookie and issues new access token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [refreshCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('POST /api/auth/logout - clears refresh token cookie', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [refreshCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
