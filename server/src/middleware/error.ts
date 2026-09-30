import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const isOperational = 'isOperational' in err ? err.isOperational : false;

  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
      statusCode,
    },
    err.message
  );

  const errorMessage = isOperational || env.NODE_ENV !== 'production' ? err.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    error: {
      message: errorMessage,
      details: 'details' in err ? err.details : undefined,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
