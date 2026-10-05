import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { NotFoundError } from './utils/errors.js';

export const app = express();

// Enterprise-Grade Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Vite / Client handles SPA assets
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'deny' }, // Anti-Clickjacking protection
    xContentTypeOptions: true, // Anti-MIME sniffing protection
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    dnsPrefetchControl: { allow: false },
    hsts:
      env.NODE_ENV === 'production'
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
  })
);

// Granular Feature & Permissions Policy to prevent unauthorized device access
app.use((_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(self), camera=(), microphone=(), payment=(self)'
  );
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      try {
        const host = new URL(origin).hostname;
        if (host.endsWith('.vercel.app') || host === 'localhost' || host === '127.0.0.1') {
          return callback(null, true);
        }
      } catch {
        // invalid URL
      }
      if (env.NODE_ENV === 'production') {
        return callback(new Error('CORS request rejected: origin not allowed'));
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key'],
  })
);

// Request body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// General rate limiter
app.use('/api', rateLimiter(100, 60 * 1000));

// Mount main API routes
app.use('/api', apiRouter);

// Catch-all for unhandled routes
app.use('*', (req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handler
app.use(errorHandler);
