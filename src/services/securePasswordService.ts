
import CryptoJS from 'crypto-js';

// Enhanced password security service with proper key derivation
export class SecurePasswordService {
  private static readonly SALT_LENGTH = 32;
  private static readonly ITERATIONS = 100000; // PBKDF2 iterations
  
  // Generate a cryptographically secure salt
  static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(this.SALT_LENGTH).toString();
  }
  
  // Derive key using PBKDF2 instead of simple SHA-256
  static deriveKey(masterPassword: string, salt: string): string {
    return CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256/32,
      iterations: this.ITERATIONS,
      hasher: CryptoJS.algo.SHA256
    }).toString();
  }
  
  // Enhanced master password hashing with salt
  static hashMasterPassword(password: string, salt?: string): { hash: string; salt: string } {
    const passwordSalt = salt || this.generateSalt();
    const hash = this.deriveKey(password, passwordSalt);
    return { hash, salt: passwordSalt };
  }
  
  // Verify master password with salt
  static verifyMasterPassword(password: string, storedHash: string, salt: string): boolean {
    const derivedKey = this.deriveKey(password, salt);
    return derivedKey === storedHash;
  }
  
  // Enhanced encryption with proper key derivation
  static encryptData(data: string, masterPassword: string, salt: string): string {
    const key = this.deriveKey(masterPassword, salt);
    return CryptoJS.AES.encrypt(data, key).toString();
  }
  
  // Enhanced decryption with proper key derivation
  static decryptData(encryptedData: string, masterPassword: string, salt: string): string {
    const key = this.deriveKey(masterPassword, salt);
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  // Session validation with timestamp checking
  static validateSession(sessionData: any): boolean {
    if (!sessionData || !sessionData.timestamp) {
      return false;
    }
    
    const now = Date.now();
    const sessionAge = now - sessionData.timestamp;
    const maxAge = 60 * 60 * 1000; // 1 hour session timeout
    
    return sessionAge < maxAge;
  }
  
  // Create secure session data
  static createSessionData(userId: string): any {
    return {
      userId,
      timestamp: Date.now(),
      sessionId: CryptoJS.lib.WordArray.random(16).toString()
    };
  }
}
