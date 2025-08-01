
import React, { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface CustomAuthFormProps {
  mode: 'sign-in' | 'sign-up';
  onToggleMode: () => void;
}

const CustomAuthForm: React.FC<CustomAuthFormProps> = ({ mode, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, setActive } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'sign-in') {
        const result = await signIn?.create({
          identifier: email,
          password,
        });
        
        if (result?.status === 'complete') {
          await setActive({ session: result.session });
          toast.success('Welcome back!');
        }
      } else {
        const result = await signUp?.create({
          emailAddress: email,
          password,
        });
        
        if (result?.status === 'complete') {
          await setActiveSignUp({ session: result.session });
          toast.success('Account created successfully!');
        } else if (result?.status === 'missing_requirements') {
          toast.error('Please verify your email to continue');
        }
      }
    } catch (error: any) {
      toast.error(error?.errors?.[0]?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftAuth = async () => {
    setIsLoading(true);
    try {
      if (mode === 'sign-in') {
        await signIn?.authenticateWithRedirect({
          strategy: 'oauth_microsoft',
          redirectUrl: window.location.origin,
          redirectUrlComplete: window.location.origin,
        });
      } else {
        await signUp?.authenticateWithRedirect({
          strategy: 'oauth_microsoft',
          redirectUrl: window.location.origin,
          redirectUrlComplete: window.location.origin,
        });
      }
    } catch (error: any) {
      toast.error(error?.errors?.[0]?.message || 'Microsoft authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-prism-surface/95 border-prism-border/50 shadow-2xl backdrop-blur-md">
        <CardHeader className="text-center pb-6 space-y-6">
          {/* Logo and Title */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-prism-primary to-prism-accent rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
            </div>
            <h1 className="text-2xl font-bold text-prism-primary font-inter">
              Prism
            </h1>
          </div>
          
          <h2 className="text-xl font-semibold text-prism-text font-inter">
            {mode === 'sign-in' ? 'Welcome Back' : 'Create Account'}
          </h2>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8">
          {/* Microsoft Button */}
          <Button
            type="button"
            onClick={handleMicrosoftAuth}
            disabled={isLoading}
            className="w-full h-12 bg-prism-surface hover:bg-prism-hover border-2 border-prism-border hover:border-prism-primary/30 text-prism-text hover:text-prism-text transition-all duration-200 font-medium"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-sm"></div>
              </div>
              Continue with Microsoft
            </div>
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-prism-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-prism-surface px-4 text-prism-text-muted uppercase tracking-wider font-inter text-xs">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-prism-text font-inter">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-prism-text-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-prism-surface border-prism-border text-prism-text placeholder:text-prism-text-muted focus:border-prism-primary focus:ring-prism-primary/30"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-prism-text font-inter">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-prism-text-muted" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-prism-surface border-prism-border text-prism-text placeholder:text-prism-text-muted focus:border-prism-primary focus:ring-prism-primary/30"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-prism-text-muted hover:text-prism-text transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-prism-primary hover:bg-prism-primary-dark text-white font-medium transition-all duration-200 font-inter"
            >
              {isLoading ? (mode === 'sign-in' ? 'Signing in...' : 'Creating account...') : (mode === 'sign-in' ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>

          {/* Help Text */}
          <p className="text-center text-sm text-prism-text-muted font-inter leading-relaxed">
            If Microsoft sign-in isn't working, you can create an account with email/password above.
          </p>

          {/* Toggle Mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-sm text-prism-primary hover:text-prism-primary-light transition-colors duration-200 font-inter underline-offset-4 hover:underline"
            >
              {mode === 'sign-in' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CustomAuthForm;
