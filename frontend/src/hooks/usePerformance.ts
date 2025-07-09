import { useEffect, useRef } from 'react';
import { useState } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  memoryUsage?: number;
  networkRequests: number;
}

export const usePerformance = (pageName: string) => {
  const startTime = useRef(performance.now());
  const metrics = useRef<PerformanceMetrics>({
    pageLoadTime: 0,
    timeToInteractive: 0,
    networkRequests: 0,
  });

  useEffect(() => {
    const measurePerformance = () => {
      const loadTime = performance.now() - startTime.current;
      metrics.current.pageLoadTime = loadTime;

      // Measure time to interactive
      if (document.readyState === 'complete') {
        metrics.current.timeToInteractive = loadTime;
      }

      // Measure memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metrics.current.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }

      // Count network requests
      const resources = performance.getEntriesByType('resource');
      metrics.current.networkRequests = resources.length;

      // Log metrics (in production, send to analytics service)
      console.log(`Performance metrics for ${pageName}:`, metrics.current);

      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance', {
          page_name: pageName,
          load_time: Math.round(loadTime),
          time_to_interactive: Math.round(metrics.current.timeToInteractive),
          memory_usage: metrics.current.memoryUsage ? Math.round(metrics.current.memoryUsage) : undefined,
          network_requests: metrics.current.networkRequests,
        });
      }
    };

    // Measure on page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [pageName]);

  return metrics.current;
};

export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return isVisible;
};

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}; 