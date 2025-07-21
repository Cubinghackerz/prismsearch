import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VaultLoadingScreenProps {
  vaultText: string;
  encryptionProgress: number;
}

export const VaultLoadingScreen: React.FC<VaultLoadingScreenProps> = ({
  vaultText,
  encryptionProgress
}) => {
  const [animationPhase, setAnimationPhase] = useState<'encrypting' | 'unlocking' | 'complete'>('encrypting');

  useEffect(() => {
    if (encryptionProgress >= 70 && animationPhase === 'encrypting') {
      setAnimationPhase('unlocking');
      
      // Show unlocking animation for 2 seconds before marking as complete
      setTimeout(() => {
        setAnimationPhase('complete');
      }, 2000);
    }
  }, [encryptionProgress, animationPhase]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Atomic Animation Styles */}
      <style jsx>{`
        .atomic-loader {
          height: 20rem;
          width: 20rem;
         margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .react-star {
          position: relative;
          width: 15rem;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 15rem;
         margin: 0 auto;
          animation: rotate 3s infinite;
        }

        .nucleus {
          position: absolute;
         left: 50%;
         top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: linear-gradient(45deg, #00C2A8, #1DD1B8);
          height: 2rem;
          width: 2rem;
          animation: rotateNucleus 1s linear infinite;
          box-shadow: 0 0 20px rgba(0, 194, 168, 0.8);
        }

        .electron {
          position: absolute;
          width: 15rem;
          height: 6rem;
          border-radius: 50%;
          border: 0.3rem solid #00C2A8;
          animation: revolve 1s linear infinite;
        }

        .electron1::before,
        .electron2::before,
        .electron3::before {
          content: "";
          position: absolute;
          top: 60%;
          left: 100%;
          transform: translate(-50%, -50%);
          width: 1rem;
          height: 1rem;
          background-color: #1DD1B8;
          border-radius: 50%;
          animation: moveElectron 1s infinite;
          box-shadow: 0 0 10px rgba(29, 209, 184, 0.8);
        }

        .electron2 {
          transform: rotate(60deg);
          animation-delay: -0.66s;
        }
        .electron2::before {
          animation-delay: -0.66s;
        }

        .electron3 {
          transform: rotate(-60deg);
        }

        .unlocking .react-star {
          animation: rotateUnlocking 2s ease-in-out infinite;
        }

        .unlocking .nucleus {
          background: linear-gradient(45deg, #9B5DE5, #B47EE8);
          box-shadow: 0 0 30px rgba(155, 93, 229, 0.9);
        }

        .unlocking .electron {
          border-color: #9B5DE5;
        }

        .unlocking .electron::before {
          background-color: #B47EE8;
          box-shadow: 0 0 15px rgba(180, 126, 232, 0.9);
        }

        .complete .react-star {
          animation: rotateComplete 1s ease-out;
        }

        .complete .nucleus {
          background: linear-gradient(45deg, #10B981, #34D399);
          box-shadow: 0 0 40px rgba(16, 185, 129, 1);
        }

        .complete .electron {
          border-color: #10B981;
        }

        .complete .electron::before {
          background-color: #34D399;
          box-shadow: 0 0 20px rgba(52, 211, 153, 1);
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg) scale3d(1.1, 1.1, 0);
          }
        }

        @keyframes rotateUnlocking {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes rotateComplete {
          0% {
            transform: rotate(0deg) scale(1);
          }
          100% {
            transform: rotate(360deg) scale(1.3);
          }
        }

        @keyframes rotateNucleus {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes revolve {
          0% {
            border-color: rgba(0, 194, 168, 0.6);
            border-right: transparent;
          }
          25% {
            border-color: rgba(0, 194, 168, 0.6);
            border-bottom-color: transparent;
          }
          50% {
            border-color: rgba(0, 194, 168, 0.6);
            border-left-color: transparent;
          }
          75% {
            border-color: rgba(0, 194, 168, 0.6);
            border-top-color: transparent;
          }
          100% {
            border-color: rgba(0, 194, 168, 0.6);
            border-right-color: transparent;
          }
        }

        @keyframes moveElectron {
          0% {
            top: 60%;
            left: 100%;
          }
          25% {
            top: 100%;
            left: 60%;
          }
          50% {
            top: 60%;
            left: 0%;
          }
          75% {
            top: 0%;
            left: 60%;
          }
          100% {
            top: 60%;
            left: 100%;
          }
        }

        @keyframes atomicRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes atomicUnlocking {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.1);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes atomicComplete {
          0% {
            transform: rotate(0deg) scale(1);
          }
          100% {
            transform: rotate(360deg) scale(1.2);
          }
        }

        @keyframes atomicNucleus {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes atomicOrbit1 {
          0% {
            border-color: rgba(0, 194, 168, 0.6);
            border-right: transparent;
          }
          25% {
            border-color: rgba(0, 194, 168, 0.6);
            border-bottom-color: transparent;
          }
          50% {
            border-color: rgba(0, 194, 168, 0.6);
            border-left-color: transparent;
          }
          75% {
            border-color: rgba(0, 194, 168, 0.6);
            border-top-color: transparent;
          }
          100% {
            border-color: rgba(0, 194, 168, 0.6);
            border-right-color: transparent;
          }
        }

        @keyframes atomicOrbit2 {
          0% {
            border-color: rgba(29, 209, 184, 0.6);
            border-right: transparent;
          }
          25% {
            border-color: rgba(29, 209, 184, 0.6);
            border-bottom-color: transparent;
          }
          50% {
            border-color: rgba(29, 209, 184, 0.6);
            border-left-color: transparent;
          }
          75% {
            border-color: rgba(29, 209, 184, 0.6);
            border-top-color: transparent;
          }
          100% {
            border-color: rgba(29, 209, 184, 0.6);
            border-right-color: transparent;
          }
        }

        @keyframes atomicOrbit3 {
          0% {
            border-color: rgba(94, 234, 212, 0.6);
            border-right: transparent;
          }
          25% {
            border-color: rgba(94, 234, 212, 0.6);
            border-bottom-color: transparent;
          }
          50% {
            border-color: rgba(94, 234, 212, 0.6);
            border-left-color: transparent;
          }
          75% {
            border-color: rgba(94, 234, 212, 0.6);
            border-top-color: transparent;
          }
          100% {
            border-color: rgba(94, 234, 212, 0.6);
            border-right-color: transparent;
          }
        }

        @keyframes atomicElectron {
          0% {
            top: 60%;
            left: 100%;
          }
          25% {
            top: 100%;
            left: 60%;
          }
          50% {
            top: 60%;
            left: 0%;
          }
          75% {
            top: 0%;
            left: 60%;
          }
          100% {
            top: 60%;
            left: 100%;
          }
        }
      `}</style>

      <div className="text-center space-y-8 z-10">
        {/* Main vault opening animation */}
        <div className="relative">
          <div className="flex justify-center items-center py-8">
            <div className="relative w-32 h-32 flex justify-center items-center">
              {/* Rotating container */}
              <div 
                className={`relative w-24 h-24 flex justify-center items-center transition-all duration-1000 ${
                  animationPhase === 'complete' ? 'scale-125' : animationPhase === 'unlocking' ? 'scale-110' : 'scale-100'
                }`}
                style={{
                  animation: `${animationPhase === 'complete' ? 'atomicComplete' : animationPhase === 'unlocking' ? 'atomicUnlocking' : 'atomicRotate'} 3s linear infinite`
                }}
              >
                {/* Nucleus */}
                <div 
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: animationPhase === 'complete' 
                      ? 'linear-gradient(45deg, #10B981, #34D399)'
                      : animationPhase === 'unlocking' 
                        ? 'linear-gradient(45deg, #9B5DE5, #B47EE8)'
                        : 'linear-gradient(45deg, #00C2A8, #1DD1B8)',
                    boxShadow: animationPhase === 'complete'
                      ? '0 0 20px rgba(16, 185, 129, 0.8)'
                      : animationPhase === 'unlocking'
                        ? '0 0 20px rgba(155, 93, 229, 0.8)'
                        : '0 0 20px rgba(0, 194, 168, 0.8)',
                    animation: 'atomicNucleus 1s linear infinite'
                  }}
                />
                
                {/* Electron orbit 1 */}
                <div 
                  className="absolute w-24 h-12 rounded-full border-2"
                  style={{
                    borderColor: animationPhase === 'complete'
                      ? 'rgba(16, 185, 129, 0.6)'
                      : animationPhase === 'unlocking'
                        ? 'rgba(155, 93, 229, 0.6)'
                        : 'rgba(0, 194, 168, 0.6)',
                    animation: 'atomicOrbit1 1s linear infinite'
                  }}
                >
                  {/* Electron 1 */}
                  <div 
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      top: '60%',
                      left: '100%',
                      transform: 'translate(-50%, -50%)',
                      background: animationPhase === 'complete'
                        ? '#34D399'
                        : animationPhase === 'unlocking'
                          ? '#B47EE8'
                          : '#1DD1B8',
                      animation: 'atomicElectron 1s infinite'
                    }}
                  />
                </div>
                
                {/* Electron orbit 2 */}
                <div 
                  className="absolute w-24 h-12 rounded-full border-2"
                  style={{
                    borderColor: animationPhase === 'complete'
                      ? 'rgba(52, 211, 153, 0.6)'
                      : animationPhase === 'unlocking'
                        ? 'rgba(180, 126, 232, 0.6)'
                        : 'rgba(29, 209, 184, 0.6)',
                    transform: 'rotate(60deg)',
                    animation: 'atomicOrbit2 1s linear infinite',
                    animationDelay: '-0.66s'
                  }}
                >
                  {/* Electron 2 */}
                  <div 
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      top: '60%',
                      left: '100%',
                      transform: 'translate(-50%, -50%)',
                      background: animationPhase === 'complete'
                        ? '#34D399'
                        : animationPhase === 'unlocking'
                          ? '#B47EE8'
                          : '#1DD1B8',
                      animation: 'atomicElectron 1s infinite',
                      animationDelay: '-0.66s'
                    }}
                  />
                </div>
                
                {/* Electron orbit 3 */}
                <div 
                  className="absolute w-24 h-12 rounded-full border-2"
                  style={{
                    borderColor: animationPhase === 'complete'
                      ? 'rgba(167, 243, 235, 0.6)'
                      : animationPhase === 'unlocking'
                        ? 'rgba(196, 181, 253, 0.6)'
                        : 'rgba(94, 234, 212, 0.6)',
                    transform: 'rotate(-60deg)',
                    animation: 'atomicOrbit3 1s linear infinite'
                  }}
                >
                  {/* Electron 3 */}
                  <div 
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      top: '60%',
                      left: '100%',
                      transform: 'translate(-50%, -50%)',
                      background: animationPhase === 'complete'
                        ? '#34D399'
                        : animationPhase === 'unlocking'
                          ? '#B47EE8'
                          : '#1DD1B8',
                      animation: 'atomicElectron 1s infinite'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated text */}
        <div className="space-y-4">
          <h2 className={`text-4xl font-bold font-mono tracking-wider transition-colors duration-300 ${
            animationPhase === 'complete' ? 'text-emerald-400' : 
            animationPhase === 'unlocking' ? 'text-purple-400' : 'text-cyan-400'
          }`}>
            {vaultText}
          </h2>
          <p className="text-slate-400">
            {animationPhase === 'complete' 
              ? 'Vault unlocked successfully!' 
              : animationPhase === 'unlocking' 
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
              animationPhase === 'complete' ? 'bg-emerald-400' : 
              animationPhase === 'unlocking' ? 'bg-purple-400' : 'bg-cyan-400'
            }`}></div>
            <span>AES-256 Encryption</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              animationPhase === 'complete' ? 'bg-emerald-400' : 'bg-cyan-400'
            }`}></div>
            <span>Secure Protocol</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              animationPhase === 'complete' ? 'bg-emerald-400' : 
              animationPhase === 'unlocking' ? 'bg-purple-400' : 'bg-cyan-400'
            }`}></div>
            <span>Quantum Resistant</span>
          </div>
        </div>
      </div>
    </div>
  );
};