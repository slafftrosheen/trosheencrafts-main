import { Router } from "express";
import { db } from "../db";
import { products, orders, orderItems, contactSubmissions } from "../db/schema";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { adminAuthMiddleware } from "../middleware/auth";

export const analyticsRouter = Router();

const REVENUE_STATUSES = ["processing", "shipped", "delivered"];

analyticsRouter.get("/dashboard", adminAuthMiddleware, async (_req, res, next) => {
  try {
    const [productsCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(products);

    const [ordersCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(orders);

    const [revenueData] = await db
      .select({ total: sql<string>`coalesce(sum(total_amount), 0)` })
      .from(orders)
      .where(inArray(orders.status, REVENUE_STATUSES));

    const [pendingCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(orders)
      .where(eq(orders.status, "pending"));

    const [lowStockCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(products)
      .where(sql`stock < 5 AND stock > 0`);

    const [outOfStockCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(products)
      .where(eq(products.stock, 0));

    const [unreadMessages] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.status, "new"));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentOrdersCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(orders)
      .where(gte(orders.createdAt, sevenDaysAgo));

    res.json({
      totalProducts: productsCount.count,
      totalOrders: ordersCount.count,
      totalRevenue: Number(revenueData.total || 0),
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

analyticsRouter.get("/sales", adminAuthMiddleware, async (req, res, next) => {
  try {
    const period = String(req.query.period || "30d");
    const daysByPeriod: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "365d": 365,
    };
    const daysBack = daysByPeriod[period] || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const salesData = await db
      .select({
        date: sql<string>`DATE(created_at)`,
        revenue: sql<string>`coalesce(sum(total_amount), 0)`,
        orders: sql<number>`cast(count(*) as int)`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDate),
          inArray(orders.status, REVENUE_STATUSES)
        )
      )
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    res.json(
      salesData.map((entry) => ({
        date: entry.date,
        revenue: Number(entry.revenue || 0),
        orders: entry.orders,
      }))
    );
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get("/top-products", adminAuthMiddleware, async (req, res, next) => {
  try {
    const requestedLimit = Number.parseInt(String(req.query.limit || "10"), 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 10;

    const topProducts = await db
      .select({
        productId: orderItems.productId,
        productName: products.name,
        totalQuantity: sql<number>`cast(sum(${orderItems.quantity}) as int)`,
        totalRevenue: sql<string>`coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0)`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orders.status, REVENUE_STATUSES))
      .groupBy(orderItems.productId, products.name)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(limit);

    res.json(
      topProducts.map((product) => ({
        productId: product.productId,
        productName: product.productName || "Удалённый товар",
        totalQuantity: product.totalQuantity,
        totalRevenue: Number(product.totalRevenue || 0),
      }))
    );
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get("/categories", adminAuthMiddleware, async (_req, res, next) => {
  try {
    const categorySales = await db
      .select({
        category: products.category,
        revenue: sql<string>`coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0)`,
        orders: sql<number>`cast(count(DISTINCT ${orderItems.orderId}) as int)`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orders.status, REVENUE_STATUSES))
      .groupBy(products.category)
      .orderBy(desc(sql`sum(${orderItems.price} * ${orderItems.quantity})`));

    res.json(
      categorySales.map((category) => ({
        category: category.category || "Без категории",
        revenue: Number(category.revenue || 0),
        orders: category.orders,
      }))
    );
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get("/recent-activity", adminAuthMiddleware, async (_req, res, next) => {
  try {
    const recentOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        amount: orders.totalAmount,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(6);

    const recentMessages = await db
      .select({
        id: contactSubmissions.id,
        status: contactSubmissions.status,
        name: contactSubmissions.name,
        subject: contactSubmissions.subject,
        createdAt: contactSubmissions.createdAt,
      })
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt))
      .limit(6);

    const orderStatusLabels: Record<string, string> = {
      pending: "ожидает",
      processing: "в обработке",
      shipped: "отправлен",
      delivered: "доставлен",
      cancelled: "отменён",
    };

    const activity = [
      ...recentOrders.map((order) => ({
        id: "order-" + order.id,
        entityId: order.id,
        type: "order" as const,
        description: `Заказ #${order.id} · ${orderStatusLabels[order.status] || order.status}`,
        amount: Number(order.amount),
        createdAt: order.createdAt,
      })),
      ...recentMessages.map((message) => ({
        id: "message-" + message.id,
        entityId: message.id,
        type: "message" as const,
        description: message.subject || `Сообщение от ${message.name}`,
        status: message.status,
        createdAt: message.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    res.json(activity);
  } catch (error) {
    next(error);
  }
});
