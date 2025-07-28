
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, LogIn, Zap } from 'lucide-react';

interface AuthPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthPromptDialog: React.FC<AuthPromptDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleAuthRedirect = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-border/50">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
          </motion.div>
          <DialogTitle className="text-2xl font-bold text-foreground mb-2">
            Unlock the Full Experience
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-lg">
            Sign in or create an account to access all of Prism's powerful features and save your progress.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <Button 
            onClick={handleAuthRedirect}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg"
            size="lg"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Button>
          
          <Button 
            onClick={handleAuthRedirect}
            variant="outline"
            className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
            size="lg"
          >
            <User className="w-5 h-5 mr-2" />
            Create Account
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Continue without account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPromptDialog;
