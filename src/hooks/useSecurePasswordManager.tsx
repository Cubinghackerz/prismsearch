
import { useState, useCallback, useEffect } from 'react';
import { SecurePasswordService } from '@/services/securePasswordService';
import { toast } from 'sonner';

interface SecurePasswordData {
  id: string;
  name: string;
  username?: string;
  url?: string;
  encryptedPassword: string;
  salt: string;
  createdAt: number;
  updatedAt: number;
}

interface SecureSession {
  isAuthenticated: boolean;
  sessionData?: any;
}

export const useSecurePasswordManager = () => {
  const [session, setSession] = useState<SecureSession>({ isAuthenticated: false });
  const [passwords, setPasswords] = useState<SecurePasswordData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Validate existing session on mount
  useEffect(() => {
    const sessionData = localStorage.getItem('prism_vault_session');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        if (SecurePasswordService.validateSession(parsed)) {
          setSession({ isAuthenticated: true, sessionData: parsed });
          loadPasswords();
        } else {
          // Session expired, clear it
          localStorage.removeItem('prism_vault_session');
          toast.error('Session expired. Please authenticate again.');
        }
      } catch (error) {
        console.error('Session validation error:', error);
        localStorage.removeItem('prism_vault_session');
      }
    }
  }, []);

  const authenticateWithMasterPassword = useCallback(async (masterPassword: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const storedAuth = localStorage.getItem('prism_vault_auth');
      
      if (!storedAuth) {
        // First time setup - create master password with salt
        const { hash, salt } = SecurePasswordService.hashMasterPassword(masterPassword);
        localStorage.setItem('prism_vault_auth', JSON.stringify({ hash, salt }));
        
        const sessionData = SecurePasswordService.createSessionData('local');
        localStorage.setItem('prism_vault_session', JSON.stringify(sessionData));
        
        setSession({ isAuthenticated: true, sessionData });
        toast.success('Master password set successfully');
        return true;
      }
      
      const { hash, salt } = JSON.parse(storedAuth);
      
      if (SecurePasswordService.verifyMasterPassword(masterPassword, hash, salt)) {
        const sessionData = SecurePasswordService.createSessionData('local');
        localStorage.setItem('prism_vault_session', JSON.stringify(sessionData));
        
        setSession({ isAuthenticated: true, sessionData });
        loadPasswords();
        toast.success('Authentication successful');
        return true;
      } else {
        toast.error('Invalid master password');
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPasswords = useCallback(() => {
    try {
      const stored = localStorage.getItem('prism_vault_passwords');
      if (stored) {
        const parsedPasswords = JSON.parse(stored);
        setPasswords(parsedPasswords);
      }
    } catch (error) {
      console.error('Error loading passwords:', error);
      toast.error('Failed to load passwords');
    }
  }, []);

  const addPassword = useCallback((data: { name: string; username?: string; password: string; url?: string }) => {
    if (!session.isAuthenticated) {
      toast.error('Not authenticated');
      return;
    }

    try {
      const storedAuth = localStorage.getItem('prism_vault_auth');
      if (!storedAuth) return;

      const { salt } = JSON.parse(storedAuth);
      const masterPassword = prompt('Enter master password to save this password:');
      
      if (!masterPassword) return;

      const encryptedPassword = SecurePasswordService.encryptData(data.password, masterPassword, salt);
      
      const newPassword: SecurePasswordData = {
        id: crypto.randomUUID(),
        name: data.name,
        username: data.username,
        url: data.url,
        encryptedPassword,
        salt,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const updatedPasswords = [...passwords, newPassword];
      setPasswords(updatedPasswords);
      localStorage.setItem('prism_vault_passwords', JSON.stringify(updatedPasswords));
      
      toast.success('Password saved securely');
    } catch (error) {
      console.error('Error saving password:', error);
      toast.error('Failed to save password');
    }
  }, [session, passwords]);

  const decryptPassword = useCallback((passwordId: string, masterPassword: string): string | null => {
    try {
      const password = passwords.find(p => p.id === passwordId);
      if (!password) return null;

      return SecurePasswordService.decryptData(password.encryptedPassword, masterPassword, password.salt);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }, [passwords]);

  const logout = useCallback(() => {
    localStorage.removeItem('prism_vault_session');
    setSession({ isAuthenticated: false });
    setPasswords([]);
    toast.success('Logged out successfully');
  }, []);

  return {
    session,
    passwords,
    isLoading,
    authenticateWithMasterPassword,
    addPassword,
    decryptPassword,
    logout
  };
};
