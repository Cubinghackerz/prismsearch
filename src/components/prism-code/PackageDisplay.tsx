
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Download, Star } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PackageDisplayProps {
  packages: string[];
  devDependencies?: string[];
  framework: string;
}

const PackageDisplay: React.FC<PackageDisplayProps> = ({ packages, devDependencies, framework }) => {
  const getFrameworkIcon = () => {
    switch (framework) {
      case 'react':
        return '⚛️';
      case 'vue':
        return '🖖';
      case 'svelte':
        return '🔥';
      case 'angular':
        return '🅰️';
      default:
        return '🌐';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Package className="w-5 h-5 text-green-400" />
          <span>AI Selected Packages</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-500/30 bg-blue-500/5">
          <Star className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-300">
            <strong>Framework:</strong> {getFrameworkIcon()} {framework.charAt(0).toUpperCase() + framework.slice(1)}
          </AlertDescription>
        </Alert>

        {packages.length > 0 && (
          <div>
            <h4 className="font-semibold text-prism-text mb-3 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Dependencies ({packages.length})</span>
            </h4>
            <ScrollArea className="h-32">
              <div className="flex flex-wrap gap-2">
                {packages.map((pkg, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-green-500/20 text-green-400 border-green-500/30"
                  >
                    {pkg}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {devDependencies && devDependencies.length > 0 && (
          <div>
            <h4 className="font-semibold text-prism-text mb-3 flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Dev Dependencies ({devDependencies.length})</span>
            </h4>
            <ScrollArea className="h-32">
              <div className="flex flex-wrap gap-2">
                {devDependencies.map((pkg, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="border-orange-500/30 text-orange-400"
                  >
                    {pkg}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {packages.length === 0 && (!devDependencies || devDependencies.length === 0) && (
          <div className="text-center py-8 text-prism-text-muted">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No packages detected</p>
            <p className="text-sm">AI will select appropriate packages for your app</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PackageDisplay;
