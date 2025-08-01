
import React from 'react';
import { Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import LoadingAnimation from '@/components/LoadingAnimation';

interface VaultLoadingScreenProps {
  vaultText: string;
  encryptionProgress: number;
}

const VaultLoadingScreen: React.FC<VaultLoadingScreenProps> = ({ vaultText, encryptionProgress }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        <div className="flex items-center justify-center space-x-4">
          <Shield className="h-12 w-12 text-cyan-300 animate-pulse" />
          <h1 className="text-4xl font-bold text-cyan-300 font-fira-code">PRISM VAULT</h1>
        </div>
        
        <div className="space-y-4">
          <div className="text-2xl font-mono text-cyan-300 tracking-wider">
            {vaultText}
          </div>
          
          <div className="w-80 mx-auto space-y-2">
            <Progress value={encryptionProgress} className="h-2" />
            <div className="text-sm text-slate-400 font-mono">
              Initializing secure encryption protocols...
            </div>
          </div>
        </div>
        
        <LoadingAnimation variant="orbit" color="cyan" size="large" />
      </div>
    </div>
  );
};

export default VaultLoadingScreen;
