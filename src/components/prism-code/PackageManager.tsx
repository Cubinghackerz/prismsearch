
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Trash2, Download, Search, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  homepage?: string;
  repository?: string;
}

interface PackageManagerProps {
  packages: Record<string, string>;
  onPackageAdd: (packageName: string, version: string) => void;
  onPackageRemove: (packageName: string) => void;
  onPackageUpdate: (packageName: string, version: string) => void;
  className?: string;
}

const PackageManager: React.FC<PackageManagerProps> = ({
  packages,
  onPackageAdd,
  onPackageRemove,
  onPackageUpdate,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PackageInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);
  const [packageDetails, setPackageDetails] = useState<Record<string, PackageInfo>>({});
  const { toast } = useToast();

  // Mock NPM registry search (in production, this would be a real API call)
  const searchPackages = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock popular packages based on search query
      const mockResults: PackageInfo[] = [
        {
          name: 'react',
          version: '18.2.0',
          description: 'A JavaScript library for building user interfaces'
        },
        {
          name: 'lodash',
          version: '4.17.21',
          description: 'A modern JavaScript utility library delivering modularity, performance, & extras.'
        },
        {
          name: 'axios',
          version: '1.6.0',
          description: 'Promise based HTTP client for the browser and node.js'
        },
        {
          name: 'moment',
          version: '2.29.4',
          description: 'Parse, validate, manipulate, and display dates in javascript.'
        },
        {
          name: 'uuid',
          version: '9.0.1',
          description: 'RFC4122 (v1, v4, and v5) UUIDs'
        }
      ].filter(pkg => 
        pkg.name.toLowerCase().includes(query.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search packages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const installPackage = async (packageName: string, version: string) => {
    setInstalling(packageName);
    try {
      // Simulate installation process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onPackageAdd(packageName, version);
      toast({
        title: "Package Installed",
        description: `Successfully installed ${packageName}@${version}`,
      });
    } catch (error) {
      toast({
        title: "Installation Failed",
        description: `Failed to install ${packageName}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setInstalling(null);
    }
  };

  const uninstallPackage = async (packageName: string) => {
    try {
      onPackageRemove(packageName);
      toast({
        title: "Package Removed",
        description: `Successfully removed ${packageName}`,
      });
    } catch (error) {
      toast({
        title: "Removal Failed",
        description: `Failed to remove ${packageName}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const updatePackage = async (packageName: string, newVersion: string) => {
    try {
      onPackageUpdate(packageName, newVersion);
      toast({
        title: "Package Updated",
        description: `Successfully updated ${packageName} to ${newVersion}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: `Failed to update ${packageName}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        searchPackages(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const installedPackagesList = Object.entries(packages);

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-prism-primary" />
          <span>Package Manager</span>
          <Badge variant="secondary" className="ml-2">
            {installedPackagesList.length} installed
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        <Tabs defaultValue="installed" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="installed">Installed ({installedPackagesList.length})</TabsTrigger>
            <TabsTrigger value="search">Search & Install</TabsTrigger>
          </TabsList>

          <TabsContent value="installed" className="flex-1 flex flex-col mt-4">
            <ScrollArea className="flex-1">
              {installedPackagesList.length === 0 ? (
                <div className="text-center py-8 text-prism-text-muted">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No packages installed yet</p>
                  <p className="text-sm">Switch to Search tab to install packages</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {installedPackagesList.map(([name, version]) => (
                    <div key={name} className="flex items-center justify-between p-3 bg-prism-surface/10 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-prism-text">{name}</span>
                          <Badge variant="outline" className="text-xs">
                            v{version}
                          </Badge>
                        </div>
                        {packageDetails[name]?.description && (
                          <p className="text-sm text-prism-text-muted mt-1">
                            {packageDetails[name].description}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => updatePackage(name, 'latest')}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Update
                        </Button>
                        <Button
                          onClick={() => uninstallPackage(name)}
                          size="sm"
                          variant="outline"
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="search" className="flex-1 flex flex-col mt-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-prism-text-muted" />
                <Input
                  placeholder="Search packages (e.g., react, lodash, axios)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-prism-text-muted" />
                )}
              </div>

              <ScrollArea className="flex-1">
                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <div className="text-center py-8 text-prism-text-muted">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No packages found for "{searchQuery}"</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}

                {searchResults.length === 0 && !searchQuery && (
                  <div className="text-center py-8 text-prism-text-muted">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Search for packages to install</p>
                    <p className="text-sm">Popular: react, lodash, axios, moment</p>
                  </div>
                )}

                <div className="space-y-2">
                  {searchResults.map((pkg) => {
                    const isInstalled = Boolean(packages[pkg.name]);
                    const isInstalling = installing === pkg.name;
                    
                    return (
                      <div key={pkg.name} className="flex items-center justify-between p-3 bg-prism-surface/10 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-prism-text">{pkg.name}</span>
                            <Badge variant="outline" className="text-xs">
                              v{pkg.version}
                            </Badge>
                            {isInstalled && (
                              <Badge variant="default" className="text-xs bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Installed
                              </Badge>
                            )}
                          </div>
                          {pkg.description && (
                            <p className="text-sm text-prism-text-muted mt-1">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => installPackage(pkg.name, pkg.version)}
                          size="sm"
                          disabled={isInstalled || isInstalling}
                          className="ml-4"
                        >
                          {isInstalling ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Installing...
                            </>
                          ) : isInstalled ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Installed
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              Install
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PackageManager;
