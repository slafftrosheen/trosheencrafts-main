import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error for debugging
  console.error('Error:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors,
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  if ((err as any).code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      message: 'Invalid CSRF token',
    });
  }

  res.status(err.statusCode || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message || 'Something went wrong',
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} not found`,
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
