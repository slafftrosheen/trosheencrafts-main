import { Router } from 'express';
import multer from 'multer';
import { uploadToR2, deleteFromR2, generateFilename } from '../lib/r2';
import { adminAuthMiddleware } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimiter';

export const uploadRouter = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'model/gltf-binary', // .glb
      'model/gltf+json',   // .gltf
      'application/octet-stream', // fallback for .glb
      'video/mp4',
      'video/webm',
    ];

    const allowedExts = /\.(jpg|jpeg|png|gif|webp|glb|gltf|mp4|webm)$/i;

    if (allowedMimes.includes(file.mimetype) || allowedExts.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, 3D models (GLB/GLTF), and short videos (MP4/WebM) are allowed.'));
    }
  },
});

/**
 * Upload single file to R2
 * POST /api/upload/gallery
 */
uploadRouter.post(
  '/gallery',
  adminAuthMiddleware,
  uploadLimiter,
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filename = generateFilename(req.file.originalname);
      const contentType = req.file.mimetype;

      // Upload to R2
      const url = await uploadToR2(req.file.buffer, filename, contentType);

      res.json({
        success: true,
        url,
        filename,
        size: req.file.size,
        contentType,
      });
    } catch (error) {
      console.error('Upload error:', error);
      next(error);
    }
  }
);

/**
 * Upload multiple files (for thumbnail + main file)
 * POST /api/upload/gallery/multiple
 */
uploadRouter.post(
  '/gallery/multiple',
  adminAuthMiddleware,
  uploadLimiter,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files.file || files.file.length === 0) {
        return res.status(400).json({ error: 'No main file uploaded' });
      }

      const mainFile = files.file[0];
      const thumbnailFile = files.thumbnail?.[0];

      // Upload main file
      const mainFilename = generateFilename(mainFile.originalname);
      const mainUrl = await uploadToR2(
        mainFile.buffer,
        mainFilename,
        mainFile.mimetype
      );

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbnailFilename = generateFilename(thumbnailFile.originalname);
        thumbnailUrl = await uploadToR2(
          thumbnailFile.buffer,
          thumbnailFilename,
          thumbnailFile.mimetype,
          'gallery/thumbnails'
        );
      }

      res.json({
        success: true,
        mainUrl,
        thumbnailUrl,
        mainFilename,
        size: mainFile.size,
      });
    } catch (error) {
      console.error('Upload error:', error);
      next(error);
    }
  }
);

/**
 * Delete file from R2
 * DELETE /api/upload/gallery/:filename
 */
uploadRouter.delete(
  '/gallery/:filename',
  adminAuthMiddleware,
  async (req, res, next) => {
    try {
      const { filename } = req.params;
      await deleteFromR2(filename as string);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      console.error('Delete error:', error);
      next(error);
    }
  }
);

export default uploadRouter;
