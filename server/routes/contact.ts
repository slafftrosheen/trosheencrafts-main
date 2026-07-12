import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { contactSubmissions, siteConfig } from '../db/schema';
import { validateRequest } from '../middleware/validation';
import { rateLimiter } from '../middleware/rateLimiter';
import { sendEmail } from '../lib/email';
import { adminAuthMiddleware } from '../middleware/auth';
import { desc, eq } from 'drizzle-orm';

export const contactRouter = Router();

contactRouter.get('/admin/all', adminAuthMiddleware, async (req, res, next) => {
  try {
    const data = await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

contactRouter.patch('/:id/status', adminAuthMiddleware, async (req, res, next) => {
  try {
    const [item] = await db
      .update(contactSubmissions)
      .set({ status: req.body.status })
      .where(eq(contactSubmissions.id, parseInt(req.params.id)))
      .returning();
    res.json(item);
  } catch (error) {
    next(error);
  }
});

const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    subject: z.string().min(5).max(200),
    message: z.string().min(10).max(2000),
  }),
});

contactRouter.post(
  '/',
  rateLimiter({ maxRequests: 3, windowMs: 60 * 60 * 1000 }),
  validateRequest(contactSchema),
  async (req, res, next) => {
    try {
      const { name, email, subject, message } = req.body;

      const [submission] = await db
        .insert(contactSubmissions)
        .values({
          name,
          email,
          subject,
          message,
          status: 'new',
        })
        .returning();

      try {
        // Fetch admin email from site config
        const [config] = await db
          .select()
          .from(siteConfig)
          .where(eq(siteConfig.key, 'contact'))
          .limit(1);
        
        const adminEmail = (config?.value as any)?.email || process.env.ADMIN_EMAIL || 'info@trosheen.shop';

        // HTML escape user input to prevent injection
        const escapeHtml = (str: string) => {
          return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        };

        const escapedName = escapeHtml(name);
        const escapedEmail = escapeHtml(email);
        const escapedSubject = escapeHtml(subject);
        const escapedMessage = escapeHtml(message).replace(/\n/g, '<br>');

        await sendEmail({
          to: adminEmail,
          subject: `New Contact Form: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${escapedName} (${escapedEmail})</p>
            <p><strong>Subject:</strong> ${escapedSubject}</p>
            <p><strong>Message:</strong></p>
            <p>${escapedMessage}</p>
            <hr>
            <p><small>Submission ID: ${submission.id}</small></p>
          `,
        }, { maxRetries: 3, retryDelay: 2000 });

        await sendEmail({
          to: email,
          subject: 'Thank you for contacting Trosheen Crafts',
          html: `
            <h2>Thank you for your message!</h2>
            <p>Hi ${escapedName},</p>
            <p>We've received your message and will get back to you as soon as possible.</p>
            <p>Best regards,<br>Trosheen Crafts Team</p>
          `,
        }, { maxRetries: 3, retryDelay: 2000 });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the request - contact was saved to database
      }

      res.status(201).json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon!'
      });
    } catch (error) {
      next(error);
    }
  }
);