
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MasterPasswordService from '@/services/masterPasswordService';

interface MasterPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: () => void;
  mode: 'setup' | 'verify';
  title?: string;
  description?: string;
}

export const MasterPasswordDialog: React.FC<MasterPasswordDialogProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  mode,
  title,
  description
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'setup') {
        if (password !== confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: "Please ensure both passwords are identical.",
            variant: "destructive"
          });
          return;
        }

        if (password.length < 8) {
          toast({
            title: "Password too short",
            description: "Master password must be at least 8 characters long.",
            variant: "destructive"
          });
          return;
        }

        MasterPasswordService.setMasterPassword(password);
        MasterPasswordService.createSession();
        
        toast({
          title: "Master password set",
          description: "Your master password has been created successfully."
        });
        
        if (onAuthenticated) onAuthenticated();
      } else {
        if (MasterPasswordService.verifyMasterPassword(password)) {
          MasterPasswordService.createSession();
          if (onAuthenticated) onAuthenticated();
        } else {
          toast({
            title: "Incorrect password",
            description: "Please enter the correct master password.",
            variant: "destructive"
          });
          return;
        }
      }

      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (title) return title;
    return mode === 'setup' ? 'Set Up Master Password' : 'Enter Master Password';
  };

  const getDescription = () => {
    if (description) return description;
    if (mode === 'setup') {
      return 'Create a master password to protect selected passwords in your vault.';
    }
    return 'Enter your master password to access this protected password.';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900/95 border-slate-700 backdrop-blur-sm max-w-md">
        <DialogHeader>
          <DialogTitle className="text-cyan-300 text-xl flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>{getTitle()}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200 font-medium">
              {mode === 'setup' ? 'Create Master Password' : 'Master Password'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your master password"
                className="bg-slate-800/50 border-slate-600 text-slate-200 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {mode === 'setup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">
                Confirm Master Password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your master password"
                className="bg-slate-800/50 border-slate-600 text-slate-200"
                required
              />
            </div>
          )}

          <div className="bg-amber-950/30 border border-amber-600/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Lock className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-200">
                {mode === 'setup' ? (
                  <>
                    <p className="font-medium mb-1">Note:</p>
                    <p>{getDescription()}</p>
                  </>
                ) : (
                  <p>{getDescription()}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !password || (mode === 'setup' && !confirmPassword)}
              className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
            >
              {isLoading ? 'Processing...' : mode === 'setup' ? 'Set Password' : 'Unlock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
