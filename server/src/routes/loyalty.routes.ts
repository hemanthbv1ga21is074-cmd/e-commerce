import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { ledgerService } from '../services/ledger.service.js';

export const loyaltyRouter = Router();

loyaltyRouter.use(requireAuth);

// GET /api/account/loyalty - Get loyalty points, tier, and history
loyaltyRouter.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = await ledgerService.getLoyaltyBalanceAndHistory(userId);
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});
