import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Capacitor imports for mobile
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

// Data persistence import
import { initializeDataPersistence } from './utils/dataPersistence'

// Initialize mobile app and data persistence
const initializeApp = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Set status bar style for mobile
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#ff6b35' })
      
      // Hide splash screen
      await SplashScreen.hide()
      
      console.log('📱 Mobile app initialized successfully!')
    }

    // Initialize data persistence for all platforms
    console.log('🔄 Initializing data persistence...')
    await initializeDataPersistence()
    console.log('✅ Data persistence initialized - your data is protected!')
    
  } catch (error) {
    console.error('❌ App initialization error:', error)
    // Continue app startup even if data persistence fails
  }
}

// Initialize performance monitoring
if (import.meta.env.PROD && 'performance' in window) {
  // Basic performance monitoring without external dependencies
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        console.log('🚀 Performance Metrics:', {
          'Page Load Time': `${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`,
          'DOM Content Loaded': `${Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart)}ms`,
          'First Paint': performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 'N/A',
          'Memory Usage': performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB` : 'N/A',
          'Platform': Capacitor.getPlatform()
        });
      }
    }, 0);
  });
}

// Initialize mobile features
initializeApp()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
