import axios from 'axios';
import crypto from 'crypto';
import { TokenStorage, TokenData } from './token-storage';
import { meliRateLimiter } from './rate-limiter';
import { logger } from './logger';

const MELI_API_URL = 'https://api.mercadolibre.com';

// PKCE Helper Functions
function base64URLEncode(str: Buffer) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer: Buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

function generatePKCE() {
  const verifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(Buffer.from(verifier)));
  return { verifier, challenge };
}

export const getAuthURL = () => {
  const appId = process.env.MELI_APP_ID;
  const redirectUri = process.env.MELI_REDIRECT_URI;
  const { verifier, challenge } = generatePKCE();
  
  const url = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${appId}&redirect_uri=${redirectUri}&code_challenge=${challenge}&code_challenge_method=S256`;
  
  return { url, codeVerifier: verifier };
};

export const exchangeCodeForToken = async (code: string, codeVerifier: string) => {
  try {
    const response = await meliRateLimiter.post(`${MELI_API_URL}/oauth/token`, null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.MELI_APP_ID,
        client_secret: process.env.MELI_CLIENT_SECRET,
        code,
        redirect_uri: process.env.MELI_REDIRECT_URI,
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
    
    await TokenStorage.save(tokenData);
    
    return response.data;
  } catch (error) {
    logger.error('Error exchanging code', { error });
    throw error;
  }
};

export const refreshAccessToken = async (currentTokens: TokenData) => {
  try {
    const response = await meliRateLimiter.post(`${MELI_API_URL}/oauth/token`, null, {
      params: {
        grant_type: 'refresh_token',
        client_id: process.env.MELI_APP_ID,
        client_secret: process.env.MELI_CLIENT_SECRET,
        refresh_token: currentTokens.refresh_token,
      },
    });
    
    const { access_token, refresh_token, user_id, expires_in, scope, token_type } = response.data;
    
    const newTokens: TokenData = {
      access_token,
      refresh_token, // Use new refresh token if provided
      user_id,
      expires_in,
      scope,
      token_type,
      created_at: Date.now(),
    };
    
    await TokenStorage.save(newTokens);
    return access_token;
  } catch (error) {
    logger.error('Error refreshing token', { error });
    throw error;
  }
};

export const getValidAccessToken = async () => {
  const tokens = await TokenStorage.get();
  if (!tokens) return null;

  const now = Date.now();
  // Check if expired or about to expire (e.g., in 5 minutes)
  const expiresAt = tokens.created_at + (tokens.expires_in * 1000);
  
  if (now >= expiresAt - 300000) {
    return await refreshAccessToken(tokens);
  }
  
  return tokens.access_token;
};

export const getUserItems = async () => {
  const accessToken = await getValidAccessToken();
  const tokens = await TokenStorage.get();
  
  if (!accessToken || !tokens?.user_id) {
    return [];
  }

  let allItemIds: string[] = [];
  let offset = 0;
  const limit = 50;
  let total = 0;

  try {
    do {
      const searchResponse = await meliRateLimiter.get(`${MELI_API_URL}/users/${tokens.user_id}/items/search`, {
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
    const chunks = chunkArray(allItemIds, 20);
    let allItems: any[] = [];
    
    for (const chunk of chunks) {
        const itemsResponse = await meliRateLimiter.get(`${MELI_API_URL}/items`, {
            params: { ids: chunk.join(','), access_token: accessToken },
        });
        
        if (Array.isArray(itemsResponse.data)) {
             allItems = [...allItems, ...itemsResponse.data.map((item: any) => item.body)];
        }
    }

    return allItems;
  } catch (error) {
    logger.error('Error fetching items', { error });
    return [];
  }
};

function chunkArray(array: any[], size: number) {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
}
