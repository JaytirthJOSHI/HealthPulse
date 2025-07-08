// Performance monitoring utilities
export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  mapRenderTime: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private startTimes: Map<string, number> = new Map();

  startTimer(label: string): void {
    this.startTimes.set(label, performance.now());
  }

  endTimer(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(label);
    
    // Log performance data in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  measurePageLoad(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        this.recordMetric('pageLoadTime', loadTime);
      });
    }
  }

  measureApiCall<T>(apiCall: Promise<T>, label: string): Promise<T> {
    this.startTimer(label);
    return apiCall.finally(() => {
      const duration = this.endTimer(label);
      this.recordMetric('apiResponseTime', duration);
    });
  }

  measureMapRender(callback: () => void): void {
    this.startTimer('mapRender');
    callback();
    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(() => {
      const duration = this.endTimer('mapRender');
      this.recordMetric('mapRenderTime', duration);
    });
  }

  private recordMetric(type: keyof PerformanceMetrics, value: number): void {
    const metric: Partial<PerformanceMetrics> = {
      [type]: value,
    };

    this.metrics.push(metric as PerformanceMetrics);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  private sendToAnalytics(metric: Partial<PerformanceMetrics>): void {
    // Example: Send to Google Analytics, Sentry, or custom analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        event_category: 'performance',
        event_label: Object.keys(metric)[0],
        value: Math.round(Object.values(metric)[0]),
      });
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageMetric(type: keyof PerformanceMetrics): number {
    const values = this.metrics
      .map(m => m[type])
      .filter(v => v !== undefined) as number[];
    
    if (values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component render time
export const usePerformanceMonitor = (componentName: string) => {
  const measureRender = (callback: () => void) => {
    performanceMonitor.measureMapRender(callback);
  };

  const measureApiCall = <T>(apiCall: Promise<T>, label?: string) => {
    return performanceMonitor.measureApiCall(apiCall, label || `${componentName}_api`);
  };

  return { measureRender, measureApiCall };
}; 