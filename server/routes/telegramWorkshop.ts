import { Router } from "express";
import { z } from "zod";
import { adminAuthMiddleware } from "../middleware/auth";
import {
  workshopSettings, saveWorkshopSettings, inviteWorkshopRecipient,
  workshopRecipientEnabled, testWorkshopRecipient,
} from "../lib/telegramWorkshop";

export const telegramWorkshopRouter = Router();
telegramWorkshopRouter.use(adminAuthMiddleware);

// Never return the encrypted or plaintext bot token to the browser.
telegramWorkshopRouter.get("/", async (_req, res, next) => {
  try {
    res.setHeader("Cache-Control", "no-store");
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
    res.setHeader("Cache-Control", "no-store");
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
