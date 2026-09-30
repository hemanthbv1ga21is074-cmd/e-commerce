import { Router, Request, Response } from 'express';
import { env } from '../config/env.js';

export const configRouter = Router();

configRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      appName: 'StyleBazaar',
      authPhoneOtpEnabled: env.AUTH_PHONE_OTP_ENABLED,
      onlinePaymentsEnabled: env.ONLINE_PAYMENTS_ENABLED,
      codEnabled: env.COD_ENABLED,
      codMaxOrderValuePaise: env.COD_MAX_ORDER_VALUE_PAISE,
      codFeePaise: env.COD_FEE_PAISE,
      freeDeliveryThresholdPaise: env.FREE_DELIVERY_THRESHOLD_PAISE,
      standardDeliveryFeePaise: env.STANDARD_DELIVERY_FEE_PAISE,
    },
  });
});
