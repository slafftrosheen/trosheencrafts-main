import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize R2 client
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'trosheen-gallery';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-xxxxx.r2.dev';

/**
 * Upload file buffer to R2
 */
export async function uploadToR2(
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder: string = 'gallery'
): Promise<string> {
  const key = `${folder}/${filename}`;

  const upload = new Upload({
    client: r2Client,
    params: {
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    },
  });

  await upload.done();

  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(filename: string, folder: string = 'gallery'): Promise<void> {
  const key = `${folder}/${filename}`;

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Generate unique filename
 */
export function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = originalName.split('.').pop();
  return `${timestamp}-${random}.${ext}`;
}
