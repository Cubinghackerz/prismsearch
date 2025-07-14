
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
  const [showUnlock, setShowUnlock] = useState(false);
  const [lockPhase, setLockPhase] = useState<'locked' | 'glitching' | 'unlocking' | 'unlocked'>('locked');
  const [glitchPixels, setGlitchPixels] = useState<Array<{x: number, y: number, color: string}>>([]);

  useEffect(() => {
    if (encryptionProgress >= 30 && lockPhase === 'locked') {
      setLockPhase('glitching');
      setIsGlitching(true);
      
      // Generate random glitch pixels
      const generateGlitchPixels = () => {
        const pixels = [];
        for (let i = 0; i < 15; i++) {
          pixels.push({
            x: Math.random() * 96, // 96px is the icon size (h-24 w-24)
            y: Math.random() * 96,
            color: Math.random() > 0.5 ? '#ef4444' : '#3b82f6' // red or blue
          });
        }
        setGlitchPixels(pixels);
      };

      // Update glitch pixels every 100ms
      const glitchInterval = setInterval(generateGlitchPixels, 100);
      
      // Clean up interval when glitching ends
      setTimeout(() => {
        clearInterval(glitchInterval);
      }, (70 - 30) / 100 * 2000); // Duration until next phase
      
    } else if (encryptionProgress >= 70 && lockPhase === 'glitching') {
      setIsGlitching(false);
      setGlitchPixels([]);
      setLockPhase('unlocking');
      setShowUnlock(true);
      
      // Show unlocking animation for 2.5 seconds before marking as unlocked
      setTimeout(() => {
        setLockPhase('unlocked');
      }, 2500);
    }
  }, [encryptionProgress, lockPhase]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="text-center space-y-8 z-10">
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
              
              {/* Random pixel glitch overlay */}
              {isGlitching && (
                <div className="absolute inset-0 w-24 h-24 mx-auto">
                  {glitchPixels.map((pixel, index) => (
                    <div
                      key={index}
                      className="absolute w-1 h-1 animate-pulse"
                      style={{
                        left: `${pixel.x}px`,
                        top: `${pixel.y}px`,
                        backgroundColor: pixel.color,
                        boxShadow: `0 0 4px ${pixel.color}`,
                      }}
                    />
                  ))}
                  
                  {/* Additional glitch effects */}
                  <div className="absolute inset-0 bg-red-500/10 animate-pulse mix-blend-multiply" />
                  <div className="absolute inset-0 bg-blue-500/10 animate-pulse mix-blend-screen" />
                </div>
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
