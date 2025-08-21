
import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import LetterGlitch from '@/components/LetterGlitch';

interface VaultLoadingScreenProps {
  vaultText: string;
  encryptionProgress: number;
  onLoadingComplete: () => void;
}

const VaultLoadingScreen: React.FC<VaultLoadingScreenProps> = ({
  vaultText,
  encryptionProgress,
  onLoadingComplete,
}) => {
  useEffect(() => {
    if (encryptionProgress >= 100) {
      const timer = setTimeout(() => {
        onLoadingComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [encryptionProgress, onLoadingComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* LetterGlitch Background */}
      <div className="absolute inset-0">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <div className="text-center space-y-8 max-w-md mx-auto px-6">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
              alt="Prism Logo" 
              className="w-16 h-16 animate-pulse"
            />
          </div>

          {/* Animated Vault Text */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold font-fira-code tracking-widest">
              {vaultText}
            </h1>
            
            {/* Encryption Progress */}
            <div className="space-y-4">
              <div className="text-sm font-fira-code text-green-400">
                Initializing Secure Vault...
              </div>
              <Progress 
                value={encryptionProgress} 
                className="h-2 bg-gray-800 border border-green-500/30"
              />
              <div className="text-xs font-fira-code text-green-400/70">
                {Math.round(encryptionProgress)}% Complete
              </div>
            </div>
          </div>

          {/* Security badges */}
          <div className="flex justify-center space-x-4 text-xs font-fira-code text-green-400/70 mt-8">
            <span>AES-256</span>
            <span>•</span>
            <span>Zero-Knowledge</span>
            <span>•</span>
            <span>Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultLoadingScreen;
