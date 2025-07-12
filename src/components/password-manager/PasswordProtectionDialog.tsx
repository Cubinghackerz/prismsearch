
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MasterPasswordService from '@/services/masterPasswordService';
import { MasterPasswordDialog } from '@/components/vault/MasterPasswordDialog';

interface StoredPassword {
  id: string;
  name: string;
  url?: string;
  password_encrypted: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  is_favorite?: boolean;
  breach_status?: 'safe' | 'breached' | 'checking';
  breach_count?: number;
}

interface PasswordProtectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  password: StoredPassword;
  onProtectionChanged: () => void;
}

export const PasswordProtectionDialog: React.FC<PasswordProtectionDialogProps> = ({
  isOpen,
  onClose,
  password,
  onProtectionChanged
}) => {
  const [isProtected, setIsProtected] = useState(() => 
    MasterPasswordService.passwordRequiresMasterPassword(password.id)
  );
  const [showMasterPasswordSetup, setShowMasterPasswordSetup] = useState(false);
  const [showMasterPasswordVerify, setShowMasterPasswordVerify] = useState(false);
  const [pendingProtectionChange, setPendingProtectionChange] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleProtectionToggle = (enabled: boolean) => {
    if (!MasterPasswordService.hasMasterPassword()) {
      if (enabled) {
        // Need to set up master password first
        setShowMasterPasswordSetup(true);
        setPendingProtectionChange(enabled);
      }
      return;
    }

    // If master password exists, require verification for any change
    if (!MasterPasswordService.isSessionValid()) {
      setPendingProtectionChange(enabled);
      setShowMasterPasswordVerify(true);
      return;
    }

    // Session is valid, proceed with change
    applyProtectionChange(enabled);
  };

  const applyProtectionChange = (enabled: boolean) => {
    if (enabled) {
      MasterPasswordService.protectPassword(password.id);
      toast({
        title: "Password protected",
        description: `"${password.name}" now requires master password to view.`
      });
    } else {
      MasterPasswordService.unprotectPassword(password.id);
      toast({
        title: "Protection removed",
        description: `"${password.name}" no longer requires master password.`
      });
    }

    setIsProtected(enabled);
    setPendingProtectionChange(null);
    onProtectionChanged();
  };

  const handleMasterPasswordSetup = () => {
    setShowMasterPasswordSetup(false);
    // After master password is set up, enable protection for this password
    if (pendingProtectionChange !== null) {
      applyProtectionChange(pendingProtectionChange);
    }
  };

  const handleMasterPasswordVerified = () => {
    setShowMasterPasswordVerify(false);
    // After verification, apply the pending change
    if (pendingProtectionChange !== null) {
      applyProtectionChange(pendingProtectionChange);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900/95 border-slate-700 backdrop-blur-sm max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cyan-300 text-xl flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Password Protection</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-slate-200 font-medium">{password.name}</h3>
              {password.url && (
                <p className="text-slate-400 text-sm">{password.url}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-slate-200 font-medium">Master Password Protection</Label>
                <p className="text-slate-400 text-sm">
                  Require master password to view, copy, edit, or delete this password
                </p>
              </div>
              <Switch
                checked={isProtected}
                onCheckedChange={handleProtectionToggle}
              />
            </div>

            {isProtected && (
              <div className="bg-amber-950/30 border border-amber-600/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Lock className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-200">
                    <p className="font-medium mb-1">Protected</p>
                    <p>This password requires master password verification to view, copy, edit, or delete.</p>
                  </div>
                </div>
              </div>
            )}

            {!MasterPasswordService.hasMasterPassword() && (
              <div className="bg-blue-950/30 border border-blue-600/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">No Master Password Set</p>
                    <p>You need to create a master password before you can protect individual passwords.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MasterPasswordDialog
        isOpen={showMasterPasswordSetup}
        onClose={() => {
          setShowMasterPasswordSetup(false);
          setPendingProtectionChange(null);
        }}
        onAuthenticated={handleMasterPasswordSetup}
        mode="setup"
        title="Set Up Master Password"
        description="Create a master password to protect selected passwords in your vault."
      />

      <MasterPasswordDialog
        isOpen={showMasterPasswordVerify}
        onClose={() => {
          setShowMasterPasswordVerify(false);
          setPendingProtectionChange(null);
        }}
        onAuthenticated={handleMasterPasswordVerified}
        mode="verify"
        title="Verify Master Password"
        description="Enter your master password to change protection settings."
      />
    </>
  );
};
