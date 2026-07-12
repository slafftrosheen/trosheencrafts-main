import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileTypeFromFile } from 'file-type';
import { adminAuthMiddleware } from '../middleware/auth';

export const uploadsRouter = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${hash}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
    
    cb(null, true);
  },
});

// Upload single image
uploadsRouter.post(
  '/image',
  adminAuthMiddleware,
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file provided' });
      }

      // Verify file type by magic bytes (content-based validation)
      const fileType = await fileTypeFromFile(req.file.path);
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      
      if (!fileType || !allowedMimes.includes(fileType.mime)) {
        // Clean up invalid file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          message: 'Invalid file content. Only JPEG, PNG and WebP images are allowed.' 
        });
      }

      // Optimize image with sharp
      const optimizedPath = path.join(uploadDir, `optimized-${req.file.filename}`);
      
      await sharp(req.file.path)
        .resize(1920, 1920, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85, progressive: true })
        .toFile(optimizedPath);

      // Remove original, rename optimized
      fs.unlinkSync(req.file.path);
      fs.renameSync(optimizedPath, req.file.path);

      const url = `/uploads/${req.file.filename}`;

      res.json({
        url,
        filename: req.file.filename,
        size: fs.statSync(req.file.path).size,
      });
    } catch (error) {
      // Clean up file on error
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
);

// Upload multiple images
uploadsRouter.post(
  '/images',
  adminAuthMiddleware,
  upload.array('files', 10),
  async (req, res, next) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files provided' });
      }

      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      
      // Validate all files first
      for (const file of files) {
        const fileType = await fileTypeFromFile(file.path);
        if (!fileType || !allowedMimes.includes(fileType.mime)) {
          // Clean up all files if any are invalid
          files.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
          return res.status(400).json({ 
            message: `Invalid file content in ${file.originalname}. Only JPEG, PNG and WebP images are allowed.` 
          });
        }
      }

      const results = await Promise.all(
        files.map(async (file) => {
          const optimizedPath = path.join(uploadDir, `optimized-${file.filename}`);
          
          await sharp(file.path)
            .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85, progressive: true })
            .toFile(optimizedPath);

          fs.unlinkSync(file.path);
          fs.renameSync(optimizedPath, file.path);

          return {
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            size: fs.statSync(file.path).size,
          };
        })
      );

      res.json({ files: results });
    } catch (error) {
      // Clean up files on error
      const files = req.files as Express.Multer.File[];
      if (files) {
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      next(error);
    }
  }
);

// Delete image
uploadsRouter.delete(
  '/image',
  adminAuthMiddleware,
  async (req, res, next) => {
    try {
      const { filename } = req.body;

      if (!filename) {
        return res.status(400).json({ message: 'Filename required' });
      }

      const filePath = path.join(uploadDir, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({ message: 'Image deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);