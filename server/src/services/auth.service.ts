import argon2 from 'argon2';
import crypto from 'crypto';
import { prisma, isDbAvailable } from '../db/client.js';
import { tokenService } from './token.service.js';
import { emailProvider } from '../providers/email/dev-email.provider.js';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors.js';

// In-memory fallback user store when PostgreSQL is not running locally
export interface InMemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  gender?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';
  isEmailVerified: boolean;
  isCodBlocked: boolean;
  unconfirmedCodOrdersCount: number;
  walletBalanceInPaise: number;
  loyaltyPoints: number;
  loyaltyTier: string;
  birthday?: Date;
  addresses?: any[];
  createdAt: Date;
}

export const memoryUsers = new Map<string, InMemoryUser>();
const memoryRefreshTokens = new Map<string, { userId: string; expiresAt: Date; isRevoked: boolean }>();
const memoryVerifyTokens = new Map<string, { userId: string; expiresAt: Date }>();
const memoryResetTokens = new Map<string, { userId: string; expiresAt: Date }>();

// Pre-seed Demo User and Admin in memory
(async () => {
  const hashDemo = await argon2.hash('Password123!');
  const hashAdmin = await argon2.hash('Admin123!');

  memoryUsers.set('rahul@example.com', {
    id: 'usr-demo-1',
    email: 'rahul@example.com',
    passwordHash: hashDemo,
    name: 'Rahul Sharma',
    phone: '9876543210',
    gender: 'Male',
    role: 'CUSTOMER',
    isEmailVerified: true,
    isCodBlocked: false,
    unconfirmedCodOrdersCount: 0,
    walletBalanceInPaise: 100000,
    loyaltyPoints: 1250,
    loyaltyTier: 'Gold',
    createdAt: new Date(),
  });

  memoryUsers.set('admin@stylebazaar.com', {
    id: 'usr-admin-1',
    email: 'admin@stylebazaar.com',
    passwordHash: hashAdmin,
    name: 'Store Administrator',
    phone: '9876500000',
    gender: 'Other',
    role: 'ADMIN',
    isEmailVerified: true,
    isCodBlocked: false,
    unconfirmedCodOrdersCount: 0,
    walletBalanceInPaise: 0,
    loyaltyPoints: 0,
    loyaltyTier: 'Platinum',
    createdAt: new Date(),
  });
})();

export class AuthService {
  async register(params: {
    name: string;
    email: string;
    password: string;
    gender?: string;
    phone?: string;
  }) {
    const normalizedEmail = params.email.toLowerCase().trim();
    const hasDb = await isDbAvailable();

    // Check existing
    if (hasDb) {
      const existingPrisma = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingPrisma) throw new ConflictError('An account with this email already exists');
    } else {
      if (memoryUsers.has(normalizedEmail)) throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(params.password);
    const userId = `usr_${Date.now()}`;
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (hasDb) {
      try {
        await prisma.user.create({
          data: {
            id: userId,
            email: normalizedEmail,
            passwordHash,
            name: params.name,
            gender: params.gender,
            phone: params.phone,
            isEmailVerified: false,
            walletBalanceInPaise: 50000, // ₹500 welcome bonus in paise
            loyaltyPoints: 500,
            loyaltyTier: 'Silver',
            emailTokens: {
              create: { token: verifyToken, expiresAt },
            },
          },
        });
      } catch {
        memoryUsers.set(normalizedEmail, {
          id: userId,
          email: normalizedEmail,
          passwordHash,
          name: params.name,
          gender: params.gender,
          phone: params.phone,
          role: 'CUSTOMER',
          isEmailVerified: false,
          isCodBlocked: false,
          unconfirmedCodOrdersCount: 0,
          walletBalanceInPaise: 50000,
          loyaltyPoints: 500,
          loyaltyTier: 'Silver',
          createdAt: new Date(),
        });
        memoryVerifyTokens.set(verifyToken, { userId, expiresAt });
      }
    } else {
      memoryUsers.set(normalizedEmail, {
        id: userId,
        email: normalizedEmail,
        passwordHash,
        name: params.name,
        gender: params.gender,
        phone: params.phone,
        role: 'CUSTOMER',
        isEmailVerified: false,
        isCodBlocked: false,
        unconfirmedCodOrdersCount: 0,
        walletBalanceInPaise: 50000,
        loyaltyPoints: 500,
        loyaltyTier: 'Silver',
        createdAt: new Date(),
      });
      memoryVerifyTokens.set(verifyToken, { userId, expiresAt });
    }

    // Send verification email
    await emailProvider.sendVerificationEmail(normalizedEmail, verifyToken);

    const payload = { userId, email: normalizedEmail, role: 'CUSTOMER' as const };
    const accessToken = tokenService.signAccessToken(payload);
    const refreshToken = tokenService.signRefreshToken(payload);

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (hasDb) {
      try {
        await prisma.refreshToken.create({
          data: { tokenHash, userId, expiresAt: refreshExpiresAt },
        });
      } catch {
        memoryRefreshTokens.set(tokenHash, { userId, expiresAt: refreshExpiresAt, isRevoked: false });
      }
    } else {
      memoryRefreshTokens.set(tokenHash, { userId, expiresAt: refreshExpiresAt, isRevoked: false });
    }

    return {
      userId,
      user: {
        id: userId,
        name: params.name,
        email: normalizedEmail,
        phone: params.phone || '',
        gender: params.gender,
        role: 'CUSTOMER',
        isEmailVerified: false,
        walletBalance: 500,
        loyaltyPoints: 500,
        loyaltyTier: 'Silver',
      },
      accessToken,
      refreshToken,
      message: 'Account created! Please check your email for the verification link.',
    };
  }

  async verifyEmail(token: string) {
    const hasDb = await isDbAvailable();
    if (hasDb) {
      try {
        const record = await prisma.emailVerificationToken.findUnique({
          where: { token },
          include: { user: true },
        });
        if (record && record.expiresAt > new Date()) {
          await prisma.user.update({
            where: { id: record.userId },
            data: { isEmailVerified: true },
          });
          await prisma.emailVerificationToken.delete({ where: { token } });
          return { success: true, message: 'Email verified successfully!' };
        }
      } catch {}
    }

    const memRecord = memoryVerifyTokens.get(token);
    if (!memRecord || memRecord.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired verification link');
    }

    for (const u of memoryUsers.values()) {
      if (u.id === memRecord.userId) {
        u.isEmailVerified = true;
        break;
      }
    }
    memoryVerifyTokens.delete(token);
    return { success: true, message: 'Email verified successfully!' };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const hasDb = await isDbAvailable();
    let user: any = null;

    if (hasDb) {
      try {
        user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      } catch {}
    }

    if (!user) {
      user = memoryUsers.get(normalizedEmail);
    }

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = tokenService.signAccessToken(payload);
    const refreshToken = tokenService.signRefreshToken(payload);

    // Store refresh token
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (hasDb) {
      try {
        await prisma.refreshToken.create({
          data: {
            tokenHash,
            userId: user.id,
            expiresAt,
          },
        });
      } catch {
        memoryRefreshTokens.set(tokenHash, { userId: user.id, expiresAt, isRevoked: false });
      }
    } else {
      memoryRefreshTokens.set(tokenHash, { userId: user.id, expiresAt, isRevoked: false });
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        gender: user.gender,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        walletBalance: user.walletBalanceInPaise / 100,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyTier: user.loyaltyTier,
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const hasDb = await isDbAvailable();

    // Check revoked / exists
    let isValidToken = false;
    if (hasDb) {
      try {
        const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });
        if (record && !record.isRevoked && record.expiresAt > new Date()) {
          isValidToken = true;
          // Revoke used token (rotation)
          await prisma.refreshToken.update({ where: { tokenHash }, data: { isRevoked: true } });
        }
      } catch {}
    }

    if (!isValidToken) {
      const memRecord = memoryRefreshTokens.get(tokenHash);
      if (memRecord && !memRecord.isRevoked && memRecord.expiresAt > new Date()) {
        isValidToken = true;
        memRecord.isRevoked = true;
      }
    }

    if (!isValidToken) {
      throw new UnauthorizedError('Revoked or invalid refresh token');
    }

    // Issue rotated pair
    const newPayload = { userId: payload.userId, email: payload.email, role: payload.role };
    const newAccessToken = tokenService.signAccessToken(newPayload);
    const newRefreshToken = tokenService.signRefreshToken(newPayload);

    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (hasDb) {
      try {
        await prisma.refreshToken.create({
          data: { tokenHash: newTokenHash, userId: payload.userId, expiresAt },
        });
      } catch {
        memoryRefreshTokens.set(newTokenHash, { userId: payload.userId, expiresAt, isRevoked: false });
      }
    } else {
      memoryRefreshTokens.set(newTokenHash, { userId: payload.userId, expiresAt, isRevoked: false });
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async revokeRefreshToken(refreshToken: string) {
    if (!refreshToken) return;
    try {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const hasDb = await isDbAvailable();
      if (hasDb) {
        try {
          await prisma.refreshToken.update({
            where: { tokenHash },
            data: { isRevoked: true },
          });
        } catch { /* ignore if record not found */ }
      }
      const memRecord = memoryRefreshTokens.get(tokenHash);
      if (memRecord) {
        memRecord.isRevoked = true;
      }
    } catch { /* ignore */ }
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    let user: any = null;

    try {
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    } catch {}

    if (!user) user = memoryUsers.get(normalizedEmail);

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      try {
        await prisma.passwordResetToken.create({
          data: { token, userId: user.id, expiresAt },
        });
      } catch {
        memoryResetTokens.set(token, { userId: user.id, expiresAt });
      }

      await emailProvider.sendPasswordResetEmail(normalizedEmail, token);
    }

    return { message: 'If that email address exists in our system, we have sent password reset instructions.' };
  }

  async resetPassword(token: string, newPassword: string) {
    let userId: string | null = null;

    try {
      const record = await prisma.passwordResetToken.findUnique({ where: { token } });
      if (record && !record.isUsed && record.expiresAt > new Date()) {
        userId = record.userId;
        await prisma.passwordResetToken.update({ where: { token }, data: { isUsed: true } });
      }
    } catch {
      const memRecord = memoryResetTokens.get(token);
      if (memRecord && memRecord.expiresAt > new Date()) {
        userId = memRecord.userId;
        memoryResetTokens.delete(token);
      }
    }

    if (!userId) {
      throw new BadRequestError('Invalid or expired password reset link');
    }

    const passwordHash = await argon2.hash(newPassword);
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
    } catch {
      for (const u of memoryUsers.values()) {
        if (u.id === userId) {
          u.passwordHash = passwordHash;
          break;
        }
      }
    }

    return { message: 'Password reset successfully. You can now log in with your new password.' };
  }

  async getUserProfile(userId: string) {
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: { addresses: { where: { isDeleted: false } } },
      });
    } catch {}

    if (!user) {
      for (const u of memoryUsers.values()) {
        if (u.id === userId) {
          user = {
            ...u,
            addresses: [
              {
                id: 'addr-demo-1',
                name: 'Rahul Sharma',
                phone: '9876543210',
                pincode: '560001',
                city: 'Bengaluru',
                state: 'Karnataka',
                locality: 'MG Road',
                addressLine1: 'Flat 402, Prestige Tower',
                type: 'Home',
                isDefault: true,
              },
            ],
          };
          break;
        }
      }
    }

    if (!user) throw new NotFoundError('User not found');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      gender: user.gender,
      birthday: user.birthday,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      walletBalance: user.walletBalanceInPaise / 100,
      loyaltyPoints: user.loyaltyPoints,
      loyaltyTier: user.loyaltyTier,
      addresses: user.addresses || [],
    };
  }

  async updateProfile(userId: string, data: { name?: string; gender?: string; phone?: string; birthday?: string }) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          gender: data.gender,
          phone: data.phone,
          birthday: data.birthday ? new Date(data.birthday) : undefined,
        },
      });
    } catch {
      for (const u of memoryUsers.values()) {
        if (u.id === userId) {
          if (data.name) u.name = data.name;
          if (data.gender) u.gender = data.gender;
          if (data.phone) u.phone = data.phone;
          if (data.birthday) u.birthday = new Date(data.birthday);
          break;
        }
      }
    }
    return this.getUserProfile(userId);
  }
}

export const authService = new AuthService();
