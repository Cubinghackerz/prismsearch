
interface BiometricCredential {
  id: string;
  publicKey: string;
  counter: number;
  createdAt: string;
}

interface BiometricAuthResult {
  success: boolean;
  error?: string;
  credential?: BiometricCredential;
}

class BiometricAuthServiceClass {
  private readonly STORAGE_KEY = 'prism_biometric_credentials';

  // Check if biometric authentication is available
  isAvailable(): boolean {
    return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
  }

  // Get supported authenticator types
  async getSupportedAuthenticators(): Promise<string[]> {
    if (!this.isAvailable()) return [];

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      const authenticators = [];
      
      if (available) {
        authenticators.push('platform'); // Built-in biometrics (Touch ID, Face ID, Windows Hello)
      }
      
      // Cross-platform authenticators (USB security keys, etc.)
      authenticators.push('cross-platform');
      
      return authenticators;
    } catch (error) {
      console.error('Error checking authenticator availability:', error);
      return [];
    }
  }

  // Register a new biometric credential
  async registerBiometric(userId: string, displayName: string): Promise<BiometricAuthResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Biometric authentication is not supported on this device' };
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Prism',
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: displayName,
            displayName: displayName,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false,
          },
          timeout: 60000,
          attestation: 'direct',
        },
      }) as PublicKeyCredential;

      if (!credential) {
        return { success: false, error: 'Failed to create biometric credential' };
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialData: BiometricCredential = {
        id: credential.id,
        publicKey: this.arrayBufferToBase64(response.publicKey!),
        counter: response.getPublicKeyAlgorithm?.() || 0,
        createdAt: new Date().toISOString(),
      };

      // Store the credential
      this.storeCredential(userId, credentialData);

      return { success: true, credential: credentialData };
    } catch (error: any) {
      console.error('Biometric registration error:', error);
      return { 
        success: false, 
        error: error.name === 'NotAllowedError' 
          ? 'Biometric authentication was cancelled or not allowed' 
          : 'Failed to register biometric authentication'
      };
    }
  }

  // Authenticate using biometric
  async authenticateBiometric(userId: string): Promise<BiometricAuthResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Biometric authentication is not supported on this device' };
    }

    const credential = this.getStoredCredential(userId);
    if (!credential) {
      return { success: false, error: 'No biometric credential found. Please register first.' };
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{
            id: this.base64ToArrayBuffer(credential.id),
            type: 'public-key',
          }],
          userVerification: 'required',
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (!assertion) {
        return { success: false, error: 'Biometric authentication failed' };
      }

      return { success: true, credential };
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      return { 
        success: false, 
        error: error.name === 'NotAllowedError' 
          ? 'Biometric authentication was cancelled or not allowed' 
          : 'Biometric authentication failed'
      };
    }
  }

  // Check if user has biometric credentials
  hasBiometricCredential(userId: string): boolean {
    return !!this.getStoredCredential(userId);
  }

  // Remove biometric credential
  removeBiometricCredential(userId: string): void {
    const credentials = this.getAllCredentials();
    delete credentials[userId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentials));
  }

  private storeCredential(userId: string, credential: BiometricCredential): void {
    const credentials = this.getAllCredentials();
    credentials[userId] = credential;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentials));
  }

  private getStoredCredential(userId: string): BiometricCredential | null {
    const credentials = this.getAllCredentials();
    return credentials[userId] || null;
  }

  private getAllCredentials(): Record<string, BiometricCredential> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

const BiometricAuthService = new BiometricAuthServiceClass();
export default BiometricAuthService;
