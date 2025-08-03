// Performance utilities for butter smooth React experience with 60fps animations
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Performance monitoring and FPS tracking
export const performanceMonitor = {
  frameCount: 0,
  lastTime: performance.now(),
  fps: 60,
  
  startMonitoring() {
    const measureFPS = (currentTime) => {
      this.frameCount++;
      if (currentTime >= this.lastTime + 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
      requestAnimationFrame(measureFPS);
    };
    requestAnimationFrame(measureFPS);
  }
};

// Hardware acceleration CSS properties
export const hardwareAcceleration = {
  transform: 'translateZ(0)',
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden',
  perspective: '1000px',
  WebkitTransform: 'translateZ(0)',
  WebkitBackfaceVisibility: 'hidden',
  WebkitPerspective: '1000px'
};

// Device-specific animation preferences
export const getAnimationLevel = () => {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'reduced';
  }
  
  // Check device performance
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const slowConnection = connection && (connection.downlink < 1.5 || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
  const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  
  if (slowConnection || lowMemory || lowCores) {
    return 'performance';
  }
  
  return 'full';
};

// RAF-based throttle for 60fps updates
export const useRAFThrottle = (callback) => {
  const callbackRef = useRef(callback);
  const frameRef = useRef();
  
  callbackRef.current = callback;
  
  return useCallback((...args) => {
    if (frameRef.current) return;
    
    frameRef.current = requestAnimationFrame(() => {
      callbackRef.current(...args);
      frameRef.current = null;
    });
  }, []);
};

// Optimized debounce with immediate first call
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      setDebouncedValue(value);
      firstRun.current = false;
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Ultra-smooth 60fps animations with hardware acceleration
export const smoothAnimations = {
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 25,
    mass: 0.5,
    velocity: 0
  },
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] // Custom cubic-bezier for smoothness
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

// Intelligent card animation with device adaptation
export const cardAnimation = (() => {
  const animationLevel = getAnimationLevel();
  
  if (animationLevel === 'reduced') {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, transition: { duration: 0.1 } }
    };
  }
  
  if (animationLevel === 'performance') {
    return {
      initial: { opacity: 0, y: 10 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" }
      },
      exit: { 
        opacity: 0, 
        y: -5,
        transition: { duration: 0.15 }
      }
    };
  }
  
  // Full animations with hardware acceleration
  return {
    initial: { 
      opacity: 0, 
      scale: 0.96, 
      y: 20,
      ...hardwareAcceleration
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.4,
        velocity: 0
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.96, 
      y: -10,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };
})();

// Optimized staggered animation with adaptive timing
export const staggerContainer = (() => {
  const animationLevel = getAnimationLevel();
  
  return {
    animate: {
      transition: {
        staggerChildren: animationLevel === 'reduced' ? 0 : animationLevel === 'performance' ? 0.03 : 0.05,
        delayChildren: animationLevel === 'reduced' ? 0 : 0.1
      }
    }
  };
})();

// Ultra-smooth hover with touch optimization
export const hoverAnimation = (() => {
  const animationLevel = getAnimationLevel();
  const isTouchDevice = 'ontouchstart' in window;
  
  if (animationLevel === 'reduced' || isTouchDevice) {
    return {
      whileHover: { scale: 1.01, transition: { duration: 0.1 } },
      whileTap: { scale: 0.99, transition: { duration: 0.05 } }
    };
  }
  
  return {
    whileHover: { 
      scale: 1.02,
      y: -2,
      ...hardwareAcceleration,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.3
      }
    },
    whileTap: { 
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 30,
        mass: 0.2
      }
    }
  };
})();

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

// Touch-optimized event handlers with passive listeners
export const useOptimizedTouchHandlers = () => {
  const handlers = useRef({});

  const createTouchHandler = useCallback((fn, options = {}) => {
    const key = `${fn.toString()}_${JSON.stringify(options)}`;
    
    if (!handlers.current[key]) {
      handlers.current[key] = (event) => {
        // Prevent default for touch events if needed
        if (options.preventDefault && event.cancelable) {
          event.preventDefault();
        }
        
        // Use RAF for smooth updates
        requestAnimationFrame(() => fn(event));
      };
    }
    
    return handlers.current[key];
  }, []);

  return createTouchHandler;
};

// Smooth scroll optimization with momentum
export const useSmoothScroll = () => {
  const scrollRef = useRef();
  
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    
    // Enable smooth scrolling with momentum
    element.style.webkitOverflowScrolling = 'touch';
    element.style.scrollBehavior = 'smooth';
    element.style.overscrollBehavior = 'contain';
    
    // Add scroll optimization
    element.addEventListener('scroll', (e) => {
      e.target.style.pointerEvents = 'none';
      clearTimeout(e.target.scrollTimer);
      e.target.scrollTimer = setTimeout(() => {
        e.target.style.pointerEvents = 'auto';
      }, 150);
    }, { passive: true });
    
    return () => {
      if (element.scrollTimer) {
        clearTimeout(element.scrollTimer);
      }
    };
  }, []);
  
  return scrollRef;
};

// Performance-optimized intersection observer
export const usePerformantIntersectionObserver = (callback, options = {}) => {
  const elementRef = useRef();
  const callbackRef = useRef(callback);
  
  callbackRef.current = callback;
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver((entries) => {
      // Use RAF for smooth callback execution
      requestAnimationFrame(() => {
        callbackRef.current(entries);
      });
    }, {
      threshold: 0.1,
      rootMargin: '20px',
      ...options
    });
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, []);
  
  return elementRef;
};

// Mobile-specific performance optimizations
export const mobilePerfOptimizations = {
  // Touch action optimization
  touchAction: 'manipulation',
  
  // Prevent text selection on touch
  userSelect: 'none',
  WebkitUserSelect: 'none',
  
  // Optimize tap highlight
  WebkitTapHighlightColor: 'transparent',
  
  // Enable hardware acceleration
  ...hardwareAcceleration,
  
  // Optimize font rendering
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  
  // Prevent overscroll
  overscrollBehavior: 'contain'
};

// Gesture-optimized event listeners
export const useGestureOptimization = () => {
  useEffect(() => {
    // Add passive event listeners for better scroll performance
    const options = { passive: true };
    
    document.addEventListener('touchstart', () => {}, options);
    document.addEventListener('touchmove', () => {}, options);
    document.addEventListener('wheel', () => {}, options);
    
    // Optimize viewport for mobile
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    
    // Start performance monitoring
    performanceMonitor.startMonitoring();
    
    return () => {
      // Cleanup if needed
    };
  }, []);
};

// High-performance animation frame hook
export const useAnimationFrame = (callback) => {
  const callbackRef = useRef(callback);
  const frameRef = useRef();
  
  callbackRef.current = callback;
  
  const animate = useCallback(() => {
    callbackRef.current();
    frameRef.current = requestAnimationFrame(animate);
  }, []);
  
  useEffect(() => {
    frameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [animate]);
  
  return () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  };
};

// Batched DOM updates for smooth performance
export const useBatchedUpdates = () => {
  const updates = useRef([]);
  const rafRef = useRef();
  
  const batchUpdate = useCallback((updateFn) => {
    updates.current.push(updateFn);
    
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        updates.current.forEach(fn => fn());
        updates.current = [];
        rafRef.current = null;
      });
    }
  }, []);
  
  return batchUpdate;
};
 