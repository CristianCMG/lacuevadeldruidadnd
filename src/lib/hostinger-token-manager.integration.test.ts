
// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { HostingerTokenManager } from './hostinger-token-manager';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Use vi.hoisted to share variables with the mock factory
const { testDir, testTokenFile, testAuditLog } = vi.hoisted(() => {
  const path = require('path');
  const cwd = process.cwd();
  const dir = path.join(cwd, 'src', 'data', 'secure_test');
  return {
    testDir: dir,
    testTokenFile: path.join(dir, 'hostinger_token_test.enc'),
    testAuditLog: path.join(dir, 'audit_test.log'),
  };
});

// Mock config module
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
    // Ensure test directory is clean
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {}
    
    manager = new HostingerTokenManager();
  });

  afterAll(async () => {
    // Cleanup
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {}
    delete process.env.HOSTINGER_ENCRYPTION_KEY_INTEGRATION;
  });

  it('should create directory, save token, and retrieve it correctly', async () => {
    // 1. Save Token
    await manager.saveToken(testToken);

    // Verify file exists
    const fileExists = await fs.access(testTokenFile).then(() => true).catch(() => false);
    expect(fileExists).toBe(true);

    // Verify file permissions (if possible, on Windows it's tricky, but on Linux/Mac it works)
    // We skip permission check for cross-platform compatibility in this simple test

    // 2. Retrieve Token
    const retrievedToken = await manager.getToken();
    expect(retrievedToken).toBe(testToken);

    // 3. Verify Audit Log
    const logContent = await fs.readFile(testAuditLog, 'utf-8');
    expect(logContent).toContain('[WRITE] Token saved successfully');
    expect(logContent).toContain('[READ] Token retrieved successfully');
  });

  it('should fail to retrieve if key is wrong', async () => {
    // Save with correct key first
    await manager.saveToken(testToken);

    // Change key
    process.env.HOSTINGER_ENCRYPTION_KEY_INTEGRATION = 'wrong-key-0000000000000000000000000000';

    // Attempt retrieve
    // It should fail either during decryption (MAC check failed) or return garbage
    // SecurityUtils.decrypt throws if tag mismatch
    await expect(manager.getToken()).rejects.toThrow();
    
    // Restore key
    process.env.HOSTINGER_ENCRYPTION_KEY_INTEGRATION = testKey;
  });
});
