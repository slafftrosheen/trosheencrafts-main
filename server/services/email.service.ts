import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  cc?: string | string[];
  bcc?: string | string[];
}

/**
 * Order item for email templates
 */
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

/**
 * Order data for email confirmations
 */
interface OrderData {
  id: number | string;
  total: number;
  items: OrderItem[];
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error(`❌ Email service configuration error: ${error.message}`);
  } else {
    console.log('✅ Email service is ready to send messages');
  }
});

/**
 * Send an email using the configured transporter
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER || process.env.VITE_CONTACT_EMAIL || 'noreply@trosheen.crafts',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    console.log(`📧 Message ID: ${info.messageId}`);

    return true;
  } catch (error) {
    console.error(`❌ Failed to send email: ${(error as Error).message}`);
    console.error('Email sending error:', error);
    return false;
  }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmation = async (to: string, order: OrderData): Promise<boolean> => {
  const html = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order! Your order #${order.id} has been confirmed.</p>
    <p>Total: €${order.total.toFixed(2)}</p>
    <h3>Items:</h3>
    <ul>
      ${order.items.map((item) => `
        <li>${item.name} - Qty: ${item.quantity} - €${item.price.toFixed(2)}</li>
      `).join('')}
    </ul>
  `;

  return sendEmail({
    to,
    subject: `Order Confirmation - #${order.id}`,
    html,
    text: `Thank you for your order! Your order #${order.id} has been confirmed.`
  });
};

export default transporter;