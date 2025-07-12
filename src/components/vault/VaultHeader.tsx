import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
interface VaultHeaderProps {
  onClearHistory?: () => void;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({ onClearHistory }) => {
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
  return <>
      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleClearHistory}
              variant="outline"
              size="sm"
              className="border-red-600 text-red-400 hover:bg-red-950/50 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
            <Link to="/" className="flex items-center text-slate-400 hover:text-slate-300 transition-colors">
              <Home className="h-5 w-5 mr-2" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative">
            <Lock className="h-12 w-12 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Prism Vault
          </h1>
        </div>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto py-[10px] my-0">
          Advanced password generation with military-grade encryption analysis
        </p>
      </div>
    </>;
};