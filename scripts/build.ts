import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildServer() {
  console.log('Building server...');
  
  await build({
    entryPoints: [path.join(__dirname, '../server/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: 'dist/index.cjs',
    external: [
      'express',
      'pg',
      'bcryptjs',
      'passport',
      'passport-local',
      'drizzle-orm',
      'stripe',
      'multer',
      'connect-pg-simple',
      'express-session',
      'express-rate-limit',
      'nodemailer',
      'postgres',
      'dotenv',
      'sharp'
    ],
    minify: true,
    sourcemap: true,
  });
  
  console.log('Server built successfully!');
}

buildServer().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});