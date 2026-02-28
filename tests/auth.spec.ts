import { test, expect } from '@playwright/test';

test('Homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/La Cueva del Druida/);
});

test('Login API redirects to Mercado Libre', async ({ request }) => {
  // We don't follow redirects to check the location header
  const response = await request.get('/api/auth/login', {
    maxRedirects: 0
  });
  
  // It should be a 307 Temporary Redirect or 302 Found
  expect(response.status()).toBeGreaterThanOrEqual(300);
  expect(response.status()).toBeLessThan(400);
  
  const location = response.headers()['location'];
  expect(location).toContain('auth.mercadolibre.com.ar');
  expect(location).toContain('client_id=');
  expect(location).toContain('redirect_uri=');
});
