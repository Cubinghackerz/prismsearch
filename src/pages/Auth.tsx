import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'verify';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email_confirmed_at) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });
      
      if (error) throw error;
      
      setMode('verify');
      toast({
        title: "Verification email sent",
        description: "Please check your email for a 6-digit verification code"
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up",
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in"
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the complete 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup'
      });
      
      if (error) throw error;
      
      toast({
        title: "Account verified!",
        description: "Your account has been successfully created and verified"
      });
      
      navigate('/');
    } catch (error: any) {
      if (error.message?.includes('otp_expired') || error.message?.includes('expired') || error.message?.includes('invalid')) {
        toast({
          title: "Verification code expired",
          description: "Your verification code has expired. Please request a new one and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Verification failed",
          description: "The verification code is incorrect. Please check your email and try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email"
      });
    } catch (error: any) {
      toast({
        title: "Resend failed",
        description: error.message || "Failed to resend verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSignInForm = () => (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-prism-text">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-prism-text-muted" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="pl-10 bg-prism-bg/50 border-prism-border text-prism-text"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-prism-text">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-prism-text-muted" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="pl-10 pr-10 bg-prism-bg/50 border-prism-border text-prism-text"
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

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-prism-primary hover:bg-prism-primary-dark text-white"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );

  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-prism-text">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-prism-text-muted" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="pl-10 bg-prism-bg/50 border-prism-border text-prism-text"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-prism-text">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-prism-text-muted" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className="pl-10 pr-10 bg-prism-bg/50 border-prism-border text-prism-text"
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-prism-text">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-prism-text-muted" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="pl-10 bg-prism-bg/50 border-prism-border text-prism-text"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-prism-primary hover:bg-prism-primary-dark text-white"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );

  const renderVerificationForm = () => (
    <form onSubmit={handleVerification} className="space-y-6">
      <div className="text-center space-y-2">
        <Shield className="h-12 w-12 mx-auto text-prism-primary" />
        <h3 className="text-lg font-semibold text-prism-text">Verify Your Email</h3>
        <p className="text-sm text-prism-text-muted">
          We've sent a 6-digit verification code to <span className="font-medium text-prism-primary">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-prism-text text-center block">Enter Verification Code</Label>
        <div className="flex justify-center">
          <InputOTP
            value={verificationCode}
            onChange={(value) => setVerificationCode(value)}
            maxLength={6}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="bg-prism-bg/50 border-prism-border text-prism-text" />
              <InputOTPSlot index={1} className="bg-prism-bg/50 border-prism-border text-prism-text" />
              <InputOTPSlot index={2} className="bg-prism-bg/50 border-prism-border text-prism-text" />
              <InputOTPSlot index={3} className="bg-prism-bg/50 border-prism-border text-prism-text" />
              <InputOTPSlot index={4} className="bg-prism-bg/50 border-prism-border text-prism-text" />
              <InputOTPSlot index={5} className="bg-prism-bg/50 border-prism-border text-prism-text" />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || verificationCode.length !== 6}
        className="w-full bg-prism-primary hover:bg-prism-primary-dark text-white"
      >
        {loading ? 'Verifying...' : 'Verify Account'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={resendVerificationCode}
          disabled={loading}
          className="text-sm text-prism-primary hover:text-prism-primary-light underline"
        >
          Didn't receive the code? Resend
        </button>
      </div>

      <Button
        type="button"
        onClick={() => setMode('signup')}
        variant="outline"
        className="w-full border-prism-border text-prism-text hover:bg-prism-surface/50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Sign Up
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-prism-bg to-prism-surface flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-prism-surface/80 border-prism-border backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img 
                src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                alt="Prism Logo" 
                className="h-8 w-8"
              />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-prism-primary-light via-prism-primary to-prism-accent">
                Prism
              </h1>
            </div>
            <CardTitle className="text-prism-text">
              {mode === 'signin' ? 'Welcome Back' : 
               mode === 'signup' ? 'Create Account' : 
               'Verify Your Email'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mode === 'signin' && renderSignInForm()}
            {mode === 'signup' && renderSignUpForm()}
            {mode === 'verify' && renderVerificationForm()}

            {mode !== 'verify' && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-prism-primary hover:text-prism-primary-light text-sm"
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

export default Auth;