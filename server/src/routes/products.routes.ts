import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { catalogService } from '../services/catalog.service.js';
import { reviewService } from '../services/review.service.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const productsRouter = Router();

const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be an integer between 1 and 5.').max(5, 'Rating must be an integer between 1 and 5.'),
  title: z.string().min(2, 'Review title is required.').max(150),
  text: z.string().min(5, 'Review text is required.').max(2000),
  fit: z.enum(['Runs Small', 'True to Size', 'Runs Large']).optional(),
  images: z.array(z.string().url('Invalid image URL')).max(5).optional(),
  orderId: z.string().optional(),
});

productsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      gender,
      category,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      discount,
      rating,
      sort,
      page,
      limit,
    } = req.query;

    const result = await catalogService.getProducts({
      gender: gender as string,
      category: category as string,
      brands: brand ? (Array.isArray(brand) ? (brand as string[]) : [brand as string]) : undefined,
      priceMin: minPrice ? parseInt(minPrice as string, 10) : undefined,
      priceMax: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
      sizes: size ? (Array.isArray(size) ? (size as string[]) : [size as string]) : undefined,
      colors: color ? (Array.isArray(color) ? (color as string[]) : [color as string]) : undefined,
      discountMin: discount ? parseInt(discount as string, 10) : undefined,
      ratingMin: rating ? parseFloat(rating as string) : undefined,
      sort: sort as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 24,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string) || '';
    const results = await catalogService.search(q);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/trending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
    const results = await catalogService.getTrending(limit);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await catalogService.getProductBySlug(req.params.slug);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/:id/related', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
    const related = await catalogService.getRelatedProducts(req.params.id, limit);
    res.json({ success: true, data: related });
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/:id/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await catalogService.getProductReviews(req.params.id);
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
});

productsRouter.post(
  '/:id/reviews',
  requireAuth,
  validate({ body: createReviewSchema }),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const review = await reviewService.addReview(
        req.params.id,
        req.user!.userId,
        req.user!.email.split('@')[0],
        req.body
      );
      res.status(201).json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  }
);

