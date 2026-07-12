import { Router } from 'express';
import { productsRouter } from './products';
import { ordersRouter } from './orders';
import { authRouter } from './auth';
import { contactRouter } from './contact';
import { uploadsRouter } from './uploads';
import { blogRouter } from './blog';
import { galleryRouter } from './gallery';
import { adminRouter } from './admin';
import { checkoutRouter } from './checkout';
import categoriesRouter from './categories';
import { analyticsRouter } from './analytics';
import { settingsRouter } from './settings';
import { inventoryRouter } from './inventory';
import siteConfigRouter from './siteConfig';
import newsletterRouter from './newsletter';
import promotionsRouter from './promotions';

export const createApiRouter = (): Router => {
  const router = Router();

  // Public routes
  router.use('/products', productsRouter);
  router.use('/orders', ordersRouter);
  router.use('/auth', authRouter);
  router.use('/contact', contactRouter);
  router.use('/newsletter', newsletterRouter);
  router.use('/blog', blogRouter);
  router.use('/gallery', galleryRouter);
  router.use('/promotions', promotionsRouter);
  router.use('/checkout', checkoutRouter);
  router.use('/categories', categoriesRouter);
  router.use('/site-config', siteConfigRouter);

  // Admin routes
  router.use('/admin', adminRouter);
  router.use('/analytics', analyticsRouter);
  router.use('/settings', settingsRouter);
  router.use('/inventory', inventoryRouter);
  router.use('/uploads', uploadsRouter);

  // Health check
  router.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  return router;
};