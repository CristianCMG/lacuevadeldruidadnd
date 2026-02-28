
import path from 'path';

export type Environment = 'development' | 'staging' | 'production';

export interface HostingerConfig {
  apiBaseUrl: string;
  tokenStoragePath: string;
  encryptionKeyEnvVar: string;
  auditLogPath: string;
}

const BASE_STORAGE_PATH = process.env.DATA_STORAGE_PATH 
  ? path.join(process.env.DATA_STORAGE_PATH, 'secure')
  : path.join(process.cwd(), 'src', 'data', 'secure');

export const getHostingerConfig = (): HostingerConfig => {
  const env = (process.env.NODE_ENV || 'development') as Environment;
  
  const configs: Record<Environment, HostingerConfig> = {
    development: {
      apiBaseUrl: 'https://api.hostinger.com/v1',
      tokenStoragePath: path.join(BASE_STORAGE_PATH, 'hostinger_token_dev.enc'),
      encryptionKeyEnvVar: 'HOSTINGER_ENCRYPTION_KEY_DEV',
      auditLogPath: path.join(BASE_STORAGE_PATH, 'audit_dev.log'),
    },
    staging: {
      apiBaseUrl: 'https://api.hostinger.com/v1',
      tokenStoragePath: path.join(BASE_STORAGE_PATH, 'hostinger_token_staging.enc'),
      encryptionKeyEnvVar: 'HOSTINGER_ENCRYPTION_KEY_STAGING',
      auditLogPath: path.join(BASE_STORAGE_PATH, 'audit_staging.log'),
    },
    production: {
      apiBaseUrl: 'https://api.hostinger.com/v1',
      tokenStoragePath: path.join(BASE_STORAGE_PATH, 'hostinger_token_prod.enc'),
      encryptionKeyEnvVar: 'HOSTINGER_ENCRYPTION_KEY_PROD',
      auditLogPath: path.join(BASE_STORAGE_PATH, 'audit_prod.log'),
    },
  };

  return configs[env];
};
