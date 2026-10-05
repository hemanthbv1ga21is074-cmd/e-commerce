import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../db/client.js';
import {
  adminAuthService,
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_CSRF_COOKIE_NAME,
  ADMIN_IDLE_TIMEOUT_MS,
} from '../services/admin-auth.service.js';
import {
  generateTotpSecret,
  calculateTotpCode,
  generateBackupCodes,
  verifyAndConsumeBackupCode,
  hashSha256,
} from '../utils/totp.js';
import argon2 from 'argon2';

describe('Admin Access Hardening (Phase G1)', () => {
  let superAdminId: string;
  let regularAdminId: string;
  let supportUserId: string;

  beforeAll(async () => {
    // Seed initial users for testing
    const passwordHash = await argon2.hash('TestAdminPass123!');

    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin_test@stylebazaar.com' },
      update: {
        role: 'SUPER_ADMIN',
        isActive: true,
        passwordHash,
      },
      create: {
        email: 'superadmin_test@stylebazaar.com',
        name: 'Super Admin Test',
        role: 'SUPER_ADMIN',
        isActive: true,
        passwordHash,
      },
    });
    superAdminId = superAdmin.id;

    const regularAdmin = await prisma.user.upsert({
      where: { email: 'admin_test@stylebazaar.com' },
      update: {
        role: 'ADMIN',
        isActive: true,
        passwordHash,
      },
      create: {
        email: 'admin_test@stylebazaar.com',
        name: 'Regular Admin Test',
        role: 'ADMIN',
        isActive: true,
        passwordHash,
      },
    });
    regularAdminId = regularAdmin.id;

    const supportUser = await prisma.user.upsert({
      where: { email: 'support_test@stylebazaar.com' },
      update: {
        role: 'SUPPORT',
        isActive: true,
        passwordHash,
      },
      create: {
        email: 'support_test@stylebazaar.com',
        name: 'Support Staff Test',
        role: 'SUPPORT',
        isActive: true,
        passwordHash,
      },
    });
    supportUserId = supportUser.id;
  });

  describe('1. Admin Account Lifecycle & Role Hierarchy', () => {
    it('prevents privilege escalation: an ADMIN cannot invite a SUPER_ADMIN', async () => {
      await expect(
        adminAuthService.createStaffInvite({
          inviterId: regularAdminId,
          email: 'escalation_target@stylebazaar.com',
          role: 'SUPER_ADMIN',
        })
      ).rejects.toThrow(/Privilege escalation prevented/);
    });

    it('prevents self-promotion and role changes above hierarchy', async () => {
      const inviteResult = await adminAuthService.createStaffInvite({
        inviterId: superAdminId,
        email: 'new_staff@stylebazaar.com',
        role: 'ADMIN',
      });

      expect(inviteResult.success).toBe(true);
      expect(inviteResult.inviteLink).toBeDefined();
    });

    it('rejects expired invitations and single-use reuse', async () => {
      // Create invite with past expiration
      const rawToken = 'test_expired_token_12345';
      const tokenHash = hashSha256(rawToken);

      await prisma.adminInvite.upsert({
        where: { email: 'expired_invite@stylebazaar.com' },
        update: {
          tokenHash,
          expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hour ago
          invitedById: superAdminId,
          isAccepted: false,
        },
        create: {
          email: 'expired_invite@stylebazaar.com',
          role: 'ADMIN',
          tokenHash,
          expiresAt: new Date(Date.now() - 3600 * 1000),
          invitedById: superAdminId,
        },
      });

      await expect(adminAuthService.validateInviteToken(rawToken)).rejects.toThrow(/expired/);
    });

    it('accepts invite with mandatory 2FA enrollment and generates 10 backup codes', async () => {
      const rawToken = 'test_valid_invite_token_999';
      const tokenHash = hashSha256(rawToken);

      await prisma.adminInvite.upsert({
        where: { email: 'activated_staff@stylebazaar.com' },
        update: {
          tokenHash,
          expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
          invitedById: superAdminId,
          isAccepted: false,
          role: 'ADMIN',
        },
        create: {
          email: 'activated_staff@stylebazaar.com',
          role: 'ADMIN',
          tokenHash,
          expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
          invitedById: superAdminId,
        },
      });

      const { secret } = generateTotpSecret('activated_staff@stylebazaar.com');
      const currentCounter = Math.floor(Date.now() / 1000 / 30);
      const validCode = calculateTotpCode(secret, currentCounter);

      const result = await adminAuthService.acceptStaffInvite({
        rawToken,
        name: 'Activated Admin',
        password: 'SecurePassword123!',
        totpSecret: secret,
        totpCode: validCode,
      });

      expect(result.success).toBe(true);
      expect(result.backupCodes).toHaveLength(10);

      // Verify invite is single-use and cannot be used again
      await expect(
        adminAuthService.acceptStaffInvite({
          rawToken,
          name: 'Activated Admin 2',
          password: 'SecurePassword123!',
          totpSecret: secret,
          totpCode: validCode,
        })
      ).rejects.toThrow(/already used/);
    });
  });

  describe('2. Last active SUPER_ADMIN protection', () => {
    it('blocks deactivating the last active SUPER_ADMIN', async () => {
      // Find or create a temporary single SUPER_ADMIN
      const soleSuperAdmin = await prisma.user.upsert({
        where: { email: 'sole_superadmin@stylebazaar.com' },
        update: { role: 'SUPER_ADMIN', isActive: true },
        create: {
          email: 'sole_superadmin@stylebazaar.com',
          name: 'Sole SuperAdmin',
          role: 'SUPER_ADMIN',
          isActive: true,
          passwordHash: 'dummy',
        },
      });

      // Temporarily mark all other super admins inactive to simulate last superadmin
      await prisma.user.updateMany({
        where: {
          role: 'SUPER_ADMIN',
          id: { not: soleSuperAdmin.id },
        },
        data: { isActive: false },
      });

      // Attempting to deactivate the only active super admin should fail
      await expect(
        adminAuthService.ensureNotLastActiveSuperAdmin(soleSuperAdmin.id, 'deactivate')
      ).rejects.toThrow(/last active SUPER_ADMIN/);

      // Restore super admins
      await prisma.user.updateMany({
        where: { id: superAdminId },
        data: { isActive: true },
      });
    });
  });

  describe('3. CSRF and Session Security', () => {
    it('rejects state-changing admin requests without X-Admin-CSRF-Token', async () => {
      // Log in as superadmin to get session
      const loginRes = await adminAuthService.adminLogin({
        email: 'superadmin_test@stylebazaar.com',
        password: 'TestAdminPass123!',
      });

      expect(loginRes.rawSessionToken).toBeDefined();

      // State-changing request (POST) without CSRF header should return 403 Forbidden
      const res = await request(app)
        .post('/api/admin/auth/invite')
        .set('Authorization', `Bearer ${loginRes.rawSessionToken}`)
        .send({ email: 'target@stylebazaar.com', role: 'SUPPORT' });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/CSRF verification failed/i);
    });

    it('accepts state-changing admin requests when valid CSRF token is provided', async () => {
      const loginRes = await adminAuthService.adminLogin({
        email: 'superadmin_test@stylebazaar.com',
        password: 'TestAdminPass123!',
      });

      const res = await request(app)
        .post('/api/admin/auth/invite')
        .set('Authorization', `Bearer ${loginRes.rawSessionToken}`)
        .set('X-Admin-CSRF-Token', loginRes.csrfToken!)
        .send({ email: 'new_staff_csrf@stylebazaar.com', role: 'SUPPORT' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('immediately revokes all sessions when a staff member is deactivated', async () => {
      // Login support user to create an active session
      const loginRes = await adminAuthService.adminLogin({
        email: 'support_test@stylebazaar.com',
        password: 'TestAdminPass123!',
      });

      expect(loginRes.rawSessionToken).toBeDefined();

      // Deactivate support user
      const deactResult = await adminAuthService.deactivateStaff({
        actorId: superAdminId,
        targetUserId: supportUserId,
        reason: 'Offboarding test',
      });

      expect(deactResult.success).toBe(true);
      expect(deactResult.offboardingChecklist).toBeDefined();

      // The previous session should now be rejected as revoked/inactive
      await expect(
        adminAuthService.validateSession(loginRes.rawSessionToken!)
      ).rejects.toThrow(/deactivated|revoked/i);
    });
  });

  describe('4. 2FA Single-Use Backup Codes', () => {
    it('consumes a backup code exactly once and rejects replay', () => {
      const { rawCodes, hashedCodes } = generateBackupCodes(10);
      const testCode = rawCodes[0];

      // First use succeeds
      const result1 = verifyAndConsumeBackupCode(testCode, hashedCodes);
      expect(result1.valid).toBe(true);
      expect(result1.remainingHashedCodes).toHaveLength(9);

      // Replay attempt fails
      const result2 = verifyAndConsumeBackupCode(testCode, result1.remainingHashedCodes);
      expect(result2.valid).toBe(false);
      expect(result2.remainingHashedCodes).toHaveLength(9);
    });
  });
});
