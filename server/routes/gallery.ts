import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { galleryCategories, galleryItems } from '../db/schema';
import { eq, desc, sql, and, ilike } from 'drizzle-orm';
import { validateRequest } from '../middleware/validation';
import { adminAuthMiddleware } from '../middleware/auth';

export const galleryRouter = Router();

// ==================== PUBLIC ROUTES ====================

// Get all categories
galleryRouter.get('/categories', async (req, res, next) => {
  try {
    const { type } = req.query;
    let query = db
      .select()
      .from(galleryCategories)
      .orderBy(galleryCategories.sortOrder, desc(galleryCategories.createdAt));

    if (type) {
      query = query.where(eq(galleryCategories.type, type as string)) as any;
    }

    const categories = await query;
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Get all gallery items (with filters)
const getGalleryItemsSchema = z.object({
  query: z.object({
    type: z.enum(['3d', 'photo']).optional(),
    categoryId: z.coerce.number().optional(),
    featured: z.coerce.boolean().optional(),
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
  }),
});

galleryRouter.get(
  '/items',
  validateRequest(getGalleryItemsSchema),
  async (req, res, next) => {
    try {
      const { type, categoryId, featured, search, limit, offset } = req.query as any;

      let conditions = [eq(galleryItems.published, true)];
      
      if (type) conditions.push(eq(galleryItems.type, type));
      if (categoryId) conditions.push(eq(galleryItems.categoryId, parseInt(categoryId)));
      if (featured) conditions.push(eq(galleryItems.featured, true));
      if (search) conditions.push(ilike(galleryItems.title, `%${search}%`));

      const items = await db
        .select()
        .from(galleryItems)
        .where(and(...conditions))
        .orderBy(galleryItems.sortOrder, desc(galleryItems.createdAt))
        .limit(limit)
        .offset(offset);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(galleryItems)
        .where(and(...conditions));

      res.json({
        items,
        total: total[0].count,
        limit,
        offset,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single gallery item
galleryRouter.get('/items/:slug', async (req, res, next) => {
  try {
    const [item] = await db
      .select()
      .from(galleryItems)
      .where(and(
        eq(galleryItems.slug, req.params.slug),
        eq(galleryItems.published, true)
      ))
      .limit(1);

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Increment view count
    await db
      .update(galleryItems)
      .set({ viewCount: sql`${galleryItems.viewCount} + 1` })
      .where(eq(galleryItems.id, item.id));

    res.json(item);
  } catch (error) {
    next(error);
  }
});

// Like a gallery item
galleryRouter.post('/items/:id/like', async (req, res, next) => {
  try {
    const [item] = await db
      .update(galleryItems)
      .set({ likes: sql`${galleryItems.likes} + 1` })
      .where(eq(galleryItems.id, parseInt(req.params.id as string)))
      .returning();

    res.json({ likes: item.likes });
  } catch (error) {
    next(error);
  }
});

// ==================== ADMIN ROUTES ====================

// Get all categories (including unpublished)
galleryRouter.get('/admin/categories', adminAuthMiddleware, async (req, res, next) => {
  try {
    const categories = await db
      .select()
      .from(galleryCategories)
      .orderBy(galleryCategories.sortOrder, desc(galleryCategories.createdAt));
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Create category
const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(['3d', 'photo']),
    featured: z.boolean().default(false),
    sortOrder: z.number().default(0),
  }),
});

galleryRouter.post(
  '/admin/categories',
  adminAuthMiddleware,
  validateRequest(createCategorySchema),
  async (req, res, next) => {
    try {
      const [category] = await db.insert(galleryCategories).values(req.body).returning();
      res.status(201).json(category);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(400).json({ message: 'Category with this slug already exists' });
      }
      next(error);
    }
  }
);

// Update category
galleryRouter.put(
  '/admin/categories/:id',
  adminAuthMiddleware,
  validateRequest(createCategorySchema),
  async (req, res, next) => {
    try {
      const [category] = await db
        .update(galleryCategories)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(galleryCategories.id, parseInt(req.params.id as string)))
        .returning();

      if (!category) return res.status(404).json({ message: 'Not found' });
      res.json(category);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(400).json({ message: 'Category with this slug already exists' });
      }
      next(error);
    }
  }
);

// Delete category
galleryRouter.delete('/admin/categories/:id', adminAuthMiddleware, async (req, res, next) => {
  try {
    await db.delete(galleryCategories).where(eq(galleryCategories.id, parseInt(req.params.id as string)));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Get all items (admin)
galleryRouter.get('/admin/items', adminAuthMiddleware, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const items = await db
      .select()
      .from(galleryItems)
      .orderBy(galleryItems.sortOrder, desc(galleryItems.createdAt))
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(galleryItems);

    res.json({
      items,
      total: total[0].count,
      limit,
      offset
    });
  } catch (error) {
    next(error);
  }
});

// Create gallery item
const createItemSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    categoryId: z.number().nullable().optional(),
    type: z.enum(['3d', 'photo']),
    mediaUrl: z.string().min(1),
    thumbnailUrl: z.string().min(1).optional(),
    metadata: z.any().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    sortOrder: z.number().default(0),
  }),
});

const batchCreateItemSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      categoryId: z.number().nullable().optional(),
      type: z.literal('photo'),
      mediaUrl: z.string().min(1),
      thumbnailUrl: z.string().min(1).optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      published: z.boolean().default(true),
      sortOrder: z.number().default(0),
    })),
    autoName: z.boolean().optional().default(true),
  }),
});

galleryRouter.post(
  '/admin/items',
  adminAuthMiddleware,
  validateRequest(createItemSchema),
  async (req, res, next) => {
    try {
      const [item] = await db.insert(galleryItems).values(req.body).returning();
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }
);

galleryRouter.post(
  '/admin/items/batch',
  adminAuthMiddleware,
  validateRequest(batchCreateItemSchema),
  async (req, res, next) => {
    try {
      const { items, autoName } = req.body;
      
      if (autoName && items.length > 0) {
        const categoryId = items[0].categoryId;
        let prefix = 'Gallery Item';
        
        if (categoryId) {
          const [cat] = await db.select().from(galleryCategories).where(eq(galleryCategories.id, categoryId)).limit(1);
          if (cat) prefix = cat.name;
        }

        // Get current count for this category to continue numbering
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(galleryItems)
          .where(categoryId ? eq(galleryItems.categoryId, categoryId) : sql`${galleryItems.categoryId} IS NULL`);
        
        const startCount = Number(count);

        // Process items with new titles and slugs
        const processedItems = items.map((item: any, index: number) => {
          const num = startCount + index + 1;
          const title = `${prefix} ${num}`;
          const slug = `${prefix.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${num}-${Math.random().toString(36).substring(7)}`;
          return { ...item, title, slug };
        });

        const inserted = await db.insert(galleryItems).values(processedItems).returning();
        return res.status(201).json(inserted);
      }

      const inserted = await db.insert(galleryItems).values(items).returning();
      res.status(201).json(inserted);
    } catch (error) {
      next(error);
    }
  }
);

const batchUpdateItemSchema = z.object({
  body: z.object({
    ids: z.array(z.number()),
    updates: z.object({
      categoryId: z.number().nullable().optional(),
      published: z.boolean().optional(),
      featured: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      sortOrder: z.number().optional(),
      regenerateSlugs: z.boolean().optional(),
    }),
  }),
});

galleryRouter.patch(
  '/admin/items/batch',
  adminAuthMiddleware,
  validateRequest(batchUpdateItemSchema),
  async (req, res, next) => {
    try {
      const { ids, updates } = req.body;
      const { regenerateSlugs, ...data } = updates;

      if (regenerateSlugs) {
        const results = [];
        for (const id of ids) {
          const [item] = await db.select().from(galleryItems).where(eq(galleryItems.id, id)).limit(1);
          if (item) {
            const newSlug = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(7)}`;
            const [updated] = await db
              .update(galleryItems)
              .set({ ...data, slug: newSlug, updatedAt: new Date() })
              .where(eq(galleryItems.id, id))
              .returning();
            results.push(updated);
          }
        }
        return res.json(results);
      }

      const updated = await db
        .update(galleryItems)
        .set({ ...data, updatedAt: new Date() })
        .where(sql`${galleryItems.id} IN (${sql.join(ids, sql`, `)})`)
        .returning();

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// Update gallery item
galleryRouter.put(
  '/admin/items/:id',
  adminAuthMiddleware,
  validateRequest(createItemSchema),
  async (req, res, next) => {
    try {
      const [item] = await db
        .update(galleryItems)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(galleryItems.id, parseInt(req.params.id as string)))
        .returning();

      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    } catch (error) {
      next(error);
    }
  }
);

// Delete gallery item
galleryRouter.delete('/admin/items/:id', adminAuthMiddleware, async (req, res, next) => {
  try {
    await db.delete(galleryItems).where(eq(galleryItems.id, parseInt(req.params.id as string)));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default galleryRouter;