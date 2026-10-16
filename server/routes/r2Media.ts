import { Router } from 'express';
import { Readable } from 'node:stream';
import { z } from 'zod';
import { db } from '../db';
import {
  products, blogPosts, galleryItems, promotions, siteConfig, constructorOptions,
} from '../db/schema';
import { adminAuthMiddleware } from '../middleware/auth';
import {
  deleteFromR2, getR2Object, isManagedKey, listR2Objects,
  publicUrlForKey, R2_FOLDERS,
} from '../lib/r2';

export const r2MediaRouter = Router();
r2MediaRouter.use(adminAuthMiddleware);

const folderSchema = z.enum(R2_FOLDERS);
r2MediaRouter.get('/files', async (req, res, next) => {
  try {
    const args = z.object({
      token: z.string().max(4096).optional(),
      folder: folderSchema.optional(),
    }).parse(req.query);
    res.setHeader('Cache-Control', 'private, no-store');
    res.json(await listR2Objects(args.token, args.folder));
  } catch (error) { next(error); }
});

/** Used before physical removal so CMS references never become broken links. */
async function referenceLocations(url: string): Promise<string[]> {
  const [productRows, journalRows, galleryRows, promoRows, configRows, options] = await Promise.all([
    db.select({ id: products.id, images: products.images }).from(products),
    db.select({ id: blogPosts.id, image: blogPosts.image, video: blogPosts.video,
      content: blogPosts.content, translatedContent: blogPosts.contentTranslations }).from(blogPosts),
    db.select({ id: galleryItems.id, media: galleryItems.mediaUrl,
      thumbnail: galleryItems.thumbnailUrl, metadata: galleryItems.metadata }).from(galleryItems),
    db.select({ id: promotions.id, image: promotions.imageUrl, video: promotions.videoUrl }).from(promotions),
    db.select({ key: siteConfig.key, value: siteConfig.value }).from(siteConfig),
    db.select({ id: constructorOptions.id, image: constructorOptions.imageUrl }).from(constructorOptions),
  ]);
  const found: string[] = [];
  const matches = (value: unknown): boolean => typeof value === 'string'
    ? value.includes(url)
    : !!value && JSON.stringify(value).includes(url);
  for (const row of productRows) if (matches(row.images)) found.push('Товар #' + row.id);
  for (const row of journalRows)
    if (matches([row.image, row.video, row.content, row.translatedContent]))
      found.push('Журнал #' + row.id);
  for (const row of galleryRows)
    if (matches([row.media, row.thumbnail, row.metadata])) found.push('Галерея #' + row.id);
  for (const row of promoRows)
    if (matches([row.image, row.video])) found.push('Промо #' + row.id);
  for (const row of configRows)
    if (matches(row.value)) found.push('Настройки: ' + row.key);
  for (const row of options)
    if (matches(row.image)) found.push('Конструктор #' + row.id);
  return found;
}

const keySchema = z.string().max(512).refine(isManagedKey, 'Недопустимый ключ R2.');

r2MediaRouter.get('/references', async (req, res, next) => {
  try {
    const { key } = z.object({ key: keySchema }).parse(req.query);
    const references = await referenceLocations(publicUrlForKey(key));
    res.json({ key, referenced: references.length > 0, references });
  } catch (error) { next(error); }
});

r2MediaRouter.get('/download', async (req, res, next) => {
  try {
    const { key } = z.object({ key: keySchema }).parse(req.query);
    const object = await getR2Object(key);
    if (!object.Body || typeof (object.Body as Readable).pipe !== 'function') {
      return res.status(502).json({ message: 'Не удалось прочитать объект из R2.' });
    }
    const filename = key.split('/').pop() || 'file';
    res.attachment(filename);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, no-store');
    if (object.ContentLength !== undefined) res.setHeader('Content-Length', String(object.ContentLength));
    const body = object.Body as Readable;
    body.on('error', next);
    body.pipe(res);
  } catch (error) { next(error); }
});

r2MediaRouter.delete('/file', async (req, res, next) => {
  try {
    const { key, confirmed } = z.object({
      key: keySchema, confirmed: z.literal(true),
    }).parse(req.body);
    const references = await referenceLocations(publicUrlForKey(key));
    if (references.length) {
      return res.status(409).json({
        message: 'Файл используется на сайте. Сначала замените его в редакторе.',
        references,
      });
    }
    await deleteFromR2(key);
    res.json({ success: true, key });
  } catch (error) { next(error); }
});
