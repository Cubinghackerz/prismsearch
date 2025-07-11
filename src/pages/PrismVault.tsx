import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Shield, RefreshCw, Copy, Eye, EyeOff, Lock, AlertTriangle, CheckCircle, XCircle, Home, ArrowLeft, Key, Fingerprint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LoadingAnimation from '@/components/LoadingAnimation';
interface PasswordData {
  password: string;
  strengthAssessment: {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    feedback: string[];
  };
}
const PrismVault = () => {
  const [passwords, setPasswords] = useState<PasswordData[]>([]);
  const [passwordCount, setPasswordCount] = useState(1);
  const [passwordLength, setPasswordLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [showPasswords, setShowPasswords] = useState<boolean[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isVaultLoading, setIsVaultLoading] = useState(true);
  const {
    toast
  } = useToast();

  // Vault loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVaultLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);
  const generatePasswords = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
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
    const newPasswords: PasswordData[] = [];
    const progressStep = 100 / passwordCount;
    for (let i = 0; i < passwordCount; i++) {
      // Simulate encryption process
      await new Promise(resolve => setTimeout(resolve, 800));
      let newPassword = '';
      for (let j = 0; j < passwordLength[0]; j++) {
        newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      const strengthAssessment = assessPasswordStrength(newPassword);
      newPasswords.push({
        password: newPassword,
        strengthAssessment
      });
      setGenerationProgress((i + 1) * progressStep);
    }
    setPasswords(newPasswords);
    setShowPasswords(new Array(passwordCount).fill(false));
    setIsGenerating(false);
    setGenerationProgress(0);
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
    return {
      score,
      level,
      feedback
    };
  };
  const copyToClipboard = async (password: string, index: number) => {
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "Copied to clipboard",
        description: `Password ${index + 1} has been copied to your clipboard.`
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy password to clipboard.",
        variant: "destructive"
      });
    }
  };
  const togglePasswordVisibility = (index: number) => {
    const newShowPasswords = [...showPasswords];
    newShowPasswords[index] = !newShowPasswords[index];
    setShowPasswords(newShowPasswords);
  };
  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'very-strong':
        return 'text-emerald-300 bg-emerald-950/50 border-emerald-600';
      case 'strong':
        return 'text-green-300 bg-green-950/50 border-green-600';
      case 'good':
        return 'text-cyan-300 bg-cyan-950/50 border-cyan-600';
      case 'fair':
        return 'text-amber-300 bg-amber-950/50 border-amber-600';
      case 'weak':
        return 'text-red-300 bg-red-950/50 border-red-600';
      default:
        return 'text-slate-300 bg-slate-950/50 border-slate-600';
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
  const getStrengthBarColor = (score: number) => {
    if (score >= 90) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (score >= 70) return 'bg-gradient-to-r from-green-500 to-green-400';
    if (score >= 50) return 'bg-gradient-to-r from-cyan-500 to-cyan-400';
    if (score >= 30) return 'bg-gradient-to-r from-amber-500 to-amber-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  };
  if (isVaultLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <LoadingAnimation variant="neural" color="cyan" size="large" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-cyan-300">Initializing Prism Vault</h2>
            <p className="text-slate-400">Encrypting your secure environment...</p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header with navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <Link to="/" className="flex items-center text-slate-400 hover:text-slate-300 transition-colors">
            <Home className="h-5 w-5 mr-2" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <Lock className="h-12 w-12 text-cyan-400" />
              <div className="absolute -top-1 -right-1">
                
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Prism Vault
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Advanced password generation with military-grade encryption analysis
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Password Generator */}
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-cyan-300">
                <Fingerprint className="h-5 w-5" />
                <span>Encryption Generator</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configure your secure password parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-200 font-medium">Number of Passwords: {passwordCount}</Label>
                <Slider value={[passwordCount]} onValueChange={value => setPasswordCount(value[0])} max={3} min={1} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Single</span>
                  <span>Triple</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200 font-medium">Password Length: {passwordLength[0]}</Label>
                <Slider value={passwordLength} onValueChange={setPasswordLength} max={64} min={4} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Weak (4)</span>
                  <span>Ultra Secure (64)</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Label htmlFor="uppercase" className="text-slate-200 font-medium">Uppercase Letters (A-Z)</Label>
                  <Switch id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Label htmlFor="lowercase" className="text-slate-200 font-medium">Lowercase Letters (a-z)</Label>
                  <Switch id="lowercase" checked={includeLowercase} onCheckedChange={setIncludeLowercase} />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Label htmlFor="numbers" className="text-slate-200 font-medium">Numbers (0-9)</Label>
                  <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Label htmlFor="symbols" className="text-slate-200 font-medium">Symbols (!@#$%)</Label>
                  <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
                </div>
              </div>

              {isGenerating && <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <LoadingAnimation variant="orbit" color="cyan" size="small" />
                    <Label className="text-cyan-300 font-medium">Generating secure passwords...</Label>
                  </div>
                  <Progress value={generationProgress} className="w-full h-2" />
                  <p className="text-xs text-slate-400 text-center">
                    Applying encryption algorithms • {Math.round(generationProgress)}%
                  </p>
                </div>}

              <Button onClick={generatePasswords} disabled={isGenerating} className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-semibold py-3 transition-all duration-200">
                {isGenerating ? <>
                    <LoadingAnimation variant="dots" color="cyan" size="small" className="mr-2" />
                    Encrypting...
                  </> : <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate {passwordCount > 1 ? `${passwordCount} Passwords` : 'Password'}
                  </>}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Passwords */}
          <div className="space-y-4">
            {passwords.length > 0 ? passwords.map((passwordData, index) => <Card key={index} className="bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-cyan-300">
                      <Shield className="h-5 w-5" />
                      <span>Encrypted Password {index + 1}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-200 font-medium">Password</Label>
                      <div className="flex space-x-2">
                        <Input type={showPasswords[index] ? "text" : "password"} value={passwordData.password} readOnly className="font-mono text-sm bg-slate-800/50 text-slate-200 border-slate-600 focus:border-cyan-500" />
                        <Button variant="outline" size="icon" onClick={() => togglePasswordVisibility(index)} className="border-slate-600 hover:bg-slate-700 hover:border-cyan-500">
                          {showPasswords[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(passwordData.password, index)} className="border-slate-600 hover:bg-slate-700 hover:border-emerald-500">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-200 font-medium">AI Security Analysis</Label>
                        <Badge className={getStrengthColor(passwordData.strengthAssessment.level)}>
                          {getStrengthIcon(passwordData.strengthAssessment.level)}
                          <span className="ml-1 capitalize">{passwordData.strengthAssessment.level.replace('-', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300 font-medium">Security Score</span>
                          <span className="text-cyan-300 font-semibold">{passwordData.strengthAssessment.score}/100</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                          <div className={`h-3 rounded-full transition-all duration-1000 ${getStrengthBarColor(passwordData.strengthAssessment.score)}`} style={{
                      width: `${passwordData.strengthAssessment.score}%`
                    }} />
                        </div>
                      </div>

                      {passwordData.strengthAssessment.feedback.length > 0 && <div className="space-y-2">
                          <Label className="text-sm text-slate-200 font-medium">Security Recommendations</Label>
                          <ul className="text-sm text-slate-400 space-y-1">
                            {passwordData.strengthAssessment.feedback.map((item, feedbackIndex) => <li key={feedbackIndex} className="flex items-start space-x-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{item}</span>
                              </li>)}
                          </ul>
                        </div>}
                    </div>
                  </CardContent>
                </Card>) : <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl">
                <CardContent className="text-center py-12">
                  <div className="space-y-4">
                    <div className="relative mx-auto w-16 h-16">
                      <Lock className="h-16 w-16 text-slate-600 mx-auto" />
                      <div className="absolute -bottom-1 -right-1">
                        <Key className="h-8 w-8 text-slate-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-300">Vault Ready</h3>
                      <p className="text-slate-400">Generate secure passwords to see AI security analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>}
          </div>
        </div>
      </div>
    </div>;
};
export default PrismVault;