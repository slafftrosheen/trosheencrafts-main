import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
}

export function rateLimiter(options: RateLimiterOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests, please try again later.',
  } = options;

  return rateLimit({
    windowMs,
    max: maxRequests,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
}

export const globalRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 1000,
});

export const apiLimiter = globalRateLimiter;
export const checkoutLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
});

export const strictRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many attempts, please try again after 15 minutes.',
});

export const uploadLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Increased from 10 to 100 for batch uploads
  message: 'Too many uploads, please try again later',
});
