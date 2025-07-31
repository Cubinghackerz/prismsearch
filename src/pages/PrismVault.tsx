import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, Lock, Unlock, Copy, Edit, Save, Plus, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PasswordData {
  id: string;
  website: string;
  username: string;
  password?: string;
  notes?: string;
  strength?: number;
}

const PrismVault = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [masterPassword, setMasterPassword] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passwords, setPasswords] = useState<PasswordData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showMasterPasswordDialog, setShowMasterPasswordDialog] = useState<boolean>(false);
  const [showChangeMasterPasswordDialog, setShowChangeMasterPasswordDialog] = useState<boolean>(false);
  const [newMasterPassword, setNewMasterPassword] = useState<string>('');
  const [confirmNewMasterPassword, setConfirmNewMasterPassword] = useState<string>('');
  const [generatedPasswords, setGeneratedPasswords] = useState<string[]>([]);

  useEffect(() => {
    // Simulate loading passwords from local storage or database
    setIsLoading(true);
    setTimeout(() => {
      // For now, let's load some dummy data
      const dummyPasswords: PasswordData[] = [
        { id: '1', website: 'Google', username: 'user1@gmail.com', password: 'securePassword1', notes: 'Important account', strength: 85 },
        { id: '2', website: 'Facebook', username: 'user2', password: 'complexPassword2', notes: 'Social media', strength: 60 },
        { id: '3', website: 'Twitter', username: 'user3', password: 'veryStrongPassword3', notes: 'Microblogging', strength: 95 },
      ];
      setPasswords(dummyPasswords);
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleUnlock = (password: string) => {
    // Simulate master password check
    if (password === 'master123') {
      setMasterPassword(password);
      setIsUnlocked(true);
      setShowMasterPasswordDialog(false);
      toast({
        title: "Vault Unlocked",
        description: "Your passwords are now accessible.",
      });
    } else {
      toast({
        title: "Incorrect Password",
        description: "Please enter the correct master password.",
        variant: "destructive",
      });
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    toast({
      title: "Vault Locked",
      description: "Your passwords are now secured.",
    });
  };

  const handleChangeMasterPassword = () => {
    setShowChangeMasterPasswordDialog(true);
  };

  const handleChangeMasterPasswordConfirm = () => {
    if (newMasterPassword === confirmNewMasterPassword) {
      // Simulate changing the master password
      setMasterPassword(newMasterPassword);
      setShowChangeMasterPasswordDialog(false);
      toast({
        title: "Master Password Changed",
        description: "Your master password has been updated successfully.",
      });
    } else {
      toast({
        title: "Passwords Do Not Match",
        description: "New passwords do not match. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordGenerated = (password: string) => {
    setGeneratedPasswords(prevPasswords => [...prevPasswords, password]);
  };

  const handleSavePassword = (passwordData: PasswordData) => {
    setPasswords(prevPasswords => [...prevPasswords, passwordData]);
    toast({
      title: "Password Saved",
      description: `Password for ${passwordData.website} has been saved.`,
    });
  };

  const handleEditPassword = (index: number, editedPassword: PasswordData) => {
    const updatedPasswords = [...passwords];
    updatedPasswords[index] = editedPassword;
    setPasswords(updatedPasswords);
    toast({
      title: "Password Updated",
      description: `Password for ${editedPassword.website} has been updated.`,
    });
  };

  const VaultLoadingScreen = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <svg className="animate-spin h-10 w-10 text-primary mb-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-lg text-muted-foreground font-fira-code">Loading secure vault...</p>
    </div>
  );

  const VaultHeader = ({ isUnlocked, onUnlock, onLock, onChangeMasterPassword }: {
    isUnlocked: boolean;
    onUnlock: (password: string) => void;
    onLock: () => void;
    onChangeMasterPassword: () => void;
  }) => (
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-fira-code">Prism Vault</h1>
        <p className="text-muted-foreground font-fira-code">
          Securely store and manage your passwords
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onChangeMasterPassword} className="font-fira-code">
          Change Master Password
        </Button>
        {isUnlocked ? (
          <Button onClick={onLock} className="bg-red-500 hover:bg-red-700 text-white font-fira-code">
            <Lock className="w-4 h-4 mr-2" />
            Lock Vault
          </Button>
        ) : (
          <Button onClick={() => setShowMasterPasswordDialog(true)} className="bg-green-500 hover:bg-green-700 text-white font-fira-code">
            <Unlock className="w-4 h-4 mr-2" />
            Unlock Vault
          </Button>
        )}
      </div>
    </div>
  );

  const SecurityScoreDashboard = ({ passwords }: { passwords: PasswordData[] }) => {
    const averageStrength = passwords.reduce((acc, password) => acc + (password.strength || 0), 0) / passwords.length || 0;
    const securityStatus = averageStrength > 70 ? 'Good' : averageStrength > 50 ? 'Moderate' : 'Weak';
    const statusColor = averageStrength > 70 ? 'green' : averageStrength > 50 ? 'yellow' : 'red';

    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-fira-code">Overall Security Score</CardTitle>
          <CardDescription className="font-fira-code">
            Assess the strength of your stored passwords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-2xl font-bold font-fira-code">{averageStrength.toFixed(0)} / 100</p>
              <p className={`text-sm text-${statusColor}-500 font-semibold font-fira-code`}>
                Security Status: {securityStatus}
              </p>
            </div>
            {securityStatus === 'Weak' && (
              <ShieldAlert className="h-8 w-8 text-red-500" />
            )}
            {securityStatus === 'Moderate' && (
              <ShieldAlert className="h-8 w-8 text-yellow-500" />
            )}
            {securityStatus === 'Good' && (
              <ShieldCheck className="h-8 w-8 text-green-500" />
            )}
          </div>
          <Progress value={averageStrength} />
        </CardContent>
      </Card>
    );
  };

  const PasswordSecurityDashboard = ({ passwords }: { passwords: PasswordData[] }) => {
    const weakPasswords = passwords.filter(password => (password.strength || 0) < 50).length;
    const moderatePasswords = passwords.filter(password => (password.strength || 0) >= 50 && (password.strength || 0) < 80).length;
    const strongPasswords = passwords.filter(password => (password.strength || 0) >= 80).length;

    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-fira-code">Password Security Overview</CardTitle>
          <CardDescription className="font-fira-code">
            Detailed breakdown of password strengths
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium font-fira-code">Weak Passwords</p>
              <p className="text-2xl font-bold text-red-500 font-fira-code">{weakPasswords}</p>
            </div>
            <div>
              <p className="text-sm font-medium font-fira-code">Moderate Passwords</p>
              <p className="text-2xl font-bold text-yellow-500 font-fira-code">{moderatePasswords}</p>
            </div>
            <div>
              <p className="text-sm font-medium font-fira-code">Strong Passwords</p>
              <p className="text-2xl font-bold text-green-500 font-fira-code">{strongPasswords}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const PasswordGenerator = ({ onPasswordGenerated, onSavePassword }: {
    onPasswordGenerated: (password: string) => void;
    onSavePassword: (passwordData: PasswordData) => void;
  }) => {
    const [passwordLength, setPasswordLength] = useState<number>(16);
    const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
    const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
    const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
    const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
    const [generatedPassword, setGeneratedPassword] = useState<string>('');
    const [website, setWebsite] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    const generatePassword = useCallback(() => {
      let charset = '';
      if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (includeNumbers) charset += '0123456789';
      if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

      let newPassword = '';
      if (charset.length === 0) {
        toast({
          title: "Invalid Options",
          description: "Please select at least one character set.",
          variant: "destructive",
        });
        return;
      }

      for (let i = 0; i < passwordLength; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        newPassword += charset[randomIndex];
      }

      setGeneratedPassword(newPassword);
      onPasswordGenerated(newPassword);
    }, [passwordLength, includeUppercase, includeLowercase, includeNumbers, includeSymbols, onPasswordGenerated, toast]);

    const handleSave = () => {
      if (!website || !username || !generatedPassword) {
        toast({
          title: "Missing Information",
          description: "Please fill in all fields before saving.",
          variant: "destructive",
        });
        return;
      }

      const newPasswordData: PasswordData = {
        id: Math.random().toString(36).substring(7),
        website: website,
        username: username,
        password: generatedPassword,
        notes: notes,
        strength: calculatePasswordStrength(generatedPassword),
      };

      onSavePassword(newPasswordData);
      setWebsite('');
      setUsername('');
      setNotes('');
      setGeneratedPassword('');
    };

    const calculatePasswordStrength = (password: string): number => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      return Math.min(strength, 100);
    };

    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-fira-code">Password Generator</CardTitle>
          <CardDescription className="font-fira-code">
            Customize and generate strong, secure passwords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="website" className="font-fira-code">Website</Label>
            <Input
              id="website"
              placeholder="Enter website name"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="font-fira-code"
            />
          </div>
          <div>
            <Label htmlFor="username" className="font-fira-code">Username</Label>
            <Input
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-fira-code"
            />
          </div>
          <div>
            <Label htmlFor="passwordLength" className="font-fira-code">Password Length ({passwordLength})</Label>
            <Slider
              id="passwordLength"
              defaultValue={[passwordLength]}
              max={32}
              min={8}
              step={1}
              onValueChange={(value) => setPasswordLength(value[0])}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="includeUppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
            <Label htmlFor="includeUppercase" className="font-fira-code">Include Uppercase</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="includeLowercase" checked={includeLowercase} onCheckedChange={setIncludeLowercase} />
            <Label htmlFor="includeLowercase" className="font-fira-code">Include Lowercase</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="includeNumbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
            <Label htmlFor="includeNumbers" className="font-fira-code">Include Numbers</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="includeSymbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
            <Label htmlFor="includeSymbols" className="font-fira-code">Include Symbols</Label>
          </div>
          <div>
            <Button onClick={generatePassword} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-fira-code">
              Generate Password
            </Button>
          </div>
          {generatedPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Input
                  type="text"
                  value={generatedPassword}
                  readOnly
                  className="font-fira-code"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword);
                    toast({ description: "Password copied to clipboard." })
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label htmlFor="notes" className="font-fira-code">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this password"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="font-fira-code"
                />
              </div>
              <Button onClick={handleSave} className="w-full bg-green-500 hover:bg-green-700 text-white font-fira-code">
                <Save className="w-4 h-4 mr-2" />
                Save Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const AnimatingPasswordCard = () => (
    <Card className="animate-in fade-in-50 slide-in-from-bottom-5 bg-card/30 backdrop-blur-sm border-border/50">
      <CardContent className="flex space-x-4 p-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <line x1="9" x2="15" y1="9" y2="9" />
        </svg>
        <div className="space-y-1">
          <p className="text-sm font-medium font-fira-code">
            Generated Password
          </p>
          <p className="text-sm text-muted-foreground font-fira-code">
            A strong, secure password
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const GeneratedPasswordCard = ({ passwordData, onSave, onEdit }: {
    passwordData: PasswordData;
    onSave: () => void;
    onEdit: (editedPassword: PasswordData) => void;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedWebsite, setEditedWebsite] = useState(passwordData.website);
    const [editedUsername, setEditedUsername] = useState(passwordData.username);
    const [editedPassword, setEditedPassword] = useState(passwordData.password || '');
    const [editedNotes, setEditedNotes] = useState(passwordData.notes || '');

    const handleEdit = () => {
      setIsEditing(true);
    };

    const handleSaveEdit = () => {
      const updatedPasswordData: PasswordData = {
        ...passwordData,
        website: editedWebsite,
        username: editedUsername,
        password: editedPassword,
        notes: editedNotes,
        strength: calculatePasswordStrength(editedPassword),
      };
      onEdit(updatedPasswordData);
      setIsEditing(false);
    };

    const calculatePasswordStrength = (password: string): number => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      return Math.min(strength, 100);
    };

    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-fira-code">
            {isEditing ? (
              <Input
                type="text"
                value={editedWebsite}
                onChange={(e) => setEditedWebsite(e.target.value)}
                className="font-fira-code"
              />
            ) : (
              <span>{passwordData.website}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm font-medium font-fira-code">Username</p>
            {isEditing ? (
              <Input
                type="text"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                className="font-fira-code"
              />
            ) : (
              <p className="text-sm text-muted-foreground font-fira-code">{passwordData.username}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium font-fira-code">Password</p>
            {isEditing ? (
              <Input
                type="text"
                value={editedPassword}
                onChange={(e) => setEditedPassword(e.target.value)}
                className="font-fira-code"
              />
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-fira-code">{passwordData.password}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(passwordData.password || '');
                    toast({ description: "Password copied to clipboard." })
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium font-fira-code">Notes</p>
            {isEditing ? (
              <Textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="font-fira-code"
              />
            ) : (
              <p className="text-sm text-muted-foreground font-fira-code">{passwordData.notes}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isEditing ? (
            <div className="space-x-2">
              <Button onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-700 text-white font-fira-code">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="font-fira-code">
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={handleEdit} className="bg-blue-500 hover:bg-blue-700 text-white font-fira-code">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  const EmptyVaultCard = () => (
    <Card className="bg-card/30 backdrop-blur-sm border-border/50">
      <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-12 h-12 text-muted-foreground"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <line x1="9" x2="15" y1="9" y2="9" />
          <line x1="9" x2="9" y1="15" y2="15" />
        </svg>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold font-fira-code">Vault is Empty</h3>
          <p className="text-sm text-muted-foreground font-fira-code">
            Start generating and saving your passwords
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 font-fira-code flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-6 py-16 flex-1">
        <VaultHeader 
          isUnlocked={isUnlocked}
          onUnlock={handleUnlock}
          onLock={handleLock}
          onChangeMasterPassword={handleChangeMasterPassword}
        />

        {isUnlocked && (
          <>
            <SecurityScoreDashboard passwords={passwords} />
            <PasswordSecurityDashboard passwords={passwords} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <PasswordGenerator 
                onPasswordGenerated={handlePasswordGenerated}
                onSavePassword={handleSavePassword}
              />
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center font-fira-code">Generated Passwords</h2>
                {generatedPasswords.length === 0 ? (
                  <EmptyVaultCard />
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedPasswords.map((password, index) => (
                      <AnimatingPasswordCard key={index} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center font-fira-code">Saved Passwords</h2>
              {passwords.length === 0 ? (
                <EmptyVaultCard />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {passwords.map((passwordData, index) => (
                    <GeneratedPasswordCard 
                      key={index}
                      passwordData={passwordData}
                      onSave={() => {}}
                      onEdit={(editedPassword) => handleEditPassword(index, editedPassword)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
      
      <MasterPasswordDialog 
        isOpen={showMasterPasswordDialog}
        onClose={() => setShowMasterPasswordDialog(false)}
        onUnlock={handleUnlock}
      />
      
      <ChangeMasterPasswordDialog 
        isOpen={showChangeMasterPasswordDialog}
        onClose={() => setShowChangeMasterPasswordDialog(false)}
        onChangePassword={handleChangeMasterPasswordConfirm}
      />
    </div>
  );
};

const MasterPasswordDialog = ({ isOpen, onClose, onUnlock }: {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (password: string) => void;
}) => {
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    onUnlock(password);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-fira-code">Unlock Vault</DialogTitle>
          <DialogDescription className="font-fira-code">
            Enter your master password to unlock the vault.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right font-fira-code">
              Master Password
            </Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3 font-fira-code"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} className="font-fira-code">Unlock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ChangeMasterPasswordDialog = ({ isOpen, onClose, onChangePassword }: {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: () => void;
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    onChangePassword();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-fira-code">Change Master Password</DialogTitle>
          <DialogDescription className="font-fira-code">
            Enter your new master password.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newPassword" className="text-right font-fira-code">
              New Password
            </Label>
            <Input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="col-span-3 font-fira-code"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirmPassword" className="text-right font-fira-code">
              Confirm Password
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="col-span-3 font-fira-code"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} className="font-fira-code">Change Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrismVault;
