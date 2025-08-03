import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Receipt, 
  Target, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
  BookOpen,
  Calendar,
  PenTool,
  Bookmark,
  TrendingUp,
  Clock,
  Flag,
  Trophy,
  CheckSquare,
  Zap,
  Brain,
  DollarSign,
  PiggyBank,
  Shield,
  Heart,
  CreditCard,
  Banknote,
  Crown,
  TrendingDown,
  Activity,
  Smile,
  Timer,
  Plus,
  Award,
  FileText
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import GoogleAuthButton from './GoogleAuthButton';
import { usePerformanceMonitor, useReducedMotion } from '../utils/performance';

const Layout = memo(({ children }) => {
  // Performance monitoring
  usePerformanceMonitor('Layout');
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appDropdownOpen, setAppDropdownOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { currentApp, switchApp, apps, currentAppInfo } = useApp();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // Close dropdown when sidebar closes
  useEffect(() => {
    if (!sidebarOpen) {
      setAppDropdownOpen(false);
    }
  }, [sidebarOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAppDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Money Manager Navigation
  const moneyManagerNavigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Budgets', href: '/budgets', icon: Target },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // My Diary Navigation
  const diaryNavigation = [
    { name: 'Dashboard', href: '/diary', icon: Home },
    { name: 'Daily Journal', href: '/diary/daily', icon: BookOpen },
    { name: 'Weekly Journal', href: '/diary/weekly', icon: Calendar },
    { name: 'Monthly Journal', href: '/diary/monthly', icon: Clock },
    { name: 'Calendar View', href: '/diary/calendar', icon: Calendar },
    { name: 'Recent Entries', href: '/diary/recent-entries', icon: Clock },
    { name: 'Analytics', href: '/diary/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/diary/settings', icon: Settings },
  ];

  // CoreOS Navigation
  const coreosNavigation = [
    { name: 'Dashboard', href: '/coreos', icon: Home },
    { name: 'Daily Tasks', href: '/coreos/tasks', icon: CheckSquare },
    { name: 'Fitness', href: '/coreos/fitness', icon: Activity },
    { name: 'Mental Reset', href: '/coreos/mental', icon: Smile },
    { name: 'Analytics', href: '/coreos/analytics', icon: BarChart3 },
    { name: 'Goal Integration', href: '/coreos/goal-integration', icon: Flag },
    { name: 'GoalOS', href: '/coreos/goalos', icon: Award },
  ];

  // FreedomOS Navigation
  const freedomosNavigation = [
    { name: 'Dashboard', href: '/freedomos', icon: Home },
    { name: 'Budgeting Engine', href: '/freedomos/budgeting', icon: DollarSign },
    { name: 'Emergency Fund', href: '/freedomos/emergency-fund', icon: Shield },
    { name: 'Loan Crusher', href: '/freedomos/loans', icon: CreditCard },
    { name: 'Wealth Creation', href: '/freedomos/wealth', icon: TrendingUp },
    { name: 'Goal Planning', href: '/freedomos/goals', icon: Target },
    { name: 'Insurance Suite', href: '/freedomos/insurance', icon: Heart },
    { name: 'Retirement Lab', href: '/freedomos/retirement', icon: Crown },
    { name: 'Tax Optimization', href: '/freedomos/tax', icon: FileText },
    { name: 'Net Worth Tracker', href: '/freedomos/net-worth', icon: Banknote },
    { name: 'Annual Wealth Check', href: '/freedomos/annual-check', icon: Award },
  ];

  const getCurrentNavigation = () => {
    switch (currentApp) {
      case 'money-manager':
        return moneyManagerNavigation;
      case 'my-diary':
        return diaryNavigation;
      case 'coreos':
        return coreosNavigation;
      case 'freedomos':
        return freedomosNavigation;
      default:
        return moneyManagerNavigation;
    }
  };

  const currentNavigation = getCurrentNavigation();

  // Optimized event handlers
  const handleAppSwitch = useCallback((appId) => {
    switchApp(appId);
    setAppDropdownOpen(false);
    setSidebarOpen(false);
  }, [switchApp]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const toggleAppDropdown = useCallback(() => {
    setAppDropdownOpen(prev => !prev);
  }, []);

  const toggleThemeHandler = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // Animation variants optimized for performance
  const sidebarVariants = {
    closed: { x: '-100%' },
    open: { x: 0 }
  };

  const overlayVariants = {
    closed: { opacity: 0, pointerEvents: 'none' },
    open: { opacity: 1, pointerEvents: 'auto' }
  };

  const navItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-green-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: prefersReducedMotion ? 0 : 0.3 
            }}
            className="fixed left-0 top-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 z-50 lg:hidden"
            style={{ transform: 'translateZ(0)' }}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      ClarityOS
                    </h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Life Operating System
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* App Switcher */}
              <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleAppDropdown}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        currentApp === 'my-diary' 
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                          : currentApp === 'coreos'
                          ? 'bg-gradient-to-br from-purple-400 to-purple-500'
                          : currentApp === 'freedomos'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-orange-500 to-red-600'
                      }`}>
                        <span className="text-white text-sm">
                          {currentApp === 'my-diary' ? '📖' : 
                           currentApp === 'coreos' ? '😊' :
                           currentApp === 'freedomos' ? '🏆' : '💰'}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {currentAppInfo.name}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${appDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {appDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-10"
                      >
                        {apps.map((app) => (
                          <button
                            key={app.id}
                            onClick={() => handleAppSwitch(app.id)}
                            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              app.id === 'my-diary' 
                                ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                                : app.id === 'coreos'
                                ? 'bg-gradient-to-br from-purple-400 to-purple-500'
                                : app.id === 'freedomos'
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                : 'bg-gradient-to-br from-orange-500 to-red-600'
                            }`}>
                              <span className="text-white text-sm">{app.icon}</span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {app.name}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {currentNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      variants={navItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                    >
                      <Link
                        to={item.href}
                        onClick={toggleSidebar}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  onClick={toggleThemeHandler}
                  className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="font-medium">
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
          <div className="flex flex-col flex-grow bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50">
            {/* Desktop Sidebar Content - Same as mobile but without overlay */}
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      ClarityOS
                    </h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Life Operating System
                    </p>
                  </div>
                </div>
              </div>

              {/* App Switcher */}
              <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleAppDropdown}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        currentApp === 'my-diary' 
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                          : currentApp === 'coreos'
                          ? 'bg-gradient-to-br from-purple-400 to-purple-500'
                          : currentApp === 'freedomos'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-orange-500 to-red-600'
                      }`}>
                        <span className="text-white text-sm">
                          {currentApp === 'my-diary' ? '📖' : 
                           currentApp === 'coreos' ? '😊' :
                           currentApp === 'freedomos' ? '🏆' : '💰'}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {currentAppInfo.name}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${appDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {appDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-10"
                      >
                        {apps.map((app) => (
                          <button
                            key={app.id}
                            onClick={() => handleAppSwitch(app.id)}
                            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              app.id === 'my-diary' 
                                ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                                : app.id === 'coreos'
                                ? 'bg-gradient-to-br from-purple-400 to-purple-500'
                                : app.id === 'freedomos'
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                : 'bg-gradient-to-br from-orange-500 to-red-600'
                            }`}>
                              <span className="text-white text-sm">{app.icon}</span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {app.name}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {currentNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  onClick={toggleThemeHandler}
                  className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="font-medium">
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-80">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
            <div className="flex items-center space-x-3 flex-1 lg:flex-none min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                currentApp === 'my-diary' 
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                  : currentApp === 'coreos'
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                  : currentApp === 'freedomos'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-orange-500 to-red-600'
              } flex-shrink-0`}>
                <span className="text-white text-xl">
                  {currentApp === 'my-diary' ? '📖' : 
                   currentApp === 'coreos' ? '😊' :
                   currentApp === 'freedomos' ? '🏆' : '💰'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={`text-lg font-bold bg-clip-text text-transparent truncate ${
                  currentApp === 'my-diary'
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400'
                    : currentApp === 'coreos'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400'
                    : currentApp === 'freedomos'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400'
                }`}>
                  {currentAppInfo.name}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  Powered by ClarityOS
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleThemeHandler}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout; 