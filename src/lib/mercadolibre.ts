/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';
import { TokenData } from './types';
import { ITokenStorage, IRateLimiter, ILogger, IMeliClient } from './interfaces';
import { meliRateLimiter } from './rate-limiter';
import { tokenStorage } from './token-storage';
import { logger } from './logger';

export interface MeliConfig {
  appId: string;
  clientSecret: string;
  redirectUri: string;
  apiUrl: string;
}

export class MeliClient implements IMeliClient {
  private config: MeliConfig;
  private tokenStorage: ITokenStorage;
  private rateLimiter: IRateLimiter;
  private logger: ILogger;

  constructor(
    config: MeliConfig,
    tokenStorage: ITokenStorage,
    rateLimiter: IRateLimiter,
    logger: ILogger
  ) {
    this.config = config;
    this.tokenStorage = tokenStorage;
    this.rateLimiter = rateLimiter;
    this.logger = logger;
  }

  // PKCE Helper Functions
  private base64URLEncode(str: Buffer): string {
    return str.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private sha256(buffer: Buffer): Buffer {
    return crypto.createHash('sha256').update(buffer).digest();
  }

  private generatePKCE() {
    const verifier = this.base64URLEncode(crypto.randomBytes(32));
    const challenge = this.base64URLEncode(this.sha256(Buffer.from(verifier)));
    return { verifier, challenge };
  }

  getAuthURL() {
    const { appId, redirectUri } = this.config;
    const { verifier, challenge } = this.generatePKCE();
    
    const url = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${challenge}&code_challenge_method=S256`;
    
    return { url, codeVerifier: verifier };
  }

  async exchangeCodeForToken(code: string, codeVerifier: string) {
    try {
      const response = await this.rateLimiter.post(`${this.config.apiUrl}/oauth/token`, null, {
        params: {
          grant_type: 'authorization_code',
          client_id: this.config.appId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri,
          code_verifier: codeVerifier,
        },
      });

      const { access_token, refresh_token, user_id, expires_in, scope, token_type } = response.data;
      
      const tokenData: TokenData = {
        access_token,
        refresh_token,
        user_id,
        expires_in,
        scope,
        token_type,
        created_at: Date.now(),
      };
      
      await this.tokenStorage.save(tokenData);
      
      return response.data;
    } catch (error) {
      this.logger.error('Error exchanging code', { error });
      throw error;
    }
  }

  async refreshAccessToken(currentTokens: TokenData) {
    try {
      const response = await this.rateLimiter.post(`${this.config.apiUrl}/oauth/token`, null, {
        params: {
          grant_type: 'refresh_token',
          client_id: this.config.appId,
          client_secret: this.config.clientSecret,
          refresh_token: currentTokens.refresh_token,
        },
      });
      
      const { access_token, refresh_token, user_id, expires_in, scope, token_type } = response.data;
      
      const newTokens: TokenData = {
        access_token,
        refresh_token: refresh_token || currentTokens.refresh_token, // Use new refresh token if provided
        user_id,
        expires_in,
        scope,
        token_type,
        created_at: Date.now(),
      };
      
      await this.tokenStorage.save(newTokens);
      return access_token;
    } catch (error) {
      this.logger.error('Error refreshing token', { error });
      throw error;
    }
  }

  async getValidAccessToken() {
    const tokens = await this.tokenStorage.get();
    if (!tokens) return null;

    const now = Date.now();
    // Check if expired or about to expire (e.g., in 5 minutes)
    const expiresAt = tokens.created_at + (tokens.expires_in * 1000);
    
    if (now >= expiresAt - 300000) {
      return await this.refreshAccessToken(tokens);
    }
    
    return tokens.access_token;
  }

  async getUserItems() {
    const accessToken = await this.getValidAccessToken();
    const tokens = await this.tokenStorage.get();
    
    if (!accessToken || !tokens?.user_id) {
      return [];
    }

    let allItemIds: string[] = [];
    let offset = 0;
    const limit = 50;
    let total = 0;

    try {
      do {
        const searchResponse = await this.rateLimiter.get(`${this.config.apiUrl}/users/${tokens.user_id}/items/search`, {
          params: { 
              status: 'active', 
              access_token: accessToken,
              offset,
              limit
          },
        });
        
        const { paging, results } = searchResponse.data;
        if (results && Array.isArray(results)) {
            allItemIds = [...allItemIds, ...results];
        }
        
        total = paging.total;
        offset += limit;
        
      } while (offset < total);

      if (allItemIds.length === 0) return [];

      // 2. Get Item Details (Chunked by 20)
      const chunks = this.chunkArray(allItemIds, 20);
      let allItems: any[] = [];
      
      for (const chunk of chunks) {
          const itemsResponse = await this.rateLimiter.get(`${this.config.apiUrl}/items`, {
              params: { ids: chunk.join(','), access_token: accessToken },
          });
          
          if (Array.isArray(itemsResponse.data)) {
               allItems = [...allItems, ...itemsResponse.data.map((item: any) => item.body)];
          }
      }

      return allItems;
    } catch (error) {
      this.logger.error('Error fetching items', { error });
      return [];
    }
  }

  private chunkArray(array: any[], size: number) {
      const chunked = [];
      for (let i = 0; i < array.length; i += size) {
          chunked.push(array.slice(i, i + size));
      }
      return chunked;
  }
}

// Default configuration from environment variables
const defaultConfig: MeliConfig = {
  appId: process.env.MELI_APP_ID || '',
  clientSecret: process.env.MELI_CLIENT_SECRET || '',
  redirectUri: process.env.MELI_REDIRECT_URI || '',
  apiUrl: 'https://api.mercadolibre.com',
};

// Singleton instance for backward compatibility
export const meliClient = new MeliClient(
  defaultConfig,
  tokenStorage,
  meliRateLimiter,
  logger
);

// Export wrapper functions for backward compatibility
export const getAuthURL = () => meliClient.getAuthURL();
export const exchangeCodeForToken = (code: string, codeVerifier: string) => meliClient.exchangeCodeForToken(code, codeVerifier);
export const refreshAccessToken = (currentTokens: TokenData) => meliClient.refreshAccessToken(currentTokens);
export const getValidAccessToken = () => meliClient.getValidAccessToken();
export const getUserItems = () => meliClient.getUserItems();
