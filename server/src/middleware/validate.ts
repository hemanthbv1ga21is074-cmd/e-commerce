import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors.js';

interface RequestValidators {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

function sanitizePayload(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return obj.replace(/\0/g, '');
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizePayload);
  }
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue; // Block prototype pollution
    }
    clean[key] = sanitizePayload(obj[key]);
  }
  return clean;
}

export function validate(schemas: RequestValidators) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body && req.body) {
        req.body = sanitizePayload(req.body);
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query && req.query) {
        req.query = sanitizePayload(req.query);
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params && req.params) {
        req.params = sanitizePayload(req.params);
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        const combinedMessage = issues.map((i) => i.message).join('; ') || 'Validation failed';
        return next(new BadRequestError(combinedMessage, issues));
      }
      next(error);
    }
  };
}
