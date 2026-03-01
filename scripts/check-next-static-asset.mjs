const baseUrl = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000';

async function requestJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'check-next-static-asset/1.0' } });
  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { status: res.status, json };
}

async function main() {
  const healthUrl = new URL('/api/health', baseUrl).toString();
  const staticUrl = new URL('/api/health/static', baseUrl).toString();

  const health = await requestJson(healthUrl);
  if (health.status !== 200 || !health.json?.ok) {
    console.error('Health check failed', { status: health.status, body: health.json });
    process.exit(1);
  }

  const stat = await requestJson(staticUrl);
  if (stat.status !== 200 || !stat.json?.ok) {
    console.error('Static asset check failed', { status: stat.status, body: stat.json });
    process.exit(1);
  }

  console.log('OK', {
    health: { buildId: health.json.buildId ?? null },
    asset: stat.json.asset?.urlPath ?? null,
    fetchStatus: stat.json.fetch?.status ?? null,
  });
}

main().catch((error) => {
  console.error('Unexpected error', error);
  process.exit(1);
});
