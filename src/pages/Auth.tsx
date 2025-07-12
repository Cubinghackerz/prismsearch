
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Chrome, Fingerprint, Eye, Lock } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (user && !loading) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Check if biometric authentication is supported
    const checkBiometricSupport = async () => {
      if ('credentials' in navigator && 'create' in navigator.credentials) {
        try {
          // Check if WebAuthn is supported
          const available = await navigator.credentials.get({
            publicKey: {
              challenge: new Uint8Array(32),
              allowCredentials: [],
              timeout: 1000,
            }
          }).catch(() => false);
          setBiometricSupported(!!available || 'authenticatorAttachment' in PublicKeyCredential.prototype);
        } catch {
          setBiometricSupported(false);
        }
      }
    };
    
    checkBiometricSupport();
  }, []);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setSigningIn(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!biometricSupported) {
      toast({
        title: "Biometric authentication not supported",
        description: "Please use Google sign-in instead.",
        variant: "destructive"
      });
      return;
    }

    try {
      // This would integrate with WebAuthn for biometric authentication
      // For now, we'll redirect to Google OAuth with biometric preference
      toast({
        title: "Biometric authentication",
        description: "Redirecting to secure authentication...",
      });
      
      await handleGoogleSignIn();
    } catch (error) {
      toast({
        title: "Biometric authentication failed",
        description: "Please try Google sign-in instead.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-prism-bg">
        <ParticleBackground color="#00C2A8" />
        <div className="animate-pulse space-y-4 text-center">
          <Shield className="h-12 w-12 text-prism-primary mx-auto" />
          <p className="text-prism-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-prism-bg p-4">
      <ParticleBackground color="#00C2A8" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <img 
              src="/lovable-uploads/aeaad4a8-0dc2-4d4b-b2b3-cb248e0843db.png" 
              alt="Prism Search Logo" 
              className="h-12 w-12"
            />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent 
              bg-gradient-to-r from-prism-primary-light via-prism-primary to-prism-accent">
              Prism Search
            </h1>
          </motion.div>
          <p className="text-prism-text-muted">
            Sign in to sync your passwords and bookmarks across devices
          </p>
        </div>

        <Card className="backdrop-blur-md bg-prism-primary/5 border-prism-border shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-prism-text flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Secure Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 
                shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {signingIn ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Chrome className="h-5 w-5" />
                  Continue with Google
                </div>
              )}
            </Button>

            {biometricSupported && (
              <Button
                onClick={handleBiometricAuth}
                variant="outline"
                className="w-full border-prism-primary text-prism-primary hover:bg-prism-primary/10"
              >
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Use Biometric Authentication
                </div>
              </Button>
            )}

            <div className="text-center pt-4 border-t border-prism-border">
              <p className="text-sm text-prism-text-muted mb-3">
                Why sign in?
              </p>
              <div className="space-y-2 text-xs text-prism-text-muted">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-prism-primary" />
                  <span>Sync passwords across devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-prism-primary" />
                  <span>Cloud backup for your vault</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-3 w-3 text-prism-primary" />
                  <span>Enhanced security features</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-prism-text-muted">
            Your data is encrypted and secure. We never store your passwords in plain text.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
