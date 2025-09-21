
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export const EmptyVaultCard: React.FC = () => {
  return (
    <Card className="border-border bg-card shadow-md">
      <CardContent className="text-center py-8">
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Ready to Generate</h3>
            <p className="text-xs text-muted-foreground">Configure settings and generate passwords to see analysis</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
