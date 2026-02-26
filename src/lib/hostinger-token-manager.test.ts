
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HostingerTokenManager } from './hostinger-token-manager';
import fs from 'fs/promises';
import path from 'path';

// Mock fs module
vi.mock('fs/promises');

// Mock config to return predictable paths
vi.mock('../config/hostinger', () => ({
  getHostingerConfig: () => ({
    apiBaseUrl: 'https://api.hostinger.com/v1',
    tokenStoragePath: '/mock/path/to/token.enc',
    encryptionKeyEnvVar: 'HOSTINGER_ENCRYPTION_KEY_TEST',
    auditLogPath: '/mock/path/to/audit.log',
  }),
}));

describe('HostingerTokenManager', () => {
  let manager: HostingerTokenManager;
  const mockToken = 'test-token-123';
  const mockKey = 'test-encryption-key-secure';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.HOSTINGER_ENCRYPTION_KEY_TEST = mockKey;
    manager = new HostingerTokenManager();
  });

  afterEach(() => {
    delete process.env.HOSTINGER_ENCRYPTION_KEY_TEST;
  });

  it('should encrypt and save the token', async () => {
    // Mock fs.access to fail (directory doesn't exist) then succeed
    vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.appendFile).mockResolvedValue(undefined);

    await manager.saveToken(mockToken);

    // Verify directory creation
    expect(fs.mkdir).toHaveBeenCalledWith(path.dirname('/mock/path/to/token.enc'), expect.objectContaining({ recursive: true }));

    // Verify file write with encrypted content
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/mock/path/to/token.enc',
      expect.stringMatching(/.+:.+:.+:.+/), // Encrypted format pattern
      expect.objectContaining({ mode: 0o600 })
    );

    // Verify audit logging
    expect(fs.appendFile).toHaveBeenCalledWith(
      '/mock/path/to/audit.log',
      expect.stringContaining('[WRITE] Token saved successfully')
    );
  });

  it('should retrieve and decrypt the token', async () => {
    // specific mock implementation for this test
    const encryptedToken = 'mock:encrypted:token:string'; // In real test we'd need valid encrypted string
    
    // We need a real encrypted string to test decryption success
    // So let's use the actual SecurityUtils to encrypt first
    const { SecurityUtils } = await import('./security');
    const realEncrypted = SecurityUtils.encrypt(mockToken, mockKey);

    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(realEncrypted);

    const retrievedToken = await manager.getToken();

    expect(retrievedToken).toBe(mockToken);
    expect(fs.readFile).toHaveBeenCalledWith('/mock/path/to/token.enc', 'utf-8');
  });

  it('should throw error if encryption key is missing', async () => {
    delete process.env.HOSTINGER_ENCRYPTION_KEY_TEST;

    await expect(manager.saveToken(mockToken)).rejects.toThrow('Encryption key not found');
  });

  it('should return null if token file does not exist', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

    const result = await manager.getToken();
    expect(result).toBeNull();
  });
});
