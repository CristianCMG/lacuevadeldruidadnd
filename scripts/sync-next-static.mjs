import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const fromDir = path.join(projectRoot, '.next', 'static');
const toDir = path.join(projectRoot, '_next', 'static');

function ensureCleanDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

if (!fs.existsSync(fromDir)) {
  console.error(`Missing build output: ${fromDir}`);
  process.exit(1);
}

ensureCleanDir(toDir);
fs.cpSync(fromDir, toDir, { recursive: true, force: true });

console.log(`Synced Next static assets to ${toDir}`);
