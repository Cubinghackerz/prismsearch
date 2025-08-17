import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Info,
  Loader2,
  Terminal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { packageManager } from '@/services/packageManager';

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  size?: number;
  license?: string;
  lastUpdated?: string;
}

interface PackageManagerProps {
  projectId: string;
  onPackageChange: (packages: PackageInfo[]) => void;
}

const PackageManager: React.FC<PackageManagerProps> = ({ projectId, onPackageChange }) => {
  const [installedPackages, setInstalledPackages] = useState<PackageInfo[]>([]);
  const [searchResults, setSearchResults] = useState<PackageInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageInfo | null>(null);
  const [isInstalling, setIsInstalling] = useState<string | null>(null);
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInstalledPackages();
  }, []);

  const loadInstalledPackages = () => {
    const packages = packageManager.getInstalledPackages();
    setInstalledPackages(packages);
    onPackageChange(packages);
  };

  const searchPackages = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await packageManager.searchPackages(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to search packages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const installPackage = async (packageInfo: PackageInfo, isDev: boolean = false) => {
    setIsInstalling(packageInfo.name);
    setInstallLogs([`Installing ${packageInfo.name}...`]);
    
    try {
      const result = await packageManager.installPackage(
        packageInfo.name,
        packageInfo.version,
        isDev
      );

      setInstallLogs(prev => [...prev, ...result.logs]);

      if (result.success) {
        loadInstalledPackages();
        setShowAddDialog(false);
        toast({
          title: "Package Installed",
          description: `${packageInfo.name} has been successfully installed.`,
        });

        if (result.conflicts && result.conflicts.length > 0) {
          toast({
            title: "Dependency Conflicts Detected",
            description: `${result.conflicts.length} conflict(s) resolved automatically.`,
            variant: "default"
          });
        }
      } else {
        toast({
          title: "Installation Failed",
          description: result.errors?.[0] || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Installation Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsInstalling(null);
      setShowLogsDialog(true);
    }
  };

  const uninstallPackage = async (packageName: string) => {
    try {
      const success = await packageManager.uninstallPackage(packageName);
      
      if (success) {
        loadInstalledPackages();
        toast({
          title: "Package Uninstalled",
          description: `${packageName} has been removed.`,
        });
      } else {
        toast({
          title: "Uninstall Failed",
          description: `Failed to uninstall ${packageName}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Uninstall Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const formatSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getSecurityBadge = (packageName: string) => {
    // Simulate security status
    const isKnownSafe = ['react', 'vue', 'express', 'lodash', 'axios'].includes(packageName);
    
    if (isKnownSafe) {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
          <Shield className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Review
      </Badge>
    );
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-prism-primary" />
              <span>Package Manager</span>
            </CardTitle>
            <Button
              onClick={() => setShowAddDialog(true)}
              size="sm"
              className="bg-prism-primary hover:bg-prism-primary-dark"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {/* Installed Packages */}
          <div>
            <h3 className="text-sm font-semibold text-prism-text mb-3">
              Installed Packages ({installedPackages.length})
            </h3>
            
            {installedPackages.length === 0 ? (
              <div className="text-center py-8 text-prism-text-muted">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No packages installed yet</p>
                <p className="text-xs">Add packages to enhance your project</p>
              </div>
            ) : (
              <div className="space-y-2">
                {installedPackages.map(pkg => (
                  <div
                    key={pkg.name}
                    className="flex items-center justify-between p-3 bg-prism-surface/20 rounded-lg border border-prism-border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-prism-text">{pkg.name}</span>
                        <Badge variant="outline" className="text-xs">
                          v{pkg.version}
                        </Badge>
                        {getSecurityBadge(pkg.name)}
                      </div>
                      {pkg.description && (
                        <p className="text-xs text-prism-text-muted mt-1 line-clamp-1">
                          {pkg.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-1 text-xs text-prism-text-muted">
                        <span>Size: {formatSize(pkg.size)}</span>
                        {pkg.license && <span>License: {pkg.license}</span>}
                      </div>
                    </div>
                    <Button
                      onClick={() => uninstallPackage(pkg.name)}
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Package Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-prism-primary" />
              <span>Add Package</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="flex space-x-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search packages (e.g., lodash, axios, react-router-dom)"
                onKeyPress={(e) => e.key === 'Enter' && searchPackages()}
              />
              <Button onClick={searchPackages} disabled={isSearching}>
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {searchResults.map(pkg => (
                <div
                  key={pkg.name}
                  className="flex items-center justify-between p-3 bg-prism-surface/10 rounded-lg border border-prism-border hover:bg-prism-surface/20 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-prism-text">{pkg.name}</span>
                      <Badge variant="outline" className="text-xs">
                        v{pkg.version}
                      </Badge>
                      {getSecurityBadge(pkg.name)}
                    </div>
                    {pkg.description && (
                      <p className="text-xs text-prism-text-muted mt-1 line-clamp-2">
                        {pkg.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-1 text-xs text-prism-text-muted">
                      <span>Size: {formatSize(pkg.size)}</span>
                      {pkg.license && <span>License: {pkg.license}</span>}
                      {pkg.lastUpdated && (
                        <span>Updated: {new Date(pkg.lastUpdated).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => installPackage(pkg, true)}
                      size="sm"
                      variant="outline"
                      disabled={isInstalling === pkg.name}
                    >
                      {isInstalling === pkg.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-1" />
                      )}
                      Dev
                    </Button>
                    <Button
                      onClick={() => installPackage(pkg, false)}
                      size="sm"
                      disabled={isInstalling === pkg.name}
                    >
                      {isInstalling === pkg.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-1" />
                      )}
                      Install
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Installation Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-prism-primary" />
              <span>Installation Logs</span>
            </DialogTitle>
          </DialogHeader>

          <div className="bg-black/90 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
            {installLogs.map((log, index) => (
              <div key={index} className="text-green-400">
                {log}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PackageManager;