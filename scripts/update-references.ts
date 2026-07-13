import fs from 'fs';
import path from 'path';

const dirsToSearch = [
  path.join(process.cwd(), 'client', 'src'),
  path.join(process.cwd(), 'server', 'db', 'seed.ts'),
];

async function updateFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  // We only replace image extensions inside quotes or strings where they match our known assets.
  const regex = /(\.png|\.jpe?g)/gi;
  if (regex.test(content)) {
    const newContent = content.replace(regex, '.webp');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated references in ${filePath}`);
  }
}

async function processDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;
  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    if (dir.match(/\.(tsx?|jsx?|json|css)$/)) {
      await updateFile(dir);
    }
  } else if (stat.isDirectory()) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      await processDirectory(path.join(dir, file));
    }
  }
}

async function run() {
  console.log('Updating references...');
  for (const dir of dirsToSearch) {
    await processDirectory(dir);
  }
  console.log('Done.');
}

run();
