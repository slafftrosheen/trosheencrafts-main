import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { contactSubmissions, siteConfig } from "../db/schema";
import { validateRequest } from "../middleware/validation";
import { rateLimiter } from "../middleware/rateLimiter";
import { sendEmail, sendEmailSafe } from "../lib/email";
import { adminAuthMiddleware } from "../middleware/auth";
import { desc, eq } from "drizzle-orm";

export const contactRouter = Router();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

async function getAdminEmail() {
  const [config] = await db
    .select()
    .from(siteConfig)
    .where(eq(siteConfig.key, "contact"))
    .limit(1);

  return (config?.value as any)?.email || process.env.ADMIN_EMAIL || "info@trosheen.shop";
}

contactRouter.get("/admin/all", adminAuthMiddleware, async (_req, res, next) => {
  try {
    const data = await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

contactRouter.patch("/:id/status", adminAuthMiddleware, async (req, res, next) => {
  try {
    const [item] = await db
      .update(contactSubmissions)
      .set({ status: req.body.status })
      .where(eq(contactSubmissions.id, parseInt(req.params.id, 10)))
      .returning();

    res.json(item);
  } catch (error) {
    next(error);
  }
});

const withdrawalSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    orderNumber: z.string().trim().min(1).max(100),
    note: z.string().trim().max(1000).optional().default(""),
  }),
});

contactRouter.post(
  "/withdrawal",
  rateLimiter({ maxRequests: 5, windowMs: 60 * 60 * 1000 }),
  validateRequest(withdrawalSchema),
  async (req, res, next) => {
    try {
      const { name, email, orderNumber, note } = req.body;
      const submittedAt = new Date();
      const timestamp = submittedAt.toISOString();
      const statement =
        "Consumer withdrawal notice: I withdraw from the distance contract identified by order/contract reference " +
        orderNumber +
        ".";

      const [submission] = await db
        .insert(contactSubmissions)
        .values({
          name,
          email,
          subject: "Withdrawal request — " + orderNumber,
          message: [
            statement,
            "Order / contract reference: " + orderNumber,
            "Confirmation email: " + email,
            "Submitted at: " + timestamp,
            note ? "Additional note: " + note : "",
          ]
            .filter(Boolean)
            .join("\n"),
          status: "new",
        })
        .returning();

      const escapedName = escapeHtml(name);
      const escapedOrder = escapeHtml(orderNumber);
      const escapedStatement = escapeHtml(statement);
      const escapedNote = note ? escapeHtml(note).replace(/\n/g, "<br>") : "";

      const receiptHtml = [
        "<h2>Withdrawal request received</h2>",
        "<p>Hi " + escapedName + ",</p>",
        "<p>This email confirms that Trosheen.Crafts received your withdrawal notice.</p>",
        "<p><strong>Order / contract reference:</strong> " + escapedOrder + "</p>",
        "<p>" + escapedStatement + "</p>",
        escapedNote ? "<p><strong>Additional note:</strong><br>" + escapedNote + "</p>" : "",
        "<p><strong>Submitted at:</strong> " + timestamp + "</p>",
        "<p>Reference: " + submission.id + "</p>",
      ].join("");

      await sendEmail(
        {
          to: email,
          subject: "Withdrawal request received — " + orderNumber,
          text: [
            "Trosheen.Crafts — withdrawal acknowledgement",
            "",
            "Name: " + name,
            "Order / contract reference: " + orderNumber,
            statement,
            note ? "Additional note: " + note : "",
            "Submitted at: " + timestamp,
            "",
            "This email confirms that we received your withdrawal notice.",
          ]
            .filter(Boolean)
            .join("\n"),
          html: receiptHtml,
        },
        { maxRetries: 3, retryDelay: 1500 }
      );

      const adminEmail = await getAdminEmail();
      await sendEmailSafe(
        {
          to: adminEmail,
          subject: "Withdrawal request — " + orderNumber,
          text: [
            "New consumer withdrawal request",
            "Name: " + name,
            "Email: " + email,
            "Order / contract: " + orderNumber,
            statement,
            note ? "Additional note: " + note : "",
            "Submitted at: " + timestamp,
            "Submission ID: " + submission.id,
          ]
            .filter(Boolean)
            .join("\n"),
        },
        { maxRetries: 3, retryDelay: 1500 }
      );

      res.status(201).json({
        success: true,
        submissionId: submission.id,
        submittedAt: timestamp,
      });
    } catch (error) {
      next(error);
    }
  }
);

const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    subject: z.string().min(5).max(200),
    message: z.string().min(10).max(2000),
  }),
});

contactRouter.post(
  "/",
  rateLimiter({ maxRequests: 3, windowMs: 60 * 60 * 1000 }),
  validateRequest(contactSchema),
  async (req, res, next) => {
    try {
      const { name, email, subject, message } = req.body;

      const [submission] = await db
        .insert(contactSubmissions)
        .values({ name, email, subject, message, status: "new" })
        .returning();

      try {
        const adminEmail = await getAdminEmail();
        const escapedName = escapeHtml(name);
        const escapedEmail = escapeHtml(email);
        const escapedSubject = escapeHtml(subject);
        const escapedMessage = escapeHtml(message).replace(/\n/g, "<br>");

        await sendEmail(
          {
            to: adminEmail,
            subject: "New Contact Form: " + subject,
            html: [
              "<h2>New Contact Form Submission</h2>",
              "<p><strong>From:</strong> " + escapedName + " (" + escapedEmail + ")</p>",
              "<p><strong>Subject:</strong> " + escapedSubject + "</p>",
              "<p><strong>Message:</strong></p>",
              "<p>" + escapedMessage + "</p>",
              "<hr><p><small>Submission ID: " + submission.id + "</small></p>",
            ].join(""),
          },
          { maxRetries: 3, retryDelay: 2000 }
        );

        await sendEmail(
          {
            to: email,
            subject: "Thank you for contacting Trosheen.Crafts",
            html:
              "<h2>Thank you for your message</h2><p>Hi " +
              escapedName +
              ",</p><p>We've received your message and will get back to you as soon as possible.</p><p>Best regards,<br>Trosheen.Crafts</p>",
          },
          { maxRetries: 3, retryDelay: 2000 }
        );
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
      }

      res.status(201).json({
        success: true,
        message: "Thank you for your message. We will get back to you soon!",
      });
    } catch (error) {
      next(error);
    }
  }
);
