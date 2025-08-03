import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, User, LogOut, Sparkles } from 'lucide-react';
import { getUserProfile, saveUserProfile, clearUserProfile } from '../utils/storage';
import { setupDatabase, syncLocalDataToDatabase } from '../utils/database';

const GoogleAuthButton = () => {
  const [user, setUser] = useState(getUserProfile());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !user) {
      handleOAuthCallback(code);
    }
  }, [user]);

  const handleOAuthCallback = async (code) => {
    setLoading(true);
    try {
      // Use Netlify function for secure token exchange
      const isDev = window.location.hostname === 'localhost';
      const baseUrl = isDev ? '' : ''; // In dev, Netlify dev proxies functions correctly
      const response = await fetch(`${baseUrl}/.netlify/functions/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.user && data.tokens) {
        const userProfile = {
          id: 'google_' + data.user.id,
          email: data.user.email,
          name: data.user.name,
          picture: data.user.picture,
          provider: 'google',
          accessToken: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token,
          loginTime: new Date().toISOString(),
        };
        
        saveUserProfile(userProfile);
        setUser(userProfile);
        
        // Initialize database and sync local data
        try {
          console.log('Setting up database...');
          await setupDatabase();
          
          console.log('Syncing local data to database...');
          const syncResult = await syncLocalDataToDatabase(userProfile.id);
          console.log('Sync result:', syncResult);
        } catch (dbError) {
          console.warn('Database setup/sync failed:', dbError);
          // Don't fail login if database operations fail
        }
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      alert(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Get auth URL from Netlify function
      const isDev = window.location.hostname === 'localhost';
      const baseUrl = isDev ? '' : ''; // In dev, Netlify dev proxies functions correctly
      const response = await fetch(`${baseUrl}/.netlify/functions/auth/url`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authentication URL received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.message}`);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearUserProfile();
    setUser(null);
  };

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden"
      >
        <div className="flex items-center p-3 sm:p-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-orange-200 dark:border-orange-700 shadow-md"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/48x48/f97316/ffffff?text=' + user.name.charAt(0);
                }}
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 touch-target"
            title="Logout"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.button>
        </div>
        
        {/* Premium indicator */}
        <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-transparent w-20 h-1"></div>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center space-x-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative group min-h-[44px] sm:min-h-[48px] p-3 sm:p-4"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {loading ? (
        <div className="spinner-large flex-shrink-0" />
      ) : (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 relative z-10" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      <span className="flex-1 text-sm sm:text-base font-semibold relative z-10">
        {loading ? 'Signing in...' : 'Continue with Google'}
      </span>
      {!loading && (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0 relative z-10"></div>
      )}
    </motion.button>
  );
};

export default GoogleAuthButton; 