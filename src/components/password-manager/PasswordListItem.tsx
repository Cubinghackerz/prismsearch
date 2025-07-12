import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, Edit, Trash2, ExternalLink, Heart, Clock, AlertTriangle, Shield, Lock, RefreshCw, Unlock } from 'lucide-react';
import MasterPasswordService from '@/services/masterPasswordService';
import { MasterPasswordDialog } from '@/components/vault/MasterPasswordDialog';
import { PasswordProtectionDialog } from './PasswordProtectionDialog';
import { useToast } from '@/hooks/use-toast';

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

interface PasswordListItemProps {
  password: StoredPassword;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onToggleFavorite: () => void;
  onCopy: (text: string, type: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PasswordListItem: React.FC<PasswordListItemProps> = ({
  password,
  isVisible,
  onToggleVisibility,
  onToggleFavorite,
  onCopy,
  onEdit,
  onDelete
}) => {
  const [showMasterPasswordDialog, setShowMasterPasswordDialog] = useState(false);
  const [showProtectionDialog, setShowProtectionDialog] = useState(false);
  const [isUnlockedState, setIsUnlockedState] = useState(false);
  const { toast } = useToast();

  const isProtected = MasterPasswordService.passwordRequiresMasterPassword(password.id);
  
  // Check if password is unlocked (protected passwords are locked by default)
  const isUnlocked = !isProtected || (isProtected && isUnlockedState && MasterPasswordService.isSessionValid());
  
  const updateSuggestion = MasterPasswordService.getPasswordUpdateSuggestion(password.created_at, password.updated_at);

  // Listen for session clearing events
  useEffect(() => {
    const handleSessionCleared = () => {
      setIsUnlockedState(false);
    };

    window.addEventListener('masterPasswordSessionCleared', handleSessionCleared);
    
    return () => {
      window.removeEventListener('masterPasswordSessionCleared', handleSessionCleared);
    };
  }, []);

  // Check session validity periodically and update unlock state
  useEffect(() => {
    if (isProtected && isUnlockedState) {
      const interval = setInterval(() => {
        if (!MasterPasswordService.isSessionValid()) {
          setIsUnlockedState(false);
        }
      }, 1000); // Check every second

      return () => clearInterval(interval);
    }
  }, [isProtected, isUnlockedState]);

  const getUpdateSuggestionStatus = () => {
    if (!updateSuggestion.shouldUpdate) return null;
    
    const colors = {
      medium: { text: 'Update Soon', color: 'text-amber-400', bg: 'bg-amber-950/50' },
      high: { text: 'Update Now', color: 'text-red-400', bg: 'bg-red-950/50' }
    };
    
    return colors[updateSuggestion.urgency] || null;
  };

  const getBreachStatus = () => {
    switch (password.breach_status) {
      case 'breached':
        return { text: `Breached (${password.breach_count?.toLocaleString()})`, color: 'text-red-400', bg: 'bg-red-950/50' };
      case 'checking':
        return { text: 'Checking...', color: 'text-blue-400', bg: 'bg-blue-950/50' };
      case 'safe':
        return { text: 'Safe', color: 'text-emerald-400', bg: 'bg-emerald-950/50' };
      default:
        return null;
    }
  };

  const handleUnlock = () => {
    setShowMasterPasswordDialog(true);
  };

  const handleMasterPasswordVerified = () => {
    setShowMasterPasswordDialog(false);
    setIsUnlockedState(true);
    toast({
      title: "Password unlocked",
      description: "All actions are now available. Password will lock automatically after 10 minutes."
    });
  };

  const getActionDescription = () => {
    return `Enter your master password to unlock "${password.name}".`;
  };

  const updateStatus = getUpdateSuggestionStatus();
  const breachStatus = getBreachStatus();

  return (
    <>
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-200">{password.name}</h3>
              {password.is_favorite && (
                <Heart className="h-4 w-4 text-red-400 fill-red-400" />
              )}
              {isProtected && (
                <Shield className="h-4 w-4 text-amber-400" />
              )}
              {isProtected && !isUnlocked && (
                <Lock className="h-4 w-4 text-red-400" />
              )}
            </div>
            {password.url && (
              <div className="flex items-center space-x-2">
                <a
                  href={password.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <span>{password.url}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            
            <div className="flex items-center space-x-2 flex-wrap">
              {isProtected && (
                <Badge variant="outline" className="bg-amber-950/50 text-amber-400 border-amber-400 text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  {isUnlocked ? 'Protected (Unlocked)' : 'Protected (Locked)'}
                </Badge>
              )}
              
              {updateStatus && (
                <Badge variant="outline" className={`${updateStatus.bg} ${updateStatus.color} border-current text-xs`}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {updateStatus.text} ({updateSuggestion.daysOld}d old)
                </Badge>
              )}
              
              {breachStatus && (
                <Badge variant="outline" className={`${breachStatus.bg} ${breachStatus.color} border-current text-xs`}>
                  {password.breach_status === 'breached' ? (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  ) : password.breach_status === 'safe' ? (
                    <Shield className="h-3 w-3 mr-1" />
                  ) : (
                    <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {breachStatus.text}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Show unlock button if protected and locked */}
            {isProtected && !isUnlocked ? (
              <Button
                variant="outline"
                size="icon"
                onClick={handleUnlock}
                className="border-red-600 hover:bg-red-950/50 hover:border-red-500 text-red-400"
                title="Unlock Password"
              >
                <Unlock className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowProtectionDialog(true)}
                  className={`border-slate-600 hover:bg-slate-700 hover:border-amber-500 ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Password Protection Settings"
                  disabled={!isUnlocked}
                >
                  <Shield className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onToggleFavorite}
                  className={`border-slate-600 hover:bg-slate-700 ${
                    password.is_favorite 
                      ? 'hover:border-red-400 text-red-400' 
                      : 'hover:border-red-500'
                  } ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isUnlocked}
                >
                  <Heart className={`h-4 w-4 ${password.is_favorite ? 'fill-red-400' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onEdit}
                  className={`border-slate-600 hover:bg-slate-700 hover:border-cyan-500 ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isUnlocked}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onDelete}
                  className={`border-slate-600 hover:bg-slate-700 hover:border-red-500 ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isUnlocked}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              type={isVisible && isUnlocked ? "text" : "password"}
              value={!isUnlocked ? "••••••••••••••••" : password.password_encrypted}
              readOnly
              className="font-mono text-sm bg-slate-800/50 text-slate-200 border-slate-600"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleVisibility}
              className={`border-slate-600 hover:bg-slate-700 hover:border-cyan-500 ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isUnlocked}
            >
              {isVisible && isUnlocked ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onCopy(password.password_encrypted, 'Password')}
              className={`border-slate-600 hover:bg-slate-700 hover:border-emerald-500 ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isUnlocked}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Created: {new Date(password.created_at).toLocaleDateString()}
              {password.updated_at !== password.created_at && (
                <span> • Updated: {new Date(password.updated_at).toLocaleDateString()}</span>
              )}
              {updateSuggestion.shouldUpdate && (
                <span className={`ml-2 ${updateStatus?.color}`}>
                  • {updateSuggestion.message}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <MasterPasswordDialog
        isOpen={showMasterPasswordDialog}
        onClose={() => setShowMasterPasswordDialog(false)}
        onAuthenticated={handleMasterPasswordVerified}
        mode="verify"
        title="Unlock Password"
        description={getActionDescription()}
      />

      <PasswordProtectionDialog
        isOpen={showProtectionDialog}
        onClose={() => setShowProtectionDialog(false)}
        password={password}
        onProtectionChanged={() => {}}
      />
    </>
  );
};
