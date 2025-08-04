import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface VaultLoadingScreenProps {
  vaultText: string;
  encryptionProgress: number;
}

const VaultLoadingScreen: React.FC<VaultLoadingScreenProps> = ({ vaultText, encryptionProgress }) => {
  const [scanLines, setScanLines] = useState<number[]>([]);
  const [showSecurityChecks, setShowSecurityChecks] = useState(false);
  const [completedChecks, setCompletedChecks] = useState<boolean[]>([]);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>(['$ prism-vault initialize...']);
  const [currentLine, setCurrentLine] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  const securityChecks = [
    { icon: Lock, text: "Verifying identity..." },
    { icon: Key, text: "Generating encryption keys..." },
    { icon: Shield, text: "Initializing secure protocols..." },
    { icon: Eye, text: "Authenticating access..." },
  ];

  const encryptionCommands = [
    "Generating 256-bit AES encryption keys...",
    "import { createCipheriv } from 'crypto';",
    "const algorithm = 'aes-256-gcm';",
    "const key = crypto.randomBytes(32);",
    "const iv = crypto.randomBytes(16);",
    "cipher = createCipheriv(algorithm, key, iv);",
    "Establishing secure connection...",
    "RSA key pair generation initiated...",
    "const { publicKey, privateKey } = generateKeyPair();",
    "Salt generation: crypto.randomBytes(64);",
    "PBKDF2 iterations: 100000",
    "Initializing vault encryption layer...",
    "Secure storage protocol activated",
    "Authentication tokens validated",
    "Vault ready for secure operations"
  ];

  // Generate scanning effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLines(prev => {
        const newLines = [...prev];
        if (newLines.length < 8) {
          newLines.push(Math.random() * 100);
        } else {
          newLines.shift();
          newLines.push(Math.random() * 100);
        }
        return newLines;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Terminal animation effect
  useEffect(() => {
    let commandIndex = 0;
    let charIndex = 0;
    
    const typeCommand = () => {
      if (commandIndex < encryptionCommands.length) {
        const command = encryptionCommands[commandIndex];
        
        if (charIndex < command.length) {
          setCurrentLine(command.slice(0, charIndex + 1));
          charIndex++;
        } else {
          // Command finished, add to terminal lines
          setTimeout(() => {
            setTerminalLines(prev => [...prev, command]);
            setCurrentLine('');
            commandIndex++;
            charIndex = 0;
            
            // Keep only last 8 lines visible
            setTimeout(() => {
              setTerminalLines(prev => prev.slice(-8));
            }, 100);
          }, 500);
        }
      }
    };

    const typingInterval = setInterval(typeCommand, 50 + Math.random() * 50);
    
    return () => clearInterval(typingInterval);
  }, []);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Show security checks when progress > 20%
  useEffect(() => {
    if (encryptionProgress > 20 && !showSecurityChecks) {
      setShowSecurityChecks(true);
      
      // Animate each check completion
      securityChecks.forEach((_, index) => {
        setTimeout(() => {
          setCompletedChecks(prev => {
            const newChecks = [...prev];
            newChecks[index] = true;
            return newChecks;
          });
        }, (index + 1) * 800);
      });
    }
  }, [encryptionProgress]);

  // Start unlock animation when almost complete
  useEffect(() => {
    if (encryptionProgress > 80 && !isUnlocking) {
      setIsUnlocking(true);
    }
  }, [encryptionProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-300/30 rounded-full"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%"
            }}
          />
        ))}
      </div>

      {/* Scanning lines effect */}
      <div className="absolute inset-0 pointer-events-none">
        {scanLines.map((position, index) => (
          <motion.div
            key={index}
            className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent"
            style={{ top: `${position}%` }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8 }}
          />
        ))}
      </div>

      <div className="text-center space-y-8 z-10 relative">
        {/* Main vault icon with pulsing effect */}
        <motion.div 
          className="flex items-center justify-center space-x-4"
          animate={isUnlocking ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: isUnlocking ? Infinity : 0 }}
        >
          <motion.div
            className="relative"
            animate={{ rotate: isUnlocking ? 360 : 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <Shield className="h-12 w-12 text-cyan-300" />
            {isUnlocking && (
              <motion.div
                className="absolute inset-0 border-2 border-cyan-300 rounded-full"
                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold text-cyan-300 font-fira-code"
            animate={isUnlocking ? { 
              textShadow: [
                "0 0 5px #00ffff", 
                "0 0 20px #00ffff", 
                "0 0 5px #00ffff"
              ] 
            } : {}}
            transition={{ duration: 1, repeat: isUnlocking ? Infinity : 0 }}
          >
            PRISM VAULT
          </motion.h1>
        </motion.div>
        
        <div className="space-y-6">
          {/* Animated text */}
          <motion.div 
            className="text-2xl font-mono text-cyan-300 tracking-wider"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {vaultText}
          </motion.div>
          
          {/* Progress bar with glow effect */}
          <div className="w-80 mx-auto space-y-2">
            <div className="relative">
              <Progress 
                value={encryptionProgress} 
                className="h-3 bg-slate-800/50 border border-cyan-300/30" 
              />
              {encryptionProgress > 0 && (
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-300/20 to-cyan-300/40 rounded-full"
                  style={{ width: `${encryptionProgress}%` }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            <div className="text-sm text-slate-400 font-mono">
              {encryptionProgress < 100 
                ? "Initializing secure encryption protocols..."
                : "Access granted. Welcome to Prism Vault."
              }
            </div>
          </div>

          {/* Security checks */}
          <AnimatePresence>
            {showSecurityChecks && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {securityChecks.map((check, index) => {
                  const Icon = check.icon;
                  const isCompleted = completedChecks[index];
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="flex items-center justify-center space-x-3 text-sm"
                    >
                      <motion.div
                        animate={isCompleted ? { 
                          scale: [1, 1.2, 1],
                          color: ["#67e8f9", "#00ff00", "#67e8f9"]
                        } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="h-4 w-4 text-cyan-300" />
                      </motion.div>
                      <span className={`font-mono ${isCompleted ? 'text-green-400' : 'text-slate-400'}`}>
                        {check.text}
                      </span>
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-green-400 rounded-full"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Terminal/Code Environment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-96 mx-auto bg-black/80 border border-cyan-300/30 rounded-lg p-4 font-mono text-sm"
        >
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-cyan-300/20">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-cyan-300/70 text-xs ml-2">prism-vault-terminal</span>
          </div>
          
          <div className="space-y-1 max-h-48 overflow-hidden">
            {terminalLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-400 text-xs leading-relaxed"
              >
                {line}
              </motion.div>
            ))}
            
            {currentLine && (
              <div className="text-green-400 text-xs leading-relaxed">
                {currentLine}
                <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  █
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VaultLoadingScreen;
