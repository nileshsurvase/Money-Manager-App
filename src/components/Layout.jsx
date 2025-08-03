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


const Layout = memo(({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appDropdownOpen, setAppDropdownOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { currentApp, switchApp, apps, currentAppInfo } = useApp();
  const location = useLocation();
  const dropdownRef = useRef(null);

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
    { name: 'GoalOS', href: '/coreos/goalos', icon: Target },
    { name: 'Analytics', href: '/coreos/analytics', icon: BarChart3 },
    { name: 'Goal Integration', href: '/coreos/goal-integration', icon: Flag },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // FreedomOS Navigation
  const freedomosNavigation = [
    { name: 'Dashboard', href: '/freedomos', icon: Home },
    { name: 'Budgeting Engine', href: '/freedomos/budgeting', icon: PiggyBank },
    { name: 'Emergency Fund Builder', href: '/freedomos/emergency-fund', icon: Shield },
    { name: 'Loan Crusher', href: '/freedomos/loans', icon: CreditCard },
    { name: 'Insurance Suite', href: '/freedomos/insurance', icon: Heart },
    { name: 'Wealth Creation', href: '/freedomos/wealth', icon: TrendingUp },
    { name: 'Goal Planning', href: '/freedomos/goals', icon: Target },
    { name: 'Retirement Lab', href: '/freedomos/retirement', icon: Award },
    { name: 'Tax Optimization', href: '/freedomos/tax', icon: FileText },
    { name: 'Net Worth Tracker', href: '/freedomos/networth', icon: BarChart3 },
    { name: 'Annual Wealth Check', href: '/freedomos/wealth-check', icon: Calendar },
  ];

  // Get current navigation based on active app
  const getCurrentNavigation = () => {
    switch (currentApp) {
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

  const handleAppSwitch = useCallback((appId) => {
    switchApp(appId);
    setAppDropdownOpen(false);
    setSidebarOpen(false);
  }, [switchApp]);

  const sidebarVariants = {
    open: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    },
    closed: { 
      x: '-100%', 
      opacity: 0,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      currentApp === 'my-diary'
        ? 'bg-gradient-to-br from-gray-50 via-emerald-50/20 to-green-50/20 dark:from-gray-950 dark:via-emerald-950/30 dark:to-gray-900'
        : currentApp === 'goals'
        ? 'bg-gradient-to-br from-gray-50 via-violet-50/20 to-purple-50/20 dark:from-gray-950 dark:via-violet-950/30 dark:to-gray-900'
        : currentApp === 'freedomos'
        ? 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-yellow-50/20 dark:from-gray-950 dark:via-blue-950/40 dark:to-yellow-950/20'
        : 'bg-gradient-to-br from-gray-50 via-orange-50/20 to-red-50/20 dark:from-gray-950 dark:via-orange-950/30 dark:to-gray-900'
    }`}>
      
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar - Reduced width for better content space */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex grow flex-col gap-y-4 overflow-y-auto backdrop-blur-xl shadow-2xl ${
          currentApp === 'my-diary'
            ? 'bg-white/80 dark:bg-gray-900/80 border-r border-emerald-200/20 dark:border-emerald-700/30'
            : currentApp === 'goals'
            ? 'bg-white/80 dark:bg-gray-900/80 border-r border-violet-200/20 dark:border-violet-700/30'
            : 'bg-white/80 dark:bg-gray-900/80 border-r border-orange-200/20 dark:border-orange-700/30'
        }`}>
          
          {/* Logo Section with App Switcher */}
          <div className="flex h-20 shrink-0 items-center px-6 border-b border-orange-200/20 dark:border-gray-700/30">
            <div className="relative w-full" ref={dropdownRef}>
              <motion.button
                onClick={() => setAppDropdownOpen(!appDropdownOpen)}
                className="flex items-center justify-between w-full space-x-3 p-2 rounded-xl hover:bg-orange-50/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-orange-500 to-orange-600">
                    <span className="text-white text-lg">⚡</span>
                  </div>
                  <div className="text-left">
                    <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400">
                      ClarityOS
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Life Operating System • {currentAppInfo.name}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  appDropdownOpen ? 'rotate-180' : ''
                }`} />
              </motion.button>

              {/* App Switcher Dropdown */}
              <AnimatePresence>
                {appDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl border border-orange-200/30 dark:border-gray-700/30 shadow-2xl z-50 overflow-hidden"
                  >
                    {Object.values(apps).map((app) => (
                      <motion.button
                        key={app.id}
                        onClick={() => handleAppSwitch(app.id)}
                        className={`w-full flex items-center space-x-3 p-4 text-left transition-all duration-200 ${
                          currentApp === app.id
                            ? 'bg-orange-50 dark:bg-gray-800/50 text-orange-600 dark:text-orange-400'
                            : 'hover:bg-orange-50/50 dark:hover:bg-gray-800/30 text-gray-700 dark:text-gray-300'
                        }`}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
                          app.id === 'my-diary' 
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                            : app.id === 'goals'
                            ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                            : 'bg-gradient-to-br from-orange-500 to-red-500'
                        }`}>
                          {app.id === 'my-diary' ? (
                            <span className="text-white text-sm">📖</span>
                          ) : app.id === 'goals' ? (
                            <span className="text-white text-sm">🎯</span>
                          ) : (
                            <span className="text-white text-sm">💰</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{app.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{app.description}</p>
                        </div>
                        {currentApp === app.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto w-2 h-2 bg-orange-500 rounded-full"
                          />
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Google Auth Section */}
          <div className="px-4">
            <GoogleAuthButton />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-6">
            <ul className="space-y-2">
              {currentNavigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                          isActive
                            ? currentApp === 'my-diary'
                              ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25'
                              : currentApp === 'goals'
                              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                              : 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/25'
                            : currentApp === 'my-diary'
                            ? 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                            : currentApp === 'goals'
                            ? 'text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-gray-800/50 hover:text-violet-600 dark:hover:text-violet-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800/50 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                      >
                        <item.icon className={`mr-3 h-5 w-5 transition-colors duration-300 ${
                          isActive ? 'text-white' : currentApp === 'my-diary'
                            ? 'text-gray-500 dark:text-gray-400 group-hover:text-emerald-600'
                            : currentApp === 'goals'
                            ? 'text-gray-500 dark:text-gray-400 group-hover:text-violet-600'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-orange-600'
                        }`} />
                        {item.name}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute right-2 w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </Link>
                    </motion.div>
                  </li>
                );
              })}
            </ul>



            {/* Theme Toggle & Premium Badge */}
            <div className="space-y-4">
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-300 ${
                  currentApp === 'my-diary'
                    ? 'hover:bg-emerald-50 dark:hover:bg-gray-800/50'
                    : currentApp === 'goals'
                    ? 'hover:bg-violet-50 dark:hover:bg-gray-800/50'
                    : 'hover:bg-orange-50 dark:hover:bg-gray-800/50'
                }`}
              >
                {isDark ? (
                  <Sun className="mr-3 h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="mr-3 h-5 w-5 text-blue-500" />
                )}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </motion.button>

              {/* Premium Badge */}
              <motion.div 
                className={`rounded-xl p-4 text-center shadow-lg ${
                  currentApp === 'my-diary'
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600'
                    : currentApp === 'goals'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600'
                    : 'bg-gradient-to-r from-orange-600 to-red-600'
                }`}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="text-white text-sm font-bold flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Premium Features
                </div>
                <p className="text-white/90 text-xs mt-1">
                  Cloud sync & analytics
                </p>
              </motion.div>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-orange-200/20 dark:border-gray-700/30 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col h-full">
              
              {/* Mobile Header with App Switcher */}
              <div className="flex h-20 items-center justify-between px-6 border-b border-orange-200/20 dark:border-gray-700/30">
                <div className="flex items-center space-x-3 flex-1">
                  <motion.button
                    onClick={() => setAppDropdownOpen(!appDropdownOpen)}
                    className="flex items-center space-x-3 p-1 rounded-lg hover:bg-orange-50/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md bg-gradient-to-br from-orange-500 to-orange-600">
                      <span className="text-white text-sm">⚡</span>
                    </div>
                    <div className="text-left">
                      <h1 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400">
                        ClarityOS
                      </h1>
                    </div>
                    <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${
                      appDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </motion.button>
                </div>
                
                <motion.button
                  onClick={() => setSidebarOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Mobile App Switcher Dropdown */}
              <AnimatePresence>
                {appDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-orange-200/20 dark:border-gray-700/30 bg-orange-50/30 dark:bg-gray-800/30"
                  >
                    {Object.values(apps).map((app) => (
                      <motion.button
                        key={app.id}
                        onClick={() => handleAppSwitch(app.id)}
                        className={`w-full flex items-center space-x-3 p-4 text-left transition-all duration-200 ${
                          currentApp === app.id
                            ? 'bg-orange-100 dark:bg-gray-700/50 text-orange-600 dark:text-orange-400'
                            : 'hover:bg-orange-100/50 dark:hover:bg-gray-700/30 text-gray-700 dark:text-gray-300'
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
                          app.id === 'my-diary' 
                            ? 'bg-gradient-to-br from-emerald-600 to-green-700' 
                            : app.id === 'goals'
                            ? 'bg-gradient-to-br from-violet-600 to-purple-700'
                            : 'bg-gradient-to-br from-orange-600 to-red-700'
                        }`}>
                          {app.id === 'my-diary' ? (
                            <span className="text-white text-lg">📖</span>
                          ) : app.id === 'goals' ? (
                            <span className="text-white text-lg">🎯</span>
                          ) : (
                            <span className="text-white text-lg">💰</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{app.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{app.description}</p>
                        </div>
                        {currentApp === app.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`ml-auto w-2 h-2 rounded-full ${
                              app.id === 'my-diary' 
                                ? 'bg-emerald-600' 
                                : app.id === 'goals'
                                ? 'bg-violet-600'
                                : 'bg-orange-600'
                            }`}
                          />
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Auth */}
              <div className="px-4 py-4 border-b border-orange-200/20 dark:border-gray-700/30">
                <GoogleAuthButton />
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 px-4 py-4">
                <ul className="space-y-2">
                  {currentNavigation.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                              isActive
                                ? currentApp === 'my-diary'
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                                  : currentApp === 'goals'
                                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                : currentApp === 'my-diary'
                                ? 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800/50'
                                : currentApp === 'goals'
                                ? 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800/50'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800/50'
                            }`}
                          >
                            <item.icon className={`mr-3 h-5 w-5 ${
                              isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                            }`} />
                            {item.name}
                          </Link>
                        </motion.div>
                      </li>
                    );
                  })}
                </ul>



                {/* Mobile Theme Toggle */}
                <motion.button
                  onClick={toggleTheme}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center px-4 py-3 mt-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300"
                >
                  {isDark ? (
                    <Sun className="mr-3 h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="mr-3 h-5 w-5 text-blue-500" />
                  )}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </motion.button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:pl-64 relative">
        
        {/* Header Content */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
          {/* Mobile menu button */}
          <motion.button
            onClick={() => setSidebarOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </motion.button>

          {/* ClarityOS Logo and Brand - Always Visible */}
          <div className="flex items-center space-x-3 flex-1 lg:flex-none min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 flex-shrink-0">
              <span className="text-white text-xl">⚡</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 truncate">
                ClarityOS
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                Life Operating System • {currentAppInfo.name}
              </p>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout; 