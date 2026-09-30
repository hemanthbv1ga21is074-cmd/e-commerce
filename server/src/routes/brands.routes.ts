import { Router, Request, Response, NextFunction } from 'express';
import { catalogService } from '../services/catalog.service.js';

export const brandsRouter = Router();

brandsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await catalogService.getBrands();
    res.json({ success: true, data: brands });
  } catch (err) {
    next(err);
  }
});
