import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { siteConfig } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { HOMEPAGE_IMAGE_SLOTS, type HomepageImageSlot, type HomepageImages } from '../../shared/homepageMedia';
import { validateRequest } from '../middleware/validation';
import { adminAuthMiddleware } from '../middleware/auth';

export const siteConfigRouter = Router();

// Default site configuration
const DEFAULT_CONFIG = {
  contact: {
    email: 'hello@trosheen.crafts',
    phone: '+371 XXX XXXXX',
    address: 'Daugavpils, Latvia',
  },
  social: {
    facebook: 'https://facebook.com/trosheencrafts',
    instagram: 'https://instagram.com/trosheen.crafts',
    twitter: '',
    youtube: '',
    telegram: '',
  },
  businessHours: {
    monFri: '09:00 - 18:00',
    satSun: 'Family Time',
  },
  promotionalGallery: {
    heading: 'Featured Collections',
  },
};

// Helper to get config by key
async function getConfigByKey(key: string) {
  const [config] = await db
    .select()
    .from(siteConfig)
    .where(eq(siteConfig.key, key))
    .limit(1);
  return config;
}

// Helper to build full config from database entries
async function buildFullConfig() {
  const configs = await db.select().from(siteConfig);
  
  const result: Record<string, unknown> = {};
  for (const config of configs) {
    result[config.key] = config.value;
  }
  
  return {
    contact: result.contact || DEFAULT_CONFIG.contact,
    social: result.social || DEFAULT_CONFIG.social,
    businessHours: result.businessHours || DEFAULT_CONFIG.businessHours,
  };
}

// ==================== PUBLIC ROUTES ====================

/**
 * GET /api/site-config
 * Get all public site configuration
 */
siteConfigRouter.get('/', async (req, res, next) => {
  try {
    const fullConfig = await buildFullConfig();
    res.json(fullConfig);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/site-config/homepage-images
 * Public, only named slots; bundled images remain as fallbacks until migration.
 */
siteConfigRouter.get('/homepage-images', async (_req, res, next) => {
  try {
    const config = await getConfigByKey('homepageImages');
    const source = (config?.value || {}) as Record<string, unknown>;
    const images: HomepageImages = {};
    for (const { key } of HOMEPAGE_IMAGE_SLOTS) {
      if (typeof source[key] === 'string' && source[key]) images[key] = source[key];
    }
    res.setHeader('Cache-Control', 'no-store');
    res.json(images);
  } catch (error) {
    next(error);
  }
});

const homepageImageUpdateSchema = z.object({
  body: z.object({
    slot: z.enum(HOMEPAGE_IMAGE_SLOTS.map(({ key }) => key) as [HomepageImageSlot, ...HomepageImageSlot[]]),
    url: z.string().url().max(2048).nullable(),
  }).strict(),
});

function validR2ImageUrl(value: string): boolean {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl || publicUrl.includes('xxxxx')) return false;
  try {
    const base = new URL(publicUrl.replace(/\/+$/, '') + '/');
    const image = new URL(value);
    if (image.origin !== base.origin || image.username || image.password ||
        image.search || image.hash || !image.pathname.startsWith(base.pathname)) return false;
    const key = image.pathname.slice(base.pathname.length);
    return /^(homepage|images|gallery)\/[A-Za-z0-9/_-]+\.(webp|jpg|jpeg|png|gif)$/i.test(key);
  } catch {
    return false;
  }
}

/** Atomic JSONB patch: editing one image never overwrites other slots. */
siteConfigRouter.put(
  '/admin/homepage-images',
  adminAuthMiddleware,
  validateRequest(homepageImageUpdateSchema),
  async (req, res, next) => {
    try {
      const { slot, url } = req.body as { slot: HomepageImageSlot; url: string | null };
      if (url !== null && !validR2ImageUrl(url)) {
        return res.status(400).json({ message: 'Image must be a public URL from the configured Cloudflare R2 bucket.' });
      }
      const patch = { [slot]: url };
      const [record] = await db.insert(siteConfig)
        .values({ key: 'homepageImages', value: patch })
        .onConflictDoUpdate({
          target: siteConfig.key,
          set: {
            value: sql`COALESCE(${siteConfig.value}, '{}'::jsonb) || ${JSON.stringify(patch)}::jsonb`,
            updatedAt: new Date(),
          },
        })
        .returning();
      res.json({ slot, url, updatedAt: record.updatedAt });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/site-config/:key
 * Get specific configuration by key
 */
siteConfigRouter.get('/:key', async (req, res, next) => {
  try {
    const config = await getConfigByKey(req.params.key);
    
    if (!config) {
      // Return default if exists
      const defaultValue = DEFAULT_CONFIG[req.params.key as keyof typeof DEFAULT_CONFIG];
      if (defaultValue) {
        return res.json({ key: req.params.key, value: defaultValue });
      }
      return res.status(404).json({ message: 'Configuration not found' });
    }
    
    res.json(config);
  } catch (error) {
    next(error);
  }
});

// ==================== ADMIN ROUTES ====================

/**
 * PUT /api/site-config/admin/contact
 * Update contact information
 */
const updateContactSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

siteConfigRouter.put(
  '/admin/contact',
  adminAuthMiddleware,
  validateRequest(updateContactSchema),
  async (req, res, next) => {
    try {
      const existing = await getConfigByKey('contact');
      const currentValue = existing?.value as typeof DEFAULT_CONFIG.contact || DEFAULT_CONFIG.contact;
      const newValue = { ...currentValue, ...req.body };
      
      if (existing) {
        const [updated] = await db
          .update(siteConfig)
          .set({ value: newValue, updatedAt: new Date() })
          .where(eq(siteConfig.key, 'contact'))
          .returning();
        res.json(updated);
      } else {
        const [created] = await db
          .insert(siteConfig)
          .values({ key: 'contact', value: newValue })
          .returning();
        res.status(201).json(created);
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/site-config/admin/social
 * Update social media links
 */
const updateSocialSchema = z.object({
  body: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    telegram: z.string().url().optional().or(z.literal('')),
  }),
});

siteConfigRouter.put(
  '/admin/social',
  adminAuthMiddleware,
  validateRequest(updateSocialSchema),
  async (req, res, next) => {
    try {
      const existing = await getConfigByKey('social');
      const currentValue = existing?.value as typeof DEFAULT_CONFIG.social || DEFAULT_CONFIG.social;
      const newValue = { ...currentValue, ...req.body };
      
      if (existing) {
        const [updated] = await db
          .update(siteConfig)
          .set({ value: newValue, updatedAt: new Date() })
          .where(eq(siteConfig.key, 'social'))
          .returning();
        res.json(updated);
      } else {
        const [created] = await db
          .insert(siteConfig)
          .values({ key: 'social', value: newValue })
          .returning();
        res.status(201).json(created);
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/site-config/admin/business-hours
 * Update business hours
 */
const updateBusinessHoursSchema = z.object({
  body: z.object({
    monFri: z.string().optional(),
    satSun: z.string().optional(),
  }),
});

siteConfigRouter.put(
  '/admin/business-hours',
  adminAuthMiddleware,
  validateRequest(updateBusinessHoursSchema),
  async (req, res, next) => {
    try {
      const existing = await getConfigByKey('businessHours');
      const currentValue = existing?.value as typeof DEFAULT_CONFIG.businessHours || DEFAULT_CONFIG.businessHours;
      const newValue = { ...currentValue, ...req.body };
      
      if (existing) {
        const [updated] = await db
          .update(siteConfig)
          .set({ value: newValue, updatedAt: new Date() })
          .where(eq(siteConfig.key, 'businessHours'))
          .returning();
        res.json(updated);
      } else {
        const [created] = await db
          .insert(siteConfig)
          .values({ key: 'businessHours', value: newValue })
          .returning();
        res.status(201).json(created);
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/site-config/admin/promotional-gallery
 * Update promotional gallery settings
 */
const updatePromotionalGallerySchema = z.object({
  body: z.object({
    heading: z.string().optional(),
  }),
});

siteConfigRouter.put(
  '/admin/promotional-gallery',
  adminAuthMiddleware,
  validateRequest(updatePromotionalGallerySchema),
  async (req, res, next) => {
    try {
      const key = 'promotionalGallery';
      const existing = await getConfigByKey(key);
      const currentValue = existing?.value as { heading: string } || { heading: 'Featured Collections' };
      const newValue = { ...currentValue, ...req.body };
      
      if (existing) {
        const [updated] = await db
          .update(siteConfig)
          .set({ value: newValue, updatedAt: new Date() })
          .where(eq(siteConfig.key, key))
          .returning();
        res.json(updated);
      } else {
        const [created] = await db
          .insert(siteConfig)
          .values({ key, value: newValue })
          .returning();
        res.status(201).json(created);
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/site-config/admin/all
 * Get all configuration (admin only)
 */
siteConfigRouter.get('/admin/all', adminAuthMiddleware, async (req, res, next) => {
  try {
    const fullConfig = await buildFullConfig();
    res.json(fullConfig);
  } catch (error) {
    next(error);
  }
});

export default siteConfigRouter;
