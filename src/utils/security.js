import DOMPurify from 'dompurify';

// Input sanitization utilities
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potentially dangerous characters and trim whitespace
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// Sanitize HTML content (for rich text)
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') {
    return html;
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
};

// Validate and sanitize expense data
export const sanitizeExpenseData = (expense) => {
  return {
    ...expense,
    description: sanitizeInput(expense.description || ''),
    category: sanitizeInput(expense.category || ''),
    amount: parseFloat(expense.amount) || 0,
    date: expense.date ? new Date(expense.date).toISOString() : new Date().toISOString(),
    notes: sanitizeInput(expense.notes || ''),
  };
};

// Validate and sanitize budget data
export const sanitizeBudgetData = (budget) => {
  return {
    ...budget,
    category: sanitizeInput(budget.category || ''),
    amount: parseFloat(budget.amount) || 0,
    name: sanitizeInput(budget.name || ''),
    description: sanitizeInput(budget.description || ''),
  };
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate currency amount
export const isValidAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0 && num <= 999999999; // Max 999 million
};

// Validate date
export const isValidDate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

// Rate limiting for API calls (simple in-memory implementation)
const rateLimitMap = new Map();

export const isRateLimited = (key, maxRequests = 10, windowMs = 60000) => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }
  
  const requests = rateLimitMap.get(key);
  
  // Remove old requests outside the window
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (recentRequests.length >= maxRequests) {
    return true; // Rate limited
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(key, recentRequests);
  
  return false; // Not rate limited
};

// Secure local storage wrapper
export const secureStorage = {
  setItem: (key, value) => {
    try {
      const sanitizedKey = sanitizeInput(key);
      const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : JSON.stringify(value);
      localStorage.setItem(sanitizedKey, sanitizedValue);
      return true;
    } catch (error) {
      console.error('Secure storage setItem error:', error);
      return false;
    }
  },
  
  getItem: (key) => {
    try {
      const sanitizedKey = sanitizeInput(key);
      const value = localStorage.getItem(sanitizedKey);
      return value;
    } catch (error) {
      console.error('Secure storage getItem error:', error);
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      const sanitizedKey = sanitizeInput(key);
      localStorage.removeItem(sanitizedKey);
      return true;
    } catch (error) {
      console.error('Secure storage removeItem error:', error);
      return false;
    }
  }
};

export default {
  sanitizeInput,
  sanitizeHTML,
  sanitizeExpenseData,
  sanitizeBudgetData,
  isValidEmail,
  isValidAmount,
  isValidDate,
  isRateLimited,
  secureStorage
}; 