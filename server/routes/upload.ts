import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { adminAuthMiddleware } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimiter';
import { generateFilename, requireR2, uploadToR2, type R2Folder } from '../lib/r2';

export const uploadRouter = Router();
const MAX_IMAGE = 12 * 1024 * 1024;
const MAX_MEDIA = 100 * 1024 * 1024;
const imageMime = new Set(['image/jpeg', 'image/png', 'image/webp']);
const mediaExt = /\.(jpe?g|png|webp|gif|glb|gltf|mp4|webm)$/i;

const imageMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE, files: 1 },
  fileFilter: (_req, file, cb) =>
    cb(null, imageMime.has(file.mimetype)),
});
const mediaMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MEDIA, files: 2 },
  fileFilter: (_req, file, cb) => cb(null, mediaExt.test(file.originalname)),
});

function r2Configured(res: any): boolean {
  try { requireR2(); return true; }
  catch {
    res.status(503).json({ message: 'Облачное хранилище R2 не настроено.' });
    return false;
  }
}

async function validatedMedia(file: Express.Multer.File): Promise<{
  data: Buffer; contentType: string; filename: string;
}> {
  const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
  let data = file.buffer;
  let contentType: string;
  let filename: string;

  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    const decoded = sharp(data, { limitInputPixels: 40_000_000, failOn: 'error' });
    const metadata = await decoded.metadata();
    if (!metadata.format || !['jpeg', 'png', 'webp', 'gif'].includes(metadata.format))
      throw new Error('Файл не является поддерживаемым изображением.');
    if (metadata.format === 'gif' && (metadata.pages || 1) > 1) {
      // Keep animated campaign media moving; regular Sharp processing takes the first frame.
      contentType = 'image/gif';
      filename = generateFilename('animation.gif');
    } else {
      data = await decoded.rotate().resize({
        width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true,
      }).webp({ quality: 86 }).toBuffer();
      contentType = 'image/webp';
      filename = generateFilename('picture.webp');
    }
  } else if (ext === 'glb') {
    if (data.subarray(0, 4).toString('ascii') !== 'glTF') throw new Error('Некорректный файл GLB.');
    contentType = 'model/gltf-binary'; filename = generateFilename(file.originalname);
  } else if (ext === 'gltf') {
    let model: any;
    try { model = JSON.parse(data.toString('utf8')); }
    catch { throw new Error('Некорректный JSON модели glTF.'); }
    if (!model?.asset?.version) throw new Error('Файл не содержит glTF asset.');
    contentType = 'model/gltf+json'; filename = generateFilename(file.originalname);
  } else if (ext === 'mp4') {
    if (data.subarray(4, 8).toString('ascii') !== 'ftyp') throw new Error('Некорректный файл MP4.');
    contentType = 'video/mp4'; filename = generateFilename(file.originalname);
  } else if (ext === 'webm') {
    if (data.subarray(0, 4).toString('hex') !== '1a45dfa3') throw new Error('Некорректный файл WebM.');
    contentType = 'video/webm'; filename = generateFilename(file.originalname);
  } else {
    throw new Error('Формат файла не поддерживается.');
  }
  return { data, contentType, filename };
}

function singleUpload(folder: R2Folder, imagesOnly: boolean): RequestHandler {
  return async (req, res, next) => {
    if (!req.file) return res.status(400).json({ message: 'Выберите файл для загрузки.' });
    if (!r2Configured(res)) return;
    try {
      const source = req.file;
      const media = await validatedMedia(source);
      if (imagesOnly && media.contentType !== 'image/webp')
        return res.status(400).json({ message: 'Для этого поля требуется изображение.' });
      const url = await uploadToR2(media.data, media.filename, media.contentType, folder);
      res.json({
        success: true, url, filename: media.filename,
        key: folder + '/' + media.filename, size: media.data.length,
        contentType: media.contentType,
      });
    } catch (error: any) {
      if (/некорректн|поддержива|формат|glTF|изображени/i.test(error?.message || ''))
        return res.status(400).json({ message: error.message });
      next(error);
    }
  };
}

uploadRouter.post('/image', adminAuthMiddleware, uploadLimiter,
  imageMiddleware.single('file'), singleUpload('images', true));
uploadRouter.post('/homepage-image', adminAuthMiddleware, uploadLimiter,
  imageMiddleware.single('file'), singleUpload('homepage', true));
uploadRouter.post('/gallery', adminAuthMiddleware, uploadLimiter,
  mediaMiddleware.single('file'), singleUpload('gallery', false));

// Legacy multi-upload contract retained for older admin integrations.
uploadRouter.post('/gallery/multiple', adminAuthMiddleware, uploadLimiter,
  mediaMiddleware.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  async (req, res, next) => {
    if (!r2Configured(res)) return;
    try {
      const files = req.files as Record<string, Express.Multer.File[]>;
      const mainFile = files?.file?.[0];
      if (!mainFile) return res.status(400).json({ message: 'Основной файл отсутствует.' });
      const main = await validatedMedia(mainFile);
      const thumbnailFile = files?.thumbnail?.[0];
      const thumbnail = thumbnailFile ? await validatedMedia(thumbnailFile) : null;
      if (thumbnail && thumbnail.contentType !== 'image/webp')
        return res.status(400).json({ message: 'Превью должно быть изображением.' });
      const mainUrl = await uploadToR2(main.data, main.filename, main.contentType, 'gallery');
      const thumbnailUrl = thumbnail
        ? await uploadToR2(thumbnail.data, thumbnail.filename, thumbnail.contentType, 'gallery/thumbnails')
        : null;
      return res.json({
        success: true, mainUrl, thumbnailUrl, mainFilename: main.filename,
        size: main.data.length,
      });
    } catch (error) { next(error); }
  });
export default uploadRouter;
