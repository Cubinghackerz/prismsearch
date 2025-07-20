
import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VaultLoadingScreenProps {
  vaultText: string;
  encryptionProgress: number;
}

const statusMessages = [
  "Encrypting vaults...",
  "Deploying security modules...",  
  "Generating encryption keys...",
  "Analyzing password strength...",
  "Securing master access...",
];

export const VaultLoadingScreen: React.FC<VaultLoadingScreenProps> = ({
  vaultText,
  encryptionProgress
}) => {
  const [showUnlock, setShowUnlock] = useState(false);
  const [lockPhase, setLockPhase] = useState<'locked' | 'unlocking' | 'unlocked'>('locked');

  useEffect(() => {
    if (encryptionProgress >= 70 && lockPhase === 'locked') {
      setLockPhase('unlocking');
      setShowUnlock(true);
      
      // Show unlocking animation for 2.5 seconds before marking as unlocked
      setTimeout(() => {
        setLockPhase('unlocked');
      }, 2500);
    }
  }, [encryptionProgress, lockPhase]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center relative overflow-hidden">
      {/* Background particle effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-emerald-400/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-cyan-300/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-emerald-300/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="text-center space-y-8 z-10">
        {/* Atomic loader animation */}
        <div className="relative mb-8">
          <div className="relative w-60 h-60 mx-auto">
            {/* Central nucleus */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
            
            {/* Electron orbits */}
            <div className="absolute inset-0 border border-cyan-400/30 rounded-full animate-spin" style={{ animationDuration: '4s' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
            </div>
            
            <div className="absolute inset-4 border border-emerald-400/30 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"></div>
            </div>
            
            <div className="absolute inset-8 border border-cyan-300/25 rounded-full animate-spin" style={{ animationDuration: '5s' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-300 rounded-full shadow-lg shadow-cyan-300/40"></div>
            </div>
          </div>
        </div>

        {/* Status messages */}
        <div className="h-8 overflow-hidden mb-6">
          <div className="flex flex-col animate-scroll-status">
            {statusMessages.map((message, index) => (
              <div key={index} className="h-8 flex items-center justify-center">
                <span className="text-cyan-300 text-lg font-medium tracking-wide">{message}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main vault opening animation */}
        <div className="relative">
          <div className="p-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-400/30 backdrop-blur-sm transition-all duration-300">
            <div className="relative">
              {showUnlock ? (
                <Unlock className={`h-24 w-24 text-emerald-400 mx-auto ${
                  lockPhase === 'unlocking' ? 'animate-pulse' : ''
                }`} />
              ) : (
                <Lock 
                  className="h-24 w-24 text-cyan-400 mx-auto animate-pulse" 
                />
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
            {lockPhase === 'unlocked' 
              ? 'Vault unlocked successfully!' 
              : lockPhase === 'unlocking' 
                ? 'Unlocking vault...' 
                : 'Decrypting secure environment...'}
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
            <div className="w-2 h-2 rounded-full animate-pulse bg-cyan-400"></div>
            <span>Secure Protocol</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-400"></div>
            <span>Quantum Resistant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
