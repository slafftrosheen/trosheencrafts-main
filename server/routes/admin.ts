import { Router } from 'express';
import { db } from '../db';
import { products, orders, contactSubmissions, blogPosts } from '../db/schema';
import { count, eq } from 'drizzle-orm';
import { adminAuthMiddleware } from '../middleware/auth';

export const adminRouter = Router();

adminRouter.get('/stats', adminAuthMiddleware, async (req, res, next) => {
  try {
    const [productCount] = await db.select({ val: count() }).from(products);
    const [orderCount] = await db.select({ val: count() }).from(orders);
    const [messageCount] = await db.select({ val: count() }).from(contactSubmissions).where(eq(contactSubmissions.status, 'new'));
    const [postCount] = await db.select({ val: count() }).from(blogPosts);

    res.json({
      products: productCount.val,
      orders: orderCount.val,
      unreadMessages: messageCount.val,
      blogPosts: postCount.val,
    });
  } catch (error) {
    next(error);
  }
});
