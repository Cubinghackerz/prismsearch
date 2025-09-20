
import React, { useState, useEffect } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LetterGlitch from '@/components/LetterGlitch';
import { SignUpPasswordStrength } from '@/components/auth/SignUpPasswordStrength';

const ClerkAuth = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'sign-in';
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Handle mode changes with smooth transitions
  useEffect(() => {
    if (mode !== currentMode) {
      setIsTransitioning(true);
      // Add a small delay to make the transition feel more natural
      const timer = setTimeout(() => {
        setCurrentMode(mode);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mode, currentMode]);

  const toggleMode = () => {
    const newMode = mode === 'sign-in' ? 'sign-up' : 'sign-in';
    setIsTransitioning(true);
    setSearchParams({ mode: newMode });
  };

  // Update Clerk configuration to use only Google and Microsoft
  const updateClerkSocialProviders = () => {
    // This will be handled by Clerk's appearance configuration
    // We'll hide GitHub and only show Google and Microsoft
  };

  // Fixed redirect URL configuration to prevent 404 errors
  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return '/';
    
    // Use the current origin for redirect
    const origin = window.location.origin;
    
    // For production deployments, ensure we use the correct URL
    if (origin.includes('vercel.app') || origin.includes('prismsearch')) {
      return origin + '/';
    }
    
    // For local development
    return origin + '/';
  };

  // Clean Prism theme appearance configuration matching the reference image
  const prismAppearance = {
    elements: {
      rootBox: "w-full max-w-md mx-auto",
      card: "bg-prism-surface/95 backdrop-blur-md shadow-2xl border border-prism-border/50 rounded-xl",
      headerTitle: "text-2xl font-bold text-prism-text text-center mb-2 font-inter",
      headerSubtitle: "text-prism-text-muted text-center mb-6 font-inter",
      socialButtonsBlockButton: "w-full bg-prism-surface/50 hover:bg-prism-surface text-prism-text border border-prism-border rounded-lg h-12 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-3 hover:border-prism-primary/40 font-inter",
      socialButtonsBlockButtonText: "text-prism-text font-medium",
      socialButtonsProviderIcon: "w-5 h-5",
      dividerLine: "bg-prism-border",
      dividerText: "text-prism-text-muted text-sm uppercase tracking-wide font-inter",
      formButtonPrimary: "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg h-12 text-sm font-medium transition-all duration-200 shadow-lg font-inter",
      formFieldInput: "w-full px-4 py-3 border border-prism-border bg-prism-surface/50 rounded-lg text-sm text-prism-text placeholder:text-prism-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 font-inter",
      formFieldLabel: "text-sm font-medium text-prism-text mb-2 font-inter",
      footerActionLink: "text-blue-400 hover:text-blue-300 underline underline-offset-4 font-inter",
      footerActionText: "text-prism-text-muted font-inter",
      footerAction: "flex justify-center mt-6",
      footer: "mt-6",
      identityPreviewText: "text-prism-text font-inter",
      identityPreviewEditButtonIcon: "text-prism-primary",
      userButtonAvatarBox: "w-8 h-8 border border-prism-border rounded-full",
      userButtonPopoverCard: "bg-prism-surface/95 border border-prism-border shadow-xl rounded-xl backdrop-blur-md",
      userButtonPopoverMain: "bg-prism-surface rounded-lg",
      userButtonPopoverFooter: "bg-prism-surface border-t border-prism-border rounded-b-lg",
      userButtonPopoverActionButton: "text-prism-text hover:bg-prism-hover hover:text-prism-primary transition-colors duration-200 rounded-md font-inter px-3 py-2",
      userButtonPopoverActionButtonText: "text-prism-text font-inter",
      userButtonPopoverActionButtonIcon: "text-prism-primary",
      profileSectionPrimaryButton: "bg-prism-primary hover:bg-prism-primary-dark text-white font-inter transition-colors duration-200",
      profileSectionTitle: "text-prism-text font-inter text-lg font-semibold",
      profileSectionContent: "text-prism-text font-inter leading-relaxed",
      accordionTriggerButton: "text-prism-text hover:bg-prism-hover hover:text-prism-primary transition-colors duration-200 font-inter rounded-md px-3 py-2",
      accordionContent: "text-prism-text bg-prism-surface font-inter rounded-md",
      userPreviewMainIdentifier: "text-prism-text font-inter font-semibold text-base",
      userPreviewSecondaryIdentifier: "text-prism-text font-inter text-sm",
      menuButton: "text-prism-text hover:bg-prism-hover hover:text-prism-primary transition-colors duration-200 font-inter rounded-md px-3 py-2",
      menuList: "bg-prism-surface border border-prism-border shadow-xl rounded-lg",
      menuItem: "text-prism-text hover:bg-prism-hover hover:text-prism-primary transition-colors duration-200 font-inter px-3 py-2 rounded-md",
      formResendCodeLink: "text-prism-primary hover:text-prism-primary-light text-sm transition-colors duration-200 font-inter underline-offset-4 hover:underline",
      alertText: "text-red-400 text-sm font-inter",
      otpCodeFieldInput: "w-12 h-12 text-center border border-prism-border bg-prism-surface rounded-md text-prism-text focus:outline-none focus:ring-2 focus:ring-prism-primary/30 focus:border-prism-primary transition-all duration-200 font-inter text-lg font-medium",
      spinner: "text-prism-primary",
      badge: "bg-prism-accent text-white text-xs px-2 py-1 rounded-full font-inter",
      cardBox: "bg-transparent",
      main: "bg-transparent",
      formFieldRow: "space-y-2",
      formFieldAction: "text-prism-primary hover:text-prism-primary-light text-sm font-inter underline-offset-4 hover:underline",
      formFieldInfoText: "text-prism-text-muted text-xs font-inter leading-relaxed",
      pageScrollBox: "bg-prism-bg min-h-screen",
      page: "bg-prism-bg text-prism-text font-inter min-h-screen",
      navbar: "bg-prism-surface border-b border-prism-border",
      navbarButton: "text-prism-text hover:text-prism-primary font-inter transition-colors duration-200",
      navbarMobileMenuButton: "text-prism-text hover:text-prism-primary transition-colors duration-200",
    },
    layout: {
      socialButtonsPlacement: "top" as const,
      showOptionalFields: false,
    },
    variables: {
      colorPrimary: "#3B82F6",
      colorDanger: "#ef4444",
      colorSuccess: "#10b981",
      colorWarning: "#f59e0b",
      colorNeutral: "#6b7280",
      colorText: "#F2F2F2",
      colorTextSecondary: "#F2F2F2",
      colorBackground: "#0D0D0D",
      colorInputBackground: "#1A1A1A",
      colorInputText: "#F2F2F2",
      borderRadius: "0.5rem",
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

  const fadeVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="min-h-screen bg-prism-bg flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <LetterGlitch 
          glitchColors={["#1e293b", "#334155", "#475569", "#64748b"]}
          glitchSpeed={100}
          centerVignette={false}
          outerVignette={true}
          smooth={true}
        />
      </div>

      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-prism-bg/80 via-prism-bg/60 to-prism-bg/80 z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-20"
      >
        {/* Loading state during transitions */}
        {isTransitioning ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-prism-primary border-t-transparent" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode}
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              {currentMode === 'sign-in' ? (
                <SignIn 
                  appearance={prismAppearance}
                  forceRedirectUrl={getRedirectUrl()}
                  fallbackRedirectUrl={getRedirectUrl()}
                  signUpUrl="?mode=sign-up"
                  signUpForceRedirectUrl={getRedirectUrl()}
                  socialButtonsVariant="iconButton"
                />
              ) : (
                <SignUp 
                  appearance={prismAppearance}
                  forceRedirectUrl={getRedirectUrl()}
                  fallbackRedirectUrl={getRedirectUrl()}
                  signInUrl="?mode=sign-in"
                  signInForceRedirectUrl={getRedirectUrl()}
                  socialButtonsVariant="iconButton"
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Password Strength Analysis for Sign Up - only show when not transitioning */}
        {currentMode === 'sign-up' && !isTransitioning && (
          <motion.div
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-6"
          >
            <SignUpPasswordStrength 
              onPasswordChange={(password, isStrong) => {
                console.log('Password strength update:', { password: password.length > 0 ? '[REDACTED]' : '', isStrong });
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ClerkAuth;
