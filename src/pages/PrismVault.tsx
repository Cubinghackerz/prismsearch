
import React, { useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VaultHeader } from '@/components/vault/VaultHeader';
import { PasswordGenerator } from '@/components/vault/PasswordGenerator';
import { GeneratedPasswordCard } from '@/components/vault/GeneratedPasswordCard';
import { AnimatingPasswordCard } from '@/components/vault/AnimatingPasswordCard';
import { EmptyVaultCard } from '@/components/vault/EmptyVaultCard';
import { StoredPasswordsList } from '@/components/StoredPasswordsList';
import { PasswordManagerDialog } from '@/components/PasswordManagerDialog';
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
  const [animatingPasswords, setAnimatingPasswords] = useState<string[]>([]);
  const [isPasswordManagerOpen, setIsPasswordManagerOpen] = useState(false);
  const [prefilledPassword, setPrefilledPassword] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

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

    if (pwd.length >= 16) bonusScore += 10;
    else if (pwd.length >= 12) bonusScore += 5;
    else if (pwd.length < 8) feedback.push('Password is too short. Use at least 12 characters');

    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
    const charTypes = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
    
    if (charTypes >= 4) bonusScore += 5;
    else if (charTypes < 3) feedback.push('Use a mix of uppercase, lowercase, numbers, and symbols');

    const finalScore = Math.min(100, Math.round(baseScore + bonusScore));

    let level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    if (finalScore >= 90) level = 'very-strong';
    else if (finalScore >= 75) level = 'strong';
    else if (finalScore >= 60) level = 'good';
    else if (finalScore >= 40) level = 'fair';
    else level = 'weak';

    if (zxcvbnResult.feedback.warning) {
      feedback.unshift(zxcvbnResult.feedback.warning);
    }
    zxcvbnResult.feedback.suggestions.forEach(suggestion => {
      if (!feedback.includes(suggestion)) {
        feedback.push(suggestion);
      }
    });

    const crackTime = String(zxcvbnResult.crack_times_display.offline_slow_hashing_1e4_per_second);
    
    return {
      score: finalScore,
      level,
      feedback: feedback.slice(0, 5),
      crackTime,
      entropy: Math.round(zxcvbnResult.guesses_log10 * 3.32)
    };
  }, []);

  const handleGenerate = () => {
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
    const animating: string[] = [];

    for (let i = 0; i < passwordCount; i++) {
      let generatedPassword = '';
      for (let j = 0; j < passwordLength[0]; j++) {
        generatedPassword += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      
      const strengthAssessment = assessPasswordStrengthWithZxcvbn(generatedPassword);
      newPasswords.push({
        password: generatedPassword,
        strengthAssessment
      });
      animating.push(generatedPassword);
    }

    setAnimatingPasswords(animating);
    
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setPasswords(newPasswords);
            setShowPasswords(new Array(newPasswords.length).fill(false));
            setIsGenerating(false);
            setAnimatingPasswords([]);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/5 to-background"></div>
      <Navigation />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <div className="w-6 h-6 rounded bg-primary-foreground/90"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            Prism Vault
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced password generation with enterprise-grade security analysis
          </p>
        </div>

        <div className="space-y-8">
          {/* Generator and Preview Section */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Password Generator - Takes 2/3 width */}
            <div className="lg:col-span-2">
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
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                generationProgress={generationProgress}
              />
            </div>

            {/* Generated Passwords Preview - Takes 1/3 width */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {passwords.length === 0 && !isGenerating && animatingPasswords.length === 0 ? (
                  <EmptyVaultCard />
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {animatingPasswords.map((password, index) => (
                      <AnimatingPasswordCard key={`anim-${index}`} password={password} />
                    ))}
                    {passwords.map((passwordData, index) => (
                      <GeneratedPasswordCard
                        key={`gen-${index}`}
                        passwordData={passwordData}
                        isVisible={showPasswords[index]}
                        onToggleVisibility={() => {
                          setShowPasswords(prev => {
                            const newState = [...prev];
                            newState[index] = !newState[index];
                            return newState;
                          });
                        }}
                        onSave={() => {
                          setPrefilledPassword(passwordData.password);
                          setIsPasswordManagerOpen(true);
                        }}
                        onEdit={(editedPassword) => {
                          setPasswords(prev => prev.map((p, i) => 
                            i === index 
                              ? { 
                                  password: editedPassword,
                                  strengthAssessment: assessPasswordStrengthWithZxcvbn(editedPassword)
                                }
                              : p
                          ));
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Password Manager Section */}
          <div className="border-t border-border pt-8">
            <StoredPasswordsList />
          </div>
        </div>
      </div>

      <PasswordManagerDialog
        isOpen={isPasswordManagerOpen}
        onClose={() => {
          setIsPasswordManagerOpen(false);
          setPrefilledPassword('');
        }}
        prefilledPassword={prefilledPassword}
        onPasswordSaved={() => {
          setRefreshKey(prev => prev + 1);
          toast({
            title: "Password saved successfully",
            description: "Your generated password has been securely stored."
          });
        }}
      />

      <Footer />
    </div>
  );
};

export default PrismVault;
