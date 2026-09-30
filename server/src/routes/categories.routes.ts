import { Router, Request, Response, NextFunction } from 'express';
import { catalogService } from '../services/catalog.service.js';

export const categoriesRouter = Router();

categoriesRouter.get('/tree', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tree = await catalogService.getCategoryTree();
    res.json({ success: true, data: tree });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.get('/megamenu', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const megamenu = await catalogService.getMegaMenu();
    res.json({ success: true, data: megamenu });
  } catch (err) {
    next(err);
  }
});
