import { test, expect } from '@playwright/test';

test.describe('API Webhooks', () => {
  test('POST /api/webhooks/meli returns 200', async ({ request }) => {
    const response = await request.post('/api/webhooks/meli', {
      data: {
        topic: 'payment',
        resource: '/payments/12345'
      }
    });
    
    // It should return 200 OK
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ status: 'OK' });
  });

  test('POST /api/webhooks/meli with invalid method returns 405', async ({ request }) => {
    const response = await request.get('/api/webhooks/meli');
    // Next.js App Router usually returns 405 Method Not Allowed for undefined methods
    expect(response.status()).toBe(405);
  });
});
