
import React from 'react';
import { Lock, Shield, Fingerprint, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface VaultHeaderProps {
  onClearHistory?: () => void;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({
  onClearHistory
}) => {
  const { toast } = useToast();
  
  const handleClearHistory = () => {
    if (!confirm('Are you sure you want to clear all vault history? This will remove all stored passwords and generated passwords. This action cannot be undone.')) {
      return;
    }
    onClearHistory?.();
    toast({
      title: "Vault history cleared",
      description: "All stored passwords and generated passwords have been removed."
    });
  };

  return (
    <>
      {/* Main Header */}
      <div className="text-center space-y-6 mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="relative">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Badge variant="secondary" className="text-xs font-bold">PRO</Badge>
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Prism Vault Pro
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Advanced password management with military-grade encryption
            </p>
          </div>
        </div>

        {/* Enhanced Features Banner */}
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Fingerprint className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Biometric Auth</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <Lock className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Zero-Knowledge</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">Secure Sharing</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Digital Identity</span>
          </div>
        </div>

        {/* Pro Features Description */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-3 text-center">Enhanced Security Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>• Biometric authentication support</div>
            <div>• Secure password sharing with expiration</div>
            <div>• Advanced breach monitoring</div>
            <div>• Digital identity management</div>
            <div>• Encrypted file storage</div>
            <div>• Team collaboration tools</div>
          </div>
        </div>
      </div>
    </>
  );
};
