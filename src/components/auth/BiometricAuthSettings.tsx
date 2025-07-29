
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Fingerprint, Shield, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/clerk-react';
import BiometricAuthService from '@/services/biometricAuthService';
import { BiometricAuthDialog } from './BiometricAuthDialog';

export const BiometricAuthSettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'setup' | 'authenticate'>('setup');
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const checkBiometricStatus = async () => {
      const available = BiometricAuthService.isAvailable();
      setIsAvailable(available);
      
      if (available && user) {
        const hasCredential = BiometricAuthService.hasBiometricCredential(user.id);
        setIsEnabled(hasCredential);
      }
    };

    checkBiometricStatus();
  }, [user]);

  const handleToggleBiometric = async () => {
    if (!user) return;

    if (isEnabled) {
      // Disable biometric auth
      BiometricAuthService.removeBiometricCredential(user.id);
      setIsEnabled(false);
      toast({
        title: "Biometric authentication disabled",
        description: "Your biometric authentication has been removed."
      });
    } else {
      // Enable biometric auth
      setDialogMode('setup');
      setShowDialog(true);
    }
  };

  const handleBiometricAuthenticated = () => {
    setIsEnabled(true);
    setShowDialog(false);
  };

  const handleTestBiometric = () => {
    if (!user) return;
    setDialogMode('authenticate');
    setShowDialog(true);
  };

  if (!isAvailable) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center space-x-2">
            <Fingerprint className="h-5 w-5" />
            <span>Biometric Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-950/30 border border-amber-600/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-200">
                <p className="font-medium mb-1">Not Available</p>
                <p>
                  Biometric authentication is not supported on this device or browser. 
                  Please use a modern browser with WebAuthn support.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center space-x-2">
            <Fingerprint className="h-5 w-5" />
            <span>Biometric Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-slate-200">Enable Biometric Authentication</Label>
              <p className="text-sm text-slate-400">
                Use fingerprint, face recognition, or other biometric methods to authenticate
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleBiometric}
            />
          </div>

          {isEnabled && (
            <div className="space-y-3 pt-3 border-t border-slate-600">
              <div className="bg-green-950/30 border border-green-600/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-200">
                    <p className="font-medium mb-1">Biometric Authentication Enabled</p>
                    <p>Your biometric authentication is active and ready to use.</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleTestBiometric}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Test Authentication
                </Button>
                
                <Button
                  onClick={() => handleToggleBiometric()}
                  variant="outline"
                  size="sm"
                  className="border-red-600 hover:bg-red-700/20 text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          )}

          {!isEnabled && (
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Plus className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-300">
                  <p className="font-medium mb-1">Quick & Secure Access</p>
                  <p>
                    Enable biometric authentication for faster and more secure login. 
                    Your biometric data stays on your device.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {user && (
        <BiometricAuthDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          onAuthenticated={handleBiometricAuthenticated}
          mode={dialogMode}
          userId={user.id}
          displayName={user.firstName || user.emailAddresses[0]?.emailAddress || 'User'}
        />
      )}
    </>
  );
};
