import crypto from 'crypto';
import argon2 from 'argon2';
import { prisma, isDbAvailable } from '../db/client.js';
import { emailProvider } from '../providers/email/dev-email.provider.js';
import {
  generateTotpSecret,
  verifyTotp,
  generateBackupCodes,
  verifyAndConsumeBackupCode,
  hashSha256,
} from '../utils/totp.js';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors.js';
import { env } from '../config/env.js';

export const ROLE_HIERARCHY: Record<string, number> = {
  CUSTOMER: 0,
  SUPPORT: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export const ADMIN_SESSION_COOKIE_NAME = 'sb_admin_session';
export const ADMIN_CSRF_COOKIE_NAME = 'sb_admin_csrf';

// Configurable session timeouts
export const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const ADMIN_ABSOLUTE_LIFETIME_MS = 12 * 60 * 60 * 1000; // 12 hours
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

export class AdminAuthService {
  /**
   * Helper to write an audit log entry
   */
  async recordAudit(params: {
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: any;
    ipAddress?: string;
  }) {
    try {
      const dbActive = await isDbAvailable();
      if (dbActive) {
        await prisma.auditLog.create({
          data: {
            userId: params.userId,
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId,
            details: params.details ?? {},
            ipAddress: params.ipAddress,
          },
        });
      }
    } catch (err) {
      console.error('[AdminAuditLog] Failed to record audit log:', err);
    }
  }

  /**
   * Ensure the target user is not the last active SUPER_ADMIN before demotion, deactivation or 2FA removal
   */
  async ensureNotLastActiveSuperAdmin(targetUserId: string, actionDescription: string) {
    const dbActive = await isDbAvailable();
    if (!dbActive) return;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, isActive: true },
    });

    if (!targetUser || targetUser.role !== 'SUPER_ADMIN') {
      return;
    }

    const otherActiveSuperAdminsCount = await prisma.user.count({
      where: {
        role: 'SUPER_ADMIN',
        isActive: true,
        id: { not: targetUserId },
      },
    });

    if (otherActiveSuperAdminsCount === 0) {
      throw new BadRequestError(
        `Operation rejected: cannot ${actionDescription}. This is the last active SUPER_ADMIN in the organization.`
      );
    }
  }

  /**
   * Create an admin staff invite with single-use 48h token
   */
  async createStaffInvite(params: {
    inviterId: string;
    email: string;
    role: 'ADMIN' | 'SUPPORT' | 'SUPER_ADMIN';
    ipAddress?: string;
  }) {
    const { inviterId, email, role, ipAddress } = params;
    const normalizedEmail = email.toLowerCase().trim();

    const dbActive = await isDbAvailable();
    if (!dbActive) {
      throw new BadRequestError('Database connection required for staff management');
    }

    // 1. Verify inviter permissions
    const inviter = await prisma.user.findUnique({ where: { id: inviterId } });
    if (!inviter || !inviter.isActive) {
      throw new UnauthorizedError('Inviter account is invalid or inactive');
    }

    const inviterLevel = ROLE_HIERARCHY[inviter.role] ?? 0;
    const targetLevel = ROLE_HIERARCHY[role] ?? 0;

    if (targetLevel > inviterLevel) {
      throw new ForbiddenError(
        `Privilege escalation prevented: You cannot grant role ${role} which exceeds your role ${inviter.role}`
      );
    }

    // 2. Check if user already exists with an active admin role
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser && existingUser.isActive && existingUser.role !== 'CUSTOMER') {
      throw new BadRequestError(`User ${normalizedEmail} already has an active ${existingUser.role} account`);
    }

    // 3. Generate secure single-use token and expiration (48 hours)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashSha256(rawToken);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Upsert invite
    await prisma.adminInvite.upsert({
      where: { email: normalizedEmail },
      update: {
        role,
        tokenHash,
        expiresAt,
        invitedById: inviterId,
        isAccepted: false,
      },
      create: {
        email: normalizedEmail,
        role,
        tokenHash,
        expiresAt,
        invitedById: inviterId,
      },
    });

    const inviteLink = `${env.CLIENT_URL}/admin/accept-invite?token=${rawToken}`;

    // Send email invitation
    await emailProvider.sendEmail({
      to: normalizedEmail,
      subject: 'StyleBazaar: You have been invited to the Admin Console',
      html: `<p>Hello,</p><p>You have been invited by ${inviter.name} (${inviter.email}) to join StyleBazaar Admin as <strong>${role}</strong>.</p><p><a href="${inviteLink}">Click here to accept your invitation and configure 2FA</a></p><p>Link: ${inviteLink}</p><p>This single-use link expires in 48 hours.</p>`,
      text: `Hello,\n\nYou have been invited by ${inviter.name} (${inviter.email}) to join StyleBazaar Admin as ${role}.\n\nPlease accept your invitation within 48 hours and set up your 2FA authentication:\n${inviteLink}\n\nThis single-use link expires on ${expiresAt.toUTCString()}.\n\nStyleBazaar Security Team`,
    });

    await this.recordAudit({
      userId: inviterId,
      action: 'ADMIN_INVITE_CREATED',
      entityType: 'ADMIN_INVITE',
      entityId: normalizedEmail,
      details: { role, expiresAt },
      ipAddress,
    });

    return {
      success: true,
      email: normalizedEmail,
      role,
      expiresAt,
      inviteLink,
      message: `Invitation generated and dispatched to ${normalizedEmail}`,
    };
  }

  /**
   * Validate an invite token
   */
  async validateInviteToken(rawToken: string) {
    const tokenHash = hashSha256(rawToken);
    const dbActive = await isDbAvailable();
    if (!dbActive) throw new BadRequestError('Database unavailable');

    const invite = await prisma.adminInvite.findUnique({
      where: { tokenHash },
      include: {
        invitedBy: { select: { name: true, email: true, role: true } },
      },
    });

    if (!invite || invite.isAccepted) {
      throw new BadRequestError('Invalid, expired, or already-used invitation link.');
    }

    if (new Date() > invite.expiresAt) {
      throw new BadRequestError('Invitation link has expired (48h limit). Please request a new invite.');
    }

    return {
      valid: true,
      email: invite.email,
      role: invite.role,
      invitedBy: invite.invitedBy.name,
      expiresAt: invite.expiresAt,
    };
  }

  /**
   * Initialize 2FA setup for an invite
   */
  async setup2FaForInvite(rawToken: string) {
    const inviteInfo = await this.validateInviteToken(rawToken);
    const { secret, otpauthUrl } = generateTotpSecret(inviteInfo.email, 'StyleBazaar Admin');

    return {
      email: inviteInfo.email,
      role: inviteInfo.role,
      secret,
      otpauthUrl,
    };
  }

  /**
   * Accept invite, set password, enforce 2FA enrollment, and issue 10 backup codes
   */
  async acceptStaffInvite(params: {
    rawToken: string;
    name: string;
    password: string;
    totpSecret: string;
    totpCode: string;
    ipAddress?: string;
  }) {
    const { rawToken, name, password, totpSecret, totpCode, ipAddress } = params;
    const tokenHash = hashSha256(rawToken);

    const dbActive = await isDbAvailable();
    if (!dbActive) throw new BadRequestError('Database unavailable');

    const invite = await prisma.adminInvite.findUnique({
      where: { tokenHash },
    });

    if (!invite || invite.isAccepted) {
      throw new BadRequestError('Invalid or already used invitation link.');
    }

    if (new Date() > invite.expiresAt) {
      throw new BadRequestError('Invitation link has expired.');
    }

    if (!password || password.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters in length.');
    }

    // Enforce 2FA verification before first access
    const isTotpValid = verifyTotp(totpCode, totpSecret);
    if (!isTotpValid) {
      throw new BadRequestError('Invalid TOTP verification code. Please check your authenticator application.');
    }

    // Generate 10 single-use backup codes
    const { rawCodes, hashedCodes } = generateBackupCodes(10);
    const passwordHash = await argon2.hash(password);

    // Upsert or create user record
    const user = await prisma.user.upsert({
      where: { email: invite.email },
      update: {
        name: name.trim() || invite.email.split('@')[0],
        passwordHash,
        role: invite.role,
        isActive: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        twoFactorSecret: totpSecret,
        twoFactorBackupCodes: hashedCodes,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
      create: {
        email: invite.email,
        name: name.trim() || invite.email.split('@')[0],
        passwordHash,
        role: invite.role,
        isActive: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        twoFactorSecret: totpSecret,
        twoFactorBackupCodes: hashedCodes,
      },
    });

    // Mark invite as accepted (single-use)
    await prisma.adminInvite.update({
      where: { id: invite.id },
      data: { isAccepted: true },
    });

    await this.recordAudit({
      userId: user.id,
      action: 'ADMIN_INVITE_ACCEPTED',
      entityType: 'USER',
      entityId: user.id,
      details: { role: user.role, twoFactorEnrolled: true },
      ipAddress,
    });

    return {
      success: true,
      message: 'Admin account successfully activated with 2FA protection.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      backupCodes: rawCodes, // Shown ONCE to the user to save securely
    };
  }

  /**
   * Admin Login with exponential throttling, generic error messages, and 2FA
   */
  async adminLogin(params: {
    email: string;
    password: string;
    totpOrBackupCode?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { email, password, totpOrBackupCode, ipAddress, userAgent } = params;
    const normalizedEmail = email.toLowerCase().trim();

    const dbActive = await isDbAvailable();
    if (!dbActive) throw new BadRequestError('Database connection required');

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Lockout verification
    if (user && user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedError(
        `Account is temporarily locked due to excessive failed attempts. Please retry in ${remainingMinutes} minute(s).`
      );
    }

    // Generic error message to prevent email enumeration
    const GENERIC_AUTH_ERROR = 'Invalid credentials or administrative access denied.';

    if (!user || !user.isActive || !['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(user.role)) {
      if (user) {
        await this.handleFailedLogin(user.id, ipAddress, userAgent);
      }
      throw new UnauthorizedError(GENERIC_AUTH_ERROR);
    }

    // Verify password
    let passwordMatches = false;
    try {
      passwordMatches = await argon2.verify(user.passwordHash, password);
    } catch {
      passwordMatches = false;
    }

    if (!passwordMatches) {
      await this.handleFailedLogin(user.id, ipAddress, userAgent);
      throw new UnauthorizedError(GENERIC_AUTH_ERROR);
    }

    // 2FA Verification (Required for enrolled accounts)
    if (user.twoFactorEnabled) {
      if (!totpOrBackupCode) {
        return {
          requires2FA: true,
          email: user.email,
          message: 'Two-factor authentication code required',
        };
      }

      let is2faValid = false;
      let usedBackupCode = false;

      // Try TOTP first
      if (user.twoFactorSecret && verifyTotp(totpOrBackupCode, user.twoFactorSecret)) {
        is2faValid = true;
      } else if (user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0) {
        // Try backup code consumption
        const backupResult = verifyAndConsumeBackupCode(totpOrBackupCode, user.twoFactorBackupCodes);
        if (backupResult.valid) {
          is2faValid = true;
          usedBackupCode = true;
          await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorBackupCodes: backupResult.remainingHashedCodes },
          });
          await this.recordAudit({
            userId: user.id,
            action: 'BACKUP_CODE_CONSUMED',
            entityType: 'USER',
            entityId: user.id,
            details: { remainingCodes: backupResult.remainingHashedCodes.length },
            ipAddress,
          });
        }
      }

      if (!is2faValid) {
        await this.handleFailedLogin(user.id, ipAddress, userAgent);
        throw new UnauthorizedError('Invalid two-factor authentication code or backup code.');
      }
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockoutUntil: null },
      });
    }

    // Detect new IP or new device / userAgent and send security alert
    const previousSession = await prisma.adminSession.findFirst({
      where: {
        userId: user.id,
        ipAddress: ipAddress || undefined,
      },
    });

    if (!previousSession && ipAddress) {
      // Send security alert for new device/IP
      await emailProvider.sendEmail({
        to: user.email,
        subject: 'Security Alert: New Admin Login Detected',
        html: `<p>Hello ${user.name},</p><p>A new login to StyleBazaar Admin Console was detected from IP: <strong>${ipAddress || 'Unknown'}</strong><br/>Device: ${userAgent || 'Unknown'}<br/>Time: ${new Date().toUTCString()}</p><p>If this was not you, please immediately alert a Super Administrator.</p>`,
        text: `Hello ${user.name},\n\nA new login to StyleBazaar Admin Console was detected from IP: ${ipAddress || 'Unknown'}\nDevice: ${userAgent || 'Unknown'}\nTime: ${new Date().toUTCString()}\n\nIf this was not you, please immediately alert a Super Administrator.`,
      });
    }

    // Create dedicated admin session
    const rawSessionToken = crypto.randomBytes(32).toString('hex');
    const sessionTokenHash = hashSha256(rawSessionToken);
    const csrfToken = crypto.randomBytes(24).toString('hex');
    const absoluteExpiresAt = new Date(Date.now() + ADMIN_ABSOLUTE_LIFETIME_MS);

    const session = await prisma.adminSession.create({
      data: {
        userId: user.id,
        sessionToken: sessionTokenHash,
        ipAddress,
        userAgent,
        expiresAt: absoluteExpiresAt,
        lastActiveAt: new Date(),
        isRevoked: false,
      },
    });

    await this.recordAudit({
      userId: user.id,
      action: 'ADMIN_LOGIN_SUCCESS',
      entityType: 'ADMIN_SESSION',
      entityId: session.id,
      details: { ipAddress, userAgent },
      ipAddress,
    });

    return {
      success: true,
      rawSessionToken,
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };
  }

  /**
   * Handle failed login attempt tracking and lockout
   */
  private async handleFailedLogin(userId: string, ipAddress?: string, userAgent?: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, failedLoginAttempts: true },
      });
      if (!user) return;

      const nextAttempts = user.failedLoginAttempts + 1;
      let lockoutUntil: Date | null = null;

      if (nextAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: nextAttempts,
          lockoutUntil,
        },
      });

      await this.recordAudit({
        userId,
        action: 'ADMIN_LOGIN_FAILED',
        entityType: 'USER',
        entityId: userId,
        details: { attempts: nextAttempts, lockedOut: !!lockoutUntil, ipAddress, userAgent },
        ipAddress,
      });
    } catch (err) {
      console.error('[AdminAuthService] handleFailedLogin error:', err);
    }
  }

  /**
   * Validate admin session with 30m idle timeout and 12h absolute limit
   */
  async validateSession(rawSessionToken: string) {
    if (!rawSessionToken) {
      throw new UnauthorizedError('Admin session token missing');
    }

    const sessionTokenHash = hashSha256(rawSessionToken);
    const dbActive = await isDbAvailable();
    if (!dbActive) throw new BadRequestError('Database connection required');

    const session = await prisma.adminSession.findUnique({
      where: { sessionToken: sessionTokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            customPermissions: true,
          },
        },
      },
    });

    if (!session || session.isRevoked) {
      throw new UnauthorizedError('Admin session expired or revoked. Please sign in again.');
    }

    // Check account status
    if (!session.user.isActive) {
      await prisma.adminSession.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedError('Admin account has been deactivated.');
    }

    // Check absolute lifetime (12h)
    const now = new Date();
    if (now > session.expiresAt) {
      await prisma.adminSession.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedError('Admin session reached maximum lifetime (12h). Please re-authenticate.');
    }

    // Check idle timeout (30 min)
    const idleElapsed = now.getTime() - session.lastActiveAt.getTime();
    if (idleElapsed > ADMIN_IDLE_TIMEOUT_MS) {
      await prisma.adminSession.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedError('Admin session timed out after 30 minutes of inactivity.');
    }

    // Touch lastActiveAt
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { lastActiveAt: now },
    });

    return {
      session,
      user: session.user,
    };
  }

  /**
   * Get all sessions for a user ("My Sessions")
   */
  async getUserSessions(userId: string, currentSessionId?: string) {
    const dbActive = await isDbAvailable();
    if (!dbActive) return [];

    const sessions = await prisma.adminSession.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        lastActiveAt: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string, userId: string, ipAddress?: string) {
    const dbActive = await isDbAvailable();
    if (!dbActive) return;

    await prisma.adminSession.updateMany({
      where: { id: sessionId, userId },
      data: { isRevoked: true },
    });

    await this.recordAudit({
      userId,
      action: 'ADMIN_SESSION_REVOKED',
      entityType: 'ADMIN_SESSION',
      entityId: sessionId,
      ipAddress,
    });
  }

  /**
   * Revoke all sessions for a user (optionally keeping current)
   */
  async revokeAllSessions(userId: string, exceptSessionId?: string, ipAddress?: string) {
    const dbActive = await isDbAvailable();
    if (!dbActive) return;

    await prisma.adminSession.updateMany({
      where: {
        userId,
        id: exceptSessionId ? { not: exceptSessionId } : undefined,
      },
      data: { isRevoked: true },
    });

    await this.recordAudit({
      userId,
      action: 'ADMIN_ALL_SESSIONS_REVOKED',
      entityType: 'USER',
      entityId: userId,
      details: { keptCurrent: !!exceptSessionId },
      ipAddress,
    });
  }

  /**
   * Deactivate staff member: immediately revokes all sessions and refresh tokens.
   * Generates offboarding audit and checklist.
   */
  async deactivateStaff(params: {
    actorId: string;
    targetUserId: string;
    reason?: string;
    ipAddress?: string;
  }) {
    const { actorId, targetUserId, reason, ipAddress } = params;

    const dbActive = await isDbAvailable();
    if (!dbActive) throw new BadRequestError('Database connection required');

    const actor = await prisma.user.findUnique({ where: { id: actorId } });
    const target = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!actor || !target) {
      throw new NotFoundError('Actor or target user not found');
    }

    // Role hierarchy check
    const actorLevel = ROLE_HIERARCHY[actor.role] ?? 0;
    const targetLevel = ROLE_HIERARCHY[target.role] ?? 0;

    if (targetLevel > actorLevel) {
      throw new ForbiddenError(`Cannot deactivate a user with a higher role than your own`);
    }

    if (actorId === targetUserId) {
      throw new BadRequestError('You cannot deactivate your own account.');
    }

    // Protect last active SUPER_ADMIN
    await this.ensureNotLastActiveSuperAdmin(targetUserId, 'deactivate');

    // 1. Mark target user as inactive
    await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: false },
    });

    // 2. Immediately revoke all AdminSessions
    await prisma.adminSession.updateMany({
      where: { userId: targetUserId },
      data: { isRevoked: true },
    });

    // 3. Immediately revoke all Storefront RefreshTokens
    await prisma.refreshToken.updateMany({
      where: { userId: targetUserId },
      data: { isRevoked: true },
    });

    await this.recordAudit({
      userId: actorId,
      action: 'STAFF_DEACTIVATED',
      entityType: 'USER',
      entityId: targetUserId,
      details: {
        targetEmail: target.email,
        targetRole: target.role,
        reason: reason || 'Staff offboarding',
      },
      ipAddress,
    });

    return {
      success: true,
      message: `Staff member ${target.email} has been deactivated.`,
      offboardingChecklist: [
        { task: 'All active Admin sessions terminated', status: 'COMPLETED' },
        { task: 'Storefront refresh tokens revoked', status: 'COMPLETED' },
        { task: 'Account deactivated (isActive = false)', status: 'COMPLETED' },
        { task: 'Audit trail record preserved', status: 'COMPLETED' },
        { task: 'API and store operations blocked', status: 'COMPLETED' },
      ],
    };
  }

  /**
   * Reset 2FA for an admin by a SUPER_ADMIN (audited, sends notification)
   */
  async superAdminReset2Fa(params: {
    superAdminId: string;
    targetEmail: string;
    ipAddress?: string;
  }) {
    const { superAdminId, targetEmail, ipAddress } = params;
    const normalizedEmail = targetEmail.toLowerCase().trim();

    const dbActive = await isDbAvailable();
    if (!dbActive) throw new BadRequestError('Database connection required');

    const superAdmin = await prisma.user.findUnique({ where: { id: superAdminId } });
    if (!superAdmin || superAdmin.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Only a SUPER_ADMIN can execute a 2FA reset.');
    }

    const targetUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!targetUser) {
      throw new NotFoundError(`User ${normalizedEmail} not found`);
    }

    // Protect last active SUPER_ADMIN
    await this.ensureNotLastActiveSuperAdmin(targetUser.id, 'remove 2FA from');

    // Reset 2FA fields and revoke existing sessions
    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      },
    });

    await prisma.adminSession.updateMany({
      where: { userId: targetUser.id },
      data: { isRevoked: true },
    });

    // Notify affected admin via email
    await emailProvider.sendEmail({
      to: targetUser.email,
      subject: 'Security Notice: Two-Factor Authentication Reset',
      html: `<p>Hello ${targetUser.name},</p><p>Your Two-Factor Authentication (2FA) has been reset by Super Administrator ${superAdmin.name} (${superAdmin.email}).</p><p>All previous active sessions have been revoked.</p><p>Please re-login and re-enroll your 2FA credentials immediately.</p>`,
      text: `Hello ${targetUser.name},\n\nYour Two-Factor Authentication (2FA) has been reset by Super Administrator ${superAdmin.name} (${superAdmin.email}).\nAll previous active sessions have been revoked.\n\nPlease re-login and re-enroll your 2FA credentials immediately.\n\nStyleBazaar Security Team`,
    });

    await this.recordAudit({
      userId: superAdminId,
      action: '2FA_RESET_BY_SUPER_ADMIN',
      entityType: 'USER',
      entityId: targetUser.id,
      details: { targetEmail: targetUser.email },
      ipAddress,
    });

    return {
      success: true,
      message: `2FA credentials reset for ${targetUser.email}. User must re-enroll on next access.`,
    };
  }

  /**
   * Regenerate 10 backup codes after re-authentication
   */
  async regenerateBackupCodes(userId: string, currentPassword: string, ipAddress?: string) {
    const dbActive = await isDbAvailable();
    if (!dbActive) throw new BadRequestError('Database unavailable');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestError('2FA must be active to regenerate backup codes.');
    }

    const validPassword = await argon2.verify(user.passwordHash, currentPassword);
    if (!validPassword) {
      throw new UnauthorizedError('Current password confirmation failed.');
    }

    const { rawCodes, hashedCodes } = generateBackupCodes(10);

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorBackupCodes: hashedCodes },
    });

    await this.recordAudit({
      userId,
      action: '2FA_BACKUP_CODES_REGENERATED',
      entityType: 'USER',
      entityId: userId,
      ipAddress,
    });

    return {
      success: true,
      backupCodes: rawCodes,
    };
  }

  /**
   * Admin Password Reset Request
   */
  async requestAdminPasswordReset(email: string, ipAddress?: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const dbActive = await isDbAvailable();
    if (!dbActive) return;

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.isActive || !['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(user.role)) {
      // Return silently to prevent user enumeration
      return { success: true, message: 'If an active administrative account exists, instructions have been dispatched.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashSha256(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store in existing PasswordResetToken or in memory
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt,
      },
    });

    const resetLink = `${env.CLIENT_URL}/admin/reset-password?token=${resetToken}`;
    await emailProvider.sendEmail({
      to: user.email,
      subject: 'StyleBazaar Admin: Password Reset Request',
      html: `<p>Hello ${user.name},</p><p>A password reset was requested for your administrative account.</p><p><a href="${resetLink}">Click here to reset your password</a></p><p>Link: ${resetLink}</p><p>Note: You will be required to verify your 2FA authentication after setting a new password.</p>`,
      text: `Hello ${user.name},\n\nA password reset was requested for your administrative account.\nReset link:\n${resetLink}\n\nNote: You will be required to verify your 2FA authentication after setting a new password.\n\nLink expires in 1 hour.`,
    });

    await this.recordAudit({
      userId: user.id,
      action: 'ADMIN_PASSWORD_RESET_REQUESTED',
      entityType: 'USER',
      entityId: user.id,
      ipAddress,
    });

    return { success: true, message: 'Password reset link sent.' };
  }

  /**
   * Complete Password Reset with mandatory 2FA confirmation
   */
  async completeAdminPasswordReset(params: {
    resetToken: string;
    newPassword: string;
    totpCode: string;
    ipAddress?: string;
  }) {
    const { resetToken, newPassword, totpCode, ipAddress } = params;
    const tokenHash = hashSha256(resetToken);

    const dbActive = await isDbAvailable();
    if (!dbActive) throw new BadRequestError('Database unavailable');

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.isUsed || new Date() > resetRecord.expiresAt) {
      throw new BadRequestError('Invalid or expired password reset link.');
    }

    const user = resetRecord.user;
    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive.');
    }

    // Require 2FA verification if enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const is2faValid = verifyTotp(totpCode, user.twoFactorSecret);
      if (!is2faValid) {
        throw new BadRequestError('Invalid 2FA verification code. Password reset aborted.');
      }
    }

    const passwordHash = await argon2.hash(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { isUsed: true },
    });

    // Password change revokes ALL sessions
    await prisma.adminSession.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    await this.recordAudit({
      userId: user.id,
      action: 'ADMIN_PASSWORD_RESET_COMPLETED',
      entityType: 'USER',
      entityId: user.id,
      details: { allSessionsRevoked: true },
      ipAddress,
    });

    return {
      success: true,
      message: 'Password successfully updated. All other active sessions have been terminated. Please log in with your new credentials.',
    };
  }
}

export const adminAuthService = new AdminAuthService();
