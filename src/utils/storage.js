// Storage utilities for the money manager application

// Default categories for expenses (Indian context)
export const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: '🍕', color: '#f97316' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#8b5cf6' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#f59e0b' },
  { id: 'health', name: 'Health & Medical', icon: '💊', color: '#22c55e' },
  { id: 'utilities', name: 'Bills & Utilities', icon: '⚡', color: '#6b7280' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#06b6d4' },
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#16a34a' },
  { id: 'investment', name: 'Investment', icon: '📈', color: '#059669' },
  { id: 'gifts', name: 'Gifts', icon: '🎁', color: '#ec4899' },
  { id: 'home', name: 'Home', icon: '🏡', color: '#84cc16' },
  { id: 'household', name: 'Household', icon: '🧹', color: '#6366f1' },
  { id: 'loans', name: 'Loans', icon: '🏦', color: '#dc2626' },
  { id: 'add_new', name: 'Add New Category', icon: '➕', color: '#10b981' },
  { id: 'other', name: 'Other', icon: '📝', color: '#64748b' },
];

// Storage keys
export const STORAGE_KEYS = {
  EXPENSES: 'money_manager_expenses',
  BUDGETS: 'money_manager_budgets',
  CATEGORIES: 'money_manager_categories',
  SETTINGS: 'money_manager_settings',
  USER_PROFILE: 'money_manager_user_profile',
};

// Indian currency formatter
export const formatIndianCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format amount in Indian numbering system (lakhs, crores)
export const formatIndianAmount = (amount) => {
  if (amount >= 10000000) { // 1 crore
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  } else if (amount >= 100000) { // 1 lakh
    return `₹${(amount / 100000).toFixed(1)} L`;
  } else if (amount >= 1000) { // 1 thousand
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₹${Math.round(amount)}`;
  }
};

// Generic storage functions
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from storage (${key}):`, error);
    return defaultValue;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    return false;
  }
};

// Expense management
export const getExpenses = () => {
  const expenses = getFromStorage(STORAGE_KEYS.EXPENSES, []);
  // Auto-load sample data if no expenses exist and sample data is loaded
  if (expenses.length === 0) {
    const sampleDataLoaded = localStorage.getItem('sample_data_loaded') === 'true';
    if (sampleDataLoaded) {
      // Return sample expenses if they exist
      const sampleExpenses = getFromStorage(STORAGE_KEYS.EXPENSES, []);
      return sampleExpenses;
    }
  }
  return expenses;
};

export const saveExpenses = (expenses) => {
  return saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
};

export const addExpense = (expense) => {
  // Basic validation
  if (!expense || typeof expense !== 'object') {
    console.error('Invalid expense data');
    return null;
  }
  
  if (!expense.description || !expense.amount || !expense.categoryId || !expense.date) {
    console.error('Missing required expense fields');
    return null;
  }
  
  const expenses = getExpenses();
  const newExpense = {
    id: Date.now().toString(),
    ...expense,
    amount: parseFloat(expense.amount) || 0,
    createdAt: new Date().toISOString(),
  };
  expenses.push(newExpense);
  return saveExpenses(expenses) ? newExpense : null;
};

export const updateExpense = (id, updates) => {
  const expenses = getExpenses();
  const index = expenses.findIndex(exp => exp.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...updates, updatedAt: new Date().toISOString() };
    return saveExpenses(expenses) ? expenses[index] : null;
  }
  return null;
};

export const deleteExpense = (id) => {
  const expenses = getExpenses();
  const filteredExpenses = expenses.filter(exp => exp.id !== id);
  return saveExpenses(filteredExpenses);
};

// Budget management
export const getBudgets = () => {
  return getFromStorage(STORAGE_KEYS.BUDGETS, []);
};

export const saveBudgets = (budgets) => {
  return saveToStorage(STORAGE_KEYS.BUDGETS, budgets);
};

export const addBudget = (budget) => {
  const budgets = getBudgets();
  const newBudget = {
    id: Date.now().toString(),
    ...budget,
    createdAt: new Date().toISOString(),
  };
  budgets.push(newBudget);
  return saveBudgets(budgets) ? newBudget : null;
};

export const updateBudget = (id, updates) => {
  const budgets = getBudgets();
  const index = budgets.findIndex(budget => budget.id === id);
  if (index !== -1) {
    budgets[index] = { ...budgets[index], ...updates, updatedAt: new Date().toISOString() };
    return saveBudgets(budgets) ? budgets[index] : null;
  }
  return null;
};

export const deleteBudget = (id) => {
  const budgets = getBudgets();
  const filteredBudgets = budgets.filter(budget => budget.id !== id);
  return saveBudgets(filteredBudgets);
};

// Category management
export const getCategories = () => {
  const saved = getFromStorage(STORAGE_KEYS.CATEGORIES);
  return saved && saved.length > 0 ? saved : DEFAULT_CATEGORIES;
};

export const saveCategories = (categories) => {
  return saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
};

export const addCategory = (category) => {
  const categories = getCategories();
  const newCategory = {
    id: category.id || `custom_${Date.now()}`,
    name: category.name,
    icon: category.icon || '📝',
    color: category.color || '#64748b',
    ...category
  };
  
  // Insert before "other" category if it exists
  const otherIndex = categories.findIndex(cat => cat.id === 'other');
  if (otherIndex !== -1) {
    categories.splice(otherIndex, 0, newCategory);
  } else {
    categories.push(newCategory);
  }
  
  return saveCategories(categories) ? newCategory : null;
};

// Settings management with Indian defaults
export const getSettings = () => {
  return getFromStorage(STORAGE_KEYS.SETTINGS, {
    currency: 'INR',
    currencySymbol: '₹',
    dateFormat: 'dd/MM/yyyy', // Indian date format
    startOfWeek: 1, // Monday
    numberFormat: 'indian', // Indian numbering system
    language: 'en-IN',
    timezone: 'Asia/Kolkata',
  });
};

export const saveSettings = (settings) => {
  return saveToStorage(STORAGE_KEYS.SETTINGS, settings);
};

// User profile management (for Google Auth)
export const getUserProfile = () => {
  return getFromStorage(STORAGE_KEYS.USER_PROFILE, null);
};

export const saveUserProfile = (profile) => {
  return saveToStorage(STORAGE_KEYS.USER_PROFILE, profile);
};

export const clearUserProfile = () => {
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
};

// CSV Export Functions
export const exportMoneyManagerToCSV = () => {
  try {
    const expenses = getExpenses();
    const budgets = getBudgets();
    const categories = getCategories();
    
    // Create a map of category IDs to names
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });
    
    // Prepare expenses data with category names
    const expenseRows = expenses.map(expense => ({
      'Date': new Date(expense.date).toLocaleDateString('en-IN'),
      'Description': expense.description || '',
      'Category': categoryMap[expense.categoryId] || 'Unknown',
      'Amount': expense.amount || 0,
      'Notes': expense.notes || '',
      'Created At': new Date(expense.createdAt).toLocaleDateString('en-IN')
    }));
    
    // Convert to CSV string
    if (expenseRows.length === 0) {
      return 'Date,Description,Category,Amount,Notes,Created At\nNo data available';
    }
    
    const headers = Object.keys(expenseRows[0]);
    const csvContent = [
      headers.join(','),
      ...expenseRows.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Error creating Money Manager CSV:', error);
    return 'Error,Message\nExport Failed,Unable to export data';
  }
};

export const exportBudgetsToCSV = () => {
  try {
    const budgets = getBudgets();
    const categories = getCategories();
    
    // Create a map of category IDs to names
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });
    
    // Prepare budgets data
    const budgetRows = budgets.map(budget => ({
      'Category': categoryMap[budget.categoryId] || 'Unknown',
      'Budget Amount': budget.amount || 0,
      'Period': budget.period || 'monthly',
      'Created At': new Date(budget.createdAt).toLocaleDateString('en-IN')
    }));
    
    // Convert to CSV string
    if (budgetRows.length === 0) {
      return 'Category,Budget Amount,Period,Created At\nNo budgets set';
    }
    
    const headers = Object.keys(budgetRows[0]);
    const csvContent = [
      headers.join(','),
      ...budgetRows.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Error creating Budgets CSV:', error);
    return 'Error,Message\nExport Failed,Unable to export budget data';
  }
};

// Generate sample Money Manager import file
export const generateSampleMoneyManagerFile = () => {
  const sampleData = {
    expenses: [
      {
        id: 'sample-1',
        amount: 450.00,
        categoryId: 'food',
        description: 'Lunch at office cafeteria',
        date: '2024-01-15',
        notes: 'Team lunch meeting',
        createdAt: '2024-01-15T12:30:00.000Z'
      },
      {
        id: 'sample-2',
        amount: 1200.00,
        categoryId: 'groceries',
        description: 'Weekly grocery shopping',
        date: '2024-01-14',
        notes: 'Fruits, vegetables, household items',
        createdAt: '2024-01-14T18:45:00.000Z'
      },
      {
        id: 'sample-3',
        amount: 850.00,
        categoryId: 'utilities',
        description: 'Electricity bill payment',
        date: '2024-01-13',
        notes: 'Monthly utility bill',
        createdAt: '2024-01-13T16:20:00.000Z'
      },
      {
        id: 'sample-4',
        amount: 300.00,
        categoryId: 'entertainment',
        description: 'Movie tickets',
        date: '2024-01-12',
        notes: 'Weekend movie with family',
        createdAt: '2024-01-12T20:15:00.000Z'
      }
    ],
    budgets: [
      {
        id: 'budget-1',
        categoryId: 'food',
        amount: 8000,
        period: 'monthly',
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'budget-2',
        categoryId: 'groceries',
        amount: 5000,
        period: 'monthly',
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'budget-3',
        categoryId: 'entertainment',
        amount: 2000,
        period: 'monthly',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    categories: DEFAULT_CATEGORIES,
    settings: {
      currency: 'INR',
      currencySymbol: '₹',
      dateFormat: 'dd/MM/yyyy',
      startOfWeek: 1,
      numberFormat: 'indian',
      language: 'en-IN',
      timezone: 'Asia/Kolkata'
    },
    exportDate: new Date().toISOString(),
    version: '1.1'
  };

  return JSON.stringify(sampleData, null, 2);
}; 