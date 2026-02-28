import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { MeliClient } from './mercadolibre';
import { TokenStorage } from './token-storage';
import { RateLimiter } from './rate-limiter';
import { Logger } from './logger';
import { TokenData } from './types';

// Setup MSW Server
const server = setupServer(
  // Refresh Token Handler
  http.post('https://api.mercadolibre.com/oauth/token', async ({ request }) => {
    const url = new URL(request.url);
    const grantType = url.searchParams.get('grant_type');

    if (grantType === 'refresh_token') {
      const refreshToken = url.searchParams.get('refresh_token');
      if (refreshToken === 'valid-refresh-token') {
        return HttpResponse.json({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          user_id: 12345,
          expires_in: 21600,
          scope: 'read write',
          token_type: 'bearer',
        });
      }
      return new HttpResponse(null, { status: 400 });
    }
    
    return new HttpResponse(null, { status: 400 });
  }),

  // User Items Search Handler
  http.get('https://api.mercadolibre.com/users/:userId/items/search', () => {
    return HttpResponse.json({
      paging: { total: 1, offset: 0, limit: 50 },
      results: ['item-123'],
    });
  }),

  // Items Details Handler
  http.get('https://api.mercadolibre.com/items', ({ request }) => {
     const url = new URL(request.url);
     const ids = url.searchParams.get('ids');
     
     if (ids === 'item-123') {
         return HttpResponse.json([
             { code: 200, body: { id: 'item-123', title: 'Test Item' } }
         ]);
     }
     return new HttpResponse(null, { status: 404 });
  })
);

describe('MeliClient Integration', () => {
  let meliClient: MeliClient;
  let mockTokenStorage: TokenStorage;

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });
  afterAll(() => server.close());

  beforeEach(() => {
    const config = {
      appId: 'test-app',
      clientSecret: 'test-secret',
      redirectUri: 'http://localhost',
      apiUrl: 'https://api.mercadolibre.com',
    };

    mockTokenStorage = {
      save: vi.fn(),
      get: vi.fn(),
    } as any;

    const rateLimiter = new RateLimiter({ maxRetries: 3, baseDelay: 10 }); // Fast retries for tests
    const logger = new Logger();
    // Silence logger for tests
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});

    meliClient = new MeliClient(config, mockTokenStorage, rateLimiter, logger);
  });

  it('should refresh token automatically when expired', async () => {
    const expiredToken: TokenData = {
      access_token: 'expired-token',
      refresh_token: 'valid-refresh-token',
      user_id: 12345,
      expires_in: 3600,
      scope: 'read',
      token_type: 'bearer',
      created_at: Date.now() - (3600 * 1000) - 1000, // Expired
    };

    vi.mocked(mockTokenStorage.get).mockResolvedValue(expiredToken);

    const token = await meliClient.getValidAccessToken();

    expect(token).toBe('new-access-token');
    expect(mockTokenStorage.save).toHaveBeenCalledWith(expect.objectContaining({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    }));
  });

  it('should retry on 429 errors', async () => {
    const validToken: TokenData = {
      access_token: 'valid-token',
      refresh_token: 'valid-refresh-token',
      user_id: 12345,
      expires_in: 3600,
      scope: 'read',
      token_type: 'bearer',
      created_at: Date.now(),
    };
    vi.mocked(mockTokenStorage.get).mockResolvedValue(validToken);

    let callCount = 0;
    server.use(
      http.get('https://api.mercadolibre.com/users/:userId/items/search', () => {
        callCount++;
        if (callCount < 3) {
          return new HttpResponse(null, { status: 429, headers: { 'Retry-After': '0.1' } });
        }
        return HttpResponse.json({
          paging: { total: 0, offset: 0, limit: 50 },
          results: [],
        });
      })
    );

    const items = await meliClient.getUserItems();
    
    expect(items).toEqual([]);
    expect(callCount).toBe(3); // 2 failures + 1 success
  });

  it('should handle 500 errors gracefully', async () => {
     const validToken: TokenData = {
      access_token: 'valid-token',
      refresh_token: 'valid-refresh-token',
      user_id: 12345,
      expires_in: 3600,
      scope: 'read',
      token_type: 'bearer',
      created_at: Date.now(),
    };
    vi.mocked(mockTokenStorage.get).mockResolvedValue(validToken);

    server.use(
      http.get('https://api.mercadolibre.com/users/:userId/items/search', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const items = await meliClient.getUserItems();
    expect(items).toEqual([]); // getUserItems catches errors and returns empty array
  });
});
