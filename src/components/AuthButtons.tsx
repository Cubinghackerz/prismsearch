
import React from 'react';
import { useUser, SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { User, LogIn } from 'lucide-react';

const AuthButtons = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    navigate('/secure-redirect?message=Securely signing you out&redirectTo=/');
  };

  // Prism theme for UserButton
  const userButtonAppearance = {
    elements: {
      avatarBox: "w-8 h-8 border border-prism-border",
      userButtonPopoverCard: "bg-prism-surface border border-prism-border shadow-xl backdrop-blur-md",
      userButtonPopoverMain: "bg-prism-surface",
      userButtonPopoverFooter: "bg-prism-surface border-t border-prism-border",
      userButtonPopoverActionButton: "text-prism-text hover:bg-prism-hover hover:text-prism-primary transition-colors duration-200 rounded-lg font-inter px-3 py-2",
      userButtonPopoverActionButtonText: "text-prism-text font-inter",
      userButtonPopoverActionButtonIcon: "text-prism-primary",
      
      // Profile page elements for better readability
      userPreviewMainIdentifier: "text-prism-text font-inter font-semibold",
      userPreviewSecondaryIdentifier: "text-prism-text font-inter", // Changed from muted for better visibility
      
      // Menu elements
      menuButton: "text-prism-text hover:bg-prism-hover hover:text-prism-primary transition-colors duration-200 font-inter",
      menuList: "bg-prism-surface border border-prism-border shadow-xl",
      menuItem: "text-prism-text hover:bg-prism-hover hover:text-prism-primary transition-colors duration-200 font-inter px-3 py-2",
      
      // Account management page elements
      profileSectionPrimaryButton: "bg-prism-primary hover:bg-prism-primary-dark text-white font-inter transition-colors duration-200",
      profileSectionTitle: "text-prism-text font-inter text-lg font-semibold",
      profileSectionContent: "text-prism-text font-inter",
      
      // Page layout
      pageScrollBox: "bg-prism-bg min-h-screen",
      page: "bg-prism-bg text-prism-text font-inter",
      
      // Navbar
      navbar: "bg-prism-surface border-b border-prism-border",
      navbarButton: "text-prism-text hover:text-prism-primary font-inter transition-colors duration-200",
      navbarMobileMenuButton: "text-prism-text hover:text-prism-primary",
      
      // Form elements in profile
      formButtonPrimary: "bg-prism-primary hover:bg-prism-primary-dark text-white rounded-lg font-inter transition-colors duration-200",
      formFieldInput: "border border-prism-border bg-prism-surface rounded-lg text-prism-text placeholder:text-prism-text-muted focus:outline-none focus:ring-2 focus:ring-prism-primary/50 focus:border-prism-primary transition-all duration-300 font-inter",
      formFieldLabel: "text-prism-text font-inter font-medium",
      
      // Accordion elements
      accordionTriggerButton: "text-prism-text hover:bg-prism-hover hover:text-prism-primary transition-colors duration-200 font-inter rounded-lg px-3 py-2",
      accordionContent: "text-prism-text bg-prism-surface font-inter",
    },
    variables: {
      colorPrimary: "#00C2A8",
      colorText: "#F2F2F2",
      colorTextSecondary: "#F2F2F2", // Changed from muted for better visibility
      colorBackground: "#0D0D0D",
      colorInputBackground: "#1A1A1A",
      colorInputText: "#F2F2F2",
      borderRadius: "0.5rem",
      fontFamily: "Inter, sans-serif",
    }
  };

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <Button 
          variant="outline" 
          onClick={() => navigate('/auth?mode=sign-in')}
          className="flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
        <Button 
          onClick={() => navigate('/auth?mode=sign-up')}
          className="flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Sign Up
        </Button>
      </SignedOut>
      
      <SignedIn>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden md:block">
            Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
          </span>
          <UserButton 
            afterSignOutUrl="/secure-redirect?message=Securely signing you out&redirectTo=/"
            appearance={userButtonAppearance}
          />
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="text-sm"
          >
            Sign Out
          </Button>
        </div>
      </SignedIn>
    </div>
  );
};

export default AuthButtons;
