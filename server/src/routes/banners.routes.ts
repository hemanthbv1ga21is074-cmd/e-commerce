import { Router, Request, Response, NextFunction } from 'express';
import { catalogService } from '../services/catalog.service.js';

export const bannersRouter = Router();

bannersRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await catalogService.getBanners();
    res.json({ success: true, data: banners });
  } catch (err) {
    next(err);
  }
});

bannersRouter.get('/hero', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await catalogService.getBanners();
    res.json({ success: true, data: banners.hero });
  } catch (err) {
    next(err);
  }
});

bannersRouter.get('/deal-of-the-day', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await catalogService.getBanners();
    res.json({ success: true, data: banners.dealOfTheDay });
  } catch (err) {
    next(err);
  }
});

bannersRouter.get('/bank-offers', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await catalogService.getBanners();
    res.json({ success: true, data: banners.bankOffers });
  } catch (err) {
    next(err);
  }
});

bannersRouter.get('/min-discount-tiles', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await catalogService.getBanners();
    res.json({ success: true, data: banners.minDiscountTiles });
  } catch (err) {
    next(err);
  }
});
