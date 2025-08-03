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

// Smooth animations with spring physics
export const smoothAnimations = {
  // Spring configuration for smooth animations
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 25,
    mass: 0.5
  },
  
  // Smooth ease configuration
  ease: {
    duration: 0.3,
    ease: [0.4, 0.0, 0.2, 1]
  },
  
  // Quick snap for interactions
  snap: {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 0.3
  }
};

// Common card animation variants
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

// Stagger animation for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Hover animations
export const hoverAnimation = {
  whileHover: { 
    scale: 1.02,
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

// Hardware acceleration styles
export const enableHardwareAcceleration = {
  transform: 'translate3d(0, 0, 0)',
  backfaceVisibility: 'hidden',
  perspective: 1000,
  willChange: 'transform, opacity'
};

// Optimized scroll hook
export const useOptimizedScroll = (callback, dependencies = []) => {
  const ticking = useRef(false);
  
  const optimizedCallback = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        callback();
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, dependencies);
  
  useEffect(() => {
    window.addEventListener('scroll', optimizedCallback, { passive: true });
    return () => window.removeEventListener('scroll', optimizedCallback);
  }, [optimizedCallback]);
};

// Resize observer hook for performance
export const useOptimizedResize = (callback, dependencies = []) => {
  const resizeObserver = useRef(null);
  
  const optimizedCallback = useCallback(
    useMemo(() => {
      let timeout;
      return () => {
        clearTimeout(timeout);
        timeout = setTimeout(callback, 100);
      };
    }, dependencies),
    dependencies
  );
  
  useEffect(() => {
    window.addEventListener('resize', optimizedCallback, { passive: true });
    return () => {
      window.removeEventListener('resize', optimizedCallback);
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, [optimizedCallback]);
};

// Memoized component wrapper
export const withOptimization = (Component) => {
  return React.memo(Component, (prevProps, nextProps) => {
    // Custom comparison for better performance
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }
    
    return prevKeys.every(key => {
      if (typeof prevProps[key] === 'function' && typeof nextProps[key] === 'function') {
        return prevProps[key].toString() === nextProps[key].toString();
      }
      return prevProps[key] === nextProps[key];
    });
  });
};

// Smooth state transitions
export const useSmoothState = (initialValue, transitionDuration = 300) => {
  const [state, setState] = useState(initialValue);
  const [transitioning, setTransitioning] = useState(false);
  
  const setSmoothState = useCallback((newValue) => {
    setTransitioning(true);
    
    // Use requestAnimationFrame for smooth transitions
    requestAnimationFrame(() => {
      setState(newValue);
      
      setTimeout(() => {
        setTransitioning(false);
      }, transitionDuration);
    });
  }, [transitionDuration]);

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