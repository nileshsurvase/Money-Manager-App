// Mobile utility functions for Capacitor app
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Toast } from '@capacitor/toast'
import { Share } from '@capacitor/share'

// Platform detection
export const isMobile = () => Capacitor.isNativePlatform()
export const isAndroid = () => Capacitor.getPlatform() === 'android'
export const isIOS = () => Capacitor.getPlatform() === 'ios'
export const isWeb = () => Capacitor.getPlatform() === 'web'

// Get platform info
export const getPlatformInfo = () => {
  return {
    platform: Capacitor.getPlatform(),
    isMobile: isMobile(),
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isWeb: isWeb()
  }
}

// Haptic feedback for better mobile UX
export const triggerHaptic = async (style = 'light') => {
  if (!isMobile()) return
  
  try {
    const impactStyle = style === 'heavy' ? ImpactStyle.Heavy : 
                      style === 'medium' ? ImpactStyle.Medium : 
                      ImpactStyle.Light
    
    await Haptics.impact({ style: impactStyle })
  } catch (error) {
    console.warn('Haptics not available:', error)
  }
}

// Native toast notifications
export const showNativeToast = async (message, duration = 'short') => {
  if (!isMobile()) {
    // Fallback to web toast (you might want to use react-hot-toast here)
    console.log('Toast:', message)
    return
  }
  
  try {
    await Toast.show({
      text: message,
      duration: duration === 'long' ? 'long' : 'short',
      position: 'bottom'
    })
  } catch (error) {
    console.warn('Native toast not available:', error)
  }
}

// Native sharing
export const shareContent = async (title, text, url = null) => {
  if (!isMobile()) {
    // Fallback to web share API or copy to clipboard
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return true
      } catch (error) {
        console.warn('Web share failed:', error)
      }
    }
    
    // Fallback: copy to clipboard
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${title}\n${text}${url ? '\n' + url : ''}`)
      return true
    }
    
    return false
  }
  
  try {
    await Share.share({
      title,
      text,
      url,
      dialogTitle: 'Share via'
    })
    return true
  } catch (error) {
    console.warn('Native share not available:', error)
    return false
  }
}

// Mobile-optimized storage
export const getMobileStorage = () => {
  if (isMobile()) {
    // Use localStorage for mobile app (it's persistent in Capacitor)
    return {
      getItem: (key) => localStorage.getItem(key),
      setItem: (key, value) => localStorage.setItem(key, value),
      removeItem: (key) => localStorage.removeItem(key),
      clear: () => localStorage.clear()
    }
  }
  return localStorage
}

// Screen orientation utilities
export const getScreenInfo = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    isSmallScreen: window.innerWidth < 768,
    isMediumScreen: window.innerWidth >= 768 && window.innerWidth < 1024,
    isLargeScreen: window.innerWidth >= 1024
  }
}

// Safe area utilities for notched phones
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement)
  return {
    top: style.getPropertyValue('--safe-area-inset-top') || '0px',
    bottom: style.getPropertyValue('--safe-area-inset-bottom') || '0px',
    left: style.getPropertyValue('--safe-area-inset-left') || '0px',
    right: style.getPropertyValue('--safe-area-inset-right') || '0px'
  }
}

// Mobile-specific event handlers
export const addMobileEventListeners = () => {
  if (!isMobile()) return
  
  // Handle back button on Android
  document.addEventListener('backbutton', (e) => {
    e.preventDefault()
    // You can customize back button behavior here
    window.history.back()
  })
  
  // Handle pause/resume events
  document.addEventListener('pause', () => {
    console.log('App paused')
    // Save any important data here
  })
  
  document.addEventListener('resume', () => {
    console.log('App resumed')
    // Refresh data if needed
  })
}

// Device info
export const getDeviceInfo = async () => {
  if (!isMobile()) {
    return {
      platform: 'web',
      model: 'Browser',
      version: navigator.userAgent
    }
  }
  
  try {
    const { Device } = await import('@capacitor/device')
    return await Device.getInfo()
  } catch (error) {
    console.warn('Device info not available:', error)
    return {
      platform: Capacitor.getPlatform(),
      model: 'Unknown',
      version: 'Unknown'
    }
  }
}

// Export all utilities
export default {
  isMobile,
  isAndroid,
  isIOS,
  isWeb,
  getPlatformInfo,
  triggerHaptic,
  showNativeToast,
  shareContent,
  getMobileStorage,
  getScreenInfo,
  getSafeAreaInsets,
  addMobileEventListeners,
  getDeviceInfo
}