import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../utils/storage';

const CurrencyContext = createContext(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    try {
      // Load currency setting from storage
      const settings = getSettings();
      if (settings && settings.currency) {
        setCurrency(settings.currency);
      }
    } catch (error) {
      console.warn('Error loading currency settings:', error);
      // Fallback to USD
      setCurrency('USD');
    }
  }, []);

  const updateCurrency = React.useCallback((newCurrency) => {
    setCurrency(newCurrency);
    try {
      // Save to storage
      const settings = getSettings();
      settings.currency = newCurrency;
      saveSettings(settings);
    } catch (error) {
      console.warn('Error saving currency settings:', error);
    }
  }, []);

  // Currency formatting function
  const formatCurrency = React.useCallback((amount) => {
    try {
      const currencySymbols = {
        'INR': '₹',
        'USD': '₹',
        'EUR': '₹',
        'GBP': '₹',
        'JPY': '₹',
        'CAD': '₹',
        'AUD': '₹'
      };

      const symbol = currencySymbols[currency] || '$';
      
      if (currency === 'INR') {
        // Indian numbering system
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(amount);
      } else {
        // Standard formatting for other currencies
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(amount);
      }
    } catch (error) {
      console.warn('Error formatting currency:', error);
      return `₹${amount}`;
    }
  }, [currency]);

  // Get currency symbol
  const getCurrencySymbol = React.useCallback(() => {
    const currencySymbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': '$',
      'AUD': '$'
    };
    return currencySymbols[currency] || '$';
  }, [currency]);

  // Format amount in abbreviated form (K, L, Cr for INR)
  const formatAbbreviatedAmount = React.useCallback((amount) => {
    try {
      const symbol = getCurrencySymbol();
      
      if (currency === 'INR') {
        if (amount >= 10000000) { // 1 crore
          return `${symbol}${(amount / 10000000).toFixed(1)} Cr`;
        } else if (amount >= 100000) { // 1 lakh
          return `${symbol}${(amount / 100000).toFixed(1)} L`;
        } else if (amount >= 1000) { // 1 thousand
          return `${symbol}${(amount / 1000).toFixed(1)}K`;
        } else {
          return `${symbol}${Math.round(amount)}`;
        }
      } else {
        // Standard abbreviation for other currencies
        if (amount >= 1000000) {
          return `${symbol}${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
          return `${symbol}${(amount / 1000).toFixed(1)}K`;
        } else {
          return `${symbol}${Math.round(amount)}`;
        }
      }
    } catch (error) {
      console.warn('Error formatting abbreviated amount:', error);
      return `₹${amount}`;
    }
  }, [currency, getCurrencySymbol]);

  const value = React.useMemo(() => ({
    currency,
    updateCurrency,
    formatCurrency,
    getCurrencySymbol,
    formatAbbreviatedAmount
  }), [currency, updateCurrency, formatCurrency, getCurrencySymbol, formatAbbreviatedAmount]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext; 