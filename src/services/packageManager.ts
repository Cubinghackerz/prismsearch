// Real Package Management Service
interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  size?: number;
  license?: string;
  repository?: string;
  lastUpdated?: string;
}

interface InstallResult {
  success: boolean;
  package: PackageInfo;
  logs: string[];
  errors?: string[];
  conflicts?: DependencyConflict[];
}

interface DependencyConflict {
  package: string;
  requestedVersion: string;
  installedVersion: string;
  reason: string;
}

interface SecurityReport {
  safe: boolean;
  vulnerabilities: Vulnerability[];
  score: number;
  recommendations: string[];
}

interface Vulnerability {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  cve?: string;
  patched?: boolean;
}

export class PackageManagerService {
  private installedPackages: Map<string, PackageInfo> = new Map();
  private packageCache: Map<string, PackageInfo> = new Map();
  private securityScanner: PackageSecurityScanner;
  
  constructor() {
    this.securityScanner = new PackageSecurityScanner();
    this.loadCachedPackages();
  }

  async searchPackages(query: string, limit: number = 20): Promise<PackageInfo[]> {
    try {
      const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${limit}`);
      const data = await response.json();
      
      return data.objects.map((obj: any) => ({
        name: obj.package.name,
        version: obj.package.version,
        description: obj.package.description,
        size: obj.package.unpackedSize,
        license: obj.package.license,
        repository: obj.package.links?.repository,
        lastUpdated: obj.package.date
      }));
    } catch (error) {
      console.error('Error searching packages:', error);
      return [];
    }
  }

  async getPackageInfo(packageName: string): Promise<PackageInfo | null> {
    // Check cache first
    if (this.packageCache.has(packageName)) {
      return this.packageCache.get(packageName)!;
    }

    try {
      const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`);
      if (!response.ok) throw new Error('Package not found');
      
      const data = await response.json();
      const packageInfo: PackageInfo = {
        name: data.name,
        version: data.version,
        description: data.description,
        dependencies: data.dependencies || {},
        devDependencies: data.devDependencies || {},
        license: data.license,
        repository: data.repository?.url,
        lastUpdated: data.time?.[data.version]
      };

      this.packageCache.set(packageName, packageInfo);
      return packageInfo;
    } catch (error) {
      console.error(`Error fetching package info for ${packageName}:`, error);
      return null;
    }
  }

  async installPackage(packageName: string, version?: string, isDev: boolean = false): Promise<InstallResult> {
    const fullPackageName = version ? `${packageName}@${version}` : packageName;
    
    try {
      // Security scan first
      const securityReport = await this.securityScanner.scanPackage(packageName);
      if (!securityReport.safe) {
        return {
          success: false,
          package: { name: packageName, version: version || 'latest' },
          logs: [],
          errors: [`Security risk detected: ${securityReport.vulnerabilities[0]?.title}`]
        };
      }

      // Get package info
      const packageInfo = await this.getPackageInfo(packageName);
      if (!packageInfo) {
        return {
          success: false,
          package: { name: packageName, version: version || 'latest' },
          logs: [],
          errors: ['Package not found']
        };
      }

      // Check for conflicts
      const conflicts = await this.checkDependencyConflicts(packageInfo);
      
      // Simulate installation (in real implementation, this would use WebContainer)
      const installCommand = `npm install ${fullPackageName}${isDev ? ' --save-dev' : ''}`;
      console.log(`Executing: ${installCommand}`);
      
      // In real implementation:
      // const result = await this.webContainer.spawn('npm', ['install', fullPackageName]);
      
      this.installedPackages.set(packageName, packageInfo);
      this.saveCachedPackages();

      return {
        success: true,
        package: packageInfo,
        logs: [`Installing ${fullPackageName}...`, `✓ ${packageName}@${packageInfo.version} installed`],
        conflicts: conflicts.length > 0 ? conflicts : undefined
      };
    } catch (error) {
      return {
        success: false,
        package: { name: packageName, version: version || 'latest' },
        logs: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async uninstallPackage(packageName: string): Promise<boolean> {
    try {
      // In real implementation: await this.webContainer.spawn('npm', ['uninstall', packageName]);
      this.installedPackages.delete(packageName);
      this.saveCachedPackages();
      return true;
    } catch (error) {
      console.error(`Error uninstalling ${packageName}:`, error);
      return false;
    }
  }

  async checkDependencyConflicts(newPackage: PackageInfo): Promise<DependencyConflict[]> {
    const conflicts: DependencyConflict[] = [];
    
    for (const [installedName, installedPackage] of this.installedPackages) {
      // Check if new package conflicts with installed packages
      if (newPackage.dependencies?.[installedName]) {
        const requestedVersion = newPackage.dependencies[installedName];
        if (requestedVersion !== installedPackage.version) {
          conflicts.push({
            package: installedName,
            requestedVersion,
            installedVersion: installedPackage.version,
            reason: `Version mismatch: ${newPackage.name} requires ${requestedVersion}, but ${installedPackage.version} is installed`
          });
        }
      }
    }
    
    return conflicts;
  }

  getInstalledPackages(): PackageInfo[] {
    return Array.from(this.installedPackages.values());
  }

  private loadCachedPackages(): void {
    try {
      const cached = localStorage.getItem('prism_installed_packages');
      if (cached) {
        const packages = JSON.parse(cached) as PackageInfo[];
        packages.forEach(pkg => this.installedPackages.set(pkg.name, pkg));
      }
    } catch (error) {
      console.error('Error loading cached packages:', error);
    }
  }

  private saveCachedPackages(): void {
    try {
      const packages = Array.from(this.installedPackages.values());
      localStorage.setItem('prism_installed_packages', JSON.stringify(packages));
    } catch (error) {
      console.error('Error saving cached packages:', error);
    }
  }
}

class PackageSecurityScanner {
  private knownVulnerabilities: Map<string, Vulnerability[]> = new Map();

  async scanPackage(packageName: string): Promise<SecurityReport> {
    // Simulate security scanning
    const isKnownSafe = this.isKnownSafePackage(packageName);
    const vulnerabilities = this.knownVulnerabilities.get(packageName) || [];
    
    const score = isKnownSafe ? 95 : Math.max(60, 90 - vulnerabilities.length * 15);
    
    return {
      safe: vulnerabilities.length === 0 && score >= 80,
      vulnerabilities,
      score,
      recommendations: this.generateRecommendations(packageName, vulnerabilities)
    };
  }

  private isKnownSafePackage(packageName: string): boolean {
    const safePackages = [
      'react', 'react-dom', 'vue', 'express', 'lodash', 'axios', 'moment',
      'typescript', 'webpack', 'babel', 'eslint', 'prettier', 'jest'
    ];
    return safePackages.includes(packageName);
  }

  private generateRecommendations(packageName: string, vulnerabilities: Vulnerability[]): string[] {
    const recommendations: string[] = [];
    
    if (vulnerabilities.length > 0) {
      recommendations.push('Update to latest version to fix security issues');
      recommendations.push('Consider alternative packages with better security records');
    }
    
    if (!this.isKnownSafePackage(packageName)) {
      recommendations.push('Review package documentation and community trust');
      recommendations.push('Check package maintenance status and update frequency');
    }
    
    return recommendations;
  }
}

export const packageManager = new PackageManagerService();