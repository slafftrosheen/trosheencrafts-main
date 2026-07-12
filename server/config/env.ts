import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Support both 5000 (new default) and 3000 (legacy) - prefer 5000
  PORT: z.string().default(process.env.PORT || '5000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),
  SESSION_SECRET: z.string(),
  // Stripe is the only external service
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  // Email configuration (local SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:5000'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    process.exit(1);
  }
}

export const env = validateEnv();
