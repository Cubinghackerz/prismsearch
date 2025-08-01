
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

  // Clean Prism theme appearance configuration matching the reference image
  const prismAppearance = {
    elements: {
      rootBox: "w-full max-w-md mx-auto",
      card: "bg-transparent shadow-none border-none",
      headerTitle: "hidden",
      headerSubtitle: "hidden",
      
      // Social buttons styling - clean Microsoft-style button
      socialButtonsBlockButton: "w-full bg-prism-surface hover:bg-prism-hover text-prism-text border border-prism-border rounded-md h-12 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-3 hover:border-prism-primary/30 font-inter",
      socialButtonsBlockButtonText: "text-prism-text font-medium",
      socialButtonsProviderIcon: "w-5 h-5",
      
      // Divider styling
      dividerLine: "bg-prism-border",
      dividerText: "text-prism-text-muted text-sm uppercase tracking-wide font-inter",
      
      // Primary action button - teal like in the image
      formButtonPrimary: "w-full bg-prism-primary hover:bg-prism-primary-dark text-white rounded-md h-12 text-sm font-medium transition-all duration-200 shadow-sm font-inter",
      
      // Input fields - dark theme with proper contrast
      formFieldInput: "w-full px-4 py-3 border border-prism-border bg-prism-surface rounded-md text-sm text-prism-text placeholder:text-prism-text-muted focus:outline-none focus:ring-2 focus:ring-prism-primary/30 focus:border-prism-primary transition-all duration-200 font-inter",
      
      formFieldLabel: "text-sm font-medium text-prism-text mb-2 font-inter",
      
      // Footer and links
      footerActionLink: "text-prism-primary hover:text-prism-primary-light text-sm transition-colors duration-200 font-inter underline-offset-4 hover:underline",
      footerActionText: "text-prism-text-muted text-sm font-inter",
      
      // Identity preview and other elements
      identityPreviewText: "text-prism-text font-inter",
      identityPreviewEditButtonIcon: "text-prism-primary",
      
      // User button and profile elements
      userButtonAvatarBox: "w-8 h-8 border border-prism-border rounded-full",
      userButtonPopoverCard: "bg-prism-surface border border-prism-border shadow-xl rounded-lg backdrop-blur-md",
      userButtonPopoverMain: "bg-prism-surface rounded-lg",
      userButtonPopoverFooter: "bg-prism-surface border-t border-prism-border rounded-b-lg",
      userButtonPopoverActionButton: "text-prism-text hover:bg-prism-hover hover:text-prism-primary transition-colors duration-200 rounded-md font-inter px-3 py-2",
      userButtonPopoverActionButtonText: "text-prism-text font-inter",
      userButtonPopoverActionButtonIcon: "text-prism-primary",
      
      // Profile page elements
      profileSectionPrimaryButton: "bg-prism-primary hover:bg-prism-primary-dark text-white font-inter transition-colors duration-200",
      profileSectionTitle: "text-prism-text font-inter text-lg font-semibold",
      profileSectionContent: "text-prism-text font-inter leading-relaxed",
      
      // Account management elements
      accordionTriggerButton: "text-prism-text hover:bg-prism-hover hover:text-prism-primary transition-colors duration-200 font-inter rounded-md px-3 py-2",
      accordionContent: "text-prism-text bg-prism-surface font-inter rounded-md",
      
      // Enhanced visibility for user info
      userPreviewMainIdentifier: "text-prism-text font-inter font-semibold text-base",
      userPreviewSecondaryIdentifier: "text-prism-text font-inter text-sm",
      
      // Menu elements with better contrast
      menuButton: "text-prism-text hover:bg-prism-hover hover:text-prism-primary transition-colors duration-200 font-inter rounded-md px-3 py-2",
      menuList: "bg-prism-surface border border-prism-border shadow-xl rounded-lg",
      menuItem: "text-prism-text hover:bg-prism-hover hover:text-prism-primary transition-colors duration-200 font-inter px-3 py-2 rounded-md",
      
      // Verification and resend links
      formResendCodeLink: "text-prism-primary hover:text-prism-primary-light text-sm transition-colors duration-200 font-inter underline-offset-4 hover:underline",
      
      // Alert and error styling
      alertText: "text-red-400 text-sm font-inter",
      
      // OTP input styling
      otpCodeFieldInput: "w-12 h-12 text-center border border-prism-border bg-prism-surface rounded-md text-prism-text focus:outline-none focus:ring-2 focus:ring-prism-primary/30 focus:border-prism-primary transition-all duration-200 font-inter text-lg font-medium",
      
      // Loading spinner
      spinner: "text-prism-primary",
      
      // Badge styling
      badge: "bg-prism-accent text-white text-xs px-2 py-1 rounded-full font-inter",
      
      // Internal card styling
      cardBox: "bg-transparent",
      main: "bg-transparent",
      
      // Form field row
      formFieldRow: "space-y-2",
      
      // Form field action
      formFieldAction: "text-prism-primary hover:text-prism-primary-light text-sm font-inter underline-offset-4 hover:underline",
      
      // Terms and conditions
      formFieldInfoText: "text-prism-text-muted text-xs font-inter leading-relaxed",
      
      // Page elements
      pageScrollBox: "bg-prism-bg min-h-screen",
      page: "bg-prism-bg text-prism-text font-inter min-h-screen",
      
      // Navbar elements
      navbar: "bg-prism-surface border-b border-prism-border",
      navbarButton: "text-prism-text hover:text-prism-primary font-inter transition-colors duration-200",
      navbarMobileMenuButton: "text-prism-text hover:text-prism-primary transition-colors duration-200",
    },
    layout: {
      socialButtonsPlacement: "top" as const,
      showOptionalFields: false,
    },
    variables: {
      colorPrimary: "#00C2A8",
      colorDanger: "#ef4444",
      colorSuccess: "#10b981",
      colorWarning: "#f59e0b",
      colorNeutral: "#6b7280",
      colorText: "#F2F2F2",
      colorTextSecondary: "#F2F2F2",
      colorBackground: "#0D0D0D",
      colorInputBackground: "#1A1A1A",
      colorInputText: "#F2F2F2",
      borderRadius: "0.375rem",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: "0.875rem",
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
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
        <Card className="bg-prism-surface border-prism-border shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-6">
              <img 
                src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                alt="Prism Logo" 
                className="h-8 w-8"
              />
              <h1 className="text-2xl font-bold text-prism-primary font-inter">
                Prism
              </h1>
            </div>
            <CardTitle className="text-prism-text font-inter text-xl">
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
                  ? "Don't have an account? Sign up" 
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
