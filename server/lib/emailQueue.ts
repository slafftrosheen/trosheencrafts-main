/**
 * Email Queue Service
 * 
 * This module provides email queueing functionality with retry support.
 * Note: Uses in-memory queue for simplicity. For production with high volume,
 * consider a persistent queue like Redis or a database-backed solution.
 */

export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

interface QueuedEmail extends EmailData {
  id: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  createdAt: Date;
  sentAt?: Date;
  lastError?: string;
}

// In-memory queue for simplicity
const emailQueue: Map<string, QueuedEmail> = new Map();

/**
 * Generate a unique ID for queued emails
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add an email to the queue
 */
export async function queueEmail(data: EmailData): Promise<QueuedEmail> {
  const id = generateId();
  const queuedEmail: QueuedEmail = {
    ...data,
    id,
    status: 'pending',
    attempts: 0,
    createdAt: new Date(),
    from: data.from || 'noreply@trosheencrafts.lv',
  };

  emailQueue.set(id, queuedEmail);
  console.log(`📧 Email queued: ${id} -> ${data.to}`);
  return queuedEmail;
}

/**
 * Get queued emails by status
 */
export async function getQueuedEmails(status: 'pending' | 'sent' | 'failed' = 'pending'): Promise<QueuedEmail[]> {
  return Array.from(emailQueue.values()).filter(email => email.status === status);
}

/**
 * Mark an email as sent
 */
export async function markEmailSent(id: string): Promise<boolean> {
  const email = emailQueue.get(id);
  if (email) {
    email.status = 'sent';
    email.sentAt = new Date();
    console.log(`✅ Email marked as sent: ${id}`);
    return true;
  }
  return false;
}

/**
 * Mark an email as failed
 */
export async function markEmailFailed(id: string, error: string): Promise<boolean> {
  const email = emailQueue.get(id);
  if (email) {
    email.attempts++;
    email.lastError = error;
    if (email.attempts >= 3) {
      email.status = 'failed';
      console.error(`❌ Email permanently failed: ${id} after ${email.attempts} attempts`);
    }
    return true;
  }
  return false;
}

/**
 * Get a specific email from the queue
 */
export async function getQueuedEmail(id: string): Promise<QueuedEmail | undefined> {
  return emailQueue.get(id);
}

/**
 * Remove sent emails older than the specified duration (cleanup)
 */
export async function cleanupQueue(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<number> {
  const now = Date.now();
  let removed = 0;
  
  const entries = Array.from(emailQueue.entries());
  for (const [id, email] of entries) {
    if (email.status === 'sent' && email.sentAt && (now - email.sentAt.getTime() > maxAgeMs)) {
      emailQueue.delete(id);
      removed++;
    }
  }
  
  if (removed > 0) {
    console.log(`🧹 Cleaned up ${removed} sent emails from queue`);
  }
  
  return removed;
}
