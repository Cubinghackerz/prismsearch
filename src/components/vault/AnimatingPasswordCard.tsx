
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

interface AnimatingPasswordCardProps {
  animPassword: string;
  index: number;
}

export const AnimatingPasswordCard: React.FC<AnimatingPasswordCardProps> = ({
  animPassword,
  index
}) => {
  return (
    <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-cyan-300">
          <Shield className="h-5 w-5" />
          <span>Encrypting Password {index + 1}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-200 font-medium">Password</Label>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={animPassword}
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
