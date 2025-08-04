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
  const [showAccessGranted, setShowAccessGranted] = useState(false);
  
  const securityChecks = [
    { icon: Lock, text: "Verifying identity..." },
    { icon: Key, text: "Generating encryption keys..." },
    { icon: Shield, text: "Initializing secure protocols..." },
    { icon: Eye, text: "Authenticating access..." },
  ];

  const encryptionCommands = [
    "$ npm install crypto-js bcrypt --save",
    "Generating 256-bit AES encryption keys...",
    "import { createCipheriv, createDecipheriv } from 'crypto';",
    "import bcrypt from 'bcryptjs';",
    "import CryptoJS from 'crypto-js';",
    "const algorithm = 'aes-256-gcm';",
    "const key = crypto.randomBytes(32);",
    "const iv = crypto.randomBytes(16);",
    "const salt = crypto.randomBytes(64);",
    "cipher = createCipheriv(algorithm, key, iv);",
    "Establishing secure connection...",
    "RSA key pair generation initiated...",
    "const { publicKey, privateKey } = generateKeyPair('rsa', {",
    "  modulusLength: 2048,",
    "  publicKeyEncoding: { type: 'spki', format: 'pem' },",
    "  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }",
    "});",
    "PBKDF2 iterations: 100000",
    "const hashedPassword = await bcrypt.hash(password, 12);",
    "const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');",
    "Initializing vault encryption layer...",
    "function encryptData(text, secretKey) {",
    "  return CryptoJS.AES.encrypt(text, secretKey).toString();",
    "}",
    "function decryptData(ciphertext, secretKey) {",
    "  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);",
    "  return bytes.toString(CryptoJS.enc.Utf8);",
    "}",
    "const encryptedAuth = cipher.update(authToken, 'utf8', 'hex');",
    "cipher.final('hex');",
    "const authTag = cipher.getAuthTag();",
    "Secure storage protocol activated",
    "localStorage.setItem('encryptedVault', encryptedData);",
    "sessionStorage.setItem('sessionKey', sessionKey);",
    "const timestamp = Date.now();",
    "const nonce = crypto.randomBytes(12);",
    "Authentication tokens validated",
    "JWT token signed with RS256 algorithm",
    "const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });",
    "Token expiry set to: " + new Date(Date.now() + 3600000).toISOString(),
    "Initializing secure WebSocket connection...",
    "wss://vault.prism.secure:443/encrypted-channel",
    "TLS 1.3 handshake completed",
    "Certificate validation successful",
    "const fingerprint = crypto.createHash('sha256')",
    "  .update(publicKey)",
    "  .digest('hex');",
    "Biometric authentication layer active",
    "Fingerprint hash: " + Math.random().toString(36).substring(2, 15),
    "Zero-knowledge proof generated",
    "const zkProof = generateZKProof(userCredentials);",
    "Multi-factor authentication enabled",
    "TOTP secret: " + Math.random().toString(36).substring(2, 18),
    "Backup codes generated: 8 codes",
    "Hardware security key detected",
    "FIDO2/WebAuthn protocol initialized",
    "const credential = await navigator.credentials.create({",
    "  publicKey: publicKeyCredentialCreationOptions",
    "});",
    "End-to-end encryption tunnel established",
    "Perfect forward secrecy enabled",
    "Diffie-Hellman key exchange completed",
    "Session keys rotated every 15 minutes",
    "Database encryption at rest: AES-256",
    "Memory encryption: Intel CET enabled",
    "Side-channel attack protection: ON",
    "const secureRandom = new Uint8Array(32);",
    "crypto.getRandomValues(secureRandom);",
    "Quantum-resistant algorithms prepared",
    "Post-quantum cryptography: Kyber-768",
    "SPHINCS+ signature scheme loaded",
    "Lattice-based encryption initialized",
    "Homomorphic encryption layer: FHE",
    "const encryptedComputation = fhe.encrypt(sensitiveData);",
    "Zero-trust architecture validated",
    "Microsegmentation policies applied",
    "Network isolation: VLAN 4094",
    "Firewall rules: 847 ACL entries loaded",
    "Intrusion detection system: ACTIVE",
    "const anomalyScore = calculateThreatScore(networkTraffic);",
    "if (anomalyScore > 0.85) { triggerSecurityAlert(); }",
    "Blockchain integrity verification",
    "const blockHash = calculateMerkleRoot(transactions);",
    "Smart contract audit: PASSED",
    "Decentralized identity verified",
    "const didDocument = await resolveDID(userDID);",
    "Verifiable credentials validated",
    "Privacy-preserving computation ready",
    "Differential privacy: ε = 0.1",
    "const noisyResult = addLaplaceNoise(trueResult, sensitivity);",
    "Secure multi-party computation initialized",
    "const sharedSecret = shamirSecretSharing.split(secret, 3, 5);",
    "Threshold cryptography: 3-of-5 scheme",
    "Distributed key generation completed",
    "Confidential computing enclave: Intel SGX",
    "Attestation report verified",
    "Sealed data integrity: CONFIRMED",
    "Vault ready for secure operations",
    "All security protocols: OPERATIONAL",
    "Welcome to Prism Vault - Ultra Secure Mode"
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

  // Terminal animation effect with more varied timing
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
          const delay = command.length > 50 ? 800 : 400; // Longer pause for longer lines
          setTimeout(() => {
            setTerminalLines(prev => [...prev, command]);
            setCurrentLine('');
            commandIndex++;
            charIndex = 0;
            
            // Keep only last 10 lines visible for better readability
            setTimeout(() => {
              setTerminalLines(prev => prev.slice(-10));
            }, 100);
          }, delay);
        }
      }
    };

    // Varied typing speed based on line content
    const getTypingSpeed = () => {
      const currentCommand = encryptionCommands[commandIndex];
      if (currentCommand?.startsWith('const ') || currentCommand?.startsWith('function ')) {
        return 30; // Slower for code
      } else if (currentCommand?.includes('//')) {
        return 80; // Faster for comments
      }
      return 40 + Math.random() * 30; // Variable speed
    };

    const typingInterval = setInterval(typeCommand, getTypingSpeed());
    
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

  // Start unlock animation when almost complete and handle access granted message
  useEffect(() => {
    if (encryptionProgress > 80 && !isUnlocking) {
      setIsUnlocking(true);
    }
    
    // Show flashing access granted message when complete
    if (encryptionProgress === 100 && !showAccessGranted) {
      setTimeout(() => {
        setShowAccessGranted(true);
      }, 2000); // 2 second pause
    }
  }, [encryptionProgress, showAccessGranted]);

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
        {/* Main vault icon without rotation */}
        <motion.div 
          className="flex items-center justify-center space-x-4"
          animate={isUnlocking ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: isUnlocking ? Infinity : 0 }}
        >
          <motion.div className="relative">
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
                : showAccessGranted ? (
                  <motion.span
                    className="text-green-400"
                    animate={{ 
                      opacity: [1, 0.3, 1],
                      textShadow: [
                        "0 0 5px #4ade80",
                        "0 0 15px #4ade80",
                        "0 0 5px #4ade80"
                      ]
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    Access granted. Welcome to Prism Vault.
                  </motion.span>
                ) : (
                  "Processing final security checks..."
                )
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
        
        {/* Enhanced Terminal/Code Environment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-[500px] mx-auto bg-black/90 border border-cyan-300/30 rounded-lg p-4 font-mono text-sm shadow-2xl"
        >
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-cyan-300/20">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-cyan-300/70 text-xs ml-2">prism-vault-terminal</span>
          </div>
          
          <div className="space-y-1 max-h-64 overflow-hidden">
            {terminalLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-xs leading-relaxed ${
                  line.startsWith('$') 
                    ? 'text-cyan-400' 
                    : line.includes('//') || line.includes('import') || line.includes('const') || line.includes('function')
                    ? 'text-green-400'
                    : line.includes('ERROR') || line.includes('FAILED')
                    ? 'text-red-400'
                    : line.includes('SUCCESS') || line.includes('CONFIRMED') || line.includes('OPERATIONAL')
                    ? 'text-green-300'
                    : 'text-gray-300'
                }`}
              >
                {line}
              </motion.div>
            ))}
            
            {currentLine && (
              <div className={`text-xs leading-relaxed ${
                currentLine.startsWith('$') 
                  ? 'text-cyan-400' 
                  : currentLine.includes('//') || currentLine.includes('import') || currentLine.includes('const') || currentLine.includes('function')
                  ? 'text-green-400'
                  : 'text-gray-300'
              }`}>
                {currentLine}
                <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity text-cyan-300`}>
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
