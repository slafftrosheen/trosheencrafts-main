import { Router } from 'express';
import { db } from '../db';
import { products, orders, orderItems, contactSubmissions, blogPosts } from '../db/schema';
import { sql, eq, gte, desc } from 'drizzle-orm';
import { adminAuthMiddleware } from '../middleware/auth';

export const analyticsRouter = Router();

/**
 * GET /api/analytics/dashboard
 * 
 * Get dashboard statistics
 */
analyticsRouter.get('/dashboard', adminAuthMiddleware, async (req, res, next) => {
  try {
    // Get total products
    const [productsCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(products);

    // Get total orders
    const [ordersCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(orders);

    // Get total revenue
    const [revenueData] = await db
      .select({ 
        total: sql<string>`coalesce(sum(total_amount), 0)` 
      })
      .from(orders)
      .where(eq(orders.status, 'completed'));

    // Get pending orders
    const [pendingCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(orders)
      .where(eq(orders.status, 'pending'));

    // Get low stock products (< 5)
    const [lowStockCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(products)
      .where(sql`stock < 5 AND stock > 0`);

    // Get out of stock products
    const [outOfStockCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(products)
      .where(eq(products.stock, 0));

    // Get unread messages
    const [unreadMessages] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.status, 'new'));

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [recentOrdersCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(orders)
      .where(gte(orders.createdAt, sevenDaysAgo));

    res.json({
      totalProducts: productsCount.count,
      totalOrders: ordersCount.count,
      totalRevenue: parseFloat(revenueData.total),
      pendingOrders: pendingCount.count,
      lowStockProducts: lowStockCount.count,
      outOfStockProducts: outOfStockCount.count,
      unreadMessages: unreadMessages.count,
      recentOrders: recentOrdersCount.count,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/sales
 * 
 * Get sales data over time
 */
analyticsRouter.get('/sales', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    let daysBack = 30;
    if (period === '7d') daysBack = 7;
    if (period === '90d') daysBack = 90;
    if (period === '365d') daysBack = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get daily sales
    const salesData = await db
      .select({
        date: sql<string>`DATE(created_at)`,
        revenue: sql<string>`coalesce(sum(total_amount), 0)`,
        orders: sql<number>`cast(count(*) as int)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, startDate))
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    res.json(salesData.map(s => ({
      date: s.date,
      revenue: parseFloat(s.revenue),
      orders: s.orders,
    })));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/top-products
 * 
 * Get best selling products
 */
analyticsRouter.get('/top-products', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { limit = '10' } = req.query;

    const topProducts = await db
      .select({
        productId: orderItems.productId,
        productName: products.name,
        totalQuantity: sql<number>`cast(sum(${orderItems.quantity}) as int)`,
        totalRevenue: sql<string>`coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0)`,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .groupBy(orderItems.productId, products.name)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(parseInt(limit as string));

    res.json(topProducts.map(p => ({
      productId: p.productId,
      productName: p.productName,
      totalQuantity: p.totalQuantity,
      totalRevenue: parseFloat(p.totalRevenue),
    })));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/categories
 * 
 * Get sales by category
 */
analyticsRouter.get('/categories', adminAuthMiddleware, async (req, res, next) => {
  try {
    const categorySales = await db
      .select({
        category: products.category,
        revenue: sql<string>`coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0)`,
        orders: sql<number>`cast(count(DISTINCT ${orderItems.orderId}) as int)`,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .groupBy(products.category)
      .orderBy(desc(sql`sum(${orderItems.price} * ${orderItems.quantity})`));

    res.json(categorySales.map(c => ({
      category: c.category || 'Uncategorized',
      revenue: parseFloat(c.revenue),
      orders: c.orders,
    })));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/recent-activity
 * 
 * Get recent system activity
 */
analyticsRouter.get('/recent-activity', adminAuthMiddleware, async (req, res, next) => {
  try {
    // Get recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        amount: orders.totalAmount,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    // Get recent messages
    const recentMessages = await db
      .select({
        id: contactSubmissions.id,
        status: contactSubmissions.status,
        name: contactSubmissions.name,
        createdAt: contactSubmissions.createdAt,
      })
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt))
      .limit(5);

    // Combine and sort
    const allActivity = [
      ...recentOrders.map(o => ({
        id: o.id,
        type: 'order' as const,
        description: `Order #${o.id} - ${o.status}`,
        amount: parseFloat(o.amount),
        createdAt: o.createdAt,
      })),
      ...recentMessages.map(m => ({
        id: m.id,
        type: 'message' as const,
        description: `Message from ${m.name}`,
        status: m.status,
        createdAt: m.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);

    res.json(allActivity);
  } catch (error) {
    next(error);
  }
});
