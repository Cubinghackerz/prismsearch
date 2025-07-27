
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { emailVerificationService } from '@/services/emailVerificationService';
import { Mail, Shield } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerificationComplete: () => void;
  onBack: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerificationComplete,
  onBack
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      const isValid = await emailVerificationService.verifyCode(email, verificationCode);
      
      if (isValid) {
        toast({
          title: "Success",
          description: "Email verified successfully!"
        });
        onVerificationComplete();
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect or has expired. Please try again.",
          variant: "destructive"
        });
        setVerificationCode('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      const code = emailVerificationService.generateCode();
      await emailVerificationService.storeVerificationCode(email, code);
      await emailVerificationService.sendVerificationEmail(email, code);
      
      toast({
        title: "Code Sent",
        description: `A new verification code has been sent to ${email}. Check your console for the code (in development).`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="bg-prism-surface/80 border-prism-border backdrop-blur-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-prism-primary" />
        </div>
        <CardTitle className="text-prism-text">Verify Your Email</CardTitle>
        <p className="text-prism-text-muted text-sm">
          We sent a 6-digit verification code to <strong>{email}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code" className="text-prism-text">
              Verification Code
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-prism-text-muted" />
              <Input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="pl-10 bg-prism-bg/50 border-prism-border text-prism-text text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isVerifying || verificationCode.length !== 6}
            className="w-full bg-prism-primary hover:bg-prism-primary-dark text-white"
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={handleResendCode}
            disabled={isResending}
            className="text-prism-primary hover:text-prism-primary-light text-sm underline"
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>
          <div>
            <button
              onClick={onBack}
              className="text-prism-text-muted hover:text-prism-text text-sm"
            >
              Back to Sign Up
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
