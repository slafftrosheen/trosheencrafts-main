import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { adminAuthMiddleware } from '../middleware/auth';
import crypto from 'crypto';

export const mediaRouter = Router();

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const MEDIA_DIR = path.join(UPLOADS_DIR, 'media');

// Create directories if they don't exist
fs.mkdir(MEDIA_DIR, { recursive: true }).catch(console.error);

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(MEDIA_DIR, { recursive: true });
      cb(null, MEDIA_DIR);
    } catch (error) {
      cb(error as Error, MEDIA_DIR);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    cb(null, `${Date.now()}-${uniqueSuffix}-${name}${ext}`);
  },
});

// File filter for allowed types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'model/gltf-binary',
    'model/gltf+json',
    'application/octet-stream', // For .glb files
  ];

  if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(glb|gltf|obj)$/i)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Upload single file
mediaRouter.post(
  '/upload',
  adminAuthMiddleware,
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileUrl = `/uploads/media/${req.file.filename}`;
      
      res.json({
        success: true,
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Upload multiple files
mediaRouter.post(
  '/upload-multiple',
  adminAuthMiddleware,
  upload.array('files', 10),
  async (req, res, next) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const files = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/media/${file.filename}`,
      }));

      res.json({
        success: true,
        files,
      });
    } catch (error) {
      next(error);
    }
  }
);

// List uploaded media
mediaRouter.get('/list', adminAuthMiddleware, async (req, res, next) => {
  try {
    const files = await fs.readdir(MEDIA_DIR);
    const fileStats = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(MEDIA_DIR, filename);
        const stats = await fs.stat(filePath);
        return {
          filename,
          url: `/uploads/media/${filename}`,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      })
    );

    res.json({
      files: fileStats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    });
  } catch (error) {
    next(error);
  }
});

// Delete media file
mediaRouter.delete('/delete/:filename', adminAuthMiddleware, async (req, res, next) => {
  try {
    const filename = req.params.filename;
    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }

    const filePath = path.join(MEDIA_DIR, filename);
    await fs.unlink(filePath);

    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    next(error);
  }
});

export default mediaRouter;
