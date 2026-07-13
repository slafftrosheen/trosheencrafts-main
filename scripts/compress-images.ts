import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assetsDir = path.join(process.cwd(), 'client', 'src', 'assets');

async function processDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.match(/\.(png|jpe?g)$/i)) {
      const webpPath = fullPath.replace(/\.(png|jpe?g)$/i, '.webp');
      console.log(`Converting ${file} to webp...`);
      try {
        await sharp(fullPath)
          .resize({ width: 1920, withoutEnlargement: true }) // max width 1920px
          .webp({ quality: 80 })
          .toFile(webpPath);
        console.log(`✅ Compressed ${file}`);
        // Optionally delete the original file to save space? We will just keep it for now and manually delete later.
        fs.unlinkSync(fullPath); // Actually let's delete to make the refactor clean
      } catch (e) {
        console.error(`❌ Failed to convert ${file}:`, e);
      }
    }
  }
}

async function run() {
  console.log('Starting image compression...');
  await processDirectory(assetsDir);
  console.log('Done.');
}

run();
