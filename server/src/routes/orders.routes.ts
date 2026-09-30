import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { orderService } from '../services/order.service.js';
import { generateOrderInvoice } from '../services/invoice.service.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { cartService } from '../services/cart.service.js';

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

const createOrderSchema = z.object({
  idempotencyKey: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      variantId: z.string().optional(),
      size: z.string().min(1, 'Size is required'),
      color: z.string().optional(),
      quantity: z.number().int().positive().default(1),
    })
  ),
  addressId: z.string().optional(),
  shippingAddressText: z.string().optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['COD', 'WALLET', 'TEST_PAYMENT']).default('COD'),
  useWallet: z.boolean().optional().default(false),
  usePoints: z.boolean().optional().default(false),
});

// POST /api/orders - Place a new order with idempotency
ordersRouter.post(
  '/',
  validate({ body: createOrderSchema }),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;

      const order = await orderService.createOrder({
        userId,
        idempotencyKey,
        ...req.body,
      });

      // Automatically clear user's cart on order placement
      await cartService.clearCart(userId);

      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/orders - Get user's order history
ordersRouter.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const orders = await orderService.getOrders(userId);
    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id - Get specific order details
ordersRouter.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const isAdmin = req.user?.role === 'ADMIN';
    const order = await orderService.getOrderById(userId, req.params.id, isAdmin);
    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
});

const cancelOrderSchema = z.object({
  reason: z.string().optional(),
});

// POST /api/orders/:id/cancel - Cancel an order
ordersRouter.post(
  '/:id/cancel',
  validate({ body: cancelOrderSchema }),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const order = await orderService.cancelOrder(userId, req.params.id, req.body.reason);
      res.json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/orders/:id/invoice - Download GST PDF invoice
ordersRouter.get('/:id/invoice', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const isAdmin = req.user?.role === 'ADMIN';
    const order = await orderService.getOrderById(userId, req.params.id, isAdmin);

    const pdfBuffer = await generateOrderInvoice(order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Invoice-${order.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});
