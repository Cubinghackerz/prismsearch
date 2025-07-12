
import React from 'react';
import { Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VaultLoadingScreenProps {
  vaultText: string;
  encryptionProgress: number;
}

export const VaultLoadingScreen: React.FC<VaultLoadingScreenProps> = ({
  vaultText,
  encryptionProgress
}) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="text-center space-y-8 z-10">
        {/* Main vault opening animation */}
        <div className="relative">
          <div className="p-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-400/30 backdrop-blur-sm">
            <Lock className="h-24 w-24 text-cyan-400 mx-auto animate-pulse" />
          </div>
        </div>
        
        {/* Animated text */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold font-mono text-green-400 tracking-wider">
            {vaultText}
          </h2>
          <p className="text-slate-400">Decrypting secure environment...</p>
        </div>

        {/* Progress bar */}
        <div className="w-80 mx-auto space-y-3">
          <Progress value={encryptionProgress} className="w-full h-3" />
          <p className="text-xs text-slate-400 text-center">
            Encryption Progress: {Math.round(encryptionProgress)}%
          </p>
        </div>

        {/* Security indicators */}
        <div className="flex justify-center space-x-6 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>AES-256 Encryption</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span>Secure Protocol</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span>Quantum Resistant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
