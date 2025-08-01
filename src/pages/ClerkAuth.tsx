
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomAuthForm from '@/components/auth/CustomAuthForm';

const ClerkAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as 'sign-in' | 'sign-up') || 'sign-in';

  const toggleMode = () => {
    const newMode = mode === 'sign-in' ? 'sign-up' : 'sign-in';
    navigate(`/auth?mode=${newMode}`);
  };

  return (
    <div className="min-h-screen bg-prism-bg flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-prism-primary/5 via-transparent to-prism-accent/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-prism-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-prism-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 w-full max-w-md">
        <CustomAuthForm mode={mode} onToggleMode={toggleMode} />
        
        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center mt-8"
        >
          <Button
            type="button"
            onClick={() => navigate('/')}
            variant="outline"
            className="flex items-center gap-2 bg-prism-surface/50 border-prism-border/50 hover:bg-prism-hover text-prism-text hover:text-prism-primary transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ClerkAuth;
