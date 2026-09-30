import { Router, Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service.js';

export const reviewsRouter = Router();

// POST /api/reviews/:id/vote - Upvote a helpful review
reviewsRouter.post('/:id/vote', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await reviewService.voteHelpful(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});
