
// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { HostingerTokenManager } from './hostinger-token-manager';
import fs from 'fs/promises';
import crypto from 'crypto';

const { testDir, testTokenFile, testAuditLog } = vi.hoisted(() => {
  const cwd = process.cwd().replace(/\\/g, '/');
  const dir = `${cwd}/src/data/secure_test`;
  return {
    testDir: dir,
    testTokenFile: `${dir}/hostinger_token_test.enc`,
    testAuditLog: `${dir}/audit_test.log`,
  };
});

vi.mock('../config/hostinger', () => ({
  getHostingerConfig: () => ({
    apiBaseUrl: 'https://api.hostinger.com/v1',
    tokenStoragePath: testTokenFile,
    encryptionKeyEnvVar: 'HOSTINGER_ENCRYPTION_KEY_INTEGRATION',
    auditLogPath: testAuditLog,
  }),
}));

describe('HostingerTokenManager Integration', () => {
  const testKey = crypto.randomBytes(32).toString('hex');
  const testToken = 'integration-test-token-' + Date.now();
  let manager: HostingerTokenManager;

  beforeAll(async () => {
    process.env.HOSTINGER_ENCRYPTION_KEY_INTEGRATION = testKey;
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {}
    
    manager = new HostingerTokenManager();
  });

  afterAll(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {}
    delete process.env.HOSTINGER_ENCRYPTION_KEY_INTEGRATION;
  });

  it('should create directory, save token, and retrieve it correctly', async () => {
    await manager.saveToken(testToken);

    const fileExists = await fs.access(testTokenFile).then(() => true).catch(() => false);
    expect(fileExists).toBe(true);

    const retrievedToken = await manager.getToken();
    expect(retrievedToken).toBe(testToken);

    const logContent = await fs.readFile(testAuditLog, 'utf-8');
    expect(logContent).toContain('[WRITE] Token saved successfully');
    expect(logContent).toContain('[READ] Token retrieved successfully');
  });

  it('should fail to retrieve if key is wrong', async () => {
    await manager.saveToken(testToken);

    process.env.HOSTINGER_ENCRYPTION_KEY_INTEGRATION = 'wrong-key-0000000000000000000000000000';

    await expect(manager.getToken()).rejects.toThrow();
    
    process.env.HOSTINGER_ENCRYPTION_KEY_INTEGRATION = testKey;
  });
});
