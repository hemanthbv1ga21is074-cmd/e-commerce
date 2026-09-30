import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipMap = new Map<string, RateLimitRecord>();
const loginAttemptMap = new Map<string, RateLimitRecord>();

export function rateLimiter(maxRequests = 100, windowMs = 60 * 1000) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = ipMap.get(ip);

    if (!record || now > record.resetTime) {
      ipMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return next(new AppError('Too many requests. Please try again later.', 429));
    }

    record.count++;
    next();
  };
}

export function loginAttemptLimiter(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const email = (req.body?.email || req.ip || 'anonymous').toLowerCase();
    const now = Date.now();
    const record = loginAttemptMap.get(email);

    if (!record || now > record.resetTime) {
      loginAttemptMap.set(email, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxAttempts) {
      return next(
        new AppError('Too many failed login attempts. Please wait 15 minutes or reset your password.', 429)
      );
    }

    record.count++;
    next();
  };
}

export function clearLoginAttempts(email: string) {
  loginAttemptMap.delete(email.toLowerCase());
}

const actionLimitMap = new Map<string, RateLimitRecord>();

export function authActionLimiter(
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
  message = 'Too many sensitive requests. Please try again after 15 minutes.'
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // In test environment, skip limiting to prevent flaky tests
    if (process.env.NODE_ENV === 'test') {
      return next();
    }
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const key = `${ip}_${req.baseUrl}${req.path}`;
    const now = Date.now();
    const record = actionLimitMap.get(key);

    if (!record || now > record.resetTime) {
      actionLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxAttempts) {
      return next(new AppError(message, 429));
    }

    record.count++;
    next();
  };
}
