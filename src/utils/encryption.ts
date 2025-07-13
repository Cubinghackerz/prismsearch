
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'prism-notes-encryption-key-2024';

export const encryptText = async (text: string): Promise<string> => {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; // Fallback to plain text
  }
};

export const decryptText = async (encryptedText: string): Promise<string> => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || encryptedText; // Fallback to original if decryption fails
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedText; // Fallback to encrypted text
  }
};
