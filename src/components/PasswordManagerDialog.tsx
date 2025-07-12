
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Save, Wand2 } from 'lucide-react';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { SavePasswordAnimation } from './SavePasswordAnimation';
import { useToast } from '@/hooks/use-toast';

interface StoredPassword {
  id: string;
  name: string;
  url?: string;
  password_encrypted: string;
  created_at: string;
  updated_at: string;
}

interface PasswordManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPassword?: StoredPassword | null;
  onPasswordSaved: () => void;
}

export const PasswordManagerDialog: React.FC<PasswordManagerDialogProps> = ({
  isOpen,
  onClose,
  editingPassword,
  onPasswordSaved,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
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
      setPassword('');
    }
  }, [editingPassword, isOpen]);

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
        <DialogContent className="bg-slate-900/95 border-slate-700 backdrop-blur-sm max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-300 text-xl">
              {editingPassword ? 'Edit Password' : 'Save New Password'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200 font-medium">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Gmail Account, Banking"
                  className="bg-slate-800/50 border-slate-600 text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-slate-200 font-medium">URL (optional)</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-slate-800/50 border-slate-600 text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200 font-medium">Password *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="password"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter or generate a password"
                    className="bg-slate-800/50 border-slate-600 text-slate-200 font-mono"
                  />
                  <Button
                    onClick={generatePassword}
                    disabled={isGenerating}
                    variant="outline"
                    className="border-slate-600 hover:bg-slate-700"
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

            {/* Password Generation Options */}
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <h3 className="text-slate-200 font-medium mb-3">Password Generator Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Length: {passwordLength}</Label>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={passwordLength}
                    onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeUppercase}
                      onChange={(e) => setIncludeUppercase(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-slate-300 text-sm">A-Z</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeLowercase}
                      onChange={(e) => setIncludeLowercase(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-slate-300 text-sm">a-z</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-slate-300 text-sm">0-9</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeSymbols}
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-slate-300 text-sm">!@#$</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={password} />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-slate-600 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !name.trim() || !password.trim()}
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
