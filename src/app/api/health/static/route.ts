import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

type StaticAsset = {
  filePath: string;
  urlPath: string;
  size: number;
  mtimeMs: number;
};

async function findRepresentativeAsset(staticRoot: string): Promise<StaticAsset | null> {
  const preferredDirs = [
    path.join(staticRoot, 'chunks'),
    path.join(staticRoot, 'css'),
    staticRoot,
  ];

  const isCandidate = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.js' || ext === '.css' || ext === '.woff2';
  };

  const statIfFile = async (filePath: string) => {
    const st = await fs.stat(filePath);
    if (!st.isFile()) return null;
    return st;
  };

  const toAsset = async (filePath: string): Promise<StaticAsset> => {
    const st = await fs.stat(filePath);
    const rel = path.relative(staticRoot, filePath).split(path.sep).join('/');
    return {
      filePath,
      urlPath: `/_next/static/${rel}`,
      size: st.size,
      mtimeMs: st.mtimeMs,
    };
  };

  for (const dir of preferredDirs) {
    try {
      const st = await fs.stat(dir);
      if (!st.isDirectory()) continue;
    } catch {
      continue;
    }

    const queue: string[] = [dir];
    let visited = 0;

    while (queue.length) {
      const current = queue.shift() as string;
      visited++;
      if (visited > 5000) break;

      let entries: Array<import('node:fs').Dirent>;
      try {
        entries = await fs.readdir(current, { withFileTypes: true });
      } catch {
        continue;
      }

      entries.sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          queue.push(fullPath);
          continue;
        }
        if (!entry.isFile()) continue;
        if (!isCandidate(fullPath)) continue;
        const fileStat = await statIfFile(fullPath);
        if (!fileStat) continue;
        if (fileStat.size <= 0) continue;
        return await toAsset(fullPath);
      }
    }
  }

  return null;
}

function getRequestOrigin(request: Request): string | null {
  const xfProto = request.headers.get('x-forwarded-proto');
  const xfHost = request.headers.get('x-forwarded-host');
  const host = xfHost ?? request.headers.get('host');
  const proto =
    xfProto ??
    (process.env.NODE_ENV === 'production' ? 'https' : 'http');

  if (!host) return null;
  return `${proto}://${host}`;
}

export async function GET(request: Request) {
  const staticRoot = path.join(process.cwd(), '.next', 'static');
  const asset = await findRepresentativeAsset(staticRoot);
  const origin = getRequestOrigin(request);
  const requestUrl = new URL(request.url);
  const requestId =
    request.headers.get('x-request-id') ??
    request.headers.get('cf-ray') ??
    undefined;

  if (!asset) {
    logger.error('Static asset check: no asset found', {
      requestId,
      path: requestUrl.pathname,
      staticRoot,
    });

    return NextResponse.json(
      {
        ok: false,
        timestamp: new Date().toISOString(),
        reason: 'no_static_asset_found',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!origin) {
    logger.error('Static asset check: missing host', {
      requestId,
      path: requestUrl.pathname,
      assetUrlPath: asset.urlPath,
    });

    return NextResponse.json(
      {
        ok: false,
        timestamp: new Date().toISOString(),
        reason: 'missing_host_header',
        assetUrlPath: asset.urlPath,
      },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const assetUrl = `${origin}${asset.urlPath}`;

  let status: number | null = null;
  let contentType: string | null = null;
  let contentLength: string | null = null;
  let errorMessage: string | null = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(assetUrl, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'health-static-check/1.0',
      },
    });
    clearTimeout(timeout);

    status = res.status;
    contentType = res.headers.get('content-type');
    contentLength = res.headers.get('content-length');
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
  }

  const ok = status === 200;
  if (!ok) {
    logger.warn('Static asset check failed', {
      requestId,
      assetUrlPath: asset.urlPath,
      status,
      errorMessage,
    });
  }

  return NextResponse.json(
    {
      ok,
      timestamp: new Date().toISOString(),
      asset: {
        urlPath: asset.urlPath,
        size: asset.size,
        mtimeMs: asset.mtimeMs,
      },
      fetch: {
        status,
        contentType,
        contentLength,
        errorMessage,
      },
    },
    {
      status: ok ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
