
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
    <Card className="bg-prism-surface/50 border-prism-border backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3 text-xl font-bold text-prism-primary">
          <Fingerprint className="h-6 w-6" />
          <span>Secure Password Generator</span>
        </CardTitle>
        <CardDescription className="text-prism-text-muted font-medium">
          Configure your secure password parameters with AI-powered strength assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* AI Security Note */}
        <div className="bg-gradient-to-r from-prism-primary/10 to-prism-accent/10 border border-prism-primary/20 rounded-xl p-5">
          <div className="flex items-start space-x-4">
            <Brain className="h-6 w-6 text-prism-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-prism-primary mb-3 text-lg">AI Security Analysis</h4>
              <p className="text-prism-text-muted mb-3 leading-relaxed">
                Our AI analyzes each generated password for maximum security strength.
              </p>
              <div className="flex items-center space-x-2 text-sm text-prism-primary font-medium">
                <Info className="h-4 w-4" />
                <span><strong>Pro Tip:</strong> Aim for 90+ security scores for optimal protection</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-prism-text font-bold text-lg">Number of Passwords: {passwordCount}</Label>
          <div className="px-2">
            <Slider
              value={[passwordCount]}
              onValueChange={(value) => setPasswordCount(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-prism-text-muted font-medium px-2">
            <span>Single Password</span>
            <span>Bulk Generation (10)</span>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-prism-text font-bold text-lg">Password Length: {passwordLength[0]}</Label>
          <div className="px-2">
            <Slider
              value={passwordLength}
              onValueChange={setPasswordLength}
              max={64}
              min={4}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-prism-text-muted font-medium px-2">
            <span>Weak (4)</span>
            <span>Ultra Secure (64)</span>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-prism-text font-bold text-lg mb-4 block">Character Types</Label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-prism-surface/70 rounded-xl border border-prism-border hover:bg-prism-surface/90 transition-colors">
              <Label htmlFor="uppercase" className="text-prism-text font-semibold cursor-pointer">Uppercase (A-Z)</Label>
              <Switch
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={setIncludeUppercase}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-prism-surface/70 rounded-xl border border-prism-border hover:bg-prism-surface/90 transition-colors">
              <Label htmlFor="lowercase" className="text-prism-text font-semibold cursor-pointer">Lowercase (a-z)</Label>
              <Switch
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={setIncludeLowercase}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-prism-surface/70 rounded-xl border border-prism-border hover:bg-prism-surface/90 transition-colors">
              <Label htmlFor="numbers" className="text-prism-text font-semibold cursor-pointer">Numbers (0-9)</Label>
              <Switch
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-prism-surface/70 rounded-xl border border-prism-border hover:bg-prism-surface/90 transition-colors">
              <Label htmlFor="symbols" className="text-prism-text font-semibold cursor-pointer">Symbols (!@#$%)</Label>
              <Switch
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={setIncludeSymbols}
              />
            </div>
          </div>
        </div>

        {isGenerating && (
          <div className="space-y-4 p-4 bg-prism-surface/50 rounded-xl border border-prism-border">
            <div className="flex items-center space-x-3">
              <LoadingAnimation variant="orbit" color="cyan" size="small" />
              <Label className="text-prism-primary font-bold text-lg">Generating secure passwords with AI analysis...</Label>
            </div>
            <Progress value={generationProgress} className="w-full h-3 rounded-full" />
            <p className="text-sm text-prism-text-muted text-center font-medium">
              Applying encryption algorithms & AI security assessment • {Math.round(generationProgress)}%
            </p>
          </div>
        )}

        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary/90 hover:to-prism-accent/90 text-white font-bold py-4 text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          {isGenerating ? (
            <>
              <LoadingAnimation variant="dots" color="cyan" size="small" className="mr-3" />
              Encrypting with AI Analysis...
            </>
          ) : (
            <>
              <RefreshCw className="mr-3 h-5 w-5" />
              Generate {passwordCount > 1 ? `${passwordCount} Passwords` : 'Password'} with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
