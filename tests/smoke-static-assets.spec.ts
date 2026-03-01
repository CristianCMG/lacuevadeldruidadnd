import { test, expect } from '@playwright/test';

function guessExpectedContentType(pathname: string): RegExp | null {
  const lower = pathname.toLowerCase();
  if (lower.endsWith('.js')) return /javascript|ecmascript/;
  if (lower.endsWith('.css')) return /text\/css/;
  if (lower.endsWith('.woff2')) return /font\/woff2|application\/font-woff2/;
  if (lower.endsWith('.woff')) return /font\/woff|application\/font-woff/;
  if (lower.endsWith('.svg')) return /image\/svg\+xml/;
  if (lower.endsWith('.png')) return /image\/png/;
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return /image\/jpeg/;
  if (lower.endsWith('.webp')) return /image\/webp/;
  if (lower.endsWith('.gif')) return /image\/gif/;
  if (lower.endsWith('.ico')) return /image\/x-icon|image\/vnd\.microsoft\.icon/;
  if (lower.endsWith('.json')) return /application\/json/;
  if (lower.endsWith('.map')) return /application\/json/;
  return null;
}

async function assertStaticAssetOk(
  request: { get: (url: string) => Promise<{ status: () => number; headers: () => Record<string, string> }> },
  assetPath: string
) {
  const res = await request.get(assetPath);
  const status = res.status();
  expect([200, 304]).toContain(status);

  const headers = res.headers();
  const contentType = headers['content-type'];
  expect(contentType).toBeTruthy();

  const expected = guessExpectedContentType(new URL(assetPath, 'http://localhost').pathname);
  if (expected) expect(contentType).toMatch(expected);

  const cacheControl = headers['cache-control'];
  if (cacheControl) expect(cacheControl).toMatch(/max-age|immutable/i);
}

test('@smoke homepage loads and serves Next static assets', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/La Cueva del Druida/i);

  const assetPaths = await page.evaluate(() => {
    const paths = new Set<string>();
    const add = (value: string | null) => {
      if (!value) return;
      try {
        const url = new URL(value, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (!url.pathname.startsWith('/_next/static/')) return;
        paths.add(url.pathname + url.search);
      } catch {}
    };

    document.querySelectorAll<HTMLScriptElement>('script[src]').forEach((el) => add(el.getAttribute('src')));
    document
      .querySelectorAll<HTMLLinkElement>('link[href]')
      .forEach((el) => add(el.getAttribute('href')));

    return Array.from(paths);
  });

  expect(assetPaths.length).toBeGreaterThan(0);

  for (const assetPath of assetPaths) {
    await assertStaticAssetOk(page.request, assetPath);
  }
});

test('@smoke health endpoints report static asset availability', async ({ request }) => {
  const health = await request.get('/api/health');
  expect(health.status()).toBe(200);

  const healthStatic = await request.get('/api/health/static');
  expect(healthStatic.status()).toBe(200);

  const json = await healthStatic.json();
  expect(json?.ok).toBe(true);
  expect(json?.asset?.urlPath).toMatch(/^\/_next\/static\//);
});
