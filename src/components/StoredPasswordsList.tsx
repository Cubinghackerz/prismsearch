
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, Edit, Trash2, ExternalLink, Plus, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PasswordManagerDialog } from './PasswordManagerDialog';

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

  const fetchPasswords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPasswords([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('stored_passwords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPasswords(data || []);
    } catch (error: any) {
      console.error('Error fetching passwords:', error);
      toast({
        title: "Failed to load passwords",
        description: error.message || "An unexpected error occurred.",
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

  const deletePassword = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('stored_passwords')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPasswords(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Password deleted",
        description: `"${name}" has been removed from your vault.`
      });
    } catch (error: any) {
      console.error('Error deleting password:', error);
      toast({
        title: "Failed to delete password",
        description: error.message || "An unexpected error occurred.",
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
              <div
                key={password.id}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-200">{password.name}</h3>
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
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(password)}
                      className="border-slate-600 hover:bg-slate-700 hover:border-cyan-500"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deletePassword(password.id, password.name)}
                      className="border-slate-600 hover:bg-slate-700 hover:border-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      type={showPasswords[password.id] ? "text" : "password"}
                      value={password.password_encrypted}
                      readOnly
                      className="font-mono text-sm bg-slate-800/50 text-slate-200 border-slate-600"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => togglePasswordVisibility(password.id)}
                      className="border-slate-600 hover:bg-slate-700 hover:border-cyan-500"
                    >
                      {showPasswords[password.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(password.password_encrypted, 'Password')}
                      className="border-slate-600 hover:bg-slate-700 hover:border-emerald-500"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Created: {new Date(password.created_at).toLocaleDateString()}
                    {password.updated_at !== password.created_at && (
                      <span> • Updated: {new Date(password.updated_at).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
              </div>
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
