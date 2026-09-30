import { Router, Request, Response, NextFunction } from 'express';
import { catalogService } from '../services/catalog.service.js';

export const pincodesRouter = Router();

pincodesRouter.get('/:pincode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pincode } = req.params;
    const result = await catalogService.checkPincode(pincode);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: { message: `Pincode ${pincode} is not serviceable` },
      });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

pincodesRouter.get('/:pincode/serviceability', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pincode } = req.params;
    const result = await catalogService.checkPincode(pincode);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: { message: `Pincode ${pincode} is not serviceable` },
      });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});
