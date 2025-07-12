
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MasterPasswordService from '@/services/masterPasswordService';

interface ChangeMasterPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChanged: () => void;
}

export const ChangeMasterPasswordDialog: React.FC<ChangeMasterPasswordDialogProps> = ({
  isOpen,
  onClose,
  onPasswordChanged
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please ensure both new passwords are identical.",
          variant: "destructive"
        });
        return;
      }

      if (newPassword.length < 8) {
        toast({
          title: "Password too short",
          description: "Master password must be at least 8 characters long.",
          variant: "destructive"
        });
        return;
      }

      const success = MasterPasswordService.changeMasterPassword(oldPassword, newPassword);
      
      if (success) {
        toast({
          title: "Master password changed",
          description: "Your master password has been updated successfully."
        });
        
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onPasswordChanged();
        onClose();
      } else {
        toast({
          title: "Incorrect old password",
          description: "Please enter your current master password correctly.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while changing the password.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900/95 border-slate-700 backdrop-blur-sm max-w-md">
        <DialogHeader>
          <DialogTitle className="text-cyan-300 text-xl flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>Change Master Password</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword" className="text-slate-200 font-medium">
              Current Master Password
            </Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showPasswords ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter your current master password"
                className="bg-slate-800/50 border-slate-600 text-slate-200 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-slate-200 font-medium">
              New Master Password
            </Label>
            <Input
              id="newPassword"
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new master password"
              className="bg-slate-800/50 border-slate-600 text-slate-200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">
              Confirm New Master Password
            </Label>
            <Input
              id="confirmPassword"
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new master password"
              className="bg-slate-800/50 border-slate-600 text-slate-200"
              required
            />
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
              disabled={isLoading || !oldPassword || !newPassword || !confirmPassword}
              className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
