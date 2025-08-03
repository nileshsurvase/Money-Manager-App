import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Custom hook for debouncing values
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for throttling function calls
export const useThrottle = (callback, delay) => {
  const lastCall = useRef(0);
  
  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    }
  }, [callback, delay]);
};

// Custom hook for optimistic updates
export const useOptimisticUpdate = (initialData, updateFn) => {
  const [data, setData] = useState(initialData);
  const [optimisticData, setOptimisticData] = useState(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const performOptimisticUpdate = useCallback(async (optimisticValue, actualUpdatePromise) => {
    setOptimisticData(optimisticValue);
    setIsOptimistic(true);

    try {
      const result = await actualUpdatePromise;
      setData(result);
      setOptimisticData(result);
      setIsOptimistic(false);
      return result;
    } catch (error) {
      // Rollback optimistic update
      setOptimisticData(data);
      setIsOptimistic(false);
      throw error;
    }
  }, [data]);

  return {
    data: optimisticData,
    isOptimistic,
    performOptimisticUpdate,
    setData: (newData) => {
      setData(newData);
      if (!isOptimistic) {
        setOptimisticData(newData);
      }
    }
  };
};

// Custom hook for simple caching
export const useCache = (key, fetcher, ttl = 300000) => { // 5 minutes default TTL
  const cache = useRef(new Map());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const cached = cache.current.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < ttl) {
      setData(cached.data);
      return cached.data;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cache.current.set(key, {
        data: result,
        timestamp: now
      });
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  const invalidateCache = useCallback(() => {
    cache.current.delete(key);
  }, [key]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidate: invalidateCache
  };
};

// Custom hook for virtual scrolling
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length - 1
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      ...item,
      index: visibleRange.startIndex + index
    }));
  }, [items, visibleRange]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e) => setScrollTop(e.target.scrollTop)
  };
};

// Custom hook for performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const renderStart = useRef(Date.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderEnd = Date.now();
    const renderTime = renderEnd - renderStart.current;

    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(`${componentName} render took ${renderTime}ms (render #${renderCount.current})`);
    }

    renderStart.current = Date.now();
  });

  return {
    renderCount: renderCount.current
  };
};