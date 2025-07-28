
import React from 'react';
import { useUser, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { User, LogIn } from 'lucide-react';

const AuthButtons = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <Button 
          variant="outline" 
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
        <Button 
          onClick={() => navigate('/auth')}
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
            afterSignOutUrl="/secure-redirect?message=Securely signing you out"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </div>
      </SignedIn>
    </div>
  );
};

export default AuthButtons;
