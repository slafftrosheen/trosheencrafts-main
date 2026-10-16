import { randomUUID } from 'node:crypto';
import { S3Client, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');
export const R2_FOLDERS = ['images', 'homepage', 'gallery', 'gallery/thumbnails'] as const;
export type R2Folder = typeof R2_FOLDERS[number];

export function requireR2() {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY ||
      !R2_BUCKET_NAME || !/^https:\/\/[^/]+/i.test(R2_PUBLIC_URL)) {
    throw new Error('Cloudflare R2 settings are incomplete.');
  }
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export function isManagedKey(key: string) {
  return R2_FOLDERS.some(folder => key.startsWith(folder + '/')) &&
    !key.includes('..') && /^[a-zA-Z0-9_./-]+$/.test(key);
}
export function publicUrlForKey(key: string) {
  if (!isManagedKey(key)) throw new Error('Invalid object key.');
  requireR2();
  return R2_PUBLIC_URL + '/' + key;
}
export function managedKeyFromUrl(url: string): string | null {
  try {
    requireR2();
    const base = new URL(R2_PUBLIC_URL);
    const target = new URL(url);
    const basePath = base.pathname.replace(/\/+$/, '') + '/';
    if (target.origin !== base.origin || !target.pathname.startsWith(basePath)
      || target.search || target.hash) return null;
    const key = target.pathname.slice(basePath.length);
    return isManagedKey(key) ? key : null;
  } catch { return null; }
}
export function generateFilename(originalName: string): string {
  const extension = originalName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  return randomUUID() + '.' + extension;
}
export async function uploadToR2(buffer: Buffer, filename: string,
  contentType: string, folder: R2Folder = 'gallery'): Promise<string> {
  requireR2();
  const key = folder + '/' + filename;
  if (!isManagedKey(key)) throw new Error('Invalid object key.');
  await new Upload({
    client: r2Client,
    params: {
      Bucket: R2_BUCKET_NAME, Key: key, Body: buffer,
      ContentType: contentType, CacheControl: 'public, max-age=31536000, immutable',
    },
  }).done();
  return publicUrlForKey(key);
}
export async function listR2Objects(continuationToken?: string, folder?: R2Folder) {
  requireR2();
  const response = await r2Client.send(new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME, Prefix: folder ? folder + '/' : undefined,
    ContinuationToken: continuationToken || undefined, MaxKeys: 48,
  }));
  return {
    files: (response.Contents || [])
      .filter(entry => entry.Key && isManagedKey(entry.Key))
      .map(entry => ({
        key: entry.Key!, url: publicUrlForKey(entry.Key!),
        size: entry.Size || 0, modifiedAt: entry.LastModified?.toISOString() || null,
      })),
    nextToken: response.IsTruncated ? response.NextContinuationToken || null : null,
  };
}
export async function getR2Object(key: string) {
  requireR2();
  if (!isManagedKey(key)) throw new Error('Invalid object key.');
  return r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
}
export async function deleteFromR2(key: string) {
  requireR2();
  if (!isManagedKey(key)) throw new Error('Invalid object key.');
  await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
}
