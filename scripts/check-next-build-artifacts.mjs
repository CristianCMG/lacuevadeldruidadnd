import fs from 'node:fs/promises';
import path from 'node:path';

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function assertExists(label, filePath) {
  const ok = await exists(filePath);
  if (!ok) {
    console.error(`Missing ${label}: ${filePath}`);
    process.exitCode = 1;
  }
}

async function countFilesWithExtension(dirPath, extension) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    let count = 0;
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) count += await countFilesWithExtension(full, extension);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(extension)) count += 1;
    }
    return count;
  } catch {
    return 0;
  }
}

async function main() {
  const root = process.cwd();

  const nextDir = path.join(root, '.next');
  const buildId = path.join(nextDir, 'BUILD_ID');
  const required = path.join(nextDir, 'required-server-files.json');
  const staticDir = path.join(nextDir, 'static');

  await assertExists('.next directory', nextDir);
  await assertExists('.next/BUILD_ID', buildId);
  await assertExists('.next/required-server-files.json', required);
  await assertExists('.next/static directory', staticDir);

  const jsCount = await countFilesWithExtension(path.join(staticDir, 'chunks'), '.js');
  if (jsCount < 1) {
    console.error(`Expected at least 1 JS chunk under ${path.join(staticDir, 'chunks')}`);
    process.exitCode = 1;
  }

  if (process.exitCode) process.exit(process.exitCode);
  console.log('OK', { buildId: (await fs.readFile(buildId, 'utf8')).trim(), jsChunks: jsCount });
}

main().catch((error) => {
  console.error('Unexpected error', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
