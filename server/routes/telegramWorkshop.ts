import { Router } from "express";
import { z } from "zod";
import { adminAuthMiddleware } from "../middleware/auth";
import { pool } from "../db";
import { createWorkshopDelivery, DeliveryError } from "../lib/workshopDelivery";
import { deliveryFilters, isDeliveryId } from "../../shared/workshopDelivery";
import { createWorkshopProduction } from "../lib/workshopProduction";
import { productionActions, WorkshopError } from "../../shared/workshopProduction";
import {
  workshopSettings, saveWorkshopSettings, inviteWorkshopRecipient,
  workshopRecipientEnabled, testWorkshopRecipient,
} from "../lib/telegramWorkshop";

export const telegramWorkshopRouter = Router();
telegramWorkshopRouter.use(adminAuthMiddleware);
telegramWorkshopRouter.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
const production = createWorkshopProduction(pool);
const delivery = createWorkshopDelivery(pool);
const productionId = z.coerce.number().int().positive().max(2147483647);
const historyPage = z.coerce.number().int().min(0).max(100000).default(0);
const changeSchema = z.object({
  action: z.enum(productionActions),
  expectedVersion: z.number().int().min(0).max(2147483646),
}).strict();

telegramWorkshopRouter.get("/orders/:id/production", async (req, res, next) => {
  const id = productionId.safeParse(req.params.id);
  const page = historyPage.safeParse(req.query.page);
  if (!id.success || !page.success) return res.status(400).json({ message: "Некорректный заказ или страница." });
  try { res.json(await production.get(id.data, page.data)); }
  catch (error) {
    if (error instanceof WorkshopError) return res.status(error.statusCode).json({ message: error.message });
    next(error);
  }
});
telegramWorkshopRouter.patch("/orders/:id/production", async (req, res, next) => {
  const id = productionId.safeParse(req.params.id);
  const body = changeSchema.safeParse(req.body);
  if (!id.success || !body.success) return res.status(400).json({ message: "Проверьте действие и версию заказа." });
  try {
    // Actor identity is server-side only, never supplied by the request body.
    await production.change(id.data, body.data.action, body.data.expectedVersion,
      { kind: "admin", id: String(req.user?.id ?? "") });
    res.json(await production.get(id.data));
  } catch (error) {
    if (error instanceof WorkshopError) return res.status(error.statusCode).json({ message: error.message });
    next(error);
  }
});

const deliveryQuery = z.object({
  page: z.coerce.number().int().min(0).max(100000).default(0),
  filter: z.enum(deliveryFilters).default("attention"),
}).strict();
telegramWorkshopRouter.get("/deliveries", async (req, res, next) => {
  const query = deliveryQuery.safeParse(req.query);
  if (!query.success) return res.status(400).json({ message: "Проверьте фильтр и страницу уведомлений." });
  try { res.json(await delivery.list(query.data.page, query.data.filter)); }
  catch (error) {
    if (error instanceof DeliveryError) return res.status(error.statusCode).json({ message: error.message });
    next(error);
  }
});
telegramWorkshopRouter.post("/deliveries/:id/retry", async (req, res, next) => {
  const id = req.params.id;
  const body = z.object({ confirm: z.literal(true) }).strict().safeParse(req.body);
  if (!isDeliveryId(id) || !body.success) return res.status(400).json({ message: "Подтвердите повторную отправку уведомления." });
  try { res.json(await delivery.retry(id, Number(req.user?.id))); }
  catch (error) {
    if (error instanceof DeliveryError) return res.status(error.statusCode).json({ message: error.message });
    next(error);
  }
});

// Never return the encrypted or plaintext bot token to the browser.
telegramWorkshopRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await workshopSettings());
  } catch (error) { next(error); }
});

const configSchema = z.object({
  token: z.string().trim().min(30).max(200).optional(),
  enabled: z.boolean().optional(),
}).strict();

telegramWorkshopRouter.put("/", async (req, res, next) => {
  const parsed = configSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Проверьте токен и состояние бота." });
  try {
    res.json(await saveWorkshopSettings(parsed.data));
  } catch (error) {
    if (error instanceof Error && (
      error.message.startsWith("Telegram ") ||
      error.message.includes("токен") ||
      error.message.includes("бота")
    )) return res.status(400).json({ message: error.message });
    next(error);
  }
});

telegramWorkshopRouter.post("/invites", async (req, res, next) => {
  const parsed = z.object({ displayName: z.string().trim().min(1).max(80) }).strict().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Введите имя сотрудника." });
  try {
    res.status(201).json(await inviteWorkshopRecipient(parsed.data.displayName));
  } catch (error) { next(error); }
});

const recipientParams = z.object({ id: z.coerce.number().int().positive() });

telegramWorkshopRouter.patch("/recipients/:id", async (req, res, next) => {
  const params = recipientParams.safeParse(req.params);
  const body = z.object({ enabled: z.boolean() }).strict().safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ message: "Некорректные данные." });
  try {
    res.json(await workshopRecipientEnabled(params.data.id, body.data.enabled));
  } catch (error) { next(error); }
});

telegramWorkshopRouter.post("/recipients/:id/test", async (req, res, next) => {
  const params = recipientParams.safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Некорректный ID." });
  try {
    await testWorkshopRecipient(params.data.id);
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Telegram ")) {
      return res.status(502).json({ message: "Telegram не принял тестовое сообщение. Проверьте, что пользователь открыл чат с ботом." });
    }
    next(error);
  }
});
