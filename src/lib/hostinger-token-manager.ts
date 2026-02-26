
import fs from 'fs/promises';
import path from 'path';
import { SecurityUtils } from './security';
import { getHostingerConfig, HostingerConfig } from '../config/hostinger';

// Ensure we are running on the server side
if (typeof window !== 'undefined') {
  throw new Error('This module must only be used on the server side.');
}

export class HostingerTokenManager {
  private config: HostingerConfig;

  constructor() {
    this.config = getHostingerConfig();
  }

  /**
   * Initialize the secure storage directory if it doesn't exist
   */
  private async ensureStorageDirectory(): Promise<void> {
    const dir = path.dirname(this.config.tokenStoragePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true, mode: 0o700 }); // Restrict access to owner only
    }
  }

  /**
   * Save the API token securely
   * @param token The API token to save
   */
  async saveToken(token: string): Promise<void> {
    await this.ensureStorageDirectory();

    const encryptionKey = process.env[this.config.encryptionKeyEnvVar];
    if (!encryptionKey) {
      throw new Error(`Encryption key not found in environment variable: ${this.config.encryptionKeyEnvVar}`);
    }

    try {
      const encryptedToken = SecurityUtils.encrypt(token, encryptionKey);
      await fs.writeFile(this.config.tokenStoragePath, encryptedToken, { mode: 0o600 }); // Read/Write by owner only
      await this.logAccess('WRITE', 'Token saved successfully');
    } catch (error) {
      await this.logAccess('ERROR', `Failed to save token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Retrieve the API token securely
   * @returns The decrypted API token
   */
  async getToken(): Promise<string | null> {
    try {
      await fs.access(this.config.tokenStoragePath);
    } catch {
      await this.logAccess('READ_ATTEMPT', 'Token file not found');
      return null;
    }

    const encryptionKey = process.env[this.config.encryptionKeyEnvVar];
    if (!encryptionKey) {
      await this.logAccess('ERROR', `Missing encryption key: ${this.config.encryptionKeyEnvVar}`);
      throw new Error(`Encryption key not found in environment variable: ${this.config.encryptionKeyEnvVar}`);
    }

    try {
      const encryptedData = await fs.readFile(this.config.tokenStoragePath, 'utf-8');
      const token = SecurityUtils.decrypt(encryptedData, encryptionKey);
      await this.logAccess('READ', 'Token retrieved successfully');
      return token;
    } catch (error) {
      await this.logAccess('ERROR', `Failed to retrieve token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Log access attempts for audit purposes
   */
  private async logAccess(action: string, message: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${action}] ${message}\n`;
    
    try {
      await fs.appendFile(this.config.auditLogPath, logEntry);
    } catch (error) {
      console.error('Failed to write to audit log:', error);
      // Don't throw here to avoid breaking the main flow if logging fails
    }
  }
}
