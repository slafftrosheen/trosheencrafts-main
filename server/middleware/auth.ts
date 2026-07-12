import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const user = req.user as any;
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  next();
}
