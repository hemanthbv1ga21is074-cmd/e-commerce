import { Router, Response, NextFunction } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { orderService } from '../services/order.service.js';
import { adminService } from '../services/admin.service.js';
import { BadRequestError } from '../utils/errors.js';

export const adminRouter = Router();

// Secure all admin routes with authentication and ADMIN role check
adminRouter.use(requireAuth, requireAdmin);

// GET /api/admin/orders - Get all customer orders with filtering & pagination
adminRouter.get('/orders', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await orderService.getAllOrders({
      status: status as string | undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/orders/:id/status - Update order status along state machine
adminRouter.patch('/orders/:id/status', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, message } = req.body;
    if (!status) {
      throw new BadRequestError('Target order status is required.');
    }

    const updated = await orderService.updateOrderStatus(req.params.id, status, message);
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/inventory - List stock levels across variants and low-stock alerts
adminRouter.get('/inventory', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { lowStockOnly, threshold, search, page, limit } = req.query;
    const result = await adminService.getInventory({
      lowStockOnly: lowStockOnly === 'true',
      threshold: threshold ? parseInt(threshold as string, 10) : 5,
      search: search as string | undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 50,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/inventory/:productId/:size - Update variant stock
adminRouter.patch(
  '/inventory/:productId/:size',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { stock } = req.body;
      const result = await adminService.updateVariantStock(
        req.params.productId,
        req.params.size,
        stock
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

// PATCH /api/admin/inventory - Alternative body-based stock adjustment
adminRouter.patch('/inventory', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, size, stock } = req.body;
    if (!productId || !size || typeof stock !== 'number') {
      throw new BadRequestError('productId, size, and stock are required.');
    }

    const result = await adminService.updateVariantStock(productId, size, stock);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
