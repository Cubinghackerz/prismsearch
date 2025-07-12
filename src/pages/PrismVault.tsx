import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VaultHeader } from '@/components/vault/VaultHeader';
import { VaultLoadingScreen } from '@/components/vault/VaultLoadingScreen';
import { PasswordGenerator } from '@/components/vault/PasswordGenerator';
import { GeneratedPasswordCard } from '@/components/vault/GeneratedPasswordCard';
import { AnimatingPasswordCard } from '@/components/vault/AnimatingPasswordCard';
import { EmptyVaultCard } from '@/components/vault/EmptyVaultCard';
import { StoredPasswordsList } from '@/components/StoredPasswordsList';
import { PasswordManagerDialog } from '@/components/PasswordManagerDialog';

interface PasswordData {
  password: string;
  strengthAssessment: {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    feedback: string[];
  };
  isEditing?: boolean;
  editedPassword?: string;
}

const PrismVault = () => {
  const [passwords, setPasswords] = useState<PasswordData[]>([]);
  const [passwordCount, setPasswordCount] = useState(1);
  const [passwordLength, setPasswordLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [showPasswords, setShowPasswords] = useState<boolean[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isVaultLoading, setIsVaultLoading] = useState(true);
  const [animatingPasswords, setAnimatingPasswords] = useState<string[]>([]);
  const [vaultText, setVaultText] = useState('');
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [isPasswordManagerOpen, setIsPasswordManagerOpen] = useState(false);
  const [prefilledPassword, setPrefilledPassword] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const { toast } = useToast();

  // Vault opening animation
  useEffect(() => {
    if (!isVaultLoading) return;
    
    const targetText = "OPENING VAULT";
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let currentIndex = 0;

    const animateText = () => {
      if (currentIndex <= targetText.length) {
        let displayText = '';

        // Show final characters up to current index
        for (let i = 0; i < currentIndex; i++) {
          displayText += targetText[i];
        }

        // Show random characters for remaining positions
        for (let i = currentIndex; i < targetText.length; i++) {
          if (targetText[i] === ' ') {
            displayText += ' ';
          } else {
            displayText += characters[Math.floor(Math.random() * characters.length)];
          }
        }
        
        setVaultText(displayText);

        // Update progress
        const progress = (currentIndex / targetText.length) * 100;
        setEncryptionProgress(progress);
        
        if (currentIndex < targetText.length) {
          currentIndex++;
          setTimeout(animateText, 200);
        } else {
          setTimeout(() => {
            setIsVaultLoading(false);
          }, 1000);
        }
      }
    };

    setTimeout(() => {
      animateText();
    }, 500);
  }, []);

  const generatePasswords = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
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

    const newPasswords: PasswordData[] = [];
    const progressStep = 100 / passwordCount;

    // Initialize animating passwords array
    const animatingPasswordsArray = new Array(passwordCount).fill('');
    setAnimatingPasswords(animatingPasswordsArray);

    for (let i = 0; i < passwordCount; i++) {
      // Character-by-character animation
      let finalPassword = '';
      for (let j = 0; j < passwordLength[0]; j++) {
        finalPassword += charset.charAt(Math.floor(Math.random() * charset.length));
      }

      // Animate each character appearing
      for (let charIndex = 0; charIndex <= passwordLength[0]; charIndex++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setAnimatingPasswords(prev => {
          const newAnimating = [...prev];
          let animatedPassword = '';

          // Show final characters up to current index
          for (let k = 0; k < charIndex; k++) {
            animatedPassword += finalPassword[k];
          }

          // Show random characters for remaining positions
          for (let k = charIndex; k < passwordLength[0]; k++) {
            animatedPassword += charset.charAt(Math.floor(Math.random() * charset.length));
          }
          
          newAnimating[i] = animatedPassword;
          return newAnimating;
        });
      }

      // Final password is set
      const strengthAssessment = assessPasswordStrength(finalPassword);
      newPasswords.push({
        password: finalPassword,
        strengthAssessment,
        isEditing: false
      });

      // Wait a bit before processing next password
      await new Promise(resolve => setTimeout(resolve, 300));
      setGenerationProgress((i + 1) * progressStep);
    }

    setPasswords(newPasswords);
    setShowPasswords(new Array(passwordCount).fill(false));
    setAnimatingPasswords([]);
    setIsGenerating(false);
    setGenerationProgress(0);
  };

  const assessPasswordStrength = (pwd: string) => {
    let score = 0;
    const feedback: string[] = [];

    // Length assessment
    if (pwd.length >= 12) {
      score += 25;
    } else if (pwd.length >= 8) {
      score += 15;
      feedback.push('Consider using a longer password (12+ characters)');
    } else {
      score += 5;
      feedback.push('Password is too short. Use at least 8 characters');
    }

    // Character variety assessment
    if (/[a-z]/.test(pwd)) score += 15; else feedback.push('Add lowercase letters');
    if (/[A-Z]/.test(pwd)) score += 15; else feedback.push('Add uppercase letters');
    if (/[0-9]/.test(pwd)) score += 15; else feedback.push('Add numbers');
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 20; else feedback.push('Add special characters');

    // Pattern assessment
    if (!/(.)\1{2,}/.test(pwd)) score += 10; else feedback.push('Avoid repeating characters');

    // Determine strength level
    let level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    if (score >= 90) level = 'very-strong';
    else if (score >= 70) level = 'strong';
    else if (score >= 50) level = 'good';
    else if (score >= 30) level = 'fair';
    else level = 'weak';

    return { score, level, feedback };
  };

  const copyToClipboard = async (password: string, index: number) => {
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "Copied to clipboard",
        description: `Password ${index + 1} has been copied to your clipboard.`
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy password to clipboard.",
        variant: "destructive"
      });
    }
  };

  const togglePasswordVisibility = (index: number) => {
    const newShowPasswords = [...showPasswords];
    newShowPasswords[index] = !newShowPasswords[index];
    setShowPasswords(newShowPasswords);
  };

  const togglePasswordEdit = (index: number) => {
    const newPasswords = [...passwords];
    if (newPasswords[index].isEditing) {
      // Save the edit
      const editedPassword = newPasswords[index].editedPassword || newPasswords[index].password;
      newPasswords[index].password = editedPassword;
      newPasswords[index].strengthAssessment = assessPasswordStrength(editedPassword);
      newPasswords[index].isEditing = false;
      newPasswords[index].editedPassword = undefined;
    } else {
      // Start editing
      newPasswords[index].isEditing = true;
      newPasswords[index].editedPassword = newPasswords[index].password;
    }
    setPasswords(newPasswords);
  };

  const handlePasswordEdit = (index: number, value: string) => {
    const newPasswords = [...passwords];
    newPasswords[index].editedPassword = value;
    setPasswords(newPasswords);
  };

  const savePasswordToManager = (password: string) => {
    setPrefilledPassword(password);
    setIsPasswordManagerOpen(true);
  };

  const handlePasswordManagerClose = () => {
    setIsPasswordManagerOpen(false);
    setPrefilledPassword('');
    // Force refresh of StoredPasswordsList by updating the key
    setRefreshKey(prev => prev + 1);
  };

  const handlePasswordSaved = () => {
    handlePasswordManagerClose();
  };

  if (isVaultLoading) {
    return (
      <VaultLoadingScreen 
        vaultText={vaultText} 
        encryptionProgress={encryptionProgress} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <VaultHeader />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Password Manager Section */}
        <StoredPasswordsList key={refreshKey} />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Password Generator */}
          <PasswordGenerator
            passwordCount={passwordCount}
            setPasswordCount={setPasswordCount}
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
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            onGenerate={generatePasswords}
          />

          {/* Generated Passwords */}
          <div className="space-y-4">
            {isGenerating && animatingPasswords.some(p => p) ? (
              animatingPasswords.map((animPassword, index) => (
                animPassword && (
                  <AnimatingPasswordCard
                    key={`animating-${index}`}
                    animPassword={animPassword}
                    index={index}
                  />
                )
              ))
            ) : passwords.length > 0 ? (
              passwords.map((passwordData, index) => (
                <GeneratedPasswordCard
                  key={index}
                  passwordData={passwordData}
                  index={index}
                  showPassword={showPasswords[index]}
                  onToggleVisibility={() => togglePasswordVisibility(index)}
                  onToggleEdit={() => togglePasswordEdit(index)}
                  onPasswordEdit={(value) => handlePasswordEdit(index, value)}
                  onCopy={() => copyToClipboard(passwordData.password, index)}
                  onSaveToManager={() => savePasswordToManager(passwordData.password)}
                />
              ))
            ) : (
              <EmptyVaultCard />
            )}
          </div>
        </div>
      </div>

      <PasswordManagerDialog
        isOpen={isPasswordManagerOpen}
        onClose={handlePasswordManagerClose}
        editingPassword={null}
        onPasswordSaved={handlePasswordSaved}
        prefilledPassword={prefilledPassword}
      />
    </div>
  );
};

export default PrismVault;
