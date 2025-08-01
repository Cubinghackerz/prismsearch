
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
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "bg-card border border-border shadow-lg",
                userButtonPopoverMain: "bg-card",
                userButtonPopoverFooter: "bg-card",
                userButtonPopoverActionButton: "text-foreground hover:bg-accent",
                userButtonPopoverActionButtonText: "text-foreground"
              }
            }}
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
