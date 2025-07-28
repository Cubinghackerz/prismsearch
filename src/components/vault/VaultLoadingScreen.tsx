
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Key, Eye } from 'lucide-react';

const VaultLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-prism-bg to-prism-surface flex items-center justify-center px-6">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(139, 92, 246, 0.6);
          }
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
      
      <div className="text-center space-y-8">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-prism-primary to-prism-accent rounded-full flex items-center justify-center pulse-glow">
            <Shield className="w-16 h-16 text-white" />
          </div>
          
          <motion.div
            className="absolute -top-4 -right-4 w-12 h-12 bg-prism-accent rounded-full flex items-center justify-center"
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Lock className="w-6 h-6 text-white" />
          </motion.div>
          
          <motion.div
            className="absolute -bottom-4 -left-4 w-10 h-10 bg-prism-primary-light rounded-full flex items-center justify-center"
            animate={{ 
              rotate: -360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Key className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent">
            Prism Vault
          </h1>
          <p className="text-xl text-prism-text-muted">
            Initializing your secure vault...
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex justify-center space-x-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-prism-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto"
        >
          <div className="text-center p-4 bg-prism-surface/50 rounded-lg border border-prism-border">
            <Lock className="w-6 h-6 text-prism-primary mx-auto mb-2" />
            <p className="text-xs text-prism-text-muted">Encryption</p>
          </div>
          <div className="text-center p-4 bg-prism-surface/50 rounded-lg border border-prism-border">
            <Key className="w-6 h-6 text-prism-accent mx-auto mb-2" />
            <p className="text-xs text-prism-text-muted">Key Management</p>
          </div>
          <div className="text-center p-4 bg-prism-surface/50 rounded-lg border border-prism-border">
            <Eye className="w-6 h-6 text-prism-primary-light mx-auto mb-2" />
            <p className="text-xs text-prism-text-muted">Security</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VaultLoadingScreen;
