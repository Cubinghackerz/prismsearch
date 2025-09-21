
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
    <Card className="border-border bg-card shadow-lg">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-2xl font-bold">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Fingerprint className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Password Generator
          </span>
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Generate cryptographically secure passwords with advanced entropy analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Security Insight Banner */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">Advanced Security Analysis</h4>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                Each password is analyzed using industry-standard algorithms for entropy, pattern detection, and vulnerability assessment.
              </p>
              <div className="flex items-center space-x-2 text-xs text-primary font-medium bg-primary/10 rounded-full px-3 py-1 w-fit">
                <Info className="h-3 w-3" />
                <span>Target: 90+ security score for enterprise-grade protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generation Settings */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-foreground">Quantity</Label>
              <span className="text-lg font-bold text-primary">{passwordCount}</span>
            </div>
            <Slider
              value={[passwordCount]}
              onValueChange={(value) => setPasswordCount(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Single</span>
              <span>Bulk (10)</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-foreground">Length</Label>
              <span className="text-lg font-bold text-primary">{passwordLength[0]} chars</span>
            </div>
            <Slider
              value={passwordLength}
              onValueChange={setPasswordLength}
              max={64}
              min={8}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Basic (8)</span>
              <span>Maximum (64)</span>
            </div>
          </div>
        </div>

        {/* Character Types */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-foreground">Character Types</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
              <Label htmlFor="uppercase" className="text-sm font-medium cursor-pointer">
                Uppercase
              </Label>
              <Switch
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={setIncludeUppercase}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
              <Label htmlFor="lowercase" className="text-sm font-medium cursor-pointer">
                Lowercase
              </Label>
              <Switch
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={setIncludeLowercase}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
              <Label htmlFor="numbers" className="text-sm font-medium cursor-pointer">
                Numbers
              </Label>
              <Switch
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
              <Label htmlFor="symbols" className="text-sm font-medium cursor-pointer">
                Symbols
              </Label>
              <Switch
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={setIncludeSymbols}
              />
            </div>
          </div>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="space-y-4 p-6 rounded-lg border bg-muted/30">
            <div className="flex items-center space-x-3">
              <LoadingAnimation variant="orbit" color="cyan" size="small" />
              <span className="text-sm font-medium">Generating secure passwords...</span>
            </div>
            <Progress value={generationProgress} className="w-full h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Cryptographic generation & security analysis • {Math.round(generationProgress)}%
            </p>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-6 text-base transition-all duration-200 hover:shadow-lg"
        >
          {isGenerating ? (
            <>
              <LoadingAnimation variant="dots" color="cyan" size="small" className="mr-3" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-3 h-5 w-5" />
              Generate {passwordCount > 1 ? `${passwordCount} Passwords` : 'Password'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
