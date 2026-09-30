import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { ledgerService } from '../services/ledger.service.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

export const walletRouter = Router();

walletRouter.use(requireAuth);

// GET /api/account/wallet - Get wallet balance and transactions ledger
walletRouter.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = await ledgerService.getWalletBalanceAndHistory(userId);
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

const topupSchema = z.object({
  amountInPaise: z.number().int().positive().max(1000000, 'Maximum top-up is ₹10,000 (1,000,000 paise)').optional(),
  amount: z.number().int().positive().max(10000, 'Maximum top-up is ₹10,000').optional(),
});

// POST /api/account/wallet/topup - Quick recharge / simulation
walletRouter.post(
  '/topup',
  validate({ body: topupSchema }),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const amountInPaise = req.body.amountInPaise || (req.body.amount ? req.body.amount * 100 : 50000);

      const result = await ledgerService.creditWallet(
        userId,
        amountInPaise,
        'TOPUP',
        `Wallet Quick Top-up (+₹${Math.round(amountInPaise / 100).toLocaleString('en-IN')})`
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

const redeemGiftCardSchema = z.object({
  code: z.string().min(1, 'Gift card code is required'),
  pin: z.string().min(1, 'PIN is required'),
});

// POST /api/account/wallet/redeem-giftcard - Redeem gift card
walletRouter.post(
  '/redeem-giftcard',
  validate({ body: redeemGiftCardSchema }),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { code, pin } = req.body;

      const result = await ledgerService.redeemGiftCard(userId, code, pin);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);
