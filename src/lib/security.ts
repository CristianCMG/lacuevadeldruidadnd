
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

export class SecurityUtils {
  /**
   * Derives a key from a password and salt using PBKDF2
   */
  private static getKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  }

  /**
   * Encrypts text using AES-256-GCM
   * @param text The text to encrypt
   * @param masterKey The master key used to derive the encryption key
   * @returns The encrypted data in format: salt:iv:tag:ciphertext
   */
  static encrypt(text: string, masterKey: string): string {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = this.getKey(masterKey, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return [
      salt.toString('hex'),
      iv.toString('hex'),
      tag.toString('hex'),
      encrypted.toString('hex')
    ].join(':');
  }

  /**
   * Decrypts text using AES-256-GCM
   * @param encryptedText The encrypted string in format: salt:iv:tag:ciphertext
   * @param masterKey The master key used to derive the encryption key
   * @returns The decrypted text
   */
  static decrypt(encryptedText: string, masterKey: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted text format');
    }

    const [saltHex, ivHex, tagHex, encryptedHex] = parts;
    
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const key = this.getKey(masterKey, salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted) + decipher.final('utf8');
  }
}
