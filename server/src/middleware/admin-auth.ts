import { Request, Response, NextFunction } from 'express';
import { adminAuthService, ADMIN_SESSION_COOKIE_NAME, ADMIN_CSRF_COOKIE_NAME } from '../services/admin-auth.service.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export interface AdminAuthenticatedRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    customPermissions?: any;
  };
  adminSession?: any;
}

/**
 * Middleware: Verify dedicated Admin Session (Cookie or Bearer Header)
 * Enforces:
 * - 30-minute idle timeout
 * - 12-hour absolute lifetime
 * - Immediate session revocation upon deactivation or password change
 */
export async function requireAdminSession(
  req: AdminAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined = undefined;

    // 1. Check dedicated admin cookie
    if (req.cookies && req.cookies[ADMIN_SESSION_COOKIE_NAME]) {
      token = req.cookies[ADMIN_SESSION_COOKIE_NAME];
    }

    // 2. Fallback to Authorization: Bearer <sessionToken> for APIs/test suites
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Administrative session missing. Please sign in.');
    }

    const { session, user } = await adminAuthService.validateSession(token);

    req.adminUser = user;
    req.adminSession = session;
    (req as any).user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Flexible Admin Auth Middleware: accepts dedicated admin session or valid admin JWT
 */
export async function authenticateAdminAny(
  req: AdminAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  // If dedicated admin cookie is present, or token is 64-char hex session token
  const cookieToken = req.cookies?.[ADMIN_SESSION_COOKIE_NAME];
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

  if (cookieToken || (bearerToken && /^[a-f0-9]{64}$/i.test(bearerToken))) {
    return requireAdminSession(req, res, next);
  }

  // Fallback to JWT authentication for storefront admin token compatibility
  if (bearerToken) {
    try {
      const { tokenService } = await import('../services/token.service.js');
      const payload = tokenService.verifyAccessToken(bearerToken);
      if (!['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(payload.role)) {
        return next(new ForbiddenError('Admin privileges required to access this resource'));
      }
      (req as any).user = payload;
      req.adminUser = {
        id: payload.userId,
        email: payload.email,
        name: payload.email.split('@')[0],
        role: payload.role,
        isActive: true,
      };
      return next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(new UnauthorizedError('Access token has expired. Please refresh.'));
      }
      return next(new UnauthorizedError('Invalid access token'));
    }
  }

  return next(new UnauthorizedError('Administrative authentication required'));
}

/**
 * Middleware: CSRF Protection for state-changing Admin requests
 * Enforces double-submit token check or header validation on POST/PUT/PATCH/DELETE
 */
export function adminCsrfProtection(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // Only state-changing HTTP methods require CSRF tokens
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!stateChangingMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  const csrfHeader = (req.headers['x-admin-csrf-token'] as string) || (req.headers['x-csrf-token'] as string);
  const csrfCookie = req.cookies ? req.cookies[ADMIN_CSRF_COOKIE_NAME] : undefined;

  // Double-submit token check: if cookie is present, header must match cookie.
  // If cookie is not used (e.g. Bearer auth), header must be non-empty and valid.
  if (!csrfHeader) {
    return next(
      new ForbiddenError('CSRF verification failed: missing X-Admin-CSRF-Token header.')
    );
  }

  if (csrfCookie && csrfCookie !== csrfHeader) {
    return next(
      new ForbiddenError('CSRF verification failed: token mismatch between header and cookie.')
    );
  }

  next();
}

/**
 * Middleware: Enforce enterprise network headers for administrative endpoints
 */
export function adminSecurityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none';");
  next();
}

/**
 * Middleware: Optional ADMIN_IP_ALLOWLIST restriction
 */
export function adminIpAllowlist(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const allowlistEnv = process.env.ADMIN_IP_ALLOWLIST;
  if (!allowlistEnv || allowlistEnv.trim() === '') {
    return next();
  }

  const allowedIps = allowlistEnv.split(',').map((ip) => ip.trim());
  const clientIp =
    ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || '')
      .replace('::ffff:', '')
      .trim();

  // Allow localhost IPs automatically in development
  const isLocalhost = ['127.0.0.1', '::1', 'localhost'].includes(clientIp);

  if (!isLocalhost && !allowedIps.includes(clientIp)) {
    return next(
      new ForbiddenError(`Access denied: IP address ${clientIp} is not authorized for the admin console.`)
    );
  }

  next();
}
