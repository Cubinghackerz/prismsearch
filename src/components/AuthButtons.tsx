
import React, { useState, useEffect } from 'react';
import { useUser, SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { User, LogIn, Fingerprint } from 'lucide-react';
import BiometricAuthService from '@/services/biometricAuthService';
import { BiometricAuthDialog } from './auth/BiometricAuthDialog';
import { useToast } from '@/hooks/use-toast';

const AuthButtons = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const [showBiometricDialog, setShowBiometricDialog] = useState(false);
  const [hasBiometricAuth, setHasBiometricAuth] = useState(false);

  useEffect(() => {
    if (user) {
      const hasCredential = BiometricAuthService.hasBiometricCredential(user.id);
      setHasBiometricAuth(hasCredential);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/secure-redirect?message=Securely signing you out&redirectTo=/');
  };

  const handleBiometricAuth = () => {
    setShowBiometricDialog(true);
  };

  const handleBiometricAuthenticated = () => {
    toast({
      title: "Biometric authentication successful",
      description: "You have been authenticated using biometrics."
    });
    setShowBiometricDialog(false);
  };

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        {BiometricAuthService.isAvailable() && (
          <Button 
            variant="outline" 
            onClick={handleBiometricAuth}
            className="flex items-center gap-2"
          >
            <Fingerprint className="w-4 h-4" />
            Biometric
          </Button>
        )}
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
            afterSignOutUrl="/secure-redirect?message=Securely signing you out&redirectTo=/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
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

      {user && (
        <BiometricAuthDialog
          isOpen={showBiometricDialog}
          onClose={() => setShowBiometricDialog(false)}
          onAuthenticated={handleBiometricAuthenticated}
          mode={hasBiometricAuth ? 'authenticate' : 'setup'}
          userId={user.id}
          displayName={user.firstName || user.emailAddresses[0]?.emailAddress || 'User'}
        />
      )}
    </div>
  );
};

export default AuthButtons;
