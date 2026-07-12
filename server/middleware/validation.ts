import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validateRequest(schema: z.ZodObject<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`🔍 Validating ${req.method} ${req.originalUrl}`);
      
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // In Express 5, req.query and req.params might be getters or non-writable.
      // We must be careful how we update them.
      
      if (validated.body) {
        req.body = validated.body;
      }
      
      if (validated.query) {
        try {
          // Attempt to merge into existing object first
          Object.assign(req.query, validated.query);
        } catch (e) {
          // If that fails, try defineProperty
          Object.defineProperty(req, 'query', {
            value: validated.query,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      
      if (validated.params) {
        try {
          Object.assign(req.params, validated.params);
        } catch (e) {
          Object.defineProperty(req, 'params', {
            value: validated.params,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('❌ Validation failed for', req.originalUrl, JSON.stringify(error.errors, null, 2));
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.reduce((acc, err) => {
            const path = err.path.join('.');
            if (!acc[path]) acc[path] = [];
            acc[path].push(err.message);
            return acc;
          }, {} as Record<string, string[]>),
        });
      }
      console.error('❌ Unexpected error during validation:', error);
      next(error);
    }
  };
}
