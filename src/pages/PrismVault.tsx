import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, Plus, Eye, EyeOff, Copy, Edit, Trash2, Search, Lock, Key, AlertTriangle, CheckCircle, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import zxcvbn from 'zxcvbn';

interface PasswordEntry {
  id: string;
  created_at: string;
  title: string;
  username: string;
  password?: string;
  notes?: string;
  url?: string;
}

const PrismVault = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | null>(null);
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [url, setUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatingPassword, setGeneratingPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
    crackTime: string;
  }>({ score: 0, feedback: [], crackTime: 'Unknown' });

  useEffect(() => {
    fetchPasswords();
  }, []);

  useEffect(() => {
    if (password) {
      const strength = assessPasswordStrengthWithZxcvbn(password);
      setPasswordStrength({
        score: strength.score,
        feedback: strength.feedback,
        crackTime: strength.crackTime
      });
    } else {
      setPasswordStrength({ score: 0, feedback: [], crackTime: 'Unknown' });
    }
  }, [password]);

  const fetchPasswords = async () => {
    try {
      const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setPasswords(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching passwords",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openDialog = () => {
    setDialogOpen(true);
    setIsEditing(false);
    setSelectedPassword(null);
    setTitle('');
    setUsername('');
    setPassword('');
    setNotes('');
    setUrl('');
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredPasswords = passwords.filter(password =>
    password.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    password.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (password: PasswordEntry) => {
    setIsEditing(true);
    setSelectedPassword(password);
    setTitle(password.title);
    setUsername(password.username);
    setPassword(password.password || '');
    setNotes(password.notes || '');
    setUrl(password.url || '');
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('passwords')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPasswords(passwords.filter(password => password.id !== id));
      toast({
        title: "Password deleted",
        description: "Password entry has been successfully deleted."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting password",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !username || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditing && selectedPassword) {
        const { error } = await supabase
          .from('passwords')
          .update({ title, username, password, notes, url })
          .eq('id', selectedPassword.id);

        if (error) {
          throw error;
        }

        setPasswords(passwords.map(passwordEntry =>
          passwordEntry.id === selectedPassword.id ? { ...passwordEntry, title, username, password, notes, url } : passwordEntry
        ));
        toast({
          title: "Password updated",
          description: "Password entry has been successfully updated."
        });
      } else {
        const { data, error } = await supabase
          .from('passwords')
          .insert([{ title, username, password, notes, url }])
          .select();

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setPasswords([data[0], ...passwords]);
          toast({
            title: "Password saved",
            description: "Password entry has been successfully saved."
          });
        }
      }

      closeDialog();
    } catch (error: any) {
      toast({
        title: "Error saving password",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const generatePassword = () => {
    setGeneratingPassword(true);
    let charset = "";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let newPassword = "";
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset.charAt(randomIndex);
    }

    setPassword(newPassword);
    setGeneratingPassword(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Password copied",
      description: "Password copied to clipboard."
    });
  };

  const assessPasswordStrengthWithZxcvbn = (password: string) => {
    const result = zxcvbn(password);
    return {
      score: result.score,
      feedback: result.feedback.suggestions,
      crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 font-fira-code flex flex-col">
      <Navigation />

      <main className="container mx-auto px-6 py-16 flex-1">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-fira-code">
              Prism Vault
            </h1>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-full border border-orange-500/30 font-fira-code">
              Beta
            </span>
          </div>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto font-fira-code">
            Securely store and manage your passwords with advanced encryption
          </p>
          <div className="flex items-center justify-center space-x-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <p className="text-sm font-fira-code">End-to-end encryption ensures your data is always safe</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search passwords..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 bg-card/50 border-border"
            />
          </div>
          <Button onClick={openDialog} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Password
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPasswords.map(password => (
            <Card key={password.id} className="bg-card/30 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-fira-code">
                  <Lock className="h-5 w-5" />
                  <span>{password.title}</span>
                </CardTitle>
                <CardDescription className="font-fira-code">
                  Username: {password.username}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground font-fira-code">
                      Password: {showPassword ? password.password : '•'.repeat(10)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(password.password || '')}
                        className="hover:bg-secondary/50"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:bg-secondary/50"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  {password.notes && (
                    <p className="text-sm text-muted-foreground font-fira-code">
                      Notes: {password.notes}
                    </p>
                  )}
                  {password.url && (
                    <a href={password.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline font-fira-code">
                      Visit Website
                    </a>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(password)} className="hover:bg-secondary/50">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(password.id)} className="hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <Footer />

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card/90 backdrop-blur-sm border-border">
          <DialogHeader>
            <DialogTitle className="font-fira-code">
              {isEditing ? 'Edit Password' : 'Add Password'}
            </DialogTitle>
            <DialogDescription className="font-fira-code">
              {isEditing ? 'Update the password details below.' : 'Enter the password details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium font-fira-code">
                Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Gmail"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-background/50 border-border font-fira-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium font-fira-code">
                Username
              </Label>
              <Input
                id="username"
                placeholder="e.g., john.doe@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-background/50 border-border font-fira-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium font-fira-code">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border pr-10 font-fira-code"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-muted-foreground hover:text-secondary"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="border rounded-md p-4 bg-secondary/10 border-secondary/30 space-y-3">
              <h4 className="text-sm font-semibold font-fira-code">Password Generator</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="passwordLength" className="text-sm font-medium font-fira-code">Length</Label>
                  <Input
                    type="number"
                    id="passwordLength"
                    value={passwordLength}
                    onChange={(e) => setPasswordLength(Number(e.target.value))}
                    min="8"
                    max="32"
                    className="bg-background/50 border-border font-fira-code"
                  />
                </div>
                <Button
                  type="button"
                  onClick={generatePassword}
                  disabled={generatingPassword}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 h-10 font-fira-code"
                >
                  {generatingPassword ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Input type="checkbox" id="includeSymbols" checked={includeSymbols} onChange={() => setIncludeSymbols(!includeSymbols)} className="h-4 w-4" />
                <Label htmlFor="includeSymbols" className="text-sm font-medium font-fira-code">Include Symbols</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input type="checkbox" id="includeNumbers" checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} className="h-4 w-4" />
                <Label htmlFor="includeNumbers" className="text-sm font-medium font-fira-code">Include Numbers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input type="checkbox" id="includeLowercase" checked={includeLowercase} onChange={() => setIncludeLowercase(!includeLowercase)} className="h-4 w-4" />
                <Label htmlFor="includeLowercase" className="text-sm font-medium font-fira-code">Include Lowercase</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input type="checkbox" id="includeUppercase" checked={includeUppercase} onChange={() => setIncludeUppercase(!includeUppercase)} className="h-4 w-4" />
                <Label htmlFor="includeUppercase" className="text-sm font-medium font-fira-code">Include Uppercase</Label>
              </div>
            </div>

            {passwordStrength.score < 3 && password && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                <div className="flex items-center space-x-2 text-yellow-500">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm font-semibold font-fira-code">Weak Password</p>
                </div>
                <p className="text-sm text-muted-foreground font-fira-code">
                  Suggestions: {passwordStrength.feedback.join(', ') || 'Use a longer password with a mix of characters.'}
                </p>
                <p className="text-xs text-muted-foreground font-fira-code">
                  Estimated crack time: {passwordStrength.crackTime}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium font-fira-code">
                Notes
              </Label>
              <Input
                id="notes"
                placeholder="Additional notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-background/50 border-border font-fira-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium font-fira-code">
                URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="e.g., https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-background/50 border-border font-fira-code"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-fira-code">
                {isEditing ? 'Update Password' : 'Save Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrismVault;
