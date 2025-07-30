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
