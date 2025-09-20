
import React, { useState, useEffect } from 'react';
import { SignIn, SignUp, useUser, useClerk } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LetterGlitch from '@/components/LetterGlitch';

const ClerkAuth = () => {
  const navigate = useNavigate();
  const { openSignIn, openSignUp } = useClerk();
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
      card: "bg-gray-900/95 backdrop-blur-md shadow-2xl border border-gray-700/50 rounded-xl",
      headerTitle: "text-2xl font-bold text-prism-text text-center mb-2 font-inter",
      headerSubtitle: "text-gray-400 text-center mb-6 font-inter",
      socialButtonsBlockButton: "w-full bg-gray-800/80 hover:bg-gray-700/80 text-white border border-gray-600 rounded-lg h-12 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-3 hover:border-gray-500 font-inter",
      socialButtonsBlockButtonText: "text-white font-medium",
      socialButtonsProviderIcon: "w-5 h-5",
      dividerLine: "bg-gray-600",
      dividerText: "text-gray-400 text-sm uppercase tracking-wide font-inter",
      formButtonPrimary: "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg h-12 text-sm font-medium transition-all duration-200 shadow-lg font-inter",
      formFieldInput: "w-full px-4 py-3 border border-gray-600 bg-gray-800/80 rounded-lg text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 font-inter",
      formFieldLabel: "text-sm font-medium text-white mb-2 font-inter",
      footerActionLink: "text-blue-400 hover:text-blue-300 underline underline-offset-4 font-inter",
      footerActionText: "text-gray-400 font-inter",
      footerAction: "flex justify-center mt-6",
      footer: "mt-6",
      identityPreviewText: "text-white font-inter",
      identityPreviewEditButtonIcon: "text-blue-400",
      userButtonAvatarBox: "w-8 h-8 border border-gray-600 rounded-full",
      userButtonPopoverCard: "bg-gray-900/95 border border-gray-700 shadow-xl rounded-xl backdrop-blur-md",
      userButtonPopoverMain: "bg-gray-900 rounded-lg",
      userButtonPopoverFooter: "bg-gray-900 border-t border-gray-700 rounded-b-lg",
      userButtonPopoverActionButton: "text-white hover:bg-gray-700 hover:text-blue-400 transition-colors duration-200 rounded-md font-inter px-3 py-2",
      userButtonPopoverActionButtonText: "text-white font-inter",
      userButtonPopoverActionButtonIcon: "text-blue-400",
      profileSectionPrimaryButton: "bg-blue-600 hover:bg-blue-700 text-white font-inter transition-colors duration-200",
      profileSectionTitle: "text-white font-inter text-lg font-semibold",
      profileSectionContent: "text-white font-inter leading-relaxed",
      accordionTriggerButton: "text-white hover:bg-gray-700 hover:text-blue-400 transition-colors duration-200 font-inter rounded-md px-3 py-2",
      accordionContent: "text-white bg-gray-800 font-inter rounded-md",
      userPreviewMainIdentifier: "text-white font-inter font-semibold text-base",
      userPreviewSecondaryIdentifier: "text-white font-inter text-sm",
      menuButton: "text-white hover:bg-gray-700 hover:text-blue-400 transition-colors duration-200 font-inter rounded-md px-3 py-2",
      menuList: "bg-gray-900 border border-gray-700 shadow-xl rounded-lg",
      menuItem: "text-white hover:bg-gray-700 hover:text-blue-400 transition-colors duration-200 font-inter px-3 py-2 rounded-md",
      formResendCodeLink: "text-prism-primary hover:text-prism-primary-light text-sm transition-colors duration-200 font-inter underline-offset-4 hover:underline",
      alertText: "text-red-400 text-sm font-inter",
      otpCodeFieldInput: "w-12 h-12 text-center border border-gray-600 bg-gray-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 font-inter text-lg font-medium",
      spinner: "text-blue-500",
      badge: "bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-inter",
      cardBox: "bg-transparent",
      main: "bg-transparent",
      formFieldRow: "space-y-2",
      formFieldAction: "text-blue-400 hover:text-blue-300 text-sm font-inter underline-offset-4 hover:underline",
      formFieldInfoText: "text-gray-400 text-xs font-inter leading-relaxed",
      pageScrollBox: "bg-black min-h-screen",
      page: "bg-black text-white font-inter min-h-screen",
      navbar: "bg-gray-900 border-b border-gray-700",
      navbarButton: "text-white hover:text-blue-400 font-inter transition-colors duration-200",
      navbarMobileMenuButton: "text-white hover:text-blue-400 transition-colors duration-200",
    },
    layout: {
      socialButtonsPlacement: "top" as const,
      showOptionalFields: false,
      logoPlacement: "inside" as const,
    },
    variables: {
      colorPrimary: "#3B82F6",
      colorDanger: "#ef4444",
      colorSuccess: "#10b981",
      colorWarning: "#f59e0b",
      colorNeutral: "#6b7280",
      colorText: "#FFFFFF",
      colorTextSecondary: "#FFFFFF",
      colorBackground: "#111111",
      colorInputBackground: "#1F2937",
      colorInputText: "#FFFFFF",
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
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <LetterGlitch 
          glitchColors={["#111111", "#1a1a1a", "#2a2a2a", "#3a3a3a"]}
          glitchSpeed={80}
          centerVignette={false}
          outerVignette={true}
          smooth={true}
        />
      </div>

      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 z-10"></div>

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
                />
              ) : (
                <SignUp 
                  appearance={prismAppearance}
                  forceRedirectUrl={getRedirectUrl()}
                  fallbackRedirectUrl={getRedirectUrl()}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default ClerkAuth;
