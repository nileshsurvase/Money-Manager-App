// Advanced Analytics & Monitoring System for ClarityOS
import { getUserProfile } from './storage';

// Analytics configuration
const ANALYTICS_CONFIG = {
  // Enable/disable analytics
  enabled: true,
  
  // Batch size for events
  batchSize: 10,
  
  // Flush interval (ms)
  flushInterval: 30000, // 30 seconds
  
  // Session timeout (ms)
  sessionTimeout: 1800000, // 30 minutes
  
  // Performance monitoring
  performanceMonitoring: true,
  
  // Error tracking
  errorTracking: true,
  
  // User behavior tracking
  behaviorTracking: true
};

// Event queue
let eventQueue = [];
let sessionId = null;
let sessionStartTime = null;
let lastActivityTime = null;

// Performance metrics
const performanceMetrics = {
  pageLoadTime: 0,
  renderTime: 0,
  apiCallTimes: new Map(),
  memoryUsage: 0,
  errorCount: 0
};

// User behavior metrics
const behaviorMetrics = {
  clicks: 0,
  scrolls: 0,
  timeSpent: new Map(),
  featureUsage: new Map(),
  navigationPath: []
};

// Initialize analytics
export const initializeAnalytics = () => {
  if (!ANALYTICS_CONFIG.enabled) return;

  try {
    // Generate session ID
    sessionId = generateSessionId();
    sessionStartTime = Date.now();
    lastActivityTime = Date.now();

    // Track page load
    trackPageLoad();

    // Set up event listeners
    setupEventListeners();

    // Set up periodic flush
    setInterval(flushEvents, ANALYTICS_CONFIG.flushInterval);

    // Track session start
    trackEvent('session_start', {
      sessionId,
      timestamp: sessionStartTime,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    console.log('Analytics initialized successfully');
  } catch (error) {
    console.error('Analytics initialization failed:', error);
  }
};

// Generate unique session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Track page load performance
const trackPageLoad = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      performanceMetrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      trackEvent('page_load', {
        loadTime: performanceMetrics.pageLoadTime,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: getFirstPaint(),
        firstContentfulPaint: getFirstContentfulPaint()
      });
    }
  }
};

// Get First Paint timing
const getFirstPaint = () => {
  try {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  } catch (error) {
    return 0;
  }
};

// Get First Contentful Paint timing
const getFirstContentfulPaint = () => {
  try {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  } catch (error) {
    return 0;
  }
};

// Set up event listeners for user behavior
const setupEventListeners = () => {
  if (typeof window === 'undefined') return;

  // Click tracking
  document.addEventListener('click', (event) => {
    behaviorMetrics.clicks++;
    trackUserInteraction('click', {
      element: event.target.tagName,
      className: event.target.className,
      id: event.target.id,
      text: event.target.textContent?.substring(0, 100)
    });
  });

  // Scroll tracking (throttled)
  let scrollTimeout;
  document.addEventListener('scroll', () => {
    behaviorMetrics.scrolls++;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      trackUserInteraction('scroll', {
        scrollY: window.scrollY,
        scrollPercentage: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
      });
    }, 1000);
  });

  // Visibility change tracking
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      trackEvent('page_hidden', { timestamp: Date.now() });
    } else {
      trackEvent('page_visible', { timestamp: Date.now() });
      lastActivityTime = Date.now();
    }
  });

  // Error tracking
  window.addEventListener('error', (event) => {
    trackError({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });

  // Unhandled promise rejection tracking
  window.addEventListener('unhandledrejection', (event) => {
    trackError({
      message: 'Unhandled Promise Rejection',
      reason: event.reason?.toString(),
      stack: event.reason?.stack
    });
  });

  // Performance observer for monitoring
  if ('PerformanceObserver' in window) {
    // Long tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          trackEvent('long_task', {
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task observer not supported:', error);
    }

    // Layout shifts
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            trackEvent('layout_shift', {
              value: entry.value,
              startTime: entry.startTime
            });
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }
  }
};

// Track generic event
export const trackEvent = (eventName, properties = {}) => {
  if (!ANALYTICS_CONFIG.enabled) return;

  const event = {
    id: generateEventId(),
    name: eventName,
    properties: {
      ...properties,
      sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    }
  };

  // Add user info if available
  const user = getUserProfile();
  if (user) {
    event.properties.userId = user.id;
    event.properties.userEmail = user.email;
  }

  eventQueue.push(event);
  lastActivityTime = Date.now();

  // Flush if batch size reached
  if (eventQueue.length >= ANALYTICS_CONFIG.batchSize) {
    flushEvents();
  }
};

// Track user interaction
export const trackUserInteraction = (action, properties = {}) => {
  trackEvent('user_interaction', {
    action,
    ...properties
  });
};

// Track page view
export const trackPageView = (page, properties = {}) => {
  // Update navigation path
  behaviorMetrics.navigationPath.push({
    page,
    timestamp: Date.now()
  });

  // Keep only last 20 pages
  if (behaviorMetrics.navigationPath.length > 20) {
    behaviorMetrics.navigationPath = behaviorMetrics.navigationPath.slice(-20);
  }

  trackEvent('page_view', {
    page,
    ...properties,
    navigationPath: behaviorMetrics.navigationPath.slice(-5) // Last 5 pages
  });
};

// Track feature usage
export const trackFeatureUsage = (feature, action = 'used', properties = {}) => {
  const featureKey = `${feature}_${action}`;
  const currentCount = behaviorMetrics.featureUsage.get(featureKey) || 0;
  behaviorMetrics.featureUsage.set(featureKey, currentCount + 1);

  trackEvent('feature_usage', {
    feature,
    action,
    usageCount: currentCount + 1,
    ...properties
  });
};

// Track API call performance
export const trackApiCall = (endpoint, method, duration, status, error = null) => {
  const apiKey = `${method}_${endpoint}`;
  const calls = performanceMetrics.apiCallTimes.get(apiKey) || [];
  calls.push(duration);
  performanceMetrics.apiCallTimes.set(apiKey, calls);

  trackEvent('api_call', {
    endpoint,
    method,
    duration,
    status,
    error: error?.message,
    averageDuration: calls.reduce((a, b) => a + b, 0) / calls.length
  });
};

// Track error
export const trackError = (error) => {
  performanceMetrics.errorCount++;
  
  trackEvent('error', {
    message: error.message,
    stack: error.stack,
    filename: error.filename,
    lineno: error.lineno,
    colno: error.colno,
    errorCount: performanceMetrics.errorCount,
    userAgent: navigator.userAgent,
    url: window.location.href
  });
};

// Track conversion/goal completion
export const trackConversion = (goal, value = null, properties = {}) => {
  trackEvent('conversion', {
    goal,
    value,
    ...properties
  });
};

// Track time spent on page/feature
export const trackTimeSpent = (page, startTime) => {
  const timeSpent = Date.now() - startTime;
  const currentTime = behaviorMetrics.timeSpent.get(page) || 0;
  behaviorMetrics.timeSpent.set(page, currentTime + timeSpent);

  trackEvent('time_spent', {
    page,
    sessionTime: timeSpent,
    totalTime: currentTime + timeSpent
  });
};

// Get session metrics
export const getSessionMetrics = () => {
  const sessionDuration = Date.now() - sessionStartTime;
  const inactiveTime = lastActivityTime ? Date.now() - lastActivityTime : 0;

  return {
    sessionId,
    sessionDuration,
    inactiveTime,
    isActive: inactiveTime < ANALYTICS_CONFIG.sessionTimeout,
    performance: performanceMetrics,
    behavior: {
      ...behaviorMetrics,
      timeSpent: Object.fromEntries(behaviorMetrics.timeSpent),
      featureUsage: Object.fromEntries(behaviorMetrics.featureUsage)
    }
  };
};

// Flush events to server
const flushEvents = async () => {
  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  try {
    // Send to analytics endpoint
    const response = await fetch('/.netlify/functions/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        events: eventsToSend,
        sessionMetrics: getSessionMetrics()
      })
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }

    console.log(`Flushed ${eventsToSend.length} analytics events`);
  } catch (error) {
    console.error('Failed to send analytics events:', error);
    // Re-queue events for retry
    eventQueue.unshift(...eventsToSend);
  }
};

// Generate unique event ID
const generateEventId = () => {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Memory usage tracking
export const trackMemoryUsage = () => {
  if ('memory' in performance) {
    performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
    
    trackEvent('memory_usage', {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    });
  }
};

// A/B test tracking
export const trackABTest = (testName, variant, converted = false) => {
  trackEvent('ab_test', {
    testName,
    variant,
    converted
  });
};

// Custom metrics tracking
export const trackCustomMetric = (name, value, unit = 'count') => {
  trackEvent('custom_metric', {
    name,
    value,
    unit
  });
};

// Heat map data collection
export const collectHeatmapData = (x, y, element) => {
  trackEvent('heatmap_click', {
    x,
    y,
    element: element.tagName,
    className: element.className,
    viewport: `${window.innerWidth}x${window.innerHeight}`
  });
};

// User journey tracking
export const trackUserJourney = (step, properties = {}) => {
  trackEvent('user_journey', {
    step,
    ...properties
  });
};

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Track session end
    trackEvent('session_end', {
      sessionDuration: Date.now() - sessionStartTime,
      finalMetrics: getSessionMetrics()
    });
    
    // Flush remaining events
    if (eventQueue.length > 0) {
      // Use sendBeacon for reliable delivery
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/.netlify/functions/analytics', JSON.stringify({
          events: eventQueue,
          sessionMetrics: getSessionMetrics()
        }));
      }
    }
  });
}

export default {
  initialize: initializeAnalytics,
  track: trackEvent,
  trackPageView,
  trackFeatureUsage,
  trackApiCall,
  trackError,
  trackConversion,
  trackTimeSpent,
  trackUserInteraction,
  trackMemoryUsage,
  trackABTest,
  trackCustomMetric,
  collectHeatmapData,
  trackUserJourney,
  getSessionMetrics
}; 