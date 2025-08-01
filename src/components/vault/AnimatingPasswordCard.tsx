
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

interface AnimatingPasswordCardProps {
  password: string;
}

export const AnimatingPasswordCard: React.FC<AnimatingPasswordCardProps> = ({
  password
}) => {
  const [animatedPassword, setAnimatedPassword] = useState('');
  
  useEffect(() => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let currentIndex = 0;
    
    const animatePassword = () => {
      if (currentIndex <= password.length) {
        let displayPassword = '';
        
        // Show correct characters up to currentIndex
        for (let i = 0; i < currentIndex; i++) {
          displayPassword += password[i];
        }
        
        // Show scrambled characters for the rest
        for (let i = currentIndex; i < password.length; i++) {
          displayPassword += characters[Math.floor(Math.random() * characters.length)];
        }
        
        setAnimatedPassword(displayPassword);
        
        if (currentIndex < password.length) {
          currentIndex++;
          setTimeout(animatePassword, 100);
        }
      }
    };
    
    // Start animation
    animatePassword();
  }, [password]);

  return (
    <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-cyan-300">
          <Shield className="h-5 w-5" />
          <span>Encrypting Password...</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-200 font-medium">Password</Label>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={animatedPassword}
              readOnly
              className="font-mono text-sm bg-slate-800/50 text-cyan-300 border-slate-600 focus:border-cyan-500"
            />
          </div>
        </div>
        <div className="text-sm text-slate-400 animate-pulse">
          Analyzing security strength...
        </div>
      </CardContent>
    </Card>
  );
};
