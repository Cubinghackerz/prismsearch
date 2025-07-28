
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, CheckCircle } from 'lucide-react';

interface SecureRedirectProps {
  message?: string;
  redirectDelay?: number;
  redirectTo?: string;
}

const SecureRedirect: React.FC<SecureRedirectProps> = ({ 
  message = "Securely redirecting you", 
  redirectDelay = 3000,
  redirectTo = "/"
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectTo);
    }, redirectDelay);

    return () => clearTimeout(timer);
  }, [navigate, redirectDelay, redirectTo]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/80 backdrop-blur-md border-border/50">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center"
                >
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">{message}</h2>
                <p className="text-muted-foreground">
                  Please wait while we securely process your request...
                </p>
              </div>
              
              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="flex items-center gap-2 text-sm text-primary"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Secure session cleanup complete</span>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SecureRedirect;
