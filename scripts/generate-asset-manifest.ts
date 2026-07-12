import { ALL_ASSETS } from '../client/src/lib/assets';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateManifest() {
  const manifest: any[] = [];
  const publicDir = path.join(__dirname, '../client/public');

  Object.entries(ALL_ASSETS).forEach(([category, assets]: [string, any]) => {
    Object.entries(assets).forEach(([name, asset]: [string, any]) => {
      const fullPath = path.join(publicDir, asset.path);
      const exists = fs.existsSync(fullPath);

      manifest.push({
        ...asset,
        exists,
      });
    });
  });

  const manifestPath = path.join(__dirname, '../asset-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ Asset manifest generated: ${manifestPath}`);
}

generateManifest();
