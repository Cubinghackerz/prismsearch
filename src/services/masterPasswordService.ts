
import CryptoJS from 'crypto-js';

interface MasterPasswordData {
  hash: string;
  salt: string;
  createdAt: string;
}

class MasterPasswordService {
  private static readonly MASTER_PASSWORD_KEY = 'prism_vault_master_password';
  private static readonly SESSION_KEY = 'prism_vault_session';
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  static setMasterPassword(password: string): void {
    const salt = CryptoJS.lib.WordArray.random(128/8).toString();
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 1000
    }).toString();

    const masterPasswordData: MasterPasswordData = {
      hash,
      salt,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(this.MASTER_PASSWORD_KEY, JSON.stringify(masterPasswordData));
  }

  static hasMasterPassword(): boolean {
    return localStorage.getItem(this.MASTER_PASSWORD_KEY) !== null;
  }

  static verifyMasterPassword(password: string): boolean {
    const stored = localStorage.getItem(this.MASTER_PASSWORD_KEY);
    if (!stored) return false;

    const { hash, salt }: MasterPasswordData = JSON.parse(stored);
    const inputHash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 1000
    }).toString();

    return hash === inputHash;
  }

  static changeMasterPassword(oldPassword: string, newPassword: string): boolean {
    if (!this.verifyMasterPassword(oldPassword)) {
      return false;
    }

    this.setMasterPassword(newPassword);
    this.clearSession(); // Clear session after password change
    return true;
  }

  static createSession(): void {
    const sessionData = {
      timestamp: Date.now(),
      expires: Date.now() + this.SESSION_TIMEOUT
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
  }

  static isSessionValid(): boolean {
    const session = localStorage.getItem(this.SESSION_KEY);
    if (!session) return false;

    const { expires } = JSON.parse(session);
    return Date.now() < expires;
  }

  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  static encryptPassword(password: string, masterPassword: string): string {
    return CryptoJS.AES.encrypt(password, masterPassword).toString();
  }

  static decryptPassword(encryptedPassword: string, masterPassword: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, masterPassword);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static removeMasterPassword(): void {
    localStorage.removeItem(this.MASTER_PASSWORD_KEY);
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Check if a specific password requires master password protection
  static passwordRequiresMasterPassword(passwordId: string): boolean {
    const protectedPasswords = localStorage.getItem('prism_vault_protected_passwords');
    if (!protectedPasswords) return false;
    
    const protectedList = JSON.parse(protectedPasswords);
    return protectedList.includes(passwordId);
  }

  // Add a password to master password protection
  static protectPassword(passwordId: string): void {
    const protectedPasswords = localStorage.getItem('prism_vault_protected_passwords');
    const protectedList = protectedPasswords ? JSON.parse(protectedPasswords) : [];
    
    if (!protectedList.includes(passwordId)) {
      protectedList.push(passwordId);
      localStorage.setItem('prism_vault_protected_passwords', JSON.stringify(protectedList));
    }
  }

  // Remove a password from master password protection
  static unprotectPassword(passwordId: string): void {
    const protectedPasswords = localStorage.getItem('prism_vault_protected_passwords');
    if (!protectedPasswords) return;
    
    const protectedList = JSON.parse(protectedPasswords);
    const updatedList = protectedList.filter((id: string) => id !== passwordId);
    localStorage.setItem('prism_vault_protected_passwords', JSON.stringify(updatedList));
  }
}

export default MasterPasswordService;
