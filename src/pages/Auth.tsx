
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (user && !loading) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (!error) {
          toast({
            title: "Account created successfully!",
            description: "Please check your email for a confirmation link.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          navigate('/', { replace: true });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
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
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <Card className="backdrop-blur-md bg-prism-primary/5 border-prism-border shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-prism-text flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-prism-text">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-prism-text-muted" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-prism-surface border-prism-border text-prism-text"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-prism-text">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-prism-text-muted" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-prism-surface border-prism-border text-prism-text"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-prism-text-muted hover:text-prism-text"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm text-prism-text">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-prism-text-muted" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-prism-surface border-prism-border text-prism-text"
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary-dark hover:to-prism-accent-dark"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-prism-primary hover:text-prism-primary-light transition-colors"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>

            <div className="text-center pt-4 border-t border-prism-border mt-6">
              <p className="text-sm text-prism-text-muted mb-3">
                Why create an account?
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
