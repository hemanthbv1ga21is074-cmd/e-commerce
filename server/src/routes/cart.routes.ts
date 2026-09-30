import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { cartService } from '../services/cart.service.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

export const cartRouter = Router();

// All cart endpoints require authentication
cartRouter.use(requireAuth);

// GET /api/cart - Get user's cart items
cartRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const items = await cartService.getCart(userId);
  res.json({
    success: true,
    data: items,
  });
});

const addItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  size: z.string().min(1, 'Size is required'),
  color: z.string().optional(),
  quantity: z.number().int().positive().default(1),
});

// POST /api/cart - Add item to cart
cartRouter.post('/', validate({ body: addItemSchema }), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const items = await cartService.addItem(userId, req.body);
  res.json({
    success: true,
    data: items,
  });
});

const updateItemSchema = z.object({
  quantity: z.number().int().positive().optional(),
  size: z.string().optional(),
});

// PATCH /api/cart/:itemId - Update item quantity or size
cartRouter.patch('/:itemId', validate({ body: updateItemSchema }), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const items = await cartService.updateItem(userId, req.params.itemId, req.body);
  res.json({
    success: true,
    data: items,
  });
});

// DELETE /api/cart/:itemId - Remove item from cart
cartRouter.delete('/:itemId', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const items = await cartService.removeItem(userId, req.params.itemId);
  res.json({
    success: true,
    data: items,
  });
});

// DELETE /api/cart - Clear entire cart
cartRouter.delete('/', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  await cartService.clearCart(userId);
  res.json({
    success: true,
    message: 'Cart cleared successfully',
    data: [],
  });
});

const mergeCartSchema = z.object({
  items: z.array(addItemSchema),
});

// POST /api/cart/merge - Merge guest cart on login
cartRouter.post('/merge', validate({ body: mergeCartSchema }), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const items = await cartService.mergeCart(userId, req.body.items);
  res.json({
    success: true,
    data: items,
  });
});
