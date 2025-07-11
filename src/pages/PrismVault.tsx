import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Shield, RefreshCw, Copy, Eye, EyeOff, Lock, AlertTriangle, CheckCircle, XCircle, Home, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PrismVault = () => {
  const [password, setPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [strengthAssessment, setStrengthAssessment] = useState<{
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    feedback: string[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePassword = () => {
    setIsGenerating(true);
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (charset === '') {
      toast({
        title: "No character types selected",
        description: "Please select at least one character type for password generation.",
        variant: "destructive"
      });
      setIsGenerating(false);
      return;
    }
    let newPassword = '';
    for (let i = 0; i < passwordLength[0]; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    assessPasswordStrength(newPassword);
    setIsGenerating(false);
  };

  const assessPasswordStrength = (pwd: string) => {
    let score = 0;
    const feedback: string[] = [];

    // Length assessment
    if (pwd.length >= 12) {
      score += 25;
    } else if (pwd.length >= 8) {
      score += 15;
      feedback.push('Consider using a longer password (12+ characters)');
    } else {
      score += 5;
      feedback.push('Password is too short. Use at least 8 characters');
    }

    // Character variety assessment
    if (/[a-z]/.test(pwd)) score += 15;else feedback.push('Add lowercase letters');
    if (/[A-Z]/.test(pwd)) score += 15;else feedback.push('Add uppercase letters');
    if (/[0-9]/.test(pwd)) score += 15;else feedback.push('Add numbers');
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 20;else feedback.push('Add special characters');

    // Pattern assessment
    if (!/(.)\1{2,}/.test(pwd)) score += 10;else feedback.push('Avoid repeating characters');

    // Determine strength level
    let level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    if (score >= 90) level = 'very-strong';else if (score >= 70) level = 'strong';else if (score >= 50) level = 'good';else if (score >= 30) level = 'fair';else level = 'weak';
    setStrengthAssessment({
      score,
      level,
      feedback
    });
  };

  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "Copied to clipboard",
        description: "Password has been copied to your clipboard."
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy password to clipboard.",
        variant: "destructive"
      });
    }
  };

  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'very-strong':
        return 'text-green-300 bg-green-900/30 border-green-700';
      case 'strong':
        return 'text-green-400 bg-green-900/20 border-green-700';
      case 'good':
        return 'text-yellow-300 bg-yellow-900/30 border-yellow-700';
      case 'fair':
        return 'text-orange-300 bg-orange-900/30 border-orange-700';
      case 'weak':
        return 'text-red-300 bg-red-900/30 border-red-700';
      default:
        return 'text-gray-300 bg-gray-900/30 border-gray-700';
    }
  };

  const getStrengthIcon = (level: string) => {
    switch (level) {
      case 'very-strong':
      case 'strong':
        return <CheckCircle className="h-4 w-4" />;
      case 'good':
        return <Shield className="h-4 w-4" />;
      case 'fair':
        return <AlertTriangle className="h-4 w-4" />;
      case 'weak':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      {/* Header with back to home navigation */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Home</span>
          </Link>
          <Link to="/" className="flex items-center text-gray-400 hover:text-gray-300 transition-colors">
            <Home className="h-5 w-5 mr-2" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Lock className="h-12 w-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Prism Vault</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Generate strong, secure passwords with AI-powered strength assessment
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Password Generator */}
          <Card className="h-fit bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Shield className="h-5 w-5" />
                <span>Password Generator</span>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Customize your password settings and generate secure passwords
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white font-medium">Password Length: {passwordLength[0]}</Label>
                <Slider 
                  value={passwordLength} 
                  onValueChange={setPasswordLength} 
                  max={64} 
                  min={4} 
                  step={1} 
                  className="w-full" 
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="uppercase" className="text-white font-medium">Uppercase Letters (A-Z)</Label>
                  <Switch id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="lowercase" className="text-white font-medium">Lowercase Letters (a-z)</Label>
                  <Switch id="lowercase" checked={includeLowercase} onCheckedChange={setIncludeLowercase} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="numbers" className="text-white font-medium">Numbers (0-9)</Label>
                  <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="symbols" className="text-white font-medium">Symbols (!@#$%)</Label>
                  <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
                </div>
              </div>

              <Button onClick={generatePassword} disabled={isGenerating} className="w-full bg-purple-600 hover:bg-purple-700">
                {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Generate Password
              </Button>
            </CardContent>
          </Card>

          {/* Password Display & Assessment */}
          <Card className="h-fit bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Eye className="h-5 w-5" />
                <span>Generated Password</span>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Your secure password with AI strength assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {password && (
                <>
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Password</Label>
                    <div className="flex space-x-2">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        readOnly 
                        className="font-mono text-sm bg-gray-900/50 text-white border-gray-600" 
                      />
                      <Button variant="outline" size="icon" onClick={() => setShowPassword(!showPassword)} className="border-gray-600 hover:bg-gray-700">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={copyToClipboard} className="border-gray-600 hover:bg-gray-700">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {strengthAssessment && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-white font-medium">AI Strength Assessment</Label>
                        <Badge className={getStrengthColor(strengthAssessment.level)}>
                          {getStrengthIcon(strengthAssessment.level)}
                          <span className="ml-1 capitalize">{strengthAssessment.level.replace('-', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300 font-medium">Strength Score</span>
                          <span className="text-white font-semibold">{strengthAssessment.score}/100</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              strengthAssessment.score >= 90 ? 'bg-green-500' : 
                              strengthAssessment.score >= 70 ? 'bg-green-400' : 
                              strengthAssessment.score >= 50 ? 'bg-yellow-500' : 
                              strengthAssessment.score >= 30 ? 'bg-orange-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${strengthAssessment.score}%` }} 
                          />
                        </div>
                      </div>

                      {strengthAssessment.feedback.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-white font-medium">Improvement Suggestions</Label>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {strengthAssessment.feedback.map((item, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {!password && (
                <div className="text-center py-8 text-gray-400">
                  <Lock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Generate a password to see AI strength assessment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};

export default PrismVault;
