import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
interface VaultHeaderProps {
  onClearHistory?: () => void;
}
export const VaultHeader: React.FC<VaultHeaderProps> = ({
  onClearHistory
}) => {
  const {
    toast
  } = useToast();
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
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Lock className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
        Prism Vault
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Advanced password generation with enterprise-grade security analysis
      </p>
    </div>
  );
};