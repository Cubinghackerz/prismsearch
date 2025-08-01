
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/80 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img 
                src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                alt="Prism Logo" 
                className="h-8 w-8"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Prism
              </h1>
            </div>
            <CardTitle className="text-foreground">
              {mode === 'sign-in' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center">
              {mode === 'sign-in' ? (
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-none bg-transparent",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg h-12 text-sm font-medium transition-colors flex items-center justify-center gap-3",
                      socialButtonsBlockButtonText: "text-gray-700 font-medium",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground text-xs uppercase",
                      formButtonPrimary: "w-full bg-primary hover:bg-primary/90 text-white rounded-lg h-11 text-sm font-medium transition-colors",
                      formFieldInput: "w-full px-3 py-2 border border-input bg-background rounded-lg text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      formFieldLabel: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground",
                      footerActionLink: "text-primary hover:text-primary/80 text-sm",
                      identityPreviewText: "text-foreground",
                      formResendCodeLink: "text-primary hover:text-primary/80 text-sm"
                    },
                    layout: {
                      socialButtonsPlacement: "top",
                      showOptionalFields: false
                    }
                  }}
                  redirectUrl={window.location.origin}
                  signUpUrl="/auth?mode=sign-up"
                />
              ) : (
                <SignUp 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-none bg-transparent",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg h-12 text-sm font-medium transition-colors flex items-center justify-center gap-3",
                      socialButtonsBlockButtonText: "text-gray-700 font-medium",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground text-xs uppercase",
                      formButtonPrimary: "w-full bg-primary hover:bg-primary/90 text-white rounded-lg h-11 text-sm font-medium transition-colors",
                      formFieldInput: "w-full px-3 py-2 border border-input bg-background rounded-lg text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      formFieldLabel: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground",
                      footerActionLink: "text-primary hover:text-primary/80 text-sm",
                      identityPreviewText: "text-foreground",
                      formResendCodeLink: "text-primary hover:text-primary/80 text-sm"
                    },
                    layout: {
                      socialButtonsPlacement: "top",
                      showOptionalFields: false
                    }
                  }}
                  redirectUrl={window.location.origin}
                  signInUrl="/auth?mode=sign-in"
                />
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
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
