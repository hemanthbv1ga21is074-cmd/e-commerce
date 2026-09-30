import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().default('http://localhost:5173'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  API_URL: z.string().default('http://localhost:4000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_ACCESS_SECRET: z.string().default('stylebazaar_jwt_access_secret_super_secure_key_2026'),
  JWT_REFRESH_SECRET: z.string().default('stylebazaar_jwt_refresh_secret_super_secure_key_2026'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Feature Flags (Default false)
  AUTH_PHONE_OTP_ENABLED: z.string().default('false').transform((v) => v === 'true'),
  ONLINE_PAYMENTS_ENABLED: z.string().default('false').transform((v) => v === 'true'),

  // COD & Delivery Parameters in Paise
  COD_ENABLED: z.string().default('true').transform((v) => v === 'true'),
  COD_MAX_ORDER_VALUE_PAISE: z.string().default('500000').transform((v) => parseInt(v, 10)),
  COD_FEE_PAISE: z.string().default('5000').transform((v) => parseInt(v, 10)),
  MAX_UNCONFIRMED_COD_PER_USER: z.string().default('3').transform((v) => parseInt(v, 10)),
  FREE_DELIVERY_THRESHOLD_PAISE: z.string().default('99900').transform((v) => parseInt(v, 10)),
  STANDARD_DELIVERY_FEE_PAISE: z.string().default('9900').transform((v) => parseInt(v, 10)),

  // Providers
  EMAIL_PROVIDER: z.enum(['dev', 'resend', 'ses']).default('dev'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('StyleBazaar <orders@stylebazaar.local>'),
  SMS_PROVIDER: z.enum(['dev', 'stub']).default('dev'),
  STORAGE_PROVIDER: z.enum(['local', 'cloudinary', 's3']).default('local'),
}).refine(
  (data) => {
    if (data.NODE_ENV === 'production') {
      const defaultAccess = 'stylebazaar_jwt_access_secret_super_secure_key_2026';
      const defaultRefresh = 'stylebazaar_jwt_refresh_secret_super_secure_key_2026';
      if (data.JWT_ACCESS_SECRET === defaultAccess || data.JWT_REFRESH_SECRET === defaultRefresh) {
        return false;
      }
    }
    return true;
  },
  {
    message: 'In production, JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set to custom secure secrets.',
  }
);

export const env = envSchema.parse(process.env);
