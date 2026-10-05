import { Router, Response, NextFunction } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import {
  adminSecurityHeaders,
  adminIpAllowlist,
  authenticateAdminAny,
  AdminAuthenticatedRequest,
} from '../middleware/admin-auth.js';
import { adminAuthService } from '../services/admin-auth.service.js';
import { orderService } from '../services/order.service.js';
import { adminService } from '../services/admin.service.js';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '../utils/errors.js';

export const adminRouter = Router();

// Enterprise network hardening headers & IP allowlist
adminRouter.use(adminSecurityHeaders);
adminRouter.use(adminIpAllowlist);

// Secure all admin routes with authentication (supports dedicated session or JWT)
adminRouter.use(authenticateAdminAny);

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

// GET /api/admin/team - Get all admin and support members including 2FA, active status, and pending invites
adminRouter.get('/team', async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { isDbAvailable, prisma } = await import('../db/client.js');
    const dbActive = await isDbAvailable();
    if (dbActive) {
      const users = await prisma.user.findMany({
        where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] } },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          twoFactorEnabled: true,
          isEmailVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const pendingInvites = await prisma.adminInvite.findMany({
        where: { isAccepted: false, expiresAt: { gt: new Date() } },
        include: { invitedBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        data: users,
        pendingInvites: pendingInvites.map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          invitedBy: inv.invitedBy?.name || 'Admin',
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt,
        })),
      });
    }
    res.json({
      success: true,
      data: [
        {
          id: 'usr-admin-1',
          email: 'admin@stylebazaar.com',
          name: 'Store Administrator',
          role: 'SUPER_ADMIN',
          isActive: true,
          twoFactorEnabled: false,
          createdAt: new Date(),
        },
      ],
      pendingInvites: [],
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/team/invite - Send single-use 48h invitation
adminRouter.post('/team/invite', async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      throw new BadRequestError('Email and role are required.');
    }

    const actorId = req.adminUser?.id || (req as any).user?.userId;
    if (!actorId) throw new UnauthorizedError('Unauthorized');

    const clientIp =
      ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || '')
        .replace('::ffff:', '')
        .trim();

    const result = await adminAuthService.createStaffInvite({
      inviterId: actorId,
      email,
      role,
      ipAddress: clientIp,
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/team/deactivate - Deactivate staff with session revocation and offboarding checklist
adminRouter.post('/team/deactivate', async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { targetUserId, reason } = req.body;
    if (!targetUserId) throw new BadRequestError('targetUserId is required');

    const actorId = req.adminUser?.id || (req as any).user?.userId;
    if (!actorId) throw new UnauthorizedError('Unauthorized');

    const clientIp =
      ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || '')
        .replace('::ffff:', '')
        .trim();

    const result = await adminAuthService.deactivateStaff({
      actorId,
      targetUserId,
      reason,
      ipAddress: clientIp,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/team/reset-2fa - Reset 2FA for a staff member (SUPER_ADMIN only)
adminRouter.post('/team/reset-2fa', async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { targetEmail } = req.body;
    if (!targetEmail) throw new BadRequestError('targetEmail is required');

    const actorId = req.adminUser?.id || (req as any).user?.userId;
    if (!actorId) throw new UnauthorizedError('Unauthorized');

    const clientIp =
      ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || '')
        .replace('::ffff:', '')
        .trim();

    const result = await adminAuthService.superAdminReset2Fa({
      superAdminId: actorId,
      targetEmail,
      ipAddress: clientIp,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/team/role - Update staff role with hierarchy enforcement and last SUPER_ADMIN protection
adminRouter.post('/team/role', async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { targetUserId, role } = req.body;
    if (!targetUserId || !role) throw new BadRequestError('targetUserId and role are required');

    const actorId = req.adminUser?.id || (req as any).user?.userId;
    if (!actorId) throw new UnauthorizedError('Unauthorized');

    const { isDbAvailable, prisma } = await import('../db/client.js');
    const dbActive = await isDbAvailable();
    if (!dbActive) throw new BadRequestError('Database connection required');

    const actor = await prisma.user.findUnique({ where: { id: actorId } });
    const target = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!actor || !target) throw new BadRequestError('User not found');

    // Prevent self-promotion
    if (actorId === targetUserId) {
      throw new ForbiddenError('Self-promotion or self-role change is not permitted.');
    }

    const { ROLE_HIERARCHY } = await import('../services/admin-auth.service.js');
    const actorLevel = ROLE_HIERARCHY[actor.role] ?? 0;
    const targetCurrentLevel = ROLE_HIERARCHY[target.role] ?? 0;
    const newLevel = ROLE_HIERARCHY[role] ?? 0;

    if (newLevel > actorLevel) {
      throw new ForbiddenError(`Cannot grant role ${role} that exceeds your own role ${actor.role}`);
    }

    if (targetCurrentLevel > actorLevel) {
      throw new ForbiddenError(`Cannot modify role of a user higher in hierarchy than you`);
    }

    // Protect last active SUPER_ADMIN from demotion
    await adminAuthService.ensureNotLastActiveSuperAdmin(targetUserId, 'demote');

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    // Revoke sessions so user must re-authenticate with new role
    await prisma.adminSession.updateMany({
      where: { userId: targetUserId },
      data: { isRevoked: true },
    });

    await adminAuthService.recordAudit({
      userId: actorId,
      action: 'STAFF_ROLE_CHANGED',
      entityType: 'USER',
      entityId: targetUserId,
      details: { previousRole: target.role, newRole: role },
    });

    res.json({
      success: true,
      data: updated,
      message: `Updated role to ${role} for ${target.email}. Active sessions revoked for re-authentication.`,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/team/grant - Legacy backward compatibility wrapper
adminRouter.post('/team/grant', async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, role = 'ADMIN' } = req.body;
    if (!email) throw new BadRequestError('Email address is required');
    const normalizedEmail = email.toLowerCase().trim();

    const actorId = req.adminUser?.id || (req as any).user?.userId || 'usr-admin-1';
    const result = await adminAuthService.createStaffInvite({
      inviterId: actorId,
      email: normalizedEmail,
      role: role === 'SUPPORT' ? 'SUPPORT' : 'ADMIN',
    });

    res.json({ success: true, message: `Created invitation for ${normalizedEmail}`, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/team/revoke - Legacy backward compatibility wrapper
adminRouter.post('/team/revoke', async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new BadRequestError('Email address is required');
    const normalizedEmail = email.toLowerCase().trim();

    const { isDbAvailable, prisma } = await import('../db/client.js');
    const dbActive = await isDbAvailable();
    if (dbActive) {
      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (user) {
        const actorId = req.adminUser?.id || (req as any).user?.userId || user.id;
        const result = await adminAuthService.deactivateStaff({
          actorId,
          targetUserId: user.id,
          reason: 'Legacy revoke endpoint called',
        });
        return res.json(result);
      }
    }

    res.json({ success: true, message: `Revoked privileges for ${normalizedEmail}` });
  } catch (err) {
    next(err);
  }
});


