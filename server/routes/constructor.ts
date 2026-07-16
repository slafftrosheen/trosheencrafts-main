import { Router } from 'express';
import { db } from '../db';
import { constructorOptions } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { adminAuthMiddleware } from '../middleware/auth';

export const constructorRouter = Router();

// GET /api/constructor - Public endpoint to get active options
constructorRouter.get('/', async (req, res) => {
  try {
    const options = await db
      .select()
      .from(constructorOptions)
      .where(eq(constructorOptions.active, true))
      .orderBy(asc(constructorOptions.sortOrder));
    
    // Group by type for easy consumption
    const grouped = options.reduce((acc, opt) => {
      if (!acc[opt.type]) acc[opt.type] = [];
      acc[opt.type].push(opt);
      return acc;
    }, {} as Record<string, typeof options>);

    res.json(grouped);
  } catch (error) {
    console.error('Failed to fetch constructor options:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes
// GET all options (including inactive)
constructorRouter.get('/admin', adminAuthMiddleware, async (req, res) => {
  try {
    const options = await db
      .select()
      .from(constructorOptions)
      .orderBy(asc(constructorOptions.type), asc(constructorOptions.sortOrder));
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST new option
constructorRouter.post('/admin', adminAuthMiddleware, async (req, res) => {
  try {
    const newOption = await db.insert(constructorOptions).values(req.body).returning();
    res.json(newOption[0]);
  } catch (error) {
    console.error('Failed to create option:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update option
constructorRouter.put('/admin/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db
      .update(constructorOptions)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(constructorOptions.id, id))
      .returning();
    
    if (!updated.length) return res.status(404).json({ message: 'Option not found' });
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE option
constructorRouter.delete('/admin/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await db.delete(constructorOptions).where(eq(constructorOptions.id, id)).returning();
    if (!deleted.length) return res.status(404).json({ message: 'Option not found' });
    res.json({ message: 'Option deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
