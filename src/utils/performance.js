// Performance utilities for butter smooth React experience
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Optimized throttle for smooth scrolling and animations
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());
  
  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// Debounce for search and input optimization
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

// Ultra smooth animation configuration for 60fps
export const smoothAnimations = {
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8
  },
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Ultra smooth card animation
export const cardAnimation = {
  initial: { opacity: 0, scale: 0.96, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      mass: 0.5
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

// Staggered children animation for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

// Smooth hover animation
export const hoverAnimation = {
  whileHover: { 
    scale: 1.02,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  whileTap: { 
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

// Memory optimization - memoized calculations
export const useMemoizedCalculations = (expenses, budgets) => {
  return useMemo(() => {
    const calculations = {
      totalExpenses: expenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
      expensesByCategory: expenses.reduce((acc, exp) => {
        acc[exp.categoryId] = (acc[exp.categoryId] || 0) + Number(exp.amount);
        return acc;
      }, {}),
      budgetProgress: budgets.map(budget => {
        const spent = expenses
          .filter(exp => exp.categoryId === budget.categoryId)
          .reduce((sum, exp) => sum + Number(exp.amount), 0);
        return {
          ...budget,
          spent,
          percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
          remaining: budget.amount - spent
        };
      })
    };
    return calculations;
  }, [expenses, budgets]);
};

// Intersection Observer for lazy loading and animations
export const useIntersectionObserver = (options = {}) => {
  const elementRef = useRef();
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return [elementRef, isIntersecting];
};

// Virtual scrolling for large lists
export const useVirtualList = (items, itemHeight = 80, containerHeight = 400) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;

  return { visibleItems, totalHeight, setScrollTop };
};

// RAF-based smooth state updates
export const useSmoothState = (initialValue) => {
  const [state, setState] = useState(initialValue);
  const rafRef = useRef();

  const setSmoothState = useCallback((newValue) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      setState(newValue);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return [state, setSmoothState];
};

// Optimized event handlers to prevent excessive re-renders
export const useOptimizedEventHandlers = () => {
  const handlers = useRef({});

  const createHandler = useCallback((fn) => {
    if (!handlers.current[fn.toString()]) {
      handlers.current[fn.toString()] = (...args) => fn(...args);
    }
    return handlers.current[fn.toString()];
  }, []);

  return createHandler;
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    if (import.meta.env.DEV) {
      console.log(`🔄 ${componentName} render #${renderCount.current} (${timeSinceLastRender.toFixed(2)}ms)`);
    }
    
    lastRenderTime.current = currentTime;
  });

  return {
    renderCount: renderCount.current,
    timeSinceLastRender: performance.now() - lastRenderTime.current
  };
};

// Hardware acceleration utilities
export const enableHardwareAcceleration = (element) => {
  if (element) {
    element.style.transform = 'translateZ(0)';
    element.style.willChange = 'transform';
  }
};

// Batch state updates for better performance
export const useBatchState = (initialState) => {
  const [state, setState] = useState(initialState);
  const batchRef = useRef([]);
  const timeoutRef = useRef(null);

  const batchUpdate = useCallback((updates) => {
    batchRef.current.push(...updates);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        let newState = { ...prevState };
        batchRef.current.forEach(update => {
          newState = { ...newState, ...update };
        });
        batchRef.current = [];
        return newState;
      });
    }, 16); // One frame at 60fps
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchUpdate];
};

// Optimized list rendering with windowing
export const useOptimizedList = (items, itemHeight = 60, windowSize = 10) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: windowSize });
  
  const updateVisibleRange = useCallback((scrollTop) => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + windowSize, items.length);
    setVisibleRange({ start, end });
  }, [items.length, itemHeight, windowSize]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  return {
    visibleItems,
    updateVisibleRange,
    totalHeight: items.length * itemHeight,
    startIndex: visibleRange.start
  };
};

// Memory cleanup utilities
export const useCleanup = () => {
  const cleanupRef = useRef([]);

  const addCleanup = useCallback((cleanupFn) => {
    cleanupRef.current.push(cleanupFn);
  }, []);

  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(cleanup => cleanup());
      cleanupRef.current = [];
    };
  }, []);

  return addCleanup;
};

// Optimized image loading
export const useOptimizedImage = (src, fallback) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setHasError(true);
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return {
    isLoaded,
    hasError,
    src: hasError ? fallback : src
  };
};

// Reduced motion support
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Optimized scroll handling
export const useOptimizedScroll = (callback, options = {}) => {
  const { throttle = 16, passive = true } = options;
  const callbackRef = useRef(callback);
  const tickingRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleScroll = useCallback((event) => {
    if (!tickingRef.current) {
      requestAnimationFrame(() => {
        callbackRef.current(event);
        tickingRef.current = false;
      });
      tickingRef.current = true;
    }
  }, []);

  useEffect(() => {
    const element = document;
    element.addEventListener('scroll', handleScroll, { passive });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, passive]);

  return handleScroll;
};

// Performance budget monitoring
export const usePerformanceBudget = (budget = 16) => {
  const [isOverBudget, setIsOverBudget] = useState(false);
  const frameTimeRef = useRef(0);

  useEffect(() => {
    let frameId;
    
    const measureFrame = () => {
      const start = performance.now();
      
      frameId = requestAnimationFrame(() => {
        const end = performance.now();
        const frameTime = end - start;
        frameTimeRef.current = frameTime;
        
        setIsOverBudget(frameTime > budget);
        
        measureFrame();
      });
    };
    
    measureFrame();
    
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [budget]);

  return {
    isOverBudget,
    frameTime: frameTimeRef.current
  };
};
 