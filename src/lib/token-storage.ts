import fs from 'fs/promises';
import path from 'path';

const TOKENS_FILE = path.join(process.cwd(), 'src', 'data', 'tokens.json');

export interface TokenData {
  access_token: string;
  refresh_token: string;
  user_id: number;
  expires_in: number;
  scope: string;
  token_type: string;
  created_at: number;
}

export class TokenStorage {
  static async save(tokens: TokenData): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(TOKENS_FILE);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  }

  static async get(): Promise<TokenData | null> {
    try {
      const data = await fs.readFile(TOKENS_FILE, 'utf-8');
      return JSON.parse(data) as TokenData;
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
