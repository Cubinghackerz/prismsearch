// Performance Analytics and Monitoring System
interface PerformanceMetrics {
  lighthouse: LighthouseReport;
  bundleSize: BundleAnalysis;
  runtime: RuntimeMetrics;
  network: NetworkMetrics;
  coreWebVitals: CoreWebVitals;
}

interface LighthouseReport {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
    totalBlockingTime: number;
  };
}

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  modules: ModuleInfo[];
  chunks: ChunkInfo[];
  duplicates: DuplicateModule[];
  unusedCode: UnusedCodeInfo[];
}

interface RuntimeMetrics {
  memoryUsage: MemoryInfo;
  cpuUsage: number;
  renderTime: number;
  hydrationTime?: number;
  interactionLatency: number[];
}

interface NetworkMetrics {
  requests: NetworkRequest[];
  totalTransferSize: number;
  criticalResourceCount: number;
  resourceLoadTime: number;
  cacheHitRate: number;
}

interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

interface PerformanceReport {
  score: number;
  metrics: PerformanceMetrics;
  recommendations: PerformanceRecommendation[];
  trends: PerformanceTrend[];
  comparisons: BenchmarkComparison[];
}

interface PerformanceRecommendation {
  type: 'critical' | 'important' | 'suggestion';
  category: 'loading' | 'interactivity' | 'visual-stability' | 'accessibility';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
  implementation: string;
  estimatedImprovement: number;
}

export class PerformanceAnalytics {
  private metricsCollector: MetricsCollector;
  private analyzer: PerformanceAnalyzer;
  private benchmarkDb: BenchmarkDatabase;
  
  constructor() {
    this.metricsCollector = new MetricsCollector();
    this.analyzer = new PerformanceAnalyzer();
    this.benchmarkDb = new BenchmarkDatabase();
  }

  async analyzeApplication(projectId: string, projectUrl: string): Promise<PerformanceReport> {
    console.log(`Starting performance analysis for project: ${projectId}`);
    
    try {
      const metrics = await this.collectMetrics(projectUrl);
      const analysis = await this.analyzer.analyze(metrics);
      const recommendations = await this.generateRecommendations(analysis);
      const trends = await this.analyzeTrends(projectId, metrics);
      const comparisons = await this.benchmarkDb.compare(metrics);

      const report: PerformanceReport = {
        score: this.calculateOverallScore(metrics),
        metrics,
        recommendations,
        trends,
        comparisons
      };

      // Store report for historical tracking
      await this.storeReport(projectId, report);
      
      return report;
    } catch (error) {
      console.error('Error analyzing application:', error);
      throw new Error(`Performance analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async monitorRealTime(projectId: string): Promise<RealTimeMonitor> {
    return new RealTimeMonitor(projectId, this.metricsCollector);
  }

  private calculateOverallScore(metrics: PerformanceMetrics): number {
    const weights = {
      lighthouse: 0.4,
      bundleSize: 0.2,
      runtime: 0.2,
      network: 0.1,
      coreWebVitals: 0.1
    };

    const scores = {
      lighthouse: (metrics.lighthouse.performance + metrics.lighthouse.accessibility + 
                  metrics.lighthouse.bestPractices + metrics.lighthouse.seo) / 4,
      bundleSize: this.calculateBundleScore(metrics.bundleSize),
      runtime: this.calculateRuntimeScore(metrics.runtime),
      network: this.calculateNetworkScore(metrics.network),
      coreWebVitals: this.calculateWebVitalsScore(metrics.coreWebVitals)
    };

    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0);
  }

  private async generateRecommendations(analysis: any): Promise<PerformanceRecommendation[]> {
    const recommendations: PerformanceRecommendation[] = [];

    // Bundle size recommendations
    if (analysis.bundleSize > 1000000) { // > 1MB
      recommendations.push({
        type: 'critical',
        category: 'loading',
        title: 'Reduce Bundle Size',
        description: 'Your bundle size is larger than recommended (1MB+)',
        impact: 'high',
        effort: 'moderate',
        implementation: 'Implement code splitting and tree shaking',
        estimatedImprovement: 30
      });
    }

    // LCP recommendations
    if (analysis.coreWebVitals.lcp > 2500) {
      recommendations.push({
        type: 'important',
        category: 'loading',
        title: 'Improve Largest Contentful Paint',
        description: 'LCP is slower than recommended (>2.5s)',
        impact: 'high',
        effort: 'moderate',
        implementation: 'Optimize images, preload critical resources, use CDN',
        estimatedImprovement: 25
      });
    }

    // CLS recommendations
    if (analysis.coreWebVitals.cls > 0.1) {
      recommendations.push({
        type: 'important',
        category: 'visual-stability',
        title: 'Reduce Layout Shifts',
        description: 'Cumulative Layout Shift exceeds threshold',
        impact: 'medium',
        effort: 'easy',
        implementation: 'Set dimensions for images and containers',
        estimatedImprovement: 20
      });
    }

    return recommendations.sort((a, b) => {
      const typeOrder = { critical: 3, important: 2, suggestion: 1 };
      return typeOrder[b.type] - typeOrder[a.type];
    });
  }

  private calculateBundleScore(bundle: BundleAnalysis): number {
    if (bundle.totalSize < 500000) return 100; // < 500KB
    if (bundle.totalSize < 1000000) return 80;  // < 1MB
    if (bundle.totalSize < 2000000) return 60;  // < 2MB
    return 40;
  }

  private calculateRuntimeScore(runtime: RuntimeMetrics): number {
    let score = 100;
    
    if (runtime.renderTime > 100) score -= 20;
    if (runtime.memoryUsage.usedJSHeapSize > 50000000) score -= 15; // > 50MB
    if (runtime.interactionLatency.some(latency => latency > 100)) score -= 15;
    
    return Math.max(0, score);
  }

  private calculateNetworkScore(network: NetworkMetrics): number {
    let score = 100;
    
    if (network.requests.length > 50) score -= 20;
    if (network.totalTransferSize > 2000000) score -= 15; // > 2MB
    if (network.cacheHitRate < 0.8) score -= 10;
    
    return Math.max(0, score);
  }

  private calculateWebVitalsScore(vitals: CoreWebVitals): number {
    let score = 100;
    
    if (vitals.lcp > 2500) score -= 30;
    if (vitals.fid > 100) score -= 25;
    if (vitals.cls > 0.1) score -= 25;
    if (vitals.fcp > 1800) score -= 20;
    
    return Math.max(0, score);
  }

  private async storeReport(projectId: string, report: PerformanceReport): Promise<void> {
    try {
      const reportData = {
        project_id: projectId,
        score: report.score,
        metrics: report.metrics,
        recommendations: report.recommendations,
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem(`performance_report_${projectId}`, JSON.stringify(reportData));
    } catch (error) {
      console.error('Error storing performance report:', error);
    }
  }
}

class MetricsCollector {
  async collectCoreWebVitals(): Promise<CoreWebVitals> {
    return new Promise((resolve) => {
      // In a real implementation, this would use the web-vitals library
      const vitals: CoreWebVitals = {
        lcp: this.measureLCP(),
        fid: this.measureFID(),
        cls: this.measureCLS(),
        fcp: this.measureFCP(),
        ttfb: this.measureTTFB()
      };
      
      resolve(vitals);
    });
  }

  async collectBundleMetrics(bundleUrl: string): Promise<BundleAnalysis> {
    // Simulate bundle analysis
    return {
      totalSize: Math.floor(Math.random() * 2000000) + 500000, // 500KB - 2.5MB
      gzippedSize: Math.floor(Math.random() * 800000) + 200000, // 200KB - 1MB
      modules: [],
      chunks: [],
      duplicates: [],
      unusedCode: []
    };
  }

  private measureLCP(): number {
    // Use PerformanceObserver for real measurement
    return Math.random() * 3000 + 1000; // 1-4 seconds
  }

  private measureFID(): number {
    return Math.random() * 200 + 50; // 50-250ms
  }

  private measureCLS(): number {
    return Math.random() * 0.2; // 0-0.2
  }

  private measureFCP(): number {
    return Math.random() * 2000 + 800; // 0.8-2.8 seconds
  }

  private measureTTFB(): number {
    return Math.random() * 800 + 200; // 200-1000ms
  }
}

class PerformanceAnalyzer {
  async analyze(metrics: PerformanceMetrics): Promise<AnalysisResult> {
    return {
      overallHealth: this.assessOverallHealth(metrics),
      bottlenecks: this.identifyBottlenecks(metrics),
      optimizations: this.suggestOptimizations(metrics),
      regressions: this.detectRegressions(metrics)
    };
  }

  private assessOverallHealth(metrics: PerformanceMetrics): HealthAssessment {
    const scores = {
      loading: this.assessLoadingPerformance(metrics),
      interactivity: this.assessInteractivity(metrics),
      visualStability: this.assessVisualStability(metrics)
    };

    return {
      overall: (scores.loading + scores.interactivity + scores.visualStability) / 3,
      breakdown: scores,
      status: this.getHealthStatus(scores)
    };
  }

  private identifyBottlenecks(metrics: PerformanceMetrics): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = [];

    if (metrics.bundleSize.totalSize > 1500000) {
      bottlenecks.push({
        type: 'bundle-size',
        severity: 'high',
        description: 'Large bundle size affecting load time',
        affectedMetrics: ['LCP', 'FCP'],
        solutions: ['Code splitting', 'Tree shaking', 'Dynamic imports']
      });
    }

    if (metrics.coreWebVitals.cls > 0.1) {
      bottlenecks.push({
        type: 'layout-shift',
        severity: 'medium',
        description: 'Layout shifts affecting user experience',
        affectedMetrics: ['CLS'],
        solutions: ['Set image dimensions', 'Reserve space for dynamic content']
      });
    }

    return bottlenecks;
  }

  private suggestOptimizations(metrics: PerformanceMetrics): OptimizationSuggestion[] {
    const optimizations: OptimizationSuggestion[] = [];

    // Image optimization
    optimizations.push({
      category: 'assets',
      title: 'Optimize Images',
      description: 'Use modern formats and responsive images',
      implementation: 'Convert to WebP, add srcset attributes',
      priority: 'high',
      estimatedGain: '15-30% faster loading'
    });

    // Caching strategy
    optimizations.push({
      category: 'caching',
      title: 'Implement Service Worker',
      description: 'Add offline support and aggressive caching',
      implementation: 'Use Workbox for service worker generation',
      priority: 'medium',
      estimatedGain: '40-60% faster repeat visits'
    });

    return optimizations;
  }

  private detectRegressions(metrics: PerformanceMetrics): PerformanceRegression[] {
    // Compare with historical data to detect regressions
    return [];
  }

  private assessLoadingPerformance(metrics: PerformanceMetrics): number {
    let score = 100;
    
    if (metrics.coreWebVitals.lcp > 2500) score -= 30;
    if (metrics.coreWebVitals.fcp > 1800) score -= 20;
    if (metrics.bundleSize.totalSize > 1000000) score -= 25;
    
    return Math.max(0, score);
  }

  private assessInteractivity(metrics: PerformanceMetrics): number {
    let score = 100;
    
    if (metrics.coreWebVitals.fid > 100) score -= 40;
    if (metrics.runtime.interactionLatency.some(l => l > 50)) score -= 20;
    if (metrics.lighthouse.metrics.totalBlockingTime > 300) score -= 20;
    
    return Math.max(0, score);
  }

  private assessVisualStability(metrics: PerformanceMetrics): number {
    let score = 100;
    
    if (metrics.coreWebVitals.cls > 0.1) score -= 50;
    if (metrics.coreWebVitals.cls > 0.25) score -= 30;
    
    return Math.max(0, score);
  }

  private getHealthStatus(scores: any): 'excellent' | 'good' | 'needs-improvement' | 'poor' {
    const avgScore = (scores.loading + scores.interactivity + scores.visualStability) / 3;
    
    if (avgScore >= 90) return 'excellent';
    if (avgScore >= 75) return 'good';
    if (avgScore >= 50) return 'needs-improvement';
    return 'poor';
  }
}

class RealTimeMonitor {
  private projectId: string;
  private collector: MetricsCollector;
  private observers: PerformanceObserver[] = [];
  private isMonitoring: boolean = false;

  constructor(projectId: string, collector: MetricsCollector) {
    this.projectId = projectId;
    this.collector = collector;
  }

  async start(): Promise<void> {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.setupPerformanceObservers();
    this.startMetricCollection();
  }

  stop(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  private setupPerformanceObservers(): void {
    // LCP Observer
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        console.log('LCP:', entry.startTime);
        this.reportMetric('lcp', entry.startTime);
      });
    });
    
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // FID Observer
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        console.log('FID:', (entry as any).processingStart - entry.startTime);
        this.reportMetric('fid', (entry as any).processingStart - entry.startTime);
      });
    });
    
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);

    // CLS Observer
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      console.log('CLS:', clsValue);
      this.reportMetric('cls', clsValue);
    });
    
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);
  }

  private startMetricCollection(): void {
    // Collect metrics every 5 seconds
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      this.collectAndReportMetrics();
    }, 5000);
  }

  private async collectAndReportMetrics(): Promise<void> {
    try {
      const metrics = await this.collector.collectCoreWebVitals();
      this.reportMetrics(metrics);
    } catch (error) {
      console.error('Error collecting real-time metrics:', error);
    }
  }

  private reportMetric(type: string, value: number): void {
    // Send to analytics service
    const event = new CustomEvent('performance-metric', {
      detail: { projectId: this.projectId, type, value, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }

  private reportMetrics(metrics: CoreWebVitals): void {
    const event = new CustomEvent('performance-metrics', {
      detail: { projectId: this.projectId, metrics, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }
}

class BenchmarkDatabase {
  async compare(metrics: PerformanceMetrics): Promise<BenchmarkComparison[]> {
    // Compare against industry benchmarks
    const benchmarks = await this.getBenchmarks();
    
    return [
      {
        metric: 'Bundle Size',
        userValue: metrics.bundleSize.totalSize,
        benchmark: benchmarks.bundleSize.median,
        percentile: this.calculatePercentile(metrics.bundleSize.totalSize, benchmarks.bundleSize.distribution),
        status: metrics.bundleSize.totalSize < benchmarks.bundleSize.median ? 'above-average' : 'below-average'
      },
      {
        metric: 'LCP',
        userValue: metrics.coreWebVitals.lcp,
        benchmark: benchmarks.lcp.median,
        percentile: this.calculatePercentile(metrics.coreWebVitals.lcp, benchmarks.lcp.distribution),
        status: metrics.coreWebVitals.lcp < benchmarks.lcp.median ? 'above-average' : 'below-average'
      }
    ];
  }

  private async getBenchmarks(): Promise<any> {
    // In real implementation, fetch from benchmark database
    return {
      bundleSize: { median: 800000, distribution: [200000, 500000, 800000, 1200000, 2000000] },
      lcp: { median: 2100, distribution: [1200, 1800, 2100, 2800, 4000] }
    };
  }

  private calculatePercentile(value: number, distribution: number[]): number {
    const sorted = distribution.sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    return index === -1 ? 100 : (index / sorted.length) * 100;
  }
}

// Type definitions
interface ModuleInfo {
  name: string;
  size: number;
  gzippedSize: number;
  path: string;
}

interface ChunkInfo {
  name: string;
  size: number;
  modules: string[];
}

interface DuplicateModule {
  name: string;
  instances: number;
  wastedSize: number;
}

interface UnusedCodeInfo {
  file: string;
  unusedBytes: number;
  totalBytes: number;
  percentage: number;
}

interface NetworkRequest {
  url: string;
  method: string;
  size: number;
  duration: number;
  cached: boolean;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface AnalysisResult {
  overallHealth: HealthAssessment;
  bottlenecks: PerformanceBottleneck[];
  optimizations: OptimizationSuggestion[];
  regressions: PerformanceRegression[];
}

interface HealthAssessment {
  overall: number;
  breakdown: {
    loading: number;
    interactivity: number;
    visualStability: number;
  };
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
}

interface PerformanceBottleneck {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedMetrics: string[];
  solutions: string[];
}

interface OptimizationSuggestion {
  category: string;
  title: string;
  description: string;
  implementation: string;
  priority: 'low' | 'medium' | 'high';
  estimatedGain: string;
}

interface PerformanceRegression {
  metric: string;
  previousValue: number;
  currentValue: number;
  degradation: number;
  introduced: string;
}

interface PerformanceTrend {
  metric: string;
  values: number[];
  trend: 'improving' | 'stable' | 'degrading';
  changePercent: number;
}

interface BenchmarkComparison {
  metric: string;
  userValue: number;
  benchmark: number;
  percentile: number;
  status: 'above-average' | 'average' | 'below-average';
}

export const performanceAnalytics = new PerformanceAnalytics();