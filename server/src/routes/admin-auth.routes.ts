import { Router, Request, Response, NextFunction } from 'express';
import {
  adminAuthService,
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_CSRF_COOKIE_NAME,
} from '../services/admin-auth.service.js';
import {
  requireAdminSession,
  adminCsrfProtection,
  AdminAuthenticatedRequest,
} from '../middleware/admin-auth.js';
import { BadRequestError } from '../utils/errors.js';
import { env } from '../config/env.js';

export const adminAuthRouter = Router();

const isProd = env.NODE_ENV === 'production';

// Helper to set session & CSRF cookies
function setAdminCookies(res: Response, rawSessionToken: string, csrfToken: string) {
  res.cookie(ADMIN_SESSION_COOKIE_NAME, rawSessionToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  });

  res.cookie(ADMIN_CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Accessible to SPA script to include in X-Admin-CSRF-Token header
    secure: isProd,
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: 12 * 60 * 60 * 1000,
  });
}

// Helper to clear cookies on logout or revocation
function clearAdminCookies(res: Response) {
  res.clearCookie(ADMIN_SESSION_COOKIE_NAME, { path: '/api/admin' });
  res.clearCookie(ADMIN_CSRF_COOKIE_NAME, { path: '/api/admin' });
}

// -------------------------------------------------------------
// Public / Semi-public Admin Auth Endpoints
// -------------------------------------------------------------

/**
 * POST /api/admin/auth/login - Administrative Login with 2FA, Throttling & Lockout
 */
adminAuthRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, totpOrBackupCode } = req.body;
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const clientIp =
      ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || '')
        .replace('::ffff:', '')
        .trim();
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    const result = await adminAuthService.adminLogin({
      email,
      password,
      totpOrBackupCode,
      ipAddress: clientIp,
      userAgent,
    });

    if ('requires2FA' in result && result.requires2FA) {
      return res.json({
        success: true,
        requires2FA: true,
        email: result.email,
        message: result.message,
      });
    }

    if (result.rawSessionToken && result.csrfToken) {
      setAdminCookies(res, result.rawSessionToken, result.csrfToken);
    }

    res.json({
      success: true,
      user: result.user,
      csrfToken: result.csrfToken,
      sessionToken: result.rawSessionToken, // Also return for tests / direct bearer headers
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/auth/logout - Terminate current session
 */
adminAuthRouter.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.cookies[ADMIN_SESSION_COOKIE_NAME];
    clearAdminCookies(res);

    if (sessionToken) {
      // Best-effort session revocation
      try {
        const { session } = await adminAuthService.validateSession(sessionToken);
        if (session) {
          await adminAuthService.revokeSession(session.id, session.userId);
        }
      } catch {
        // Already invalid/expired
      }
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/auth/validate-invite - Validate invitation token
 */
adminAuthRouter.get('/validate-invite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    if (!token) throw new BadRequestError('Token parameter is required');

    const result = await adminAuthService.validateInviteToken(token);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/auth/setup-2fa - Generate 2FA secret and OTP auth URL for invite acceptance
 */
adminAuthRouter.post('/setup-2fa', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) throw new BadRequestError('Invitation token is required');

    const result = await adminAuthService.setup2FaForInvite(token);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/auth/accept-invite - Complete invitation acceptance, enroll 2FA, generate backup codes
 */
adminAuthRouter.post('/accept-invite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, name, password, totpSecret, totpCode } = req.body;
    if (!token || !password || !totpSecret || !totpCode) {
      throw new BadRequestError('Token, password, totpSecret, and totpCode are required.');
    }

    const clientIp =
      ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || '')
        .replace('::ffff:', '')
        .trim();

    const result = await adminAuthService.acceptStaffInvite({
      rawToken: token,
      name: name || '',
      password,
      totpSecret,
      totpCode,
      ipAddress: clientIp,
    });

    res.json({
      success: true,
      message: result.message,
      user: result.user,
      backupCodes: result.backupCodes,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/auth/request-password-reset - Request admin password reset
 */
adminAuthRouter.post('/request-password-reset', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new BadRequestError('Email address is required');

    const clientIp =
      ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || '')
        .replace('::ffff:', '')
        .trim();

    const result = await adminAuthService.requestAdminPasswordReset(email, clientIp);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/auth/complete-password-reset - Complete reset with 2FA
 */
adminAuthRouter.post('/complete-password-reset', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetToken, newPassword, totpCode } = req.body;
    if (!resetToken || !newPassword || !totpCode) {
      throw new BadRequestError('resetToken, newPassword, and totpCode are required.');
    }

    const clientIp =
      ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || '')
        .replace('::ffff:', '')
        .trim();

    const result = await adminAuthService.completeAdminPasswordReset({
      resetToken,
      newPassword,
      totpCode,
      ipAddress: clientIp,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// Authenticated Admin Lifecycle & Session Endpoints
// -------------------------------------------------------------

/**
 * GET /api/admin/auth/me - Retrieve current admin profile
 */
adminAuthRouter.get('/me', requireAdminSession, (req: AdminAuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.adminUser,
    sessionId: req.adminSession?.id,
  });
});

/**
 * POST /api/admin/auth/invite - Invite a new staff member (Enforces Role Hierarchy & No Self-Promotion)
 */
adminAuthRouter.post(
  '/invite',
  requireAdminSession,
  adminCsrfProtection,
  async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { email, role } = req.body;
      if (!email || !role) {
        throw new BadRequestError('Email and role are required.');
      }

      const clientIp =
        ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || '')
          .replace('::ffff:', '')
          .trim();

      const result = await adminAuthService.createStaffInvite({
        inviterId: req.adminUser!.id,
        email,
        role,
        ipAddress: clientIp,
      });

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/admin/auth/sessions - "My Sessions" list
 */
adminAuthRouter.get('/sessions', requireAdminSession, async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sessions = await adminAuthService.getUserSessions(req.adminUser!.id, req.adminSession?.id);
    res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/auth/sessions/:id - Revoke single session
 */
adminAuthRouter.delete(
  '/sessions/:id',
  requireAdminSession,
  adminCsrfProtection,
  async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.params.id;
      const clientIp =
        ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || '')
          .replace('::ffff:', '')
          .trim();

      await adminAuthService.revokeSession(sessionId, req.adminUser!.id, clientIp);

      // If user revoked their own current session, clear cookies
      if (sessionId === req.adminSession?.id) {
        clearAdminCookies(res);
      }

      res.json({ success: true, message: 'Session successfully revoked' });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/admin/auth/sessions/revoke-all - Revoke all other sessions
 */
adminAuthRouter.post(
  '/sessions/revoke-all',
  requireAdminSession,
  adminCsrfProtection,
  async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { keepCurrent = true } = req.body;
      const clientIp =
        ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || '')
          .replace('::ffff:', '')
          .trim();

      await adminAuthService.revokeAllSessions(
        req.adminUser!.id,
        keepCurrent ? req.adminSession?.id : undefined,
        clientIp
      );

      if (!keepCurrent) {
        clearAdminCookies(res);
      }

      res.json({ success: true, message: 'All requested sessions revoked.' });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/admin/auth/regenerate-backup-codes - Regenerate 10 backup codes
 */
adminAuthRouter.post(
  '/regenerate-backup-codes',
  requireAdminSession,
  adminCsrfProtection,
  async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { currentPassword } = req.body;
      if (!currentPassword) {
        throw new BadRequestError('Current password is required to regenerate backup codes.');
      }

      const clientIp =
        ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || '')
          .replace('::ffff:', '')
          .trim();

      const result = await adminAuthService.regenerateBackupCodes(
        req.adminUser!.id,
        currentPassword,
        clientIp
      );

      res.json({
        success: true,
        message: 'Generated 10 new single-use backup codes. Please store them securely.',
        backupCodes: result.backupCodes,
      });
    } catch (err) {
      next(err);
    }
  }
);
