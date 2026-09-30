import { Router, Request, Response } from 'express';
import { couponService } from '../services/coupon.service.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

export const couponsRouter = Router();

// GET /api/coupons - List all active coupons
couponsRouter.get('/', async (_req: Request, res: Response) => {
  const coupons = await couponService.getActiveCoupons();
  res.json({
    success: true,
    data: coupons,
  });
});

const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  subtotalInPaise: z.number().int().nonnegative().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        size: z.string().optional(),
        color: z.string().optional(),
        quantity: z.number().int().positive().default(1),
        priceInPaise: z.number().int().optional(),
        categoryPath: z.array(z.string()).optional(),
        brand: z.string().optional(),
      })
    )
    .optional(),
});

// POST /api/coupons/validate - Validate coupon code
couponsRouter.post(
  '/validate',
  optionalAuth,
  validate({ body: validateCouponSchema }),
  async (req: AuthenticatedRequest, res: Response) => {
    const { code, subtotalInPaise = 0, items } = req.body;
    const userId = req.user?.userId;

    const result = await couponService.validateCoupon({
      code,
      subtotalInPaise,
      items,
      userId,
    });

    res.json({
      success: true,
      data: result,
    });
  }
);
