
import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VaultLoadingScreenProps {
  vaultText: string;
  encryptionProgress: number;
}

export const VaultLoadingScreen: React.FC<VaultLoadingScreenProps> = ({
  vaultText,
  encryptionProgress
}) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [lockPhase, setLockPhase] = useState<'locked' | 'glitching' | 'shaking' | 'unlocked'>('locked');

  useEffect(() => {
    if (encryptionProgress >= 30 && lockPhase === 'locked') {
      setLockPhase('glitching');
      setIsGlitching(true);
    } else if (encryptionProgress >= 70 && lockPhase === 'glitching') {
      setIsGlitching(false);
      setLockPhase('shaking');
      setIsShaking(true);
      
      // After shaking, unlock
      setTimeout(() => {
        setIsShaking(false);
        setLockPhase('unlocked');
        setShowUnlock(true);
      }, 1500);
    }
  }, [encryptionProgress, lockPhase]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="text-center space-y-8 z-10">
        {/* Main vault opening animation */}
        <div className="relative">
          <div className={`p-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-400/30 backdrop-blur-sm transition-all duration-300 ${
            isShaking ? 'animate-bounce' : ''
          }`}>
            <div className={`relative ${isGlitching ? 'animate-pulse' : ''}`}>
              {showUnlock ? (
                <Unlock className="h-24 w-24 text-emerald-400 mx-auto animate-pulse" />
              ) : (
                <Lock 
                  className={`h-24 w-24 text-cyan-400 mx-auto transition-all duration-200 ${
                    isGlitching ? 'animate-ping opacity-70' : 'animate-pulse'
                  }`} 
                />
              )}
              
              {/* Glitch overlay effect */}
              {isGlitching && (
                <>
                  <div className="absolute inset-0 bg-red-500/20 animate-pulse mix-blend-multiply" />
                  <div className="absolute inset-0 bg-blue-500/20 animate-pulse mix-blend-screen" />
                  <Lock className="absolute inset-0 h-24 w-24 text-red-400 mx-auto animate-ping opacity-30" />
                  <Lock className="absolute inset-0 h-24 w-24 text-blue-400 mx-auto animate-pulse opacity-20" />
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Animated text */}
        <div className="space-y-4">
          <h2 className={`text-4xl font-bold font-mono tracking-wider transition-colors duration-300 ${
            showUnlock ? 'text-emerald-400' : 'text-green-400'
          }`}>
            {vaultText}
          </h2>
          <p className="text-slate-400">
            {showUnlock ? 'Vault unlocked successfully!' : 'Decrypting secure environment...'}
          </p>
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
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              showUnlock ? 'bg-emerald-400' : 'bg-green-400'
            }`}></div>
            <span>AES-256 Encryption</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isGlitching ? 'bg-red-400' : 'bg-cyan-400'
            }`}></div>
            <span>Secure Protocol</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              showUnlock ? 'bg-emerald-400' : 'bg-emerald-400'
            }`}></div>
            <span>Quantum Resistant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
