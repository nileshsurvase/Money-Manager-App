import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Capacitor imports for mobile
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

// Performance optimization imports
import { performanceMonitor, useGestureOptimization } from './utils/performance'

// Initialize performance optimizations
const initializePerformance = () => {
  // Start FPS monitoring
  performanceMonitor.startMonitoring()
  
  // Set up gesture optimization for touch devices
  if ('ontouchstart' in window) {
    // Add passive touch listeners for better performance
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
  }
  
  // Apply global performance styles
  document.documentElement.style.transform = 'translateZ(0)';
  document.body.style.transform = 'translateZ(0)';
  
  console.log('⚡ Performance optimizations initialized!');
}

// Initialize mobile app
const initializeApp = async () => {
  // Initialize performance first
  initializePerformance()
  
  if (Capacitor.isNativePlatform()) {
    try {
      // Set status bar style for mobile
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#ff6b35' })
      
      // Hide splash screen
      await SplashScreen.hide()
      
      console.log('📱 Mobile app initialized successfully!')
    } catch (error) {
      console.warn('Mobile initialization warning:', error)
    }
  }
}

// Initialize performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        console.log('🚀 Performance Metrics:', {
          'Page Load Time': `${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`,
          'DOM Content Loaded': `${Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart)}ms`,
          'First Paint': performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 'N/A',
          'Memory Usage': performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB` : 'N/A',
          'Platform': Capacitor.getPlatform(),
          'Current FPS': performanceMonitor.fps,
          'Touch Optimized': 'ontouchstart' in window ? 'Yes' : 'No'
        });
      }
    }, 1000);
  });
  
  // Monitor FPS in development
  if (import.meta.env.DEV) {
    setInterval(() => {
      if (performanceMonitor.fps < 50) {
        console.warn(`⚠️ Low FPS detected: ${performanceMonitor.fps}fps`);
      }
    }, 5000);
  }
}

// Initialize mobile features
initializeApp()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
