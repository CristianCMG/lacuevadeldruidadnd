
# Hostinger API Token Security

This document outlines the security mechanism implemented for storing and retrieving the Hostinger API token.

## Overview

The Hostinger API token is a sensitive credential that allows access to the Hostinger account management. To prevent unauthorized access, the token is stored using encryption at rest and is never exposed in plain text in logs or configuration files.

## Storage Mechanism

### Encryption
The token is encrypted using **AES-256-GCM** (Galois/Counter Mode), which provides both confidentiality and integrity.
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with SHA-512 (100,000 iterations)
- **Salt**: Random 64-byte salt
- **IV**: Random 16-byte initialization vector

### File Location
The encrypted token is stored in the server's file system. The file path varies by environment:
- **Development**: `src/data/secure/hostinger_token_dev.enc`
- **Staging**: `src/data/secure/hostinger_token_staging.enc`
- **Production**: `src/data/secure/hostinger_token_prod.enc`

The file permissions are set to `600` (read/write by owner only) to restrict access from other users on the system.

## Configuration

The system uses environment variables to store the master encryption key. This key is never committed to version control.

### Environment Variables
You must set the following environment variables in your `.env.local` or server environment:

- `HOSTINGER_ENCRYPTION_KEY_DEV`: Encryption key for development environment
- `HOSTINGER_ENCRYPTION_KEY_STAGING`: Encryption key for staging environment
- `HOSTINGER_ENCRYPTION_KEY_PROD`: Encryption key for production environment

**Note:** The encryption key should be a strong, random string (at least 32 characters).

## Access Control

- **Server-Side Only**: The token manager module ensures it can only be imported and used in a server-side environment (Node.js), preventing accidental bundling in client-side code.
- **Audit Logging**: All access attempts (read/write) are logged to an audit log file located in `src/data/secure/audit_<env>.log`.

## Usage

To use the token manager in your code:

```typescript
import { HostingerTokenManager } from '@/lib/hostinger-token-manager';

const manager = new HostingerTokenManager();

// To save a new token (e.g., from an admin script)
await manager.saveToken('your-raw-token');

// To retrieve the token for API calls
const token = await manager.getToken();
```

## Security Best Practices

1.  **Key Management**: Rotate encryption keys periodically. If a key is compromised, all tokens encrypted with it must be re-encrypted with a new key.
2.  **Least Privilege**: Ensure the application process runs with a user that has minimal permissions on the server.
3.  **Audit Monitoring**: Regularly monitor the audit logs for suspicious access patterns.
4.  **No Hardcoding**: NEVER hardcode the API token or the encryption key in the source code.
5.  **Git Ignore**: Ensure `src/data/secure/*.enc` and `src/data/secure/*.log` are added to `.gitignore`.

## Setup Instructions

1.  Generate a strong encryption key: `openssl rand -hex 32`
2.  Add it to `.env.local`: `HOSTINGER_ENCRYPTION_KEY_DEV=your_generated_key`
3.  Run a script to save the initial token (see `scripts/setup-hostinger-token.ts` - *to be created if needed*).
