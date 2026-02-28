import fs from 'fs/promises';
import path from 'path';
import { ITokenStorage } from './interfaces';
import { TokenData } from './types';
import { SecurityUtils } from './security';

const TOKENS_FILE = path.join(process.cwd(), 'src', 'data', 'tokens.json');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.MELI_CLIENT_SECRET || 'fallback-secret-key-do-not-use-in-prod';

export class TokenStorage implements ITokenStorage {
  async save(tokens: TokenData): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(TOKENS_FILE);
      await fs.mkdir(dir, { recursive: true });
      
      const json = JSON.stringify(tokens);
      const encrypted = SecurityUtils.encrypt(json, ENCRYPTION_KEY);
      
      await fs.writeFile(TOKENS_FILE, encrypted);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  }

  async get(): Promise<TokenData | null> {
    try {
      const data = await fs.readFile(TOKENS_FILE, 'utf-8');
      
      try {
        // Try to decrypt
        const decrypted = SecurityUtils.decrypt(data, ENCRYPTION_KEY);
        return JSON.parse(decrypted) as TokenData;
      } catch (e) {
        // Fallback: Try parsing as plain JSON (migration path)
        try {
          return JSON.parse(data) as TokenData;
        } catch (jsonError) {
          console.error('Error parsing tokens (decryption failed and not valid JSON):', e);
          return null;
        }
      }
    } catch (error) {
      // If file doesn't exist, return null
      if ((error as any).code === 'ENOENT') {
        return null;
      }
      console.error('Error reading tokens:', error);
      return null;
    }
  }
}

export const tokenStorage = new TokenStorage();
export type { TokenData };
