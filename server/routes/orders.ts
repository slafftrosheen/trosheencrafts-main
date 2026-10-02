import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { orders } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { validateRequest } from "../middleware/validation";
import { adminAuthMiddleware, authMiddleware } from "../middleware/auth";

export const ordersRouter = Router();

ordersRouter.get("/", authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === "admin";

    let query = db.select().from(orders);

    if (!isAdmin) {
      query = query.where(eq(orders.userId, userId)) as any;
    }

    const userOrders = await query.orderBy(desc(orders.createdAt));
    res.json(userOrders);
  } catch (error) {
    next(error);
  }
});

const statusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  }),
});

ordersRouter.patch(
  "/:id/status",
  adminAuthMiddleware,
  validateRequest(statusSchema),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      const [updated] = await db
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);
