import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Eye,
  Target,
  Activity,
  Gauge,
  RefreshCw,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { performanceAnalytics } from '@/services/performanceAnalytics';

interface PerformanceReport {
  score: number;
  metrics: any;
  recommendations: PerformanceRecommendation[];
  trends: any[];
  comparisons: any[];
}

interface PerformanceRecommendation {
  type: 'critical' | 'important' | 'suggestion';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
  implementation: string;
  estimatedImprovement: number;
}

interface PerformanceDashboardProps {
  projectId: string;
  projectUrl?: string;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  projectId, 
  projectUrl 
}) => {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load cached report if available
    loadCachedReport();
    
    // Start real-time monitoring
    if (projectUrl) {
      startRealTimeMonitoring();
    }
  }, [projectId, projectUrl]);

  const loadCachedReport = () => {
    try {
      const cached = localStorage.getItem(`performance_report_${projectId}`);
      if (cached) {
        setReport(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Error loading cached report:', error);
    }
  };

  const runAnalysis = async () => {
    if (!projectUrl) {
      toast({
        title: "No Preview Available",
        description: "Deploy your application to run performance analysis.",
        variant: "default"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const newReport = await performanceAnalytics.analyzeApplication(projectId, projectUrl);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      setTimeout(() => {
        setReport(newReport);
        setAnalysisProgress(0);
        setIsAnalyzing(false);
        
        toast({
          title: "Analysis Complete",
          description: `Performance score: ${Math.round(newReport.score)}/100`,
        });
      }, 500);
    } catch (error) {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const startRealTimeMonitoring = async () => {
    if (!projectUrl || isMonitoring) return;
    
    try {
      setIsMonitoring(true);
      const monitor = await performanceAnalytics.monitorRealTime(projectId);
      
      // Listen for real-time metrics
      window.addEventListener('performance-metrics', (event: any) => {
        setRealTimeMetrics(event.detail.metrics);
      });
      
      await monitor.start();
      
      toast({
        title: "Real-time Monitoring Started",
        description: "Performance metrics are now being tracked in real-time.",
      });
    } catch (error) {
      setIsMonitoring(false);
      console.error('Error starting monitoring:', error);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number): { label: string; color: string } => {
    if (score >= 90) return { label: 'EXCELLENT', color: 'bg-emerald-600' };
    if (score >= 75) return { label: 'GOOD', color: 'bg-green-600' };
    if (score >= 50) return { label: 'NEEDS WORK', color: 'bg-amber-600' };
    return { label: 'POOR', color: 'bg-red-600' };
  };

  const exportReport = () => {
    if (!report) return;
    
    const reportData = {
      projectId,
      timestamp: new Date().toISOString(),
      score: report.score,
      recommendations: report.recommendations,
      metrics: report.metrics
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-report-${projectId}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-prism-primary" />
            <span>Performance Analytics</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {report && (
              <Button onClick={exportReport} size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
            <Button onClick={runAnalysis} disabled={isAnalyzing} size="sm">
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Activity className="w-4 h-4 mr-2" />
              )}
              Analyze
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {isAnalyzing && (
          <div className="space-y-4">
            <div className="text-center">
              <Gauge className="w-12 h-12 text-prism-primary mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-prism-text">Analyzing Performance</h3>
              <p className="text-prism-text-muted">Running Lighthouse audit and collecting metrics...</p>
            </div>
            <Progress value={analysisProgress} className="w-full" />
            <p className="text-center text-sm text-prism-text-muted">
              {analysisProgress}% complete
            </p>
          </div>
        )}

        {!isAnalyzing && !report && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-prism-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-prism-text mb-2">No Analysis Available</h3>
            <p className="text-prism-text-muted mb-4">
              Run a performance analysis to get detailed insights about your application.
            </p>
            <Button onClick={runAnalysis} disabled={!projectUrl}>
              <Activity className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </div>
        )}

        {report && !isAnalyzing && (
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-4">
              {/* Overall Score */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="text-6xl font-bold">
                    <span className={getScoreColor(report.score)}>{Math.round(report.score)}</span>
                    <span className="text-2xl text-prism-text-muted">/100</span>
                  </div>
                  <Badge className={`${getScoreBadge(report.score).color} text-white px-4 py-1 mt-2`}>
                    {getScoreBadge(report.score).label}
                  </Badge>
                </div>
                <Progress value={report.score} className="w-full h-3" />
                <p className="text-prism-text-muted">Overall Performance Score</p>
              </div>

              {/* Core Web Vitals */}
              <div>
                <h3 className="text-lg font-semibold text-prism-text mb-4">Core Web Vitals</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-prism-surface/20 rounded-lg p-4 text-center">
                    <Clock className="w-6 h-6 text-prism-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-prism-text">
                      {report.metrics.coreWebVitals?.lcp ? `${(report.metrics.coreWebVitals.lcp / 1000).toFixed(1)}s` : 'N/A'}
                    </div>
                    <div className="text-xs text-prism-text-muted">LCP</div>
                  </div>
                  <div className="bg-prism-surface/20 rounded-lg p-4 text-center">
                    <Zap className="w-6 h-6 text-prism-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-prism-text">
                      {report.metrics.coreWebVitals?.fid ? `${report.metrics.coreWebVitals.fid}ms` : 'N/A'}
                    </div>
                    <div className="text-xs text-prism-text-muted">FID</div>
                  </div>
                  <div className="bg-prism-surface/20 rounded-lg p-4 text-center">
                    <Target className="w-6 h-6 text-prism-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-prism-text">
                      {report.metrics.coreWebVitals?.cls ? report.metrics.coreWebVitals.cls.toFixed(3) : 'N/A'}
                    </div>
                    <div className="text-xs text-prism-text-muted">CLS</div>
                  </div>
                  <div className="bg-prism-surface/20 rounded-lg p-4 text-center">
                    <Eye className="w-6 h-6 text-prism-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-prism-text">
                      {report.metrics.coreWebVitals?.fcp ? `${(report.metrics.coreWebVitals.fcp / 1000).toFixed(1)}s` : 'N/A'}
                    </div>
                    <div className="text-xs text-prism-text-muted">FCP</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4 mt-4">
              <div className="space-y-4">
                {report.recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-prism-text">Great Performance!</h3>
                    <p className="text-prism-text-muted">No critical issues found. Your app is well-optimized.</p>
                  </div>
                ) : (
                  report.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        rec.type === 'critical' 
                          ? 'bg-red-500/10 border-red-500/30' 
                          : rec.type === 'important'
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-blue-500/10 border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {rec.type === 'critical' ? (
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                            ) : rec.type === 'important' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-blue-400" />
                            )}
                            <h4 className="font-semibold text-prism-text">{rec.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {rec.impact} impact
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {rec.effort} effort
                            </Badge>
                          </div>
                          <p className="text-sm text-prism-text-muted mb-3">{rec.description}</p>
                          <div className="bg-prism-surface/30 rounded p-3">
                            <h5 className="text-xs font-semibold text-prism-text mb-1">Implementation:</h5>
                            <p className="text-xs text-prism-text-muted">{rec.implementation}</p>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-lg font-bold text-prism-primary">
                            +{rec.estimatedImprovement}%
                          </div>
                          <div className="text-xs text-prism-text-muted">improvement</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4 mt-4">
              {/* Bundle Analysis */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-prism-text">Bundle Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-prism-surface/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-4 h-4 text-prism-primary" />
                      <span className="font-medium text-prism-text">Total Size</span>
                    </div>
                    <div className="text-2xl font-bold text-prism-text">
                      {report.metrics.bundleSize ? `${(report.metrics.bundleSize.totalSize / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-prism-surface/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Archive className="w-4 h-4 text-prism-primary" />
                      <span className="font-medium text-prism-text">Gzipped</span>
                    </div>
                    <div className="text-2xl font-bold text-prism-text">
                      {report.metrics.bundleSize ? `${(report.metrics.bundleSize.gzippedSize / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Runtime Metrics */}
              {realTimeMetrics && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-prism-text">Real-time Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-prism-surface/20 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-prism-primary">
                        {realTimeMetrics.lcp ? `${(realTimeMetrics.lcp / 1000).toFixed(1)}s` : 'N/A'}
                      </div>
                      <div className="text-xs text-prism-text-muted">LCP</div>
                    </div>
                    <div className="bg-prism-surface/20 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-prism-primary">
                        {realTimeMetrics.fid ? `${realTimeMetrics.fid}ms` : 'N/A'}
                      </div>
                      <div className="text-xs text-prism-text-muted">FID</div>
                    </div>
                    <div className="bg-prism-surface/20 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-prism-primary">
                        {realTimeMetrics.cls ? realTimeMetrics.cls.toFixed(3) : 'N/A'}
                      </div>
                      <div className="text-xs text-prism-text-muted">CLS</div>
                    </div>
                    <div className="bg-prism-surface/20 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-prism-primary">
                        {realTimeMetrics.ttfb ? `${realTimeMetrics.ttfb}ms` : 'N/A'}
                      </div>
                      <div className="text-xs text-prism-text-muted">TTFB</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-prism-text-muted">Monitoring in real-time</span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceDashboard;