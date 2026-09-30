import { Router, Response, NextFunction } from 'express';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { pricingService } from '../services/pricing.service.js';
import { prisma, isDbAvailable } from '../db/client.js';
import { memoryUsers } from '../services/auth.service.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

export const checkoutRouter = Router();

const quoteSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      variantId: z.string().optional(),
      size: z.string().min(1, 'Size is required'),
      color: z.string().optional(),
      quantity: z.number().int().positive().default(1),
    })
  ),
  couponCode: z.string().optional(),
  isCod: z.boolean().optional().default(false),
  useWallet: z.boolean().optional().default(false),
  usePoints: z.boolean().optional().default(false),
  pincode: z.string().optional(),
});

// POST /api/checkout/quote - Calculate authoritative order pricing breakdown
checkoutRouter.post(
  '/quote',
  optionalAuth,
  validate({ body: quoteSchema }),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { items, couponCode, isCod, useWallet, usePoints, pincode } = req.body;
      const userId = req.user?.userId;

      let walletBalanceInPaise = 0;
      let loyaltyPoints = 0;
      let userOrderCount: number | undefined = undefined;

      if (userId) {
        const dbUp = await isDbAvailable();
        if (dbUp) {
          try {
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: {
                walletBalanceInPaise: true,
                loyaltyPoints: true,
                orders: { select: { id: true, status: true } },
              },
            });
            if (user) {
              walletBalanceInPaise = user.walletBalanceInPaise;
              loyaltyPoints = user.loyaltyPoints;
              userOrderCount = user.orders.filter((o) => o.status !== 'CANCELLED').length;
            }
          } catch {
            // DB error, check in-memory
          }
        }

        if (walletBalanceInPaise === 0) {
          for (const u of memoryUsers.values()) {
            if (u.id === userId) {
              walletBalanceInPaise = u.walletBalanceInPaise;
              loyaltyPoints = u.loyaltyPoints;
              break;
            }
          }
        }
      }

      const breakdown = await pricingService.calculateQuote({
        items,
        couponCode,
        isCod,
        walletBalanceInPaise,
        useWallet,
        loyaltyPoints,
        usePoints,
        pincode,
        userId,
        userOrderCount,
      });

      res.json({
        success: true,
        data: breakdown,
      });
    } catch (err) {
      next(err);
    }
  }
);
