
import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ClerkAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'sign-in';

  const toggleMode = () => {
    const newMode = mode === 'sign-in' ? 'sign-up' : 'sign-in';
    navigate(`/auth?mode=${newMode}`);
  };

  // Prism theme appearance configuration
  const prismAppearance = {
    elements: {
      rootBox: "w-full",
      card: "shadow-none border-none bg-transparent",
      headerTitle: "hidden",
      headerSubtitle: "hidden",
      
      // Social buttons styling
      socialButtonsBlockButton: "w-full bg-prism-surface hover:bg-prism-hover text-prism-text border border-prism-border rounded-lg h-12 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-3 hover:border-prism-primary/50 hover:shadow-lg hover:shadow-prism-primary/10 font-inter",
      socialButtonsBlockButtonText: "text-prism-text font-medium",
      socialButtonsProviderIcon: "w-5 h-5",
      
      // Divider styling
      dividerLine: "bg-prism-border",
      dividerText: "text-prism-text-muted text-xs uppercase font-inter",
      
      // Form elements
      formButtonPrimary: "w-full bg-prism-primary hover:bg-prism-primary-dark text-white rounded-lg h-11 text-sm font-medium transition-all duration-300 shadow-lg shadow-prism-primary/20 hover:shadow-prism-primary/30 border border-prism-primary/40 hover:border-prism-primary-dark/60 active:translate-y-0.5 active:shadow-sm font-inter",
      
      formFieldInput: "w-full px-4 py-3 border border-prism-border bg-prism-surface rounded-lg text-sm text-prism-text placeholder:text-prism-text-muted focus:outline-none focus:ring-2 focus:ring-prism-primary/50 focus:border-prism-primary transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 font-inter",
      
      formFieldLabel: "text-sm font-medium text-prism-text mb-2 font-inter",
      
      // Footer and links
      footerActionLink: "text-prism-primary hover:text-prism-primary-light text-sm transition-colors duration-300 font-inter",
      footerActionText: "text-prism-text-muted text-sm font-inter",
      
      // Identity preview and other elements
      identityPreviewText: "text-prism-text font-inter",
      identityPreviewEditButtonIcon: "text-prism-primary",
      
      // Verification and resend links
      formResendCodeLink: "text-prism-primary hover:text-prism-primary-light text-sm transition-colors duration-300 font-inter",
      
      // Alert and error styling
      alertText: "text-red-400 text-sm font-inter",
      
      // OTP input styling
      otpCodeFieldInput: "w-12 h-12 text-center border border-prism-border bg-prism-surface rounded-lg text-prism-text focus:outline-none focus:ring-2 focus:ring-prism-primary/50 focus:border-prism-primary transition-all duration-300 font-inter text-lg",
      
      // Loading spinner
      spinner: "text-prism-primary",
      
      // Badge styling
      badge: "bg-prism-accent text-white text-xs px-2 py-1 rounded font-inter",
      
      // Internal card styling
      cardBox: "bg-transparent",
      main: "bg-transparent",
      
      // Form field row
      formFieldRow: "space-y-2",
      
      // Form field action
      formFieldAction: "text-prism-primary hover:text-prism-primary-light text-sm font-inter",
      
      // Terms and conditions
      formFieldInfoText: "text-prism-text-muted text-xs font-inter",
    },
    layout: {
      socialButtonsPlacement: "top",
      showOptionalFields: false,
    },
    variables: {
      colorPrimary: "#00C2A8",
      colorDanger: "#ef4444",
      colorSuccess: "#10b981",
      colorWarning: "#f59e0b",
      colorNeutral: "#6b7280",
      colorText: "#F2F2F2",
      colorTextSecondary: "#B0B0B0",
      colorBackground: "#0D0D0D",
      colorInputBackground: "#1A1A1A",
      colorInputText: "#F2F2F2",
      borderRadius: "0.5rem",
      fontFamily: "Inter, sans-serif",
      fontSize: "0.875rem",
      fontWeight: "400",
    }
  };

  return (
    <div className="min-h-screen bg-prism-bg flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-prism-surface/80 backdrop-blur-md border-prism-border">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img 
                src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                alt="Prism Logo" 
                className="h-8 w-8"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent font-inter">
                Prism
              </h1>
            </div>
            <CardTitle className="text-prism-text font-inter">
              {mode === 'sign-in' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center">
              {mode === 'sign-in' ? (
                <SignIn 
                  appearance={prismAppearance}
                  redirectUrl={window.location.origin}
                  signUpUrl="/auth?mode=sign-up"
                />
              ) : (
                <SignUp 
                  appearance={prismAppearance}
                  redirectUrl={window.location.origin}
                  signInUrl="/auth?mode=sign-in"
                />
              )}
            </div>

            <div className="flex items-center justify-center gap-4 pt-4 border-t border-prism-border">
              <Button
                type="button"
                onClick={() => navigate('/')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              
              <Button
                type="button"
                onClick={toggleMode}
                variant="ghost"
                className="text-sm"
              >
                {mode === 'sign-in' 
                  ? "Need an account? Sign up" 
                  : "Have an account? Sign in"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClerkAuth;
