import { useState, useEffect } from 'react';
import { performanceMonitor } from '../utils/performance';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 0,
    renderTime: 0
  });

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const updateMetrics = () => {
      setMetrics({
        fps: performanceMonitor.fps,
        memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 0,
        renderTime: performance.now()
      });
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  // Only show in development mode
  if (!import.meta.env.DEV) return null;

  const getFpsColor = (fps) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs px-3 py-2 rounded-lg font-mono z-50 backdrop-blur-sm">
      <div className="space-y-1">
        <div className={`flex justify-between gap-4 ${getFpsColor(metrics.fps)}`}>
          <span>FPS:</span>
          <span className="font-bold">{metrics.fps}</span>
        </div>
        <div className="flex justify-between gap-4 text-blue-400">
          <span>Memory:</span>
          <span>{metrics.memory}MB</span>
        </div>
        <div className="flex justify-between gap-4 text-purple-400">
          <span>Platform:</span>
          <span>{navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;