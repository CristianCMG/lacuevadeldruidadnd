import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenStorage } from '../src/lib/token-storage';
import { SecurityUtils } from '../src/lib/security';
import fs from 'fs/promises';

// Mock fs/promises explicitly
vi.mock('fs/promises', () => ({
  default: {
    writeFile: vi.fn(),
    readFile: vi.fn(),
    mkdir: vi.fn(),
  },
}));

describe('TokenStorage Security', () => {
  let tokenStorage: TokenStorage;
  const mockTokens = {
    access_token: 'access-123',
    refresh_token: 'refresh-123',
    user_id: 12345,
    expires_in: 3600,
    scope: 'read',
    token_type: 'bearer',
    created_at: 1234567890,
  };

  beforeEach(() => {
    tokenStorage = new TokenStorage();
    vi.clearAllMocks();
  });

  it('should encrypt tokens before writing to disk', async () => {
    await tokenStorage.save(mockTokens);

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    const [filePath, content] = vi.mocked(fs.writeFile).mock.calls[0];
    
    // Content should not contain the plain access token
    expect(content).not.toContain('access-123');
    // Content should look like encrypted string (salt:iv:tag:ciphertext)
    expect(content).toMatch(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);
  });

  it('should decrypt tokens when reading from disk', async () => {
    const json = JSON.stringify(mockTokens);
    const key = process.env.ENCRYPTION_KEY || process.env.MELI_CLIENT_SECRET || 'fallback-secret-key-do-not-use-in-prod';
    const encrypted = SecurityUtils.encrypt(json, key);

    vi.mocked(fs.readFile).mockResolvedValue(encrypted);

    const tokens = await tokenStorage.get();

    expect(tokens).toEqual(mockTokens);
  });

  it('should handle plain JSON for backward compatibility', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockTokens));

    const tokens = await tokenStorage.get();

    expect(tokens).toEqual(mockTokens);
  });
});
