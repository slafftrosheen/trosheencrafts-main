import { Router, type Response } from 'express';
import { z } from 'zod';
import { adminAuthMiddleware } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import { sumupConfiguration, sumupPayments } from '../lib/sumup';
import { SumupError } from '../../shared/sumup';

export const sumupAdminRouter = Router();
sumupAdminRouter.use(adminAuthMiddleware);
sumupAdminRouter.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
const upstreamLimit = rateLimiter({ windowMs: 60000, maxRequests: 15, message: 'Слишком много проверок SumUp. Подождите минуту.' });
const version = z.number().int().min(0).max(2147483646);
const draft = z.object({
  expectedVersion: version, merchantCode: z.string().trim().min(4).max(32),
  apiKey: z.string().trim().max(512).optional(), siteUrl: z.string().trim().min(1).max(300),
  descriptionPrefix: z.string().trim().min(1).max(100),
}).strict();
function fail(res: Response, error: unknown) {
  if (error instanceof SumupError) return res.status(error.statusCode).json({ code: error.code, message: error.message });
  // No request bodies, raw provider errors or credentials in logs or error responses.
  console.error('SumUp admin operation failed');
  return res.status(500).json({ code: 'SUMUP_SETTINGS_ERROR', message: 'Не удалось обработать настройки SumUp. Проверьте БД и миграцию 0017.' });
}
sumupAdminRouter.get('/', async (_req, res) => {
  try { res.json(await sumupConfiguration.getSettings()); } catch (error) { fail(res, error); }
});
sumupAdminRouter.post('/check', upstreamLimit, async (req, res) => {
  const input = draft.safeParse(req.body);
  if (!input.success) return res.status(400).json({ message: 'Проверьте поля подключения SumUp.' });
  try { res.json(await sumupConfiguration.check(input.data)); } catch (error) { fail(res, error); }
});
sumupAdminRouter.put('/', upstreamLimit, async (req, res) => {
  const input = draft.safeParse(req.body);
  if (!input.success) return res.status(400).json({ message: 'Проверьте поля подключения SumUp.' });
  try { res.json(await sumupConfiguration.save(input.data, String(req.user?.id ?? ''))); }
  catch (error) { fail(res, error); }
});
sumupAdminRouter.patch('/enabled', (req, res, next) => {
  if (req.body?.enabled === true) return upstreamLimit(req, res, next);
  next();
}, async (req, res) => {
  const input = z.object({ enabled: z.boolean(), expectedVersion: version, confirm: z.literal(true) }).strict().safeParse(req.body);
  if (!input.success) return res.status(400).json({ message: 'Подтвердите изменение приёма платежей.' });
  // Pausing must remain available even if upstream checks have been rate limited.
  try { res.json(await sumupConfiguration.setEnabled(input.data.enabled, input.data.expectedVersion, String(req.user?.id ?? ''))); }
  catch (error) { fail(res, error); }
});
sumupAdminRouter.post('/sandbox-checkouts', upstreamLimit, async (req, res) => {
  const input = z.object({ expectedVersion: version, confirm: z.literal(true) }).strict().safeParse(req.body);
  if (!input.success) return res.status(400).json({ message: 'Подтвердите создание тестовой оплаты.' });
  try { res.status(201).json(await sumupPayments.createSandboxCheckout(input.data.expectedVersion, String(req.user?.id ?? ''))); }
  catch (error) { fail(res, error); }
});
sumupAdminRouter.get('/sandbox-checkouts/:id', upstreamLimit, async (req, res) => {
  const input = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/).safeParse(req.params.id);
  if (!input.success) return res.status(400).json({ message: 'Некорректная тестовая оплата.' });
  try { res.json(await sumupPayments.getSandboxCheckout(input.data)); } catch (error) { fail(res, error); }
});
