import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { newsletterSubscribers } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import rateLimit from 'express-rate-limit';
import { adminAuthMiddleware } from '../middleware/auth';

const router = Router();


// Rate limiting for subscription endpoint
const subscribeLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many subscription attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema
const subscribeSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  source: z.string().optional().default('website'),
  preferences: z.object({
    marketing: z.boolean().optional().default(true),
    productUpdates: z.boolean().optional().default(true),
    blogUpdates: z.boolean().optional().default(true),
  }).optional(),
});

// Subscribe endpoint
router.post('/subscribe', subscribeLimit, async (req: Request, res: Response) => {
  try {
    const validation = subscribeSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.errors[0].message,
      });
    }

    const { email, source, preferences } = validation.data;
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';

    // Check if email already exists
    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      const subscriber = existing[0];
      
      // If previously unsubscribed, reactivate
      if (!subscriber.isActive) {
        await db
          .update(newsletterSubscribers)
          .set({
            isActive: true,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            preferences: preferences || subscriber.preferences,
            ipAddress,
            userAgent,
          })
          .where(eq(newsletterSubscribers.id, subscriber.id));

        return res.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
          reactivated: true,
        });
      }

      return res.status(409).json({
        success: false,
        message: 'This email is already subscribed to our newsletter.',
      });
    }

    // Create new subscription
    const [newSubscriber] = await db
      .insert(newsletterSubscribers)
      .values({
        email: email.toLowerCase(),
        source,
        ipAddress,
        userAgent,
        preferences: preferences || { marketing: true, productUpdates: true, blogUpdates: true },
      })
      .returning();

    // TODO: Send welcome email via nodemailer
    // await sendWelcomeEmail(email);

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! Check your email for confirmation.',
      subscriber: {
        id: newSubscriber.id,
        email: newSubscriber.email,
        subscribedAt: newSubscriber.subscribedAt,
      },
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to process subscription. Please try again later.',
    });
  }
});

// Unsubscribe endpoint
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const result = await db
      .update(newsletterSubscribers)
      .set({
        isActive: false,
        unsubscribedAt: new Date(),
      })
      .where(and(
        eq(newsletterSubscribers.email, email.toLowerCase()),
        eq(newsletterSubscribers.isActive, true)
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our subscription list.',
      });
    }

    res.json({
      success: true,
      message: 'You have been successfully unsubscribed.',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to process unsubscription. Please try again later.',
    });
  }
});

// Admin: Get all subscribers (protected route)
router.get('/subscribers', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const subscribers = await db
      .select()
      .from(newsletterSubscribers)
      .orderBy(desc(newsletterSubscribers.subscribedAt))
      .limit(limit)
      .offset(offset);

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(newsletterSubscribers);
    const count = Number(result[0]?.count) || 0;

    res.json({
      subscribers,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch subscribers',
    });
  }
});

export default router;
