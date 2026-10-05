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

// POST /api/admin/products - Create a new product
adminRouter.post('/products', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const created = await adminService.createProduct(req.body);
    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/products/:id - Update an existing product
adminRouter.put('/products/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await adminService.updateProduct(req.params.id, req.body);
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/products/:id - Delete an existing product
adminRouter.delete('/products/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await adminService.deleteProduct(req.params.id);
    res.json({
      success: true,
      message: 'Product successfully deleted',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/upload - Upload an image (base64 or link)
adminRouter.post('/upload', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      throw new BadRequestError('Image data or URL is required');
    }
    // If it's already a link (http/https), return it directly
    if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
      return res.json({ success: true, url: image });
    }
    // If it's a data URL, return it or store it
    res.json({
      success: true,
      url: image,
    });
  } catch (err) {
    next(err);
  }
});

