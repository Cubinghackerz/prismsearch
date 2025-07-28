import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSignUp, useSignIn } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, CheckCircle } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'verify-email';

const ClerkAuth = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await signUp?.create({
        emailAddress: email,
        password,
      });

      await signUp?.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      setMode('verify-email');
      toast({
        title: "Check your email",
        description: `A 6-digit verification code has been sent to ${email}`
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: error.errors?.[0]?.message || "An error occurred during sign up",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const completeSignUp = await signUp?.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp?.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        toast({
          title: "Welcome to Prism!",
          description: "Your account has been created successfully"
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Error: Verification code is incorrect.",
        description: "Please check the code and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signIn?.create({
        identifier: email,
        password,
      });

      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast({
          title: "Welcome back!",
          description: "Successfully signed in"
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.errors?.[0]?.message || "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    setLoading(true);
    
    try {
      await signUp?.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      toast({
        title: "Code resent",
        description: `A new verification code has been sent to ${email}`
      });
    } catch (error: any) {
      toast({
        title: "Resend failed",
        description: error.errors?.[0]?.message || "Failed to resend verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSignInForm = () => (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="pl-10"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );

  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="pl-10"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password (min 8 characters)"
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );

  const renderVerifyEmailForm = () => (
    <form onSubmit={handleVerifyEmail} className="space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle className="h-12 w-12 mx-auto text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Verify Your Email</h3>
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit verification code to <span className="font-medium text-primary">{email}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="text-foreground">Verification Code</Label>
        <Input
          id="code"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit code"
          className="text-center text-lg tracking-widest"
          maxLength={6}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading || verificationCode.length !== 6}
        className="w-full"
      >
        {loading ? 'Verifying...' : 'Verify Email'}
      </Button>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={resendVerificationCode}
          disabled={loading}
          className="text-sm text-primary hover:text-primary/80 underline"
        >
          Didn't receive the code? Resend
        </button>
        
        <Button
          type="button"
          onClick={() => setMode('signup')}
          variant="outline"
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign Up
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/80 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img 
                src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                alt="Prism Logo" 
                className="h-8 w-8"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Prism
              </h1>
            </div>
            <CardTitle className="text-foreground">
              {mode === 'signin' ? 'Welcome Back' : 
               mode === 'signup' ? 'Create Account' : 
               'Verify Email'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mode === 'signin' && renderSignInForm()}
            {mode === 'signup' && renderSignUpForm()}
            {mode === 'verify-email' && renderVerifyEmailForm()}

            {mode !== 'verify-email' && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  {mode === 'signin' 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClerkAuth;
