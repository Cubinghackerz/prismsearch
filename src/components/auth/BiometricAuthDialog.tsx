
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Fingerprint, Shield, AlertCircle, CheckCircle, Scan } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BiometricAuthService from '@/services/biometricAuthService';

interface BiometricAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  mode: 'setup' | 'authenticate';
  userId: string;
  displayName: string;
}

export const BiometricAuthDialog: React.FC<BiometricAuthDialogProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  mode,
  userId,
  displayName
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [supportedAuthenticators, setSupportedAuthenticators] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const checkAvailability = async () => {
      const available = BiometricAuthService.isAvailable();
      setIsAvailable(available);
      
      if (available) {
        const authenticators = await BiometricAuthService.getSupportedAuthenticators();
        setSupportedAuthenticators(authenticators);
      }
    };

    if (isOpen) {
      checkAvailability();
    }
  }, [isOpen]);

  const handleBiometricSetup = async () => {
    setIsLoading(true);
    
    try {
      const result = await BiometricAuthService.registerBiometric(userId, displayName);
      
      if (result.success) {
        toast({
          title: "Biometric authentication enabled",
          description: "Your biometric authentication has been set up successfully."
        });
        onAuthenticated();
        onClose();
      } else {
        toast({
          title: "Setup failed",
          description: result.error || "Failed to set up biometric authentication",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Setup failed",
        description: "An unexpected error occurred during setup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    
    try {
      const result = await BiometricAuthService.authenticateBiometric(userId);
      
      if (result.success) {
        toast({
          title: "Authentication successful",
          description: "You have been authenticated using biometrics."
        });
        onAuthenticated();
        onClose();
      } else {
        toast({
          title: "Authentication failed",
          description: result.error || "Biometric authentication failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "An unexpected error occurred during authentication",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthenticatorIcon = (type: string) => {
    switch (type) {
      case 'platform':
        return <Fingerprint className="h-5 w-5 text-green-400" />;
      case 'cross-platform':
        return <Shield className="h-5 w-5 text-blue-400" />;
      default:
        return <Scan className="h-5 w-5 text-purple-400" />;
    }
  };

  const getAuthenticatorName = (type: string) => {
    switch (type) {
      case 'platform':
        return 'Built-in Biometrics (Touch ID, Face ID, Windows Hello)';
      case 'cross-platform':
        return 'Security Key (USB, NFC)';
      default:
        return 'Unknown Authenticator';
    }
  };

  if (!isAvailable) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900/95 border-slate-700 backdrop-blur-sm max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400 text-xl flex items-center space-x-2">
              <AlertCircle className="h-6 w-6" />
              <span>Biometric Authentication Unavailable</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-slate-300">
              Biometric authentication is not supported on this device or browser. 
              Please use a modern browser with WebAuthn support.
            </p>
            
            <div className="flex justify-end">
              <Button onClick={onClose} variant="outline" className="border-slate-600 hover:bg-slate-700">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900/95 border-slate-700 backdrop-blur-sm max-w-md">
        <DialogHeader>
          <DialogTitle className="text-cyan-300 text-xl flex items-center space-x-2">
            <Fingerprint className="h-6 w-6" />
            <span>
              {mode === 'setup' ? 'Set Up Biometric Authentication' : 'Biometric Authentication'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-slate-200 font-medium">Available Authenticators</span>
            </div>
            
            <div className="space-y-2">
              {supportedAuthenticators.map((type) => (
                <div key={type} className="flex items-center space-x-3 text-sm">
                  {getAuthenticatorIcon(type)}
                  <span className="text-slate-300">{getAuthenticatorName(type)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-600/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-200">
                <p className="font-medium mb-1">Security Note:</p>
                <p>
                  {mode === 'setup' 
                    ? 'This will enable biometric authentication for your account. Your biometric data stays on your device and is never transmitted.'
                    : 'Use your registered biometric authentication to securely access your account.'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={mode === 'setup' ? handleBiometricSetup : handleBiometricAuth}
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Fingerprint className="h-4 w-4" />
                  <span>{mode === 'setup' ? 'Enable Biometrics' : 'Authenticate'}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
