import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { wishlistService } from '../services/wishlist.service.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

// GET /api/wishlist - Get current user's wishlist
wishlistRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const data = await wishlistService.getWishlistWithProducts(userId);
  res.json({
    success: true,
    data,
  });
});

const productIdSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

// POST /api/wishlist - Add product to wishlist
wishlistRouter.post('/', validate({ body: productIdSchema }), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const items = await wishlistService.addItem(userId, req.body.productId);
  res.json({
    success: true,
    data: items,
  });
});

// POST /api/wishlist/toggle - Toggle product in wishlist
wishlistRouter.post('/toggle', validate({ body: productIdSchema }), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const result = await wishlistService.toggleItem(userId, req.body.productId);
  res.json({
    success: true,
    data: result,
  });
});

// DELETE /api/wishlist/:productId - Remove product from wishlist
wishlistRouter.delete('/:productId', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const items = await wishlistService.removeItem(userId, req.params.productId);
  res.json({
    success: true,
    data: items,
  });
});

const mergeWishlistSchema = z.object({
  productIds: z.array(z.string().min(1)),
});

// POST /api/wishlist/merge - Merge guest wishlist on login
wishlistRouter.post('/merge', validate({ body: mergeWishlistSchema }), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const items = await wishlistService.mergeWishlist(userId, req.body.productIds);
  res.json({
    success: true,
    data: items,
  });
});
