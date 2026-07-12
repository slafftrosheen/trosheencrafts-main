import { Router } from 'express';
import { db } from '../db';
import { promotions } from '../db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { adminAuthMiddleware as requireAdmin } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Public: Get active promotions
router.get('/', async (req, res, next) => {
  try {
    const items = await db.query.promotions.findMany({
      where: eq(promotions.active, true),
      orderBy: [asc(promotions.sortOrder), desc(promotions.createdAt)],
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Admin: Get all promotions
router.get('/all', requireAdmin, async (req, res, next) => {
  try {
    const items = await db.query.promotions.findMany({
      orderBy: [asc(promotions.sortOrder), desc(promotions.createdAt)],
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

const promotionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().min(1),
  videoUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  linkText: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

// Admin: Create
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const data = promotionSchema.parse(req.body);
    const [item] = await db.insert(promotions).values(data).returning();
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// Admin: Update
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = promotionSchema.partial().parse(req.body);
    const [item] = await db
      .update(promotions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(promotions.id, id))
      .returning();
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// Admin: Delete
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(promotions).where(eq(promotions.id, id));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
