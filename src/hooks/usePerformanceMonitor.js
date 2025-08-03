import { useEffect, useRef, useCallback } from 'react';

export const usePerformanceMonitor = (componentName) => {
  const startTimeRef = useRef();
  const metricsRef = useRef({
    renderCount: 0,
    totalRenderTime: 0,
    averageRenderTime: 0,
    slowRenders: 0
  });

  // Start timing on component mount/update
  useEffect(() => {
    startTimeRef.current = performance.now();
    metricsRef.current.renderCount++;
  });

  // End timing after render
  useEffect(() => {
    if (startTimeRef.current) {
      const renderTime = performance.now() - startTimeRef.current;
      const metrics = metricsRef.current;
      
      metrics.totalRenderTime += renderTime;
      metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
      
      if (renderTime > 16) { // 60fps threshold
        metrics.slowRenders++;
      }
      
      // Log performance warnings
      if (renderTime > 100) {
        console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      // Log metrics every 50 renders
      if (metrics.renderCount % 50 === 0) {
        console.log(`📊 Performance metrics for ${componentName}:`, {
          renders: metrics.renderCount,
          avgTime: metrics.averageRenderTime.toFixed(2) + 'ms',
          slowRenders: metrics.slowRenders,
          slowRenderRate: ((metrics.slowRenders / metrics.renderCount) * 100).toFixed(1) + '%'
        });
      }
    }
  });

  const measureAsync = useCallback(async (asyncOperation, operationName) => {
    const start = performance.now();
    try {
      const result = await asyncOperation();
      const duration = performance.now() - start;
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow async operation in ${componentName}.${operationName}: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`❌ Failed async operation in ${componentName}.${operationName} (${duration.toFixed(2)}ms):`, error);
      throw error;
    }
  }, [componentName]);

  const getMetrics = useCallback(() => ({ ...metricsRef.current }), []);

  return { measureAsync, getMetrics };
};

// Basic Web Vitals monitoring without external dependencies
export const useWebVitals = () => {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Basic performance monitoring using native APIs
    const measureVitals = () => {
      // Measure First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      // Measure Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('📊 LCP:', lastEntry.startTime);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // PerformanceObserver not supported
        }
      }
      
      if (fcp) {
        console.log('📊 FCP:', fcp.startTime);
      }
    };

    if (document.readyState === 'complete') {
      measureVitals();
    } else {
      window.addEventListener('load', measureVitals);
      return () => window.removeEventListener('load', measureVitals);
    }
  }, []);
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  useEffect(() => {
    if (!performance.memory) return;

    const checkMemory = () => {
      const memory = performance.memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
      
      // Warn if memory usage is high
      if (usedMB > limitMB * 0.8) {
        console.warn(`⚠️ High memory usage: ${usedMB}MB / ${limitMB}MB (${Math.round(usedMB/limitMB*100)}%)`);
      }
      
      // Log memory stats every 5 minutes
      console.log(`💾 Memory: ${usedMB}MB used, ${totalMB}MB total, ${limitMB}MB limit`);
    };

    const interval = setInterval(checkMemory, 5 * 60 * 1000); // 5 minutes
    checkMemory(); // Initial check

    return () => clearInterval(interval);
  }, []);
};

export default usePerformanceMonitor;