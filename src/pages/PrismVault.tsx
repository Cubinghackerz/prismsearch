import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VaultHeader } from '@/components/vault/VaultHeader';
import VaultLoadingScreen from '@/components/vault/VaultLoadingScreen';
import { PasswordGenerator } from '@/components/vault/PasswordGenerator';
import { GeneratedPasswordCard } from '@/components/vault/GeneratedPasswordCard';
import { AnimatingPasswordCard } from '@/components/vault/AnimatingPasswordCard';
import { EmptyVaultCard } from '@/components/vault/EmptyVaultCard';
import { StoredPasswordsList } from '@/components/StoredPasswordsList';
import { PasswordManagerDialog } from '@/components/PasswordManagerDialog';
import { SecurityScoreDashboard } from '@/components/vault/SecurityScoreDashboard';
import Navigation from '@/components/Navigation';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import zxcvbn from 'zxcvbn';

interface PasswordData {
  password: string;
  strengthAssessment: {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    feedback: string[];
    crackTime: string;
    entropy: number;
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
  const {
    toast
  } = useToast();

  // Memoize stored passwords to prevent unnecessary re-fetches
  const storedPasswords = useMemo(() => {
    try {
      const storedData = localStorage.getItem('prism_vault_passwords');
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Error loading stored passwords:', error);
      return [];
    }
  }, [refreshKey]);

  useEffect(() => {
    if (!isVaultLoading) return;
    const targetText = "OPENING VAULT";
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let currentIndex = 0;
    const animateText = () => {
      if (currentIndex <= targetText.length) {
        let displayText = '';
        for (let i = 0; i < currentIndex; i++) {
          displayText += targetText[i];
        }
        for (let i = currentIndex; i < targetText.length; i++) {
          if (targetText[i] === ' ') {
            displayText += ' ';
          } else {
            displayText += characters[Math.floor(Math.random() * characters.length)];
          }
        }
        setVaultText(displayText);
        const progress = currentIndex / targetText.length * 100;
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

  // Memoize password strength assessment to avoid recalculation
  const assessPasswordStrengthWithZxcvbn = useCallback((pwd: string) => {
    if (!pwd) {
      return {
        score: 0,
        level: 'weak' as const,
        feedback: ['Enter a password to see strength analysis'],
        crackTime: 'instant',
        entropy: 0
      };
    }
    const zxcvbnResult = zxcvbn(pwd);
    const baseScore = zxcvbnResult.score / 4 * 100;
    let bonusScore = 0;
    const feedback: string[] = [];
    if (pwd.length >= 16) bonusScore += 10;else if (pwd.length >= 12) bonusScore += 5;else if (pwd.length < 8) feedback.push('Password is too short. Use at least 12 characters');
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
    const charTypes = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
    if (charTypes >= 4) bonusScore += 5;else if (charTypes < 3) feedback.push('Use a mix of uppercase, lowercase, numbers, and symbols');
    const finalScore = Math.min(100, Math.round(baseScore + bonusScore));
    let level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    if (finalScore >= 90) level = 'very-strong';else if (finalScore >= 75) level = 'strong';else if (finalScore >= 60) level = 'good';else if (finalScore >= 40) level = 'fair';else level = 'weak';
    if (zxcvbnResult.feedback.warning) {
      feedback.unshift(zxcvbnResult.feedback.warning);
    }
    zxcvbnResult.feedback.suggestions.forEach(suggestion => {
      if (!feedback.includes(suggestion)) {
        feedback.push(suggestion);
      }
    });
    const crackTime = String(zxcvbnResult.crack_times_display.offline_slow_hashing_1e4_per_second);
    const entropy = Math.round(zxcvbnResult.guesses_log10 * 3.32);
    return {
      score: finalScore,
      level,
      feedback: feedback.slice(0, 5),
      crackTime,
      entropy
    };
  }, []);

  const generatePasswords = useCallback(async () => {
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
    const animatingPasswordsArray = new Array(passwordCount).fill('');
    setAnimatingPasswords(animatingPasswordsArray);
    for (let i = 0; i < passwordCount; i++) {
      let finalPassword = '';
      for (let j = 0; j < passwordLength[0]; j++) {
        finalPassword += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      for (let charIndex = 0; charIndex <= passwordLength[0]; charIndex += 2) {
        await new Promise(resolve => setTimeout(resolve, 30));
        setAnimatingPasswords(prev => {
          const newAnimating = [...prev];
          let animatedPassword = '';
          for (let k = 0; k < charIndex; k++) {
            animatedPassword += finalPassword[k];
          }
          for (let k = charIndex; k < passwordLength[0]; k++) {
            animatedPassword += charset.charAt(Math.floor(Math.random() * charset.length));
          }
          newAnimating[i] = animatedPassword;
          return newAnimating;
        });
      }
      const strengthAssessment = assessPasswordStrengthWithZxcvbn(finalPassword);
      newPasswords.push({
        password: finalPassword,
        strengthAssessment,
        isEditing: false
      });
      await new Promise(resolve => setTimeout(resolve, 100));
      setGenerationProgress((i + 1) * progressStep);
    }
    setPasswords(newPasswords);
    setShowPasswords(new Array(passwordCount).fill(false));
    setAnimatingPasswords([]);
    setIsGenerating(false);
    setGenerationProgress(0);
  }, [passwordCount, passwordLength, includeUppercase, includeLowercase, includeNumbers, includeSymbols, assessPasswordStrengthWithZxcvbn, toast]);

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
      const editedPassword = newPasswords[index].editedPassword || newPasswords[index].password;
      newPasswords[index].password = editedPassword;
      newPasswords[index].strengthAssessment = assessPasswordStrengthWithZxcvbn(editedPassword);
      newPasswords[index].isEditing = false;
      newPasswords[index].editedPassword = undefined;
    } else {
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
    setRefreshKey(prev => prev + 1);
  };

  const handlePasswordSaved = () => {
    handlePasswordManagerClose();
  };

  const clearVaultHistory = useCallback(() => {
    localStorage.removeItem('prism_vault_passwords');
    localStorage.removeItem('prism_vault_protected_passwords');
    setPasswords([]);
    setShowPasswords([]);
    setRefreshKey(prev => prev + 1);
  }, []);

  if (isVaultLoading) {
    return <VaultLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-prism-bg to-prism-surface relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10">
        <Navigation />
        
        <div className="container mx-auto px-6 py-6">
          <SecurityScoreDashboard passwords={storedPasswords} />
          
          <StoredPasswordsList key={refreshKey} />

          <div className="grid gap-8 lg:grid-cols-2 py-[22px]">
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

            <div className="space-y-4">
              {isGenerating && animatingPasswords.some(p => p) ? 
                animatingPasswords.map((animPassword, index) => 
                  animPassword && <AnimatingPasswordCard 
                    key={`animating-${index}`} 
                    animPassword={animPassword} 
                    index={index} 
                  />
                ) : 
                passwords.length > 0 ? 
                  passwords.map((passwordData, index) => 
                    <GeneratedPasswordCard 
                      key={index} 
                      passwordData={passwordData} 
                      index={index} 
                      showPassword={showPasswords[index]} 
                      onToggleVisibility={() => togglePasswordVisibility(index)} 
                      onToggleEdit={() => togglePasswordEdit(index)} 
                      onPasswordEdit={value => handlePasswordEdit(index, value)} 
                      onCopy={() => copyToClipboard(passwordData.password, index)} 
                      onSaveToManager={() => savePasswordToManager(passwordData.password)} 
                    />
                  ) : 
                  <EmptyVaultCard />
              }
            </div>
          </div>
        </div>

        <Footer />

        <PasswordManagerDialog 
          isOpen={isPasswordManagerOpen} 
          onClose={handlePasswordManagerClose} 
          editingPassword={null} 
          onPasswordSaved={handlePasswordSaved} 
          prefilledPassword={prefilledPassword} 
        />
      </div>
    </div>
  );
};

export default PrismVault;
