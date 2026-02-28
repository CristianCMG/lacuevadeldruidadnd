import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MeliClient, MeliConfig } from './mercadolibre';
import { ITokenStorage, IRateLimiter, ILogger } from './interfaces';
import { TokenData } from './types';

describe('MeliClient', () => {
  let meliClient: MeliClient;
  let mockConfig: MeliConfig;
  let mockTokenStorage: ITokenStorage;
  let mockRateLimiter: IRateLimiter;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockConfig = {
      appId: 'test-app-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'http://localhost/callback',
      apiUrl: 'https://api.mercadolibre.com',
    };

    mockTokenStorage = {
      save: vi.fn(),
      get: vi.fn(),
    };

    mockRateLimiter = {
      request: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(),
    };

    meliClient = new MeliClient(mockConfig, mockTokenStorage, mockRateLimiter, mockLogger);
  });

  describe('getAuthURL', () => {
    it('should return a valid auth URL and code verifier', () => {
      const result = meliClient.getAuthURL();
      expect(result.url).toContain('https://auth.mercadolibre.com.ar/authorization');
      expect(result.url).toContain(`client_id=${mockConfig.appId}`);
      expect(result.url).toContain(`redirect_uri=${encodeURIComponent(mockConfig.redirectUri)}`);
      expect(result.codeVerifier).toBeDefined();
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange code for token and save it', async () => {
      const mockResponse = {
        data: {
          access_token: 'access-123',
          refresh_token: 'refresh-123',
          user_id: 12345,
          expires_in: 21600,
          scope: 'read write',
          token_type: 'bearer',
        },
      };

      vi.mocked(mockRateLimiter.post).mockResolvedValue(mockResponse);

      const result = await meliClient.exchangeCodeForToken('code-123', 'verifier-123');

      expect(mockRateLimiter.post).toHaveBeenCalledWith(
        `${mockConfig.apiUrl}/oauth/token`,
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            grant_type: 'authorization_code',
            code: 'code-123',
            code_verifier: 'verifier-123',
          }),
        })
      );

      expect(mockTokenStorage.save).toHaveBeenCalledWith(expect.objectContaining({
        access_token: 'access-123',
        refresh_token: 'refresh-123',
      }));

      expect(result).toEqual(mockResponse.data);
    });

    it('should log error and throw on failure', async () => {
      const error = new Error('API Error');
      vi.mocked(mockRateLimiter.post).mockRejectedValue(error);

      await expect(meliClient.exchangeCodeForToken('code', 'verifier')).rejects.toThrow('API Error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token and save new tokens', async () => {
      const currentTokens: TokenData = {
        access_token: 'old-access',
        refresh_token: 'old-refresh',
        user_id: 123,
        expires_in: 3600,
        scope: 'read',
        token_type: 'bearer',
        created_at: Date.now() - 10000,
      };

      const mockResponse = {
        data: {
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          user_id: 123,
          expires_in: 3600,
          scope: 'read',
          token_type: 'bearer',
        },
      };

      vi.mocked(mockRateLimiter.post).mockResolvedValue(mockResponse);

      const result = await meliClient.refreshAccessToken(currentTokens);

      expect(mockRateLimiter.post).toHaveBeenCalledWith(
        `${mockConfig.apiUrl}/oauth/token`,
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            grant_type: 'refresh_token',
            refresh_token: 'old-refresh',
          }),
        })
      );

      expect(mockTokenStorage.save).toHaveBeenCalledWith(expect.objectContaining({
        access_token: 'new-access',
        refresh_token: 'new-refresh',
      }));

      expect(result).toBe('new-access');
    });
  });

  describe('getValidAccessToken', () => {
    it('should return existing token if valid', async () => {
      const validToken: TokenData = {
        access_token: 'valid-token',
        refresh_token: 'refresh',
        user_id: 123,
        expires_in: 3600,
        scope: 'read',
        token_type: 'bearer',
        created_at: Date.now(), // Just created
      };

      vi.mocked(mockTokenStorage.get).mockResolvedValue(validToken);

      const result = await meliClient.getValidAccessToken();

      expect(result).toBe('valid-token');
      expect(mockRateLimiter.post).not.toHaveBeenCalled();
    });

    it('should refresh token if expired', async () => {
      const expiredToken: TokenData = {
        access_token: 'expired-token',
        refresh_token: 'refresh',
        user_id: 123,
        expires_in: 3600,
        scope: 'read',
        token_type: 'bearer',
        created_at: Date.now() - (3600 * 1000) - 1000, // Expired 1 sec ago
      };

      vi.mocked(mockTokenStorage.get).mockResolvedValue(expiredToken);
      
      const mockRefreshResponse = {
        data: {
          access_token: 'refreshed-token',
          refresh_token: 'new-refresh',
          user_id: 123,
          expires_in: 3600,
          scope: 'read',
          token_type: 'bearer',
        },
      };
      vi.mocked(mockRateLimiter.post).mockResolvedValue(mockRefreshResponse);

      const result = await meliClient.getValidAccessToken();

      expect(result).toBe('refreshed-token');
      expect(mockRateLimiter.post).toHaveBeenCalled();
    });
    
    it('should return null if no tokens exist', async () => {
      vi.mocked(mockTokenStorage.get).mockResolvedValue(null);
      const result = await meliClient.getValidAccessToken();
      expect(result).toBeNull();
    });
  });

  describe('getUserItems', () => {
    it('should fetch all items with pagination', async () => {
      const token: TokenData = {
        access_token: 'valid-token',
        refresh_token: 'refresh',
        user_id: 123,
        expires_in: 3600,
        scope: 'read',
        token_type: 'bearer',
        created_at: Date.now(),
      };
      vi.mocked(mockTokenStorage.get).mockResolvedValue(token);

      // Mock Search (2 pages)
      vi.mocked(mockRateLimiter.get)
        .mockResolvedValueOnce({ // Page 1
          data: {
            paging: { total: 60, offset: 0, limit: 50 },
            results: Array(50).fill('item-id'),
          }
        })
        .mockResolvedValueOnce({ // Page 2
          data: {
            paging: { total: 60, offset: 50, limit: 50 },
            results: Array(10).fill('item-id'),
          }
        })
        // Mock Details (3 chunks of 20)
        .mockResolvedValueOnce({ data: [{ body: { id: 'item-1' } }] })
        .mockResolvedValueOnce({ data: [{ body: { id: 'item-2' } }] })
        .mockResolvedValueOnce({ data: [{ body: { id: 'item-3' } }] });

      const result = await meliClient.getUserItems();

      expect(mockRateLimiter.get).toHaveBeenCalledTimes(5); // 2 search + 3 details
      expect(result.length).toBe(3); // Based on mock details
    });

    it('should handle errors gracefully', async () => {
       vi.mocked(mockTokenStorage.get).mockResolvedValue({
        access_token: 'token',
        refresh_token: 'refresh',
        user_id: 123,
        expires_in: 3600,
        scope: 'read',
        token_type: 'bearer',
        created_at: Date.now(),
      });

      vi.mocked(mockRateLimiter.get).mockRejectedValue(new Error('Network Error'));

      const result = await meliClient.getUserItems();

      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
