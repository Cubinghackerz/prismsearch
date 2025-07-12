import CryptoJS from 'crypto-js';

class MasterPasswordServiceClass {
  private masterPasswordHash: string | null = null;
  private sessionCreatedAt: number | null = null;
  private readonly SESSION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
  private autoLockTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadMasterPassword();
    this.loadSession();
  }

  private loadMasterPassword(): void {
    const storedHash = localStorage.getItem('prism_vault_master_password');
    if (storedHash) {
      this.masterPasswordHash = storedHash;
    }
  }

  private loadSession(): void {
    const storedSession = localStorage.getItem('prism_vault_session');
    if (storedSession) {
      this.sessionCreatedAt = parseInt(storedSession, 10);
    }
  }

  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  hasMasterPassword(): boolean {
    return !!this.masterPasswordHash;
  }

  setMasterPassword(password: string): void {
    this.masterPasswordHash = this.hashPassword(password);
    localStorage.setItem('prism_vault_master_password', this.masterPasswordHash);
  }

  verifyMasterPassword(password: string): boolean {
    const hashedPassword = this.hashPassword(password);
    return this.masterPasswordHash === hashedPassword;
  }

  removeMasterPassword(): void {
    this.masterPasswordHash = null;
    localStorage.removeItem('prism_vault_master_password');
    this.clearSession();
  }

  createSession(): void {
    this.sessionCreatedAt = Date.now();
    localStorage.setItem('prism_vault_session', this.sessionCreatedAt.toString());
    this.startAutoLockTimer();
  }

  private startAutoLockTimer(): void {
    this.clearAutoLockTimer();
    this.autoLockTimer = setTimeout(() => {
      this.clearSession();
    }, this.SESSION_DURATION);
  }

  private clearAutoLockTimer(): void {
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }
  }

  clearSession(): void {
    this.sessionCreatedAt = null;
    localStorage.removeItem('prism_vault_session');
    this.clearAutoLockTimer();
    // Dispatch custom event to notify components about session clearing
    window.dispatchEvent(new CustomEvent('masterPasswordSessionCleared'));
  }

  isSessionValid(): boolean {
    if (!this.sessionCreatedAt) {
      const stored = localStorage.getItem('prism_vault_session');
      if (!stored) return false;
      this.sessionCreatedAt = parseInt(stored);
    }

    if (!this.sessionCreatedAt) return false;

    const now = Date.now();
    const isValid = (now - this.sessionCreatedAt) < this.SESSION_DURATION;
    
    if (!isValid) {
      this.clearSession();
      return false;
    }

    // Restart the timer on session check (activity detection)
    this.startAutoLockTimer();
    return true;
  }

  protectPassword(passwordId: string): void {
    let protectedPasswords = localStorage.getItem('prism_vault_protected_passwords');
    let passwordIds = protectedPasswords ? new Set(JSON.parse(protectedPasswords)) : new Set<string>();
    passwordIds.add(passwordId);
    localStorage.setItem('prism_vault_protected_passwords', JSON.stringify(Array.from(passwordIds)));
  }

  unprotectPassword(passwordId: string): void {
    let protectedPasswords = localStorage.getItem('prism_vault_protected_passwords');
    if (protectedPasswords) {
      let passwordIds = new Set(JSON.parse(protectedPasswords));
      passwordIds.delete(passwordId);
      localStorage.setItem('prism_vault_protected_passwords', JSON.stringify(Array.from(passwordIds)));
    }
  }

  passwordRequiresMasterPassword(passwordId: string): boolean {
    const protectedPasswords = localStorage.getItem('prism_vault_protected_passwords');
    if (!protectedPasswords) return false;
    const passwordIds = new Set(JSON.parse(protectedPasswords));
    return passwordIds.has(passwordId);
  }

  getPasswordUpdateSuggestion(createdAt: string, updatedAt: string): { shouldUpdate: boolean; urgency: 'low' | 'medium' | 'high'; message: string; daysOld: number } {
    const createdDate = new Date(createdAt);
    const updatedDate = new Date(updatedAt);
    const now = new Date();

    const daysSinceUpdate = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate >= 180) {
      return {
        shouldUpdate: true,
        urgency: 'high',
        message: 'Update immediately',
        daysOld: daysSinceUpdate
      };
    } else if (daysSinceUpdate >= 90) {
      return {
        shouldUpdate: true,
        urgency: 'medium',
        message: 'Update soon',
        daysOld: daysSinceUpdate
      };
    } else if (daysSinceCreation >= 365 && daysSinceUpdate < 90) {
      return {
        shouldUpdate: true,
        urgency: 'low',
        message: 'Consider updating',
        daysOld: daysSinceUpdate
      };
    }

    return {
      shouldUpdate: false,
      urgency: 'low',
      message: '',
      daysOld: daysSinceUpdate
    };
  }
}

const MasterPasswordService = new MasterPasswordServiceClass();
export default MasterPasswordService;
