import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Database, Settings, Shield, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PasswordManagerDialog } from './PasswordManagerDialog';
import { PasswordListItem } from './password-manager/PasswordListItem';
import { PasswordSecurityDashboard } from './vault/PasswordSecurityDashboard';
import { MasterPasswordDialog } from './vault/MasterPasswordDialog';
import { ChangeMasterPasswordDialog } from './vault/ChangeMasterPasswordDialog';
import MasterPasswordService from '@/services/masterPasswordService';
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
export const StoredPasswordsList: React.FC = React.memo(() => {
  const [passwords, setPasswords] = useState<StoredPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<StoredPassword | null>(null);
  const [showMasterPasswordSetup, setShowMasterPasswordSetup] = useState(false);
  const [showMasterPasswordSettings, setShowMasterPasswordSettings] = useState(false);
  const [showChangeMasterPassword, setShowChangeMasterPassword] = useState(false);
  const {
    toast
  } = useToast();

  // Memoize password fetch function
  const fetchPasswords = useCallback(() => {
    try {
      const storedData = localStorage.getItem('prism_vault_passwords');
      const parsedData = storedData ? JSON.parse(storedData) : [];
      setPasswords(parsedData);
    } catch (error) {
      console.error('Error fetching passwords:', error);
      toast({
        title: "Failed to load passwords",
        description: "An error occurred while loading your stored passwords.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    fetchPasswords();
  }, [fetchPasswords]);

  // Memoize update function to prevent unnecessary re-renders
  const updatePassword = useCallback((id: string, updates: Partial<StoredPassword>) => {
    setPasswords(prev => {
      const updated = prev.map(p => p.id === id ? {
        ...p,
        ...updates
      } : p);
      localStorage.setItem('prism_vault_passwords', JSON.stringify(updated));
      return updated;
    });
  }, []);
  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const toggleFavorite = (id: string) => {
    const password = passwords.find(p => p.id === id);
    if (password) {
      updatePassword(id, {
        is_favorite: !password.is_favorite
      });
      toast({
        title: password.is_favorite ? "Removed from favorites" : "Added to favorites",
        description: `"${password.name}" ${password.is_favorite ? 'removed from' : 'added to'} favorites.`
      });
    }
  };
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${type} has been copied to your clipboard.`
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: `Could not copy ${type.toLowerCase()} to clipboard.`,
        variant: "destructive"
      });
    }
  };
  const deletePassword = useCallback((id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const updatedPasswords = passwords.filter(p => p.id !== id);
      localStorage.setItem('prism_vault_passwords', JSON.stringify(updatedPasswords));
      MasterPasswordService.unprotectPassword(id);
      setPasswords(updatedPasswords);
      toast({
        title: "Password deleted",
        description: `"${name}" has been removed from your vault.`
      });
    } catch (error) {
      console.error('Error deleting password:', error);
      toast({
        title: "Failed to delete password",
        description: "An unexpected error occurred while deleting the password.",
        variant: "destructive"
      });
    }
  }, [passwords, toast]);
  const handleEdit = (password: StoredPassword) => {
    setEditingPassword(password);
    setIsDialogOpen(true);
  };
  const handleAddNew = () => {
    setEditingPassword(null);
    setIsDialogOpen(true);
  };
  const handlePasswordSaved = () => {
    fetchPasswords();
    setIsDialogOpen(false);
    setEditingPassword(null);
  };
  const handleSetupMasterPassword = () => {
    setShowMasterPasswordSetup(false);
    toast({
      title: "Master password created",
      description: "You can now protect individual passwords with master password."
    });
  };
  const handleMasterPasswordSettings = () => {
    setShowMasterPasswordSettings(true);
  };
  const handleRemoveMasterPassword = () => {
    if (!confirm("Are you sure you want to remove the master password? This will remove protection from all protected passwords.")) {
      return;
    }
    MasterPasswordService.removeMasterPassword();
    // Remove protection from all passwords
    const protectedPasswords = localStorage.getItem('prism_vault_protected_passwords');
    if (protectedPasswords) {
      localStorage.removeItem('prism_vault_protected_passwords');
    }
    setShowMasterPasswordSettings(false);
    toast({
      title: "Master password removed",
      description: "Master password protection has been disabled for all passwords."
    });
  };
  const handlePasswordChanged = () => {
    setShowChangeMasterPassword(false);
    toast({
      title: "Master password changed",
      description: "Your master password has been updated successfully."
    });
  };

  // Memoize rendered password items
  const passwordItems = useMemo(() => passwords.map(password => <PasswordListItem key={password.id} password={password} isVisible={showPasswords[password.id]} onToggleVisibility={() => togglePasswordVisibility(password.id)} onToggleFavorite={() => toggleFavorite(password.id)} onCopy={copyToClipboard} onEdit={() => handleEdit(password)} onDelete={() => deletePassword(password.id, password.name)} />), [passwords, showPasswords, deletePassword]);
  if (loading) {
    return <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <div className="animate-pulse space-y-4">
            <Database className="h-12 w-12 text-slate-600 mx-auto" />
            <p className="text-slate-400">Loading your passwords...</p>
          </div>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-6">
      <PasswordSecurityDashboard passwords={passwords} onPasswordUpdate={updatePassword} />

      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl">
        <CardHeader className="py-0 mx-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-cyan-300">
              <Database className="h-5 w-5" />
              <span>Password Manager</span>
              <Badge variant="outline" className="text-slate-400 border-slate-600">
                {passwords.length}/10
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={() => MasterPasswordService.hasMasterPassword() ? handleMasterPasswordSettings() : setShowMasterPasswordSetup(true)} size="sm" variant="outline" className="border-slate-600 hover:bg-slate-700">
                <Shield className="h-4 w-4 mr-2" />
                {MasterPasswordService.hasMasterPassword() ? 'Master Password' : 'Set Master Password'}
              </Button>
              <Button onClick={handleAddNew} disabled={passwords.length >= 10} className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Password
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {passwords.length === 0 ? <div className="text-center py-8 space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <Database className="h-16 w-16 text-slate-600 mx-auto" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-300">No Passwords Stored</h3>
                <p className="text-slate-400">Start building your secure password vault</p>
              </div>
            </div> : passwordItems}
        </CardContent>
      </Card>

      <PasswordManagerDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} editingPassword={editingPassword} onPasswordSaved={handlePasswordSaved} />

      <MasterPasswordDialog isOpen={showMasterPasswordSetup} onClose={() => setShowMasterPasswordSetup(false)} onAuthenticated={handleSetupMasterPassword} mode="setup" title="Set Up Master Password" description="Create a master password to protect selected passwords in your vault." />

      {/* Master Password Settings Modal */}
      {showMasterPasswordSettings && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowMasterPasswordSettings(false)}>
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Master Password Settings</span>
            </h3>
            <div className="space-y-4">
              <p className="text-slate-300">Master password is currently active. You can use it to protect individual passwords.</p>
              
              <div className="space-y-3">
                <Button onClick={() => {
              setShowMasterPasswordSettings(false);
              setShowChangeMasterPassword(true);
            }} variant="outline" className="w-full border-cyan-600 text-cyan-400 hover:bg-cyan-950/50">
                  <Key className="h-4 w-4 mr-2" />
                  Change Master Password
                </Button>
                
                <Button onClick={handleRemoveMasterPassword} variant="outline" className="w-full border-red-600 text-red-400 hover:bg-red-950/50">
                  Remove Master Password
                </Button>
              </div>
              
              <Button onClick={() => setShowMasterPasswordSettings(false)} className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700">
                Close
              </Button>
            </div>
          </div>
        </div>}

      <ChangeMasterPasswordDialog isOpen={showChangeMasterPassword} onClose={() => setShowChangeMasterPassword(false)} onPasswordChanged={handlePasswordChanged} />
    </div>;
});
StoredPasswordsList.displayName = 'StoredPasswordsList';