
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Fingerprint, RefreshCw, Brain, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import LoadingAnimation from '@/components/LoadingAnimation';

interface PasswordGeneratorProps {
  passwordCount: number;
  setPasswordCount: (value: number) => void;
  passwordLength: number[];
  setPasswordLength: (value: number[]) => void;
  includeUppercase: boolean;
  setIncludeUppercase: (value: boolean) => void;
  includeLowercase: boolean;
  setIncludeLowercase: (value: boolean) => void;
  includeNumbers: boolean;
  setIncludeNumbers: (value: boolean) => void;
  includeSymbols: boolean;
  setIncludeSymbols: (value: boolean) => void;
  isGenerating: boolean;
  generationProgress: number;
  onGenerate: () => void;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  passwordCount,
  setPasswordCount,
  passwordLength,
  setPasswordLength,
  includeUppercase,
  setIncludeUppercase,
  includeLowercase,
  setIncludeLowercase,
  includeNumbers,
  setIncludeNumbers,
  includeSymbols,
  setIncludeSymbols,
  isGenerating,
  generationProgress,
  onGenerate
}) => {
  return (
    <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-cyan-300">
          <Fingerprint className="h-5 w-5" />
          <span>Secure Password Generator</span>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Configure your secure password parameters with AI-powered strength assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Security Note */}
        <div className="bg-gradient-to-r from-cyan-950/50 to-emerald-950/50 border border-cyan-600/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Brain className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-cyan-300 mb-2">AI Security Analysis</h4>
              <p className="text-sm text-slate-300 mb-2">
                Our AI analyzes each generated password for maximum security strength.
              </p>
              <div className="flex items-center space-x-2 text-xs text-cyan-400">
                <Info className="h-4 w-4" />
                <span><strong>Pro Tip:</strong> Aim for 90+ security scores for optimal protection</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200 font-medium">Number of Passwords: {passwordCount}</Label>
          <Slider
            value={[passwordCount]}
            onValueChange={(value) => setPasswordCount(value[0])}
            max={3}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Single</span>
            <span>Triple</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200 font-medium">Password Length: {passwordLength[0]}</Label>
          <Slider
            value={passwordLength}
            onValueChange={setPasswordLength}
            max={64}
            min={4}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Weak (4)</span>
            <span>Ultra Secure (64)</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <Label htmlFor="uppercase" className="text-slate-200 font-medium">Uppercase Letters (A-Z)</Label>
            <Switch
              id="uppercase"
              checked={includeUppercase}
              onCheckedChange={setIncludeUppercase}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <Label htmlFor="lowercase" className="text-slate-200 font-medium">Lowercase Letters (a-z)</Label>
            <Switch
              id="lowercase"
              checked={includeLowercase}
              onCheckedChange={setIncludeLowercase}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <Label htmlFor="numbers" className="text-slate-200 font-medium">Numbers (0-9)</Label>
            <Switch
              id="numbers"
              checked={includeNumbers}
              onCheckedChange={setIncludeNumbers}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <Label htmlFor="symbols" className="text-slate-200 font-medium">Symbols (!@#$%)</Label>
            <Switch
              id="symbols"
              checked={includeSymbols}
              onCheckedChange={setIncludeSymbols}
            />
          </div>
        </div>

        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <LoadingAnimation variant="orbit" color="cyan" size="small" />
              <Label className="text-cyan-300 font-medium">Generating secure passwords with AI analysis...</Label>
            </div>
            <Progress value={generationProgress} className="w-full h-2" />
            <p className="text-xs text-slate-400 text-center">
              Applying encryption algorithms & AI security assessment • {Math.round(generationProgress)}%
            </p>
          </div>
        )}

        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-semibold py-3 transition-all duration-200"
        >
          {isGenerating ? (
            <>
              <LoadingAnimation variant="dots" color="cyan" size="small" className="mr-2" />
              Encrypting with AI Analysis...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate {passwordCount > 1 ? `${passwordCount} Passwords` : 'Password'} with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
