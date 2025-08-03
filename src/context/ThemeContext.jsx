import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      // Check if user has a saved preference
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // Default to dark mode for premium experience
      return true;
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return true; // Default to dark mode
    }
  });

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (error) {
      console.warn('Error updating theme:', error);
    }
  }, [isDark]);

  const toggleTheme = React.useCallback(() => {
    setIsDark(prevIsDark => !prevIsDark);
  }, []);

  const value = React.useMemo(() => ({
    isDark,
    toggleTheme,
    theme: isDark ? 'dark' : 'light',
  }), [isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 