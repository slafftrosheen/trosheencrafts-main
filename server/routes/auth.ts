import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { validateRequest } from '../middleware/validation';
import { rateLimiter } from '../middleware/rateLimiter';

export const authRouter = Router();

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6),
  }),
});

/**
 * POST /api/auth/login
 * 
 * Authenticate user with email and password.
 * Rate limited to 5 attempts per 15 minutes.
 * 
 * @param {string} email - User email address
 * @param {string} password - User password (minimum 6 characters)
 * 
 * @returns {Object} 200 - User object with session
 * @returns {Object} 401 - Invalid credentials
 * @returns {Object} 429 - Too many login attempts
 * @returns {Object} 500 - Server error
 * 
 * @example
 * POST /api/auth/login
 * {
 *   "email": "admin@trosheen.shop",
 *   "password": "securepassword"
 * }
 */
authRouter.post(
  '/login',
  rateLimiter({ maxRequests: 5, windowMs: 15 * 60 * 1000 }),
  validateRequest(loginSchema),
  (req, res, next) => {
    passport.authenticate('local', (err: Error | null, user: Express.User | false, info: { message?: string } | undefined) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ 
          message: info?.message || 'Invalid credentials' 
        });
      }

      req.logIn(user, (err) => {
        if (err) return next(err);
        
        res.json({
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
        });
      });
    })(req, res, next);
  }
);

/**
 * POST /api/auth/logout
 * 
 * Logout current user and destroy session.
 * 
 * @returns {Object} 200 - Logout success message
 * @returns {Object} 500 - Server error
 */
authRouter.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: 'Logged out successfully' });
  });
});

/**
 * GET /api/auth/me
 * 
 * Get current authenticated user information.
 * 
 * @returns {Object} 200 - Current user object
 * @returns {Object} 401 - Not authenticated
 */
authRouter.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  res.json({
    id: req.user.id,
    email: req.user.email,
    username: req.user.username,
    role: req.user.role,
    createdAt: req.user.createdAt,
  });
});