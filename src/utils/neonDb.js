// Neon Database utilities for direct PostgreSQL connection
// Note: In production, these should be handled by a backend API

import { AUTH_CONFIG } from '../config/auth';

// Database connection helper
export const createNeonConnection = () => {
  // Note: Direct database connections from frontend are not recommended for production
  // This is for development/demo purposes. In production, use backend API endpoints.
  return {
    host: AUTH_CONFIG.database.host,
    database: AUTH_CONFIG.database.database,
    user: AUTH_CONFIG.database.user,
    port: AUTH_CONFIG.database.port,
    ssl: AUTH_CONFIG.database.ssl,
  };
};

// SQL queries for expense management
export const SQL_QUERIES = {
  // Create tables
  createTables: `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      picture TEXT,
      provider VARCHAR(50) DEFAULT 'google',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      icon VARCHAR(10),
      color VARCHAR(7),
      user_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Expenses table
    CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      category_id VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    -- Budgets table
    CREATE TABLE IF NOT EXISTS budgets (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      category_id VARCHAR(255) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      period VARCHAR(20) DEFAULT 'monthly',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    -- Indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
  `,

  // User queries
  insertUser: `
    INSERT INTO users (id, email, name, picture, provider)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      picture = EXCLUDED.picture,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `,

  // Expense queries
  getExpensesByUser: `
    SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM expenses e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = $1
    ORDER BY e.date DESC, e.created_at DESC;
  `,

  insertExpense: `
    INSERT INTO expenses (id, user_id, category_id, description, amount, date, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `,

  updateExpense: `
    UPDATE expenses 
    SET description = $2, amount = $3, category_id = $4, date = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $7
    RETURNING *;
  `,

  deleteExpense: `
    DELETE FROM expenses 
    WHERE id = $1 AND user_id = $2;
  `,

  // Budget queries
  getBudgetsByUser: `
    SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.user_id = $1;
  `,

  insertBudget: `
    INSERT INTO budgets (id, user_id, category_id, amount, period)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, category_id) DO UPDATE SET
      amount = EXCLUDED.amount,
      period = EXCLUDED.period,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `,

  // Category queries
  getCategoriesByUser: `
    SELECT * FROM categories 
    WHERE user_id = $1 OR user_id IS NULL
    ORDER BY created_at;
  `,

  insertDefaultCategories: `
    INSERT INTO categories (id, name, icon, color, user_id)
    VALUES 
      ('food', 'Food & Dining', '🍕', '#f97316', NULL),
      ('shopping', 'Shopping', '🛍️', '#8b5cf6', NULL),
      ('entertainment', 'Entertainment', '🎬', '#f59e0b', NULL),
      ('health', 'Health & Medical', '💊', '#22c55e', NULL),
      ('utilities', 'Bills & Utilities', '⚡', '#6b7280', NULL),
      ('travel', 'Travel', '✈️', '#06b6d4', NULL),
      ('groceries', 'Groceries', '🛒', '#16a34a', NULL),
      ('investment', 'Investment', '📈', '#059669', NULL),
      ('gifts', 'Gifts', '🎁', '#ec4899', NULL),
      ('home', 'Home', '🏡', '#84cc16', NULL),
      ('household', 'Household', '🧹', '#6366f1', NULL),
      ('loans', 'Loans', '🏦', '#dc2626', NULL),
      ('add_new', 'Add New Category', '➕', '#10b981', NULL),
      ('other', 'Other', '📝', '#64748b', NULL)
    ON CONFLICT (id) DO NOTHING;
  `
};

// API endpoint functions (these would be used with a backend)
export const API_ENDPOINTS = {
  base: 'https://your-app.netlify.app/.netlify/functions',
  
  // Authentication
  auth: '/auth/google',
  profile: '/auth/profile',
  
  // Data endpoints
  expenses: '/api/expenses',
  budgets: '/api/budgets',
  categories: '/api/categories',
  sync: '/api/sync',
  
  // Database setup
  setup: '/api/setup-db',
};

// Helper function to make API calls
export const makeApiCall = async (endpoint, options = {}) => {
  const user = JSON.parse(localStorage.getItem('money_manager_user_profile') || '{}');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': user.accessToken ? `Bearer ${user.accessToken}` : '',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_ENDPOINTS.base}${endpoint}`, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Database setup function
export const setupDatabase = async () => {
  try {
    const response = await makeApiCall(API_ENDPOINTS.setup, {
      method: 'POST',
      body: JSON.stringify({ 
        action: 'create_tables',
        queries: SQL_QUERIES.createTables 
      }),
    });
    
    console.log('Database setup completed:', response);
    return response;
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
};

// Sync functions for online/offline data management
export const syncExpensesToCloud = async (localExpenses, userId) => {
  if (!userId) return { success: false, message: 'User not authenticated' };
  
  try {
    const response = await makeApiCall(API_ENDPOINTS.sync, {
      method: 'POST',
      body: JSON.stringify({
        type: 'expenses',
        data: localExpenses,
        userId,
      }),
    });
    
    return response;
  } catch (error) {
    console.warn('Sync to cloud failed, continuing with local storage:', error);
    return { success: false, error: error.message };
  }
};

export const getExpensesFromCloud = async (userId) => {
  if (!userId) return null;
  
  try {
    const response = await makeApiCall(`${API_ENDPOINTS.expenses}?userId=${userId}`);
    return response.data || [];
  } catch (error) {
    console.warn('Failed to fetch from cloud, using local storage:', error);
    return null;
  }
};

// Export the connection info for backend use
export const NEON_CONFIG = {
  connectionString: AUTH_CONFIG.database.connectionString,
  ssl: { rejectUnauthorized: false },
}; 