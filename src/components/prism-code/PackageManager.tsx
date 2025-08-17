
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Plus, Trash2, Search, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  type: 'dependency' | 'devDependency';
}

interface PackageManagerProps {
  packages: PackageInfo[];
  onAddPackage: (packageName: string, type: 'dependency' | 'devDependency') => void;
  onRemovePackage: (packageName: string) => void;
}

const POPULAR_PACKAGES = [
  { name: 'react', description: 'JavaScript library for building user interfaces' },
  { name: 'vue', description: 'Progressive JavaScript framework' },
  { name: 'express', description: 'Fast, unopinionated web framework for Node.js' },
  { name: 'lodash', description: 'Utility library delivering modularity and consistency' },
  { name: 'axios', description: 'Promise-based HTTP client' },
  { name: 'moment', description: 'Parse, validate, manipulate dates and times' },
  { name: 'uuid', description: 'Generate RFC-compliant UUIDs' },
  { name: 'cors', description: 'Enable CORS with various options' },
  { name: 'dotenv', description: 'Load environment variables from .env file' },
  { name: 'bcrypt', description: 'Hash passwords with bcrypt' },
];

const PackageManager: React.FC<PackageManagerProps> = ({ 
  packages, 
  onAddPackage, 
  onRemovePackage 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newPackage, setNewPackage] = useState('');
  const [packageType, setPackageType] = useState<'dependency' | 'devDependency'>('dependency');
  const { toast } = useToast();

  const filteredPopularPackages = POPULAR_PACKAGES.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPackage = (packageName: string) => {
    if (!packageName.trim()) return;
    
    const exists = packages.some(pkg => pkg.name === packageName);
    if (exists) {
      toast({
        title: "Package already exists",
        description: `${packageName} is already in your dependencies.`,
        variant: "destructive"
      });
      return;
    }

    onAddPackage(packageName.trim(), packageType);
    setNewPackage('');
    toast({
      title: "Package added",
      description: `${packageName} has been added to your project.`,
    });
  };

  const dependencies = packages.filter(pkg => pkg.type === 'dependency');
  const devDependencies = packages.filter(pkg => pkg.type === 'devDependency');

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Package className="w-5 h-5 text-blue-400" />
          <span>Package Manager</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Add Package Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-prism-text">Add Package</h3>
          <div className="flex space-x-2">
            <Input
              value={newPackage}
              onChange={(e) => setNewPackage(e.target.value)}
              placeholder="Package name (e.g., lodash)"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddPackage(newPackage)}
            />
            <select
              value={packageType}
              onChange={(e) => setPackageType(e.target.value as 'dependency' | 'devDependency')}
              className="px-3 py-2 border border-prism-border rounded-md bg-prism-surface/10 text-prism-text text-sm"
            >
              <option value="dependency">Dependency</option>
              <option value="devDependency">Dev Dependency</option>
            </select>
            <Button
              size="sm"
              onClick={() => handleAddPackage(newPackage)}
              disabled={!newPackage.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Popular Packages */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-prism-text">Popular Packages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-prism-text-muted" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search packages..."
              className="pl-10"
            />
          </div>
          
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {filteredPopularPackages.map((pkg) => (
                <div
                  key={pkg.name}
                  className="flex items-center justify-between p-2 border border-prism-border rounded-lg hover:bg-prism-surface/10"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-prism-text">{pkg.name}</div>
                    <div className="text-xs text-prism-text-muted">{pkg.description}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddPackage(pkg.name)}
                    disabled={packages.some(p => p.name === pkg.name)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Installed Packages */}
        <div className="flex-1 space-y-3">
          <h3 className="text-sm font-semibold text-prism-text">Installed Packages</h3>
          
          <ScrollArea className="flex-1">
            <div className="space-y-4">
              {dependencies.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-prism-text-muted mb-2">Dependencies</h4>
                  <div className="space-y-1">
                    {dependencies.map((pkg) => (
                      <div
                        key={pkg.name}
                        className="flex items-center justify-between p-2 bg-prism-surface/5 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-prism-text">{pkg.name}</span>
                          <Badge variant="secondary" className="text-xs">{pkg.version}</Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemovePackage(pkg.name)}
                          className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {devDependencies.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-prism-text-muted mb-2">Dev Dependencies</h4>
                  <div className="space-y-1">
                    {devDependencies.map((pkg) => (
                      <div
                        key={pkg.name}
                        className="flex items-center justify-between p-2 bg-prism-surface/5 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-prism-text">{pkg.name}</span>
                          <Badge variant="outline" className="text-xs">{pkg.version}</Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemovePackage(pkg.name)}
                          className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {packages.length === 0 && (
                <div className="text-center py-8 text-prism-text-muted">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No packages installed</p>
                  <p className="text-sm">Add packages to get started</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageManager;
