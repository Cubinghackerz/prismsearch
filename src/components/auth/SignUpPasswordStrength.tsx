
import React, { useEffect, useState } from 'react';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { Card } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface SignUpPasswordStrengthProps {
  onPasswordChange?: (password: string, isStrong: boolean) => void;
}

export const SignUpPasswordStrength: React.FC<SignUpPasswordStrengthProps> = ({
  onPasswordChange
}) => {
  const [password, setPassword] = useState('');
  const [isStrong, setIsStrong] = useState(false);

  useEffect(() => {
    // Monitor Clerk's password input field
    const monitorPasswordField = () => {
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
      
      if (passwordInput) {
        const handleInput = (e: Event) => {
          const target = e.target as HTMLInputElement;
          setPassword(target.value);
        };

        passwordInput.addEventListener('input', handleInput);
        
        return () => {
          passwordInput.removeEventListener('input', handleInput);
        };
      }
    };

    // Try to find the password input periodically until found
    const interval = setInterval(() => {
      const cleanup = monitorPasswordField();
      if (cleanup) {
        clearInterval(interval);
        return cleanup;
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleAssessmentChange = (assessment: any) => {
    const strongPassword = assessment.score >= 75;
    setIsStrong(strongPassword);
    onPasswordChange?.(password, strongPassword);
  };

  if (!password) {
    return (
      <Card className="bg-prism-surface/30 border-prism-border p-4 mt-4">
        <div className="flex items-center gap-3 text-prism-text-muted">
          <Shield className="h-5 w-5" />
          <p className="text-sm font-medium">
            Start typing your password to see security analysis
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-prism-surface/30 border-prism-border p-4 mt-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {isStrong ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          )}
          <h3 className="text-sm font-semibold text-prism-text">
            Password Security Analysis
          </h3>
        </div>
        
        <PasswordStrengthMeter 
          password={password}
          onAssessmentChange={handleAssessmentChange}
        />
        
        {isStrong && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <p className="text-sm text-green-400 font-medium">
              ✓ Your password meets our security requirements
            </p>
          </div>
        )}
        
        {!isStrong && password.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-sm text-amber-400 font-medium">
              Please strengthen your password using the recommendations above
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
