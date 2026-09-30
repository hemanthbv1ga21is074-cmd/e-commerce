import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { validate } from '../middleware/validate.js';
import { loginAttemptLimiter, clearLoginAttempts, authActionLimiter } from '../middleware/rateLimiter.js';
import { env } from '../config/env.js';

export const authRouter = Router();

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  gender: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

// Routes
authRouter.post(
  '/register',
  validate({ body: registerSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/api/auth',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.get('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const result = await authService.verifyEmail(token);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

authRouter.post(
  '/login',
  loginAttemptLimiter(),
  validate({ body: loginSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken, user } = await authService.login(
        req.body.email,
        req.body.password
      );

      clearLoginAttempts(req.body.email);

      // Set rotating refresh token in secure, httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        data: {
          accessToken,
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, error: { message: 'Refresh token required' } });
    }

    const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(token);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      await authService.revokeRefreshToken(token);
    }
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

authRouter.post(
  '/forgot-password',
  authActionLimiter(5, 15 * 60 * 1000, 'Too many password reset requests. Please wait 15 minutes.'),
  validate({ body: forgotPasswordSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post(
  '/reset-password',
  authActionLimiter(5, 15 * 60 * 1000, 'Too many password reset attempts. Please wait 15 minutes.'),
  validate({ body: resetPasswordSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.newPassword);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);
