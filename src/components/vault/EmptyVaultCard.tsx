
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export const EmptyVaultCard: React.FC = () => {
  return (
    <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl">
      <CardContent className="text-center py-12">
        <div className="space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <Lock className="h-16 w-16 text-slate-600 mx-auto" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-300">Vault Ready</h3>
            <p className="text-slate-400">Generate secure passwords to see AI security analysis</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
