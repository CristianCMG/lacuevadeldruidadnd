import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

async function tryReadBuildId(): Promise<string | null> {
  try {
    const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID');
    const buildId = await fs.readFile(buildIdPath, 'utf8');
    return buildId.trim() || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const buildId = await tryReadBuildId();

  const responseBody = {
    ok: true,
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV ?? null,
    uptimeSeconds: Math.round(process.uptime()),
    buildId,
  };

  if (process.env.NODE_ENV !== 'production') {
    const requestUrl = new URL(request.url);
    logger.debug('Health check', { path: requestUrl.pathname });
  }

  return NextResponse.json(responseBody, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
