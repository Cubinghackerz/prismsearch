
import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import Galaxy from '@/components/Galaxy';

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
      {/* Galaxy Background */}
      <div className="absolute inset-0">
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={true}
          density={2.0}
          glowIntensity={0.5}
          saturation={0.7}
          hueShift={140}
          transparent={false}
          rotationSpeed={0.1}
          twinkleIntensity={0.5}
          repulsionStrength={2.0}
          speed={2.5}
          starSpeed={1.2}
        />
      </div>

      {/* Content with solid background for readability */}
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

          {/* Animated Vault Text with readable background */}
          <div className="space-y-6 bg-black/60 backdrop-blur-sm p-8 rounded-xl border border-green-500/30">
            <h1 className="text-4xl font-bold font-fira-code tracking-widest text-white">
              {vaultText}
            </h1>
            
            {/* Encryption Progress with enhanced visibility */}
            <div className="space-y-4">
              <div className="text-sm font-fira-code text-green-400 bg-black/40 p-2 rounded">
                Initializing Secure Vault...
              </div>
              <div className="bg-black/40 p-4 rounded-lg">
                <Progress 
                  value={encryptionProgress} 
                  className="h-3 bg-gray-800 border border-green-500/50"
                />
                <div className="text-xs font-fira-code text-green-400/90 mt-2 text-center">
                  {Math.round(encryptionProgress)}% Complete
                </div>
              </div>
            </div>
          </div>

          {/* Security badges with readable background */}
          <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-green-500/20">
            <div className="flex justify-center space-x-4 text-xs font-fira-code text-green-400/90">
              <span>AES-256</span>
              <span>•</span>
              <span>Zero-Knowledge</span>
              <span>•</span>
              <span>Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultLoadingScreen;
