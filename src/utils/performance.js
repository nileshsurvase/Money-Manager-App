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

// Optimized animation configuration for smooth 60fps
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
 