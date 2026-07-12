import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
  }>;
}

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

class EmailService {
  private transporter: Transporter;
  private retryQueue: Map<string, { options: EmailOptions; retries: number }> = new Map();

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true, // Use connection pooling
      maxConnections: 5,
      maxMessages: 100,
    });

    // Handle transport errors
    this.transporter.on('error', (error) => {
      console.error('❌ Email transporter error:', error);
    });
  }

  async send(options: EmailOptions, retryOpts: RetryOptions = {}): Promise<void> {
    const { maxRetries = 3, retryDelay = 2000 } = retryOpts;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const info = await this.transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Trosheen Crafts" <noreply@trosheen.shop>',
          to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
          subject: options.subject,
          text: options.text,
          html: this.sanitizeHtml(options.html || ''),
          attachments: options.attachments,
        });

        console.log(`✅ Email sent (attempt ${attempt}/${maxRetries}):`, info.messageId);
        return; // Success - exit function
      } catch (error: any) {
        lastError = error;
        console.error(`❌ Email sending failed (attempt ${attempt}/${maxRetries}):`, {
          to: options.to,
          subject: options.subject,
          error: error.message,
        });

        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt)); // Exponential backoff
        }
      }
    }

    // All retries exhausted
    console.error('❌ Email sending failed after all retries:', lastError);
    throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Sanitize HTML content to prevent email injection
   */
  private sanitizeHtml(html: string): string {
    // Basic HTML escaping for user-generated content
    // This is already handled by the email library, but we add extra safety
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, ''); // Remove inline event handlers
  }

  /**
   * Send email without throwing on failure (fire and forget with retry)
   */
  async sendSafe(options: EmailOptions, retryOpts?: RetryOptions): Promise<boolean> {
    try {
      await this.send(options, retryOpts);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed (safe mode):', error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error: any) {
      console.error('❌ Email service verification failed:', error.message);
      return false;
    }
  }

  /**
   * Close the transporter connection
   */
  async close(): Promise<void> {
    this.transporter.close();
    console.log('🔌 Email service closed');
  }
}

export const emailService = new EmailService();
export const sendEmail = (options: EmailOptions, retryOpts?: RetryOptions) => emailService.send(options, retryOpts);
export const sendEmailSafe = (options: EmailOptions, retryOpts?: RetryOptions) => emailService.sendSafe(options, retryOpts);
