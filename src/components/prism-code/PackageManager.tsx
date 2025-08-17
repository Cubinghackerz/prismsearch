
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Search, Trash2, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  size?: string;
  status: 'installed' | 'installing' | 'failed' | 'available';
  dependencies?: string[];
}

interface PackageManagerProps {
  onPackageChange?: (packages: PackageInfo[]) => void;
}

const PackageManager: React.FC<PackageManagerProps> = ({ onPackageChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [installedPackages, setInstalledPackages] = useState<PackageInfo[]>([
    { name: 'react', version: '18.3.1', description: 'A JavaScript library for building user interfaces', status: 'installed', size: '42.0 kB' },
    { name: 'tailwindcss', version: '3.4.0', description: 'A utility-first CSS framework', status: 'installed', size: '15.2 kB' },
    { name: 'lucide-react', version: '0.462.0', description: 'Beautiful & consistent icon toolkit', status: 'installed', size: '67.8 kB' },
  ]);
  const [availablePackages, setAvailablePackages] = useState<PackageInfo[]>([
    { name: 'lodash', version: '4.17.21', description: 'A modern JavaScript utility library', status: 'available', size: '24.8 kB' },
    { name: 'axios', version: '1.6.0', description: 'Promise based HTTP client', status: 'available', size: '15.5 kB' },
    { name: 'date-fns', version: '2.30.0', description: 'Modern JavaScript date utility library', status: 'available', size: '18.9 kB' },
    { name: 'framer-motion', version: '10.16.4', description: 'A production-ready motion library for React', status: 'available', size: '89.1 kB' },
    { name: 'react-router-dom', version: '6.15.0', description: 'Declarative routing for React', status: 'available', size: '23.7 kB' },
    { name: 'zustand', version: '4.4.1', description: 'A small, fast and scalable bearbones state-management solution', status: 'available', size: '8.2 kB' },
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const installPackage = async (packageInfo: PackageInfo) => {
    // Update package status to installing
    setAvailablePackages(prev => 
      prev.map(pkg => 
        pkg.name === packageInfo.name 
          ? { ...pkg, status: 'installing' as const }
          : pkg
      )
    );

    toast({
      title: "Installing Package",
      description: `Installing ${packageInfo.name}@${packageInfo.version}...`,
    });

    // Simulate package installation
    setTimeout(() => {
      const newPackage: PackageInfo = {
        ...packageInfo,
        status: 'installed'
      };

      setInstalledPackages(prev => [...prev, newPackage]);
      setAvailablePackages(prev => prev.filter(pkg => pkg.name !== packageInfo.name));
      
      toast({
        title: "Package Installed",
        description: `${packageInfo.name}@${packageInfo.version} has been installed successfully.`,
      });

      if (onPackageChange) {
        onPackageChange([...installedPackages, newPackage]);
      }
    }, 2000 + Math.random() * 3000); // Random delay between 2-5 seconds
  };

  const uninstallPackage = (packageName: string) => {
    const packageToRemove = installedPackages.find(pkg => pkg.name === packageName);
    if (!packageToRemove) return;

    setInstalledPackages(prev => prev.filter(pkg => pkg.name !== packageName));
    setAvailablePackages(prev => [...prev, { ...packageToRemove, status: 'available' }]);
    
    toast({
      title: "Package Uninstalled",
      description: `${packageName} has been removed from your project.`,
    });

    if (onPackageChange) {
      onPackageChange(installedPackages.filter(pkg => pkg.name !== packageName));
    }
  };

  const searchPackages = async (term: string) => {
    if (!term.trim()) return;

    setIsSearching(true);
    toast({
      title: "Searching Packages",
      description: `Searching npm registry for "${term}"...`,
    });

    // Simulate API search
    setTimeout(() => {
      const mockResults: PackageInfo[] = [
        { name: `${term}-helper`, version: '1.0.0', description: `A helper library for ${term}`, status: 'available', size: '12.3 kB' },
        { name: `react-${term}`, version: '2.1.0', description: `React components for ${term}`, status: 'available', size: '45.7 kB' },
        { name: `${term}-utils`, version: '0.5.2', description: `Utility functions for ${term}`, status: 'available', size: '8.9 kB' },
      ];

      setAvailablePackages(prev => {
        const existing = prev.filter(pkg => !mockResults.some(result => result.name === pkg.name));
        return [...existing, ...mockResults];
      });

      setIsSearching(false);
      toast({
        title: "Search Complete",
        description: `Found ${mockResults.length} packages matching "${term}".`,
      });
    }, 1500);
  };

  const getStatusIcon = (status: PackageInfo['status']) => {
    switch (status) {
      case 'installed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'installing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Download className="w-4 h-4 text-prism-text-muted" />;
    }
  };

  const filteredAvailable = availablePackages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInstalled = installedPackages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Package className="w-5 h-5 text-blue-400" />
          <span>Package Manager</span>
        </CardTitle>
        <div className="flex space-x-2 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-prism-text-muted" />
            <Input
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-prism-surface/10 border-prism-border"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchPackages(searchTerm);
                }
              }}
            />
          </div>
          <Button 
            onClick={() => searchPackages(searchTerm)}
            disabled={isSearching || !searchTerm.trim()}
            size="sm"
          >
            {isSearching ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <Alert className="mx-6 mb-4 border-blue-500/30 bg-blue-500/5">
          <Package className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-300">
            <strong>Beta Feature:</strong> Package management is simulated. In production, this would integrate with npm/yarn for real package installation.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="installed" className="flex-1 flex flex-col">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="installed" className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Installed ({installedPackages.length})</span>
              </TabsTrigger>
              <TabsTrigger value="available" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Available ({filteredAvailable.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="installed" className="flex-1 mt-4">
            <ScrollArea className="h-[400px] px-6">
              <div className="space-y-3">
                {filteredInstalled.map((pkg) => (
                  <div key={pkg.name} className="flex items-center justify-between p-3 bg-prism-surface/10 rounded-lg border border-prism-border">
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(pkg.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-prism-text">{pkg.name}</span>
                          <Badge variant="secondary" className="text-xs">{pkg.version}</Badge>
                          {pkg.size && (
                            <Badge variant="outline" className="text-xs">{pkg.size}</Badge>
                          )}
                        </div>
                        {pkg.description && (
                          <p className="text-sm text-prism-text-muted mt-1">{pkg.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => uninstallPackage(pkg.name)}
                      disabled={pkg.status === 'installing'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {filteredInstalled.length === 0 && (
                  <div className="text-center py-8 text-prism-text-muted">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No installed packages found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="available" className="flex-1 mt-4">
            <ScrollArea className="h-[400px] px-6">
              <div className="space-y-3">
                {filteredAvailable.map((pkg) => (
                  <div key={pkg.name} className="flex items-center justify-between p-3 bg-prism-surface/10 rounded-lg border border-prism-border">
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(pkg.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-prism-text">{pkg.name}</span>
                          <Badge variant="secondary" className="text-xs">{pkg.version}</Badge>
                          {pkg.size && (
                            <Badge variant="outline" className="text-xs">{pkg.size}</Badge>
                          )}
                        </div>
                        {pkg.description && (
                          <p className="text-sm text-prism-text-muted mt-1">{pkg.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => installPackage(pkg)}
                      disabled={pkg.status === 'installing'}
                    >
                      {pkg.status === 'installing' ? (
                        <Clock className="w-3 h-3 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                ))}
                {filteredAvailable.length === 0 && (
                  <div className="text-center py-8 text-prism-text-muted">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No available packages found</p>
                    <p className="text-sm">Try searching for a specific package</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PackageManager;
