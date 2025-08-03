import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nilesh.clarityos',
  appName: 'ClarityOS',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    allowNavigation: [
      '*.netlify.app',
      '*.netlify.com',
      'localhost',
      '*.clarityos.com'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ff6b35',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ff6b35'
    },
    App: {
      allowMixedContent: true
    },
    Filesystem: {
      ioTimeout: 30000
    },
    LocalStorage: {
      persist: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: 'ClarityOS-Mobile',
    overrideUserAgent: undefined,
    backgroundColor: '#ff6b35',
    loggingBehavior: 'none',
    useLegacyBridge: false
  }
};

export default config;
