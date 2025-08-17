
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Clock, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Gauge,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'error';
  description: string;
  recommendation?: string;
}

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  files: Array<{
    name: string;
    size: number;
    type: string;
  }>;
}

interface PerformanceAnalyticsProps {
  projectFiles: Record<string, string>;
  packages: Record<string, string>;
  onOptimizationApply: (optimization: string) => void;
  className?: string;
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  projectFiles,
  packages,
  onOptimizationApply,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [bundleAnalysis, setBundleAnalysis] = useState<BundleAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  // Mock performance analysis
  const analyzePerformance = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate mock metrics based on project files and packages
    const fileCount = Object.keys(projectFiles).length;
    const packageCount = Object.keys(packages).length;
    const totalCodeSize = Object.values(projectFiles).reduce((sum, content) => sum + content.length, 0);

    const mockMetrics: PerformanceMetric[] = [
      {
        name: 'Bundle Size',
        value: Math.round(totalCodeSize / 1024),
        unit: 'KB',
        status: totalCodeSize > 100000 ? 'warning' : 'good',
        description: 'Total size of your bundled application',
        recommendation: totalCodeSize > 100000 ? 'Consider code splitting and lazy loading' : undefined
      },
      {
        name: 'Build Time',
        value: Math.round(fileCount * 0.5 + packageCount * 0.2),
        unit: 's',
        status: fileCount > 20 ? 'warning' : 'good',
        description: 'Time taken to build your application',
        recommendation: fileCount > 20 ? 'Optimize imports and reduce file count' : undefined
      },
      {
        name: 'Dependencies',
        value: packageCount,
        unit: 'packages',
        status: packageCount > 15 ? 'warning' : 'good',
        description: 'Number of external dependencies',
        recommendation: packageCount > 15 ? 'Audit dependencies and remove unused packages' : undefined
      },
      {
        name: 'Code Complexity',
        value: Math.round(totalCodeSize / fileCount / 100),
        unit: 'score',
        status: totalCodeSize / fileCount > 2000 ? 'warning' : 'good',
        description: 'Average complexity per file',
        recommendation: totalCodeSize / fileCount > 2000 ? 'Break down large files into smaller components' : undefined
      },
      {
        name: 'Tree Shaking',
        value: Math.round(Math.random() * 30 + 70),
        unit: '%',
        status: Math.random() > 0.5 ? 'good' : 'warning',
        description: 'Percentage of unused code eliminated',
        recommendation: Math.random() > 0.5 ? undefined : 'Use ES6 modules and avoid default exports'
      }
    ];

    const mockBundleAnalysis: BundleAnalysis = {
      totalSize: Math.round(totalCodeSize / 1024),
      gzippedSize: Math.round(totalCodeSize / 1024 * 0.3),
      files: Object.entries(projectFiles).map(([name, content]) => ({
        name,
        size: Math.round(content.length / 1024),
        type: name.split('.').pop() || 'unknown'
      })).sort((a, b) => b.size - a.size)
    };

    setMetrics(mockMetrics);
    setBundleAnalysis(mockBundleAnalysis);
    setLastAnalyzed(new Date());
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (Object.keys(projectFiles).length > 0) {
      analyzePerformance();
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Activity;
    }
  };

  const optimizations = [
    {
      id: 'code-splitting',
      title: 'Enable Code Splitting',
      description: 'Split your code into smaller chunks for better loading performance',
      impact: 'High',
      effort: 'Medium'
    },
    {
      id: 'lazy-loading',
      title: 'Implement Lazy Loading',
      description: 'Load components only when they are needed',
      impact: 'High',
      effort: 'Low'
    },
    {
      id: 'tree-shaking',
      title: 'Optimize Tree Shaking',
      description: 'Remove unused code from your final bundle',
      impact: 'Medium',
      effort: 'Low'
    },
    {
      id: 'minification',
      title: 'Enable Minification',
      description: 'Compress your code for smaller bundle sizes',
      impact: 'Medium',
      effort: 'Low'
    }
  ];

  const overallScore = metrics.length > 0 
    ? Math.round(metrics.filter(m => m.status === 'good').length / metrics.length * 100)
    : 0;

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-prism-primary" />
            <span>Performance Analytics</span>
            <Badge variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}>
              {overallScore}% Health
            </Badge>
          </CardTitle>
          <Button 
            onClick={analyzePerformance} 
            size="sm" 
            variant="outline"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-analyze
              </>
            )}
          </Button>
        </div>
        {lastAnalyzed && (
          <p className="text-sm text-prism-text-muted">
            Last analyzed: {lastAnalyzed.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <Tabs defaultValue="metrics" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">
              <Gauge className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="bundle">
              <BarChart3 className="w-4 h-4 mr-2" />
              Bundle
            </TabsTrigger>
            <TabsTrigger value="optimizations">
              <Zap className="w-4 h-4 mr-2" />
              Optimize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="flex-1 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {metrics.length === 0 ? (
                  <div className="text-center py-8 text-prism-text-muted">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No metrics available</p>
                    <p className="text-sm">Add some files to analyze performance</p>
                  </div>
                ) : (
                  metrics.map((metric) => {
                    const StatusIcon = getStatusIcon(metric.status);
                    return (
                      <Card key={metric.name}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`w-4 h-4 ${getStatusColor(metric.status)}`} />
                              <h3 className="font-medium text-prism-text">{metric.name}</h3>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-semibold text-prism-text">
                                {metric.value}
                              </span>
                              <span className="text-sm text-prism-text-muted ml-1">
                                {metric.unit}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-prism-text-muted mb-2">
                            {metric.description}
                          </p>
                          {metric.status === 'good' && (
                            <Progress value={85} className="h-2 mb-2" />
                          )}
                          {metric.status === 'warning' && (
                            <Progress value={60} className="h-2 mb-2" />
                          )}
                          {metric.status === 'error' && (
                            <Progress value={30} className="h-2 mb-2" />
                          )}
                          {metric.recommendation && (
                            <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                              <p className="text-xs text-yellow-800">
                                <strong>Recommendation:</strong> {metric.recommendation}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="bundle" className="flex-1 mt-4">
            <ScrollArea className="h-full">
              {bundleAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-prism-primary" />
                        <div className="text-2xl font-bold text-prism-text">
                          {bundleAnalysis.totalSize}KB
                        </div>
                        <div className="text-sm text-prism-text-muted">Total Size</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <div className="text-2xl font-bold text-prism-text">
                          {bundleAnalysis.gzippedSize}KB
                        </div>
                        <div className="text-sm text-prism-text-muted">Gzipped</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">File Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {bundleAnalysis.files.map((file) => (
                          <div key={file.name} className="flex items-center justify-between p-2 bg-prism-surface/10 rounded">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-prism-text-muted" />
                              <span className="text-sm text-prism-text">{file.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {file.type}
                              </Badge>
                            </div>
                            <span className="text-sm font-medium text-prism-text">
                              {file.size}KB
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-prism-text-muted">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No bundle analysis available</p>
                  <p className="text-sm">Build your project to see bundle breakdown</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="optimizations" className="flex-1 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {optimizations.map((optimization) => (
                  <Card key={optimization.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-prism-text">{optimization.title}</h3>
                        <div className="flex space-x-2">
                          <Badge variant={optimization.impact === 'High' ? 'default' : 'secondary'}>
                            {optimization.impact} Impact
                          </Badge>
                          <Badge variant="outline">
                            {optimization.effort} Effort
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-prism-text-muted mb-3">
                        {optimization.description}
                      </p>
                      <Button
                        onClick={() => onOptimizationApply(optimization.id)}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Apply Optimization
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PerformanceAnalytics;
