
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Save, Wand2, Shield } from 'lucide-react';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { SavePasswordAnimation } from './SavePasswordAnimation';
import { PasswordGeneratorSettings } from './password-manager/PasswordGeneratorSettings';
import { useToast } from '@/hooks/use-toast';
import BreachDetectionService from '@/services/breachDetectionService';

interface StoredPassword {
  id: string;
  name: string;
  url?: string;
  password_encrypted: string;
  created_at: string;
  updated_at: string;
  is_favorite?: boolean;
  breach_status?: 'safe' | 'breached' | 'checking';
  breach_count?: number;
}

interface PasswordManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPassword?: StoredPassword | null;
  onPasswordSaved: () => void;
  prefilledPassword?: string;
}

export const PasswordManagerDialog: React.FC<PasswordManagerDialogProps> = ({
  isOpen,
  onClose,
  editingPassword,
  onPasswordSaved,
  prefilledPassword = ''
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [breachData, setBreachData] = useState<any>(null);
  const { toast } = useToast();

  // Password generation settings
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  useEffect(() => {
    if (editingPassword) {
      setName(editingPassword.name);
      setUrl(editingPassword.url || '');
      setPassword(editingPassword.password_encrypted);
    } else {
      setName('');
      setUrl('');
      setPassword(prefilledPassword);
    }
    setBreachData(null);
  }, [editingPassword, isOpen, prefilledPassword]);

  const checkBreach = async (passwordToCheck: string) => {
    if (!passwordToCheck.trim()) return;
    
    setIsCheckingBreach(true);
    try {
      const result = await BreachDetectionService.checkPasswordBreach(passwordToCheck);
      setBreachData(result);
    } catch (error) {
      console.error('Error checking breach:', error);
    } finally {
      setIsCheckingBreach(false);
    }
  };

  useEffect(() => {
    if (password && password.length > 0) {
      const timeoutId = setTimeout(() => {
        checkBreach(password);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [password]);

  const generatePassword = () => {
    setIsGenerating(true);
    
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      toast({
        title: "No character types selected",
        description: "Please select at least one character type for password generation.",
        variant: "destructive"
      });
      setIsGenerating(false);
      return;
    }

    let generatedPassword = '';
    for (let i = 0; i < passwordLength; i++) {
      generatedPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Simulate generation time for better UX
    setTimeout(() => {
      setPassword(generatedPassword);
      setIsGenerating(false);
    }, 500);
  };

  const handleSave = async () => {
    if (!name.trim() || !password.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please provide both a name and password.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    setShowSaveAnimation(true);

    try {
      // Get existing passwords from localStorage
      const storedData = localStorage.getItem('prism_vault_passwords');
      const existingPasswords = storedData ? JSON.parse(storedData) : [];

      if (editingPassword) {
        // Update existing password
        const updatedPasswords = existingPasswords.map((p: StoredPassword) =>
          p.id === editingPassword.id
            ? {
                ...p,
                name: name.trim(),
                url: url.trim() || undefined,
                password_encrypted: password,
                updated_at: new Date().toISOString(),
              }
            : p
        );
        localStorage.setItem('prism_vault_passwords', JSON.stringify(updatedPasswords));

        toast({
          title: "Password updated",
          description: "Your password has been successfully updated.",
        });
      } else {
        // Check if we're at the limit
        if (existingPasswords.length >= 10) {
          toast({
            title: "Password limit reached",
            description: "You can only store up to 10 passwords.",
            variant: "destructive"
          });
          setShowSaveAnimation(false);
          setIsSaving(false);
          return;
        }

        // Create new password
        const newPassword: StoredPassword = {
          id: crypto.randomUUID(),
          name: name.trim(),
          url: url.trim() || undefined,
          password_encrypted: password,
          is_favorite: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updatedPasswords = [...existingPasswords, newPassword];
        localStorage.setItem('prism_vault_passwords', JSON.stringify(updatedPasswords));

        toast({
          title: "Password saved",
          description: "Your password has been securely stored on this device.",
        });
      }

      onPasswordSaved();
    } catch (error: any) {
      console.error('Error saving password:', error);
      toast({
        title: "Failed to save password",
        description: "An unexpected error occurred while saving the password.",
        variant: "destructive"
      });
      setShowSaveAnimation(false);
      setIsSaving(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowSaveAnimation(false);
    setIsSaving(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900/95 border-slate-700 backdrop-blur-sm max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-cyan-300 text-lg">
              {editingPassword ? 'Edit Password' : 'Save New Password'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-slate-200 font-medium text-sm">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Gmail Account, Banking"
                  className="bg-slate-800/50 border-slate-600 text-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="url" className="text-slate-200 font-medium text-sm">URL (optional)</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-slate-800/50 border-slate-600 text-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-slate-200 font-medium text-sm">Password *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="password"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter or generate a password"
                    className="bg-slate-800/50 border-slate-600 text-slate-200 font-mono text-sm"
                  />
                  <Button
                    onClick={generatePassword}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 hover:bg-slate-700 px-3"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Breach Detection Results */}
            {(isCheckingBreach || breachData) && (
              <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-cyan-400" />
                  <span className="text-slate-200 font-medium text-sm">Security Check</span>
                </div>
                {isCheckingBreach ? (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="text-xs">Checking for data breaches...</span>
                  </div>
                ) : breachData && (
                  <div className={`text-xs ${breachData.isBreached ? 'text-red-400' : 'text-emerald-400'}`}>
                    {breachData.isBreached ? (
                      <>⚠️ This password has been found in {breachData.breachCount.toLocaleString()} data breaches. Consider using a different password.</>
                    ) : (
                      <>✅ This password has not been found in any known data breaches.</>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Password Generation Options */}
            <PasswordGeneratorSettings
              passwordLength={passwordLength}
              setPasswordLength={setPasswordLength}
              includeUppercase={includeUppercase}
              setIncludeUppercase={setIncludeUppercase}
              includeLowercase={includeLowercase}
              setIncludeLowercase={setIncludeLowercase}
              includeNumbers={includeNumbers}
              setIncludeNumbers={setIncludeNumbers}
              includeSymbols={includeSymbols}
              setIncludeSymbols={setIncludeSymbols}
            />

            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={password} />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-3">
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="border-slate-600 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !name.trim() || !password.trim()}
                size="sm"
                className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingPassword ? 'Update Password' : 'Save Password'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SavePasswordAnimation
        isVisible={showSaveAnimation}
        onComplete={handleAnimationComplete}
      />
    </>
  );
};
