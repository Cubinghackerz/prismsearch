
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface SavePasswordAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const SavePasswordAnimation: React.FC<SavePasswordAnimationProps> = ({ 
  isVisible, 
  onComplete 
}) => {
  const [stage, setStage] = useState<'loading' | 'complete' | 'hidden'>('hidden');

  useEffect(() => {
    if (isVisible) {
      setStage('loading');
      // Show loading for 2 seconds, then complete
      const timer = setTimeout(() => {
        setStage('complete');
        // Hide after showing completion for 1 second
        setTimeout(() => {
          setStage('hidden');
          onComplete();
        }, 1000);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setStage('hidden');
    }
  }, [isVisible, onComplete]);

  if (stage === 'hidden') return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Blurred background */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Animation container */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="relative">
          {/* Outer ring */}
          <div 
            className={`w-24 h-24 rounded-full border-4 transition-all duration-1000 ${
              stage === 'loading' 
                ? 'border-cyan-400/30 border-t-cyan-400 animate-spin' 
                : 'border-emerald-400'
            }`}
          />
          
          {/* Inner circle - fills when complete */}
          <div 
            className={`absolute inset-2 rounded-full transition-all duration-500 ${
              stage === 'complete' 
                ? 'bg-emerald-400 scale-100' 
                : 'bg-transparent scale-0'
            }`}
          />
          
          {/* Check icon */}
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 delay-200 ${
              stage === 'complete' 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-0'
            }`}
          >
            <Check className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
