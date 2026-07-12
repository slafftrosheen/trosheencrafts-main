import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { products } from '../db/schema';
import { sql, eq } from 'drizzle-orm';
import { validateRequest } from '../middleware/validation';
import { adminAuthMiddleware } from '../middleware/auth';

const router = Router();

/**
 * GET /api/categories
 * 
 * Get all unique categories with product counts
 */
router.get('/', async (req, res, next) => {
  try {
    // Get distinct categories with counts
    const categoriesResult = await db
      .select({
        category: products.category,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(products)
      .where(eq(products.published, true))
      .groupBy(products.category)
      .orderBy(products.category);

    // Format response
    const categories = categoriesResult
      .filter(c => c.category) // Filter out null categories
      .map(c => ({
        name: c.category!,
        slug: c.category!.toLowerCase().replace(/\s+/g, '-'),
        count: c.count,
      }));

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/categories/:slug
 * 
 * Get category details by slug
 */
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const categoryName = slug.replace(/-/g, ' ');

    const categoryProducts = await db
      .select()
      .from(products)
      .where(eq(products.category, categoryName));

    if (categoryProducts.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      name: categoryName,
      slug,
      count: categoryProducts.length,
      products: categoryProducts,
    });
  } catch (error) {
    next(error);
  }
});

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100).optional(),
  }),
});

/**
 * POST /api/categories
 * 
 * Create a new category (admin only)
 * Note: Categories are derived from products, this is for validation
 */
router.post(
  '/',
  adminAuthMiddleware,
  validateRequest(createCategorySchema),
  async (req, res, next) => {
    try {
      const { name, slug } = req.body;
      const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-');

      // Check if category exists (has products)
      const existing = await db
        .select()
        .from(products)
        .where(eq(products.category, name))
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({ 
          message: 'Category already exists' 
        });
      }

      res.status(201).json({
        name,
        slug: categorySlug,
        count: 0,
        message: 'Category created. Add products to this category to populate it.',
      });
    } catch (error) {
      next(error);
    }
  }
);

const updateCategorySchema = z.object({
  params: z.object({
    slug: z.string(),
  }),
  body: z.object({
    name: z.string().min(1).max(100),
  }),
});

/**
 * PUT /api/categories/:slug
 * 
 * Update category name (updates all products in that category)
 */
router.put(
  '/:slug',
  adminAuthMiddleware,
  validateRequest(updateCategorySchema),
  async (req, res, next) => {
    try {
      const { slug } = req.params;
      const { name: newName } = req.body;
      const oldName = slug.replace(/-/g, ' ');

      // Update all products in this category
      const result = await db
        .update(products)
        .set({ category: newName, updatedAt: new Date() })
        .where(eq(products.category, oldName))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json({
        name: newName,
        slug: newName.toLowerCase().replace(/\s+/g, '-'),
        productsUpdated: result.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/categories/:slug
 * 
 * Delete a category (sets products to uncategorized)
 */
router.delete(
  '/:slug',
  adminAuthMiddleware,
  async (req, res, next) => {
    try {
      const { slug } = req.params;
      const categoryName = slug.replace(/-/g, ' ');

      // Set products to null category
      const result = await db
        .update(products)
        .set({ category: null, updatedAt: new Date() })
        .where(eq(products.category, categoryName))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json({
        message: 'Category deleted',
        productsAffected: result.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
