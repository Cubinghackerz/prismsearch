
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, RefreshCw, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { InputSanitizer } from '@/utils/inputSanitization';
import { auditLogger } from '@/components/security/SecurityAuditLogger';

const SecurePasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(true);

  const generateSecurePassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const similarChars = 'il1Lo0O';

    let availableChars = '';
    
    if (includeUppercase) availableChars += uppercaseChars;
    if (includeLowercase) availableChars += lowercaseChars;
    if (includeNumbers) availableChars += numberChars;
    if (includeSymbols) availableChars += symbolChars;

    if (excludeSimilar) {
      availableChars = availableChars
        .split('')
        .filter(char => !similarChars.includes(char))
        .join('');
    }

    if (availableChars === '') {
      toast.error('Please select at least one character type');
      return;
    }

    // Use crypto.getRandomValues for cryptographically secure randomness
    const array = new Uint8Array(length[0]);
    crypto.getRandomValues(array);
    
    let generatedPassword = '';
    for (let i = 0; i < length[0]; i++) {
      generatedPassword += availableChars.charAt(array[i] % availableChars.length);
    }

    setPassword(generatedPassword);
    
    // Log password generation (without the actual password)
    auditLogger.logEvent('password_generated', {
      length: length[0],
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      excludeSimilar
    }, 'low');
  };

  const copyToClipboard = async () => {
    if (!password) {
      toast.error('No password to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(password);
      toast.success('Password copied to clipboard');
      
      auditLogger.logEvent('password_copied', {}, 'medium');
      
      // Clear clipboard after 30 seconds for security
      setTimeout(() => {
        navigator.clipboard.writeText('');
      }, 30000);
    } catch (error) {
      toast.error('Failed to copy password');
    }
  };

  const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: 'No password', color: 'bg-gray-300' };
    
    let score = 0;
    
    // Length scoring
    if (pass.length >= 12) score += 2;
    else if (pass.length >= 8) score += 1;
    
    // Character variety scoring
    if (/[a-z]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    // Complexity bonus
    if (pass.length >= 16 && score >= 5) score += 1;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 6) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(password);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Secure Password Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Display */}
        <div className="space-y-2">
          <Label htmlFor="generated-password">Generated Password</Label>
          <div className="flex gap-2">
            <Input
              id="generated-password"
              type="text"
              value={password}
              readOnly
              placeholder="Click generate to create a password"
              className="font-mono"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={copyToClipboard}
              disabled={!password}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Strength Indicator */}
          {password && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Strength: {strength.label}</span>
                <span>{strength.score}/7</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${strength.color}`}
                  style={{ width: `${(strength.score / 7) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Length Slider */}
        <div className="space-y-2">
          <Label>Password Length: {length[0]}</Label>
          <Slider
            value={length}
            onValueChange={setLength}
            max={64}
            min={4}
            step={1}
            className="w-full"
          />
        </div>

        {/* Character Options */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Character Types</Label>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="uppercase">Uppercase Letters (A-Z)</Label>
            <Switch
              id="uppercase"
              checked={includeUppercase}
              onCheckedChange={setIncludeUppercase}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="lowercase">Lowercase Letters (a-z)</Label>
            <Switch
              id="lowercase"
              checked={includeLowercase}
              onCheckedChange={setIncludeLowercase}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="numbers">Numbers (0-9)</Label>
            <Switch
              id="numbers"
              checked={includeNumbers}
              onCheckedChange={setIncludeNumbers}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="symbols">Symbols (!@#$...)</Label>
            <Switch
              id="symbols"
              checked={includeSymbols}
              onCheckedChange={setIncludeSymbols}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="exclude-similar">Exclude Similar Characters</Label>
            <Switch
              id="exclude-similar"
              checked={excludeSimilar}
              onCheckedChange={setExcludeSimilar}
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateSecurePassword}
          className="w-full"
          size="lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate Password
        </Button>
      </CardContent>
    </Card>
  );
};

export default SecurePasswordGenerator;
