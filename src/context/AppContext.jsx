import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AppContext = createContext(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Simple function to detect app from URL path
const getAppFromPath = (pathname) => {
  if (pathname.startsWith('/diary')) return 'my-diary';
  if (pathname.startsWith('/coreos')) return 'coreos';
  if (pathname.startsWith('/freedomos')) return 'freedomos';
  return 'money-manager'; // default for /, /expenses, /budgets, /analytics, /settings
};

export const AppProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Simply track current app based on URL - no complex state management
  const currentApp = getAppFromPath(location.pathname);
  
  // Save to localStorage whenever app changes (for persistence)
  useEffect(() => {
    try {
      localStorage.setItem('current_app', currentApp);
    } catch (error) {
      console.warn('Error saving app to localStorage:', error);
    }
  }, [currentApp]);

  // Simple app switcher - just navigates to the app's dashboard
  const switchApp = React.useCallback((appId) => {
    switch (appId) {
      case 'my-diary':
        navigate('/diary');
        break;
      case 'coreos':
        navigate('/coreos');
        break;
      case 'freedomos':
        navigate('/freedomos');
        break;
      case 'money-manager':
      default:
        navigate('/');
        break;
    }
  }, [navigate]);

  // Helper function to get dashboard route for current app
  const getDashboardRoute = React.useCallback(() => {
    switch (currentApp) {
      case 'my-diary': return '/diary';
      case 'coreos': return '/coreos';
      case 'freedomos': return '/freedomos';
      default: return '/';
    }
  }, [currentApp]);

  // Helper function to navigate to current app's dashboard
  const goToDashboard = React.useCallback(() => {
    navigate(getDashboardRoute());
  }, [navigate, getDashboardRoute]);

  // Define apps configuration
  const apps = React.useMemo(() => ({
    'money-manager': {
      id: 'money-manager',
      name: 'Money Manager',
      icon: '💰',
      description: 'Personal Finance Management',
      dashboardRoute: '/'
    },
    'my-diary': {
      id: 'my-diary',
      name: 'My Diary',
      icon: '📖',
      description: 'Personal Journaling & Reflection',
      dashboardRoute: '/diary'
    },
    'coreos': {
      id: 'coreos',
      name: 'CoreOS',
      icon: '⚡',
      description: 'Life Management System',
      dashboardRoute: '/coreos'
    },
    'freedomos': {
      id: 'freedomos',
      name: 'FreedomOS',
      icon: '🏆',
      description: 'Financial Freedom Platform',
      dashboardRoute: '/freedomos'
    }
  }), []);

  // Get current app info with fallback
  const currentAppInfo = React.useMemo(() => {
    return apps[currentApp] || apps['money-manager'];
  }, [apps, currentApp]);

  const value = React.useMemo(() => ({
    currentApp,
    switchApp,
    apps,
    currentAppInfo,
    getDashboardRoute,
    goToDashboard,
    isOnCorrectDashboard: location.pathname === getDashboardRoute()
  }), [currentApp, switchApp, apps, currentAppInfo, getDashboardRoute, goToDashboard, location.pathname]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 