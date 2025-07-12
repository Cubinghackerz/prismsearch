
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PasswordManagerDialog } from './PasswordManagerDialog';
import { PasswordListItem } from './password-manager/PasswordListItem';

interface StoredPassword {
  id: string;
  name: string;
  url?: string;
  password_encrypted: string;
  created_at: string;
  updated_at: string;
}

export const StoredPasswordsList: React.FC = () => {
  const [passwords, setPasswords] = useState<StoredPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<StoredPassword | null>(null);
  const { toast } = useToast();

  const fetchPasswords = () => {
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
  };

  useEffect(() => {
    fetchPasswords();
  }, []);

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
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

  const deletePassword = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const updatedPasswords = passwords.filter(p => p.id !== id);
      localStorage.setItem('prism_vault_passwords', JSON.stringify(updatedPasswords));
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
  };

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

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <div className="animate-pulse space-y-4">
            <Database className="h-12 w-12 text-slate-600 mx-auto" />
            <p className="text-slate-400">Loading your passwords...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-cyan-300">
              <Database className="h-5 w-5" />
              <span>Password Manager</span>
              <Badge variant="outline" className="text-slate-400 border-slate-600">
                {passwords.length}/10
              </Badge>
            </CardTitle>
            <Button
              onClick={handleAddNew}
              disabled={passwords.length >= 10}
              className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Password
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {passwords.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <Database className="h-16 w-16 text-slate-600 mx-auto" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-300">No Passwords Stored</h3>
                <p className="text-slate-400">Start building your secure password vault</p>
              </div>
            </div>
          ) : (
            passwords.map((password) => (
              <PasswordListItem
                key={password.id}
                password={password}
                isVisible={showPasswords[password.id]}
                onToggleVisibility={() => togglePasswordVisibility(password.id)}
                onCopy={copyToClipboard}
                onEdit={() => handleEdit(password)}
                onDelete={() => deletePassword(password.id, password.name)}
              />
            ))
          )}
        </CardContent>
      </Card>

      <PasswordManagerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        editingPassword={editingPassword}
        onPasswordSaved={handlePasswordSaved}
      />
    </>
  );
};
