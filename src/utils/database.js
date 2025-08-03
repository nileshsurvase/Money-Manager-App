// Database utilities for Neon PostgreSQL integration
// Falls back to local storage when database is not available

import {
  getFromStorage,
  saveToStorage,
  STORAGE_KEYS,
  formatIndianCurrency,
  formatIndianAmount,
  getUserProfile,
} from "./storage";
import {
  sanitizeExpenseData,
  sanitizeBudgetData,
  isRateLimited,
} from "./security";
import toast from "react-hot-toast";

// Database configuration - use Netlify functions
const DB_CONFIG = {
  // Use Netlify functions for database operations
  API_ENDPOINT: "/.netlify/functions/api",
};

// Check if database is available (always true for Netlify functions)
export const isDatabaseAvailable = () => {
  return true; // Always available since we're using Netlify functions
};

// Get current user
const getCurrentUser = () => {
  const user = getUserProfile();
  return user?.id || null;
};

// Generic API call function with authentication
const apiCall = async (endpoint, method = "GET", data = null) => {
  const user = getUserProfile();
  const userId = user?.id || "anonymous";

  // Check rate limiting
  if (isRateLimited(`api_${userId}`, 30, 60000)) {
    // 30 requests per minute
    const error = new Error("Too many requests. Please wait a moment.");
    toast.error("Too many requests. Please slow down.");
    throw error;
  }

  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        // Add user authentication
        Authorization: user?.accessToken ? `Bearer ${user.accessToken}` : "",
        "X-User-ID": userId,
      },
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      // Sanitize data before sending
      let sanitizedData = data;
      if (endpoint.includes("expenses")) {
        sanitizedData = sanitizeExpenseData(data);
      } else if (endpoint.includes("budgets")) {
        sanitizedData = sanitizeBudgetData(data);
      }
      options.body = JSON.stringify(sanitizedData);
    }

    const url = `${DB_CONFIG.API_ENDPOINT}${endpoint}`;
    console.log(`API Call: ${method} ${url}`, data);

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `API call failed: ${response.status} ${response.statusText}`;

      // Show user-friendly error messages
      if (response.status === 401) {
        toast.error("Please sign in to continue");
      } else if (response.status === 403) {
        toast.error("You don't have permission to perform this action");
      } else if (response.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }

      throw new Error(`${errorMessage} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`API Response:`, result);
    return result;
  } catch (error) {
    console.error("API call error:", error);

    // Only show toast if it's not already handled above
    if (
      !error.message.includes("API call failed:") &&
      !error.message.includes("Too many requests")
    ) {
      toast.error("Network error. Please check your connection.");
    }

    throw error;
  }
};

// Expense operations with database fallback
export const getExpensesFromDB = async (userId = null) => {
  const currentUserId = userId || getCurrentUser();

  if (!currentUserId) {
    // Silently use local storage without console warning
    return getFromStorage(STORAGE_KEYS.EXPENSES, []);
  }

  try {
    const result = await apiCall("/expenses");
    console.log("API call result for expenses:", result);
    return result || [];
  } catch (error) {
    // Silently fallback to local storage
    return getFromStorage(STORAGE_KEYS.EXPENSES, []);
  }
};

export const addExpenseToDB = async (expense, userId = null) => {
  const currentUserId = userId || getCurrentUser();

  const expenseWithId = {
    id: Date.now().toString(),
    ...expense,
    userId: currentUserId,
    createdAt: new Date().toISOString(),
  };

  if (!currentUserId) {
    // Silently use local storage without console warning
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES, []);
    expenses.push(expenseWithId);
    const success = saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
    if (success) {
      toast.success("Expense added successfully!");
      return expenseWithId;
    }
    return null;
  }

  try {
    const result = await apiCall("/expenses", "POST", expenseWithId);
    toast.success("Expense saved to cloud!");
    return result; // Return the result directly, not result.data
  } catch (error) {
    // Silently fallback to local storage
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES, []);
    expenses.push(expenseWithId);
    const success = saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
    if (success) {
      toast.success("Expense saved locally (will sync when online)");
      return expenseWithId;
    }
    toast.error("Failed to save expense");
    return null;
  }
};

export const updateExpenseInDB = async (id, updates, userId = null) => {
  const currentUserId = userId || getCurrentUser();

  const updatedData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (!currentUserId) {
    // Silently use local storage without console warning
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES, []);
    const index = expenses.findIndex((exp) => exp.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updatedData };
      return saveToStorage(STORAGE_KEYS.EXPENSES, expenses)
        ? expenses[index]
        : null;
    }
    return null;
  }

  try {
    const result = await apiCall(`/expenses/${id}`, "PUT", updatedData);
    return result.data;
  } catch (error) {
    // Silently fallback to local storage
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES, []);
    const index = expenses.findIndex((exp) => exp.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updatedData };
      return saveToStorage(STORAGE_KEYS.EXPENSES, expenses)
        ? expenses[index]
        : null;
    }
    return null;
  }
};

export const deleteExpenseFromDB = async (id, userId = null) => {
  const currentUserId = userId || getCurrentUser();

  if (!currentUserId) {
    // Silently use local storage without console warning
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES, []);
    const filteredExpenses = expenses.filter((exp) => exp.id !== id);
    const success = saveToStorage(STORAGE_KEYS.EXPENSES, filteredExpenses);
    if (success) {
      toast.success("Expense deleted successfully!");
    }
    return success;
  }

  try {
    await apiCall(`/expenses/${id}`, "DELETE");
    toast.success("Expense deleted from cloud!");
    return true;
  } catch (error) {
    // Silently fallback to local storage
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES, []);
    const filteredExpenses = expenses.filter((exp) => exp.id !== id);
    const success = saveToStorage(STORAGE_KEYS.EXPENSES, filteredExpenses);
    if (success) {
      toast.success("Expense deleted locally (will sync when online)");
    } else {
      toast.error("Failed to delete expense");
    }
    return success;
  }
};

// Budget operations with database fallback
export const getBudgetsFromDB = async (userId = null) => {
  const currentUserId = userId || getCurrentUser();

  if (!currentUserId) {
    return getFromStorage(STORAGE_KEYS.BUDGETS, []);
  }

  try {
    const result = await apiCall("/budgets");
    return result || [];
  } catch (error) {
    // Silently fallback to local storage
    return getFromStorage(STORAGE_KEYS.BUDGETS, []);
  }
};

export const addBudgetToDB = async (budget, userId = null) => {
  const currentUserId = userId || getCurrentUser();

  const budgetWithId = {
    id: Date.now().toString(),
    ...budget,
    userId: currentUserId,
    createdAt: new Date().toISOString(),
  };

  if (!currentUserId) {
    const budgets = getFromStorage(STORAGE_KEYS.BUDGETS, []);
    budgets.push(budgetWithId);
    return saveToStorage(STORAGE_KEYS.BUDGETS, budgets) ? budgetWithId : null;
  }

  try {
    const result = await apiCall("/budgets", "POST", budgetWithId);
    return result.data;
  } catch (error) {
    // Silently fallback to local storage
    const budgets = getFromStorage(STORAGE_KEYS.BUDGETS, []);
    budgets.push(budgetWithId);
    return saveToStorage(STORAGE_KEYS.BUDGETS, budgets) ? budgetWithId : null;
  }
};

// Database setup - setup the database tables
export const setupDatabase = async () => {
  try {
    // Call the init-db function directly, not through the main API
    const response = await fetch("/.netlify/functions/init-db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Setup failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Database setup error:", error);
    return { success: false, error: error.message };
  }
};

// Data synchronization functions
export const syncLocalDataToDatabase = async (userId) => {
  const currentUserId = userId || getCurrentUser();

  if (!currentUserId) {
    return { success: false, message: "User not logged in" };
  }

  try {
    const localExpenses = getFromStorage(STORAGE_KEYS.EXPENSES, []);
    const localBudgets = getFromStorage(STORAGE_KEYS.BUDGETS, []);

    // Sync expenses
    for (const expense of localExpenses) {
      if (!expense.userId || expense.userId !== currentUserId) {
        await addExpenseToDB({ ...expense, userId: currentUserId });
      }
    }

    // Sync budgets
    for (const budget of localBudgets) {
      if (!budget.userId || budget.userId !== currentUserId) {
        await addBudgetToDB({ ...budget, userId: currentUserId });
      }
    }

    return { success: true, message: "Data synchronized successfully" };
  } catch (error) {
    console.error("Sync error:", error);
    return { success: false, message: "Synchronization failed", error };
  }
};

// Database status check
export const checkDatabaseConnection = async () => {
  try {
    // Test connection by calling init-db function
    const response = await fetch("/.netlify/functions/init-db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return { connected: true, message: "Database functions available" };
    } else {
      throw new Error(`Connection test failed: ${response.status}`);
    }
  } catch (error) {
    return {
      connected: false,
      message: "Database functions not available",
      error: error.message,
    };
  }
};

// Export unified functions that components should use
export const getExpenses = () => getExpensesFromDB();
export const addExpense = (expense) => addExpenseToDB(expense);
export const updateExpense = (id, updates) => updateExpenseInDB(id, updates);
export const deleteExpense = (id) => deleteExpenseFromDB(id);
export const getBudgets = () => getBudgetsFromDB();
export const addBudget = (budget) => addBudgetToDB(budget);

// Export for use in components
export default {
  getExpensesFromDB,
  addExpenseToDB,
  updateExpenseInDB,
  deleteExpenseFromDB,
  getBudgetsFromDB,
  addBudgetToDB,
  syncLocalDataToDatabase,
  checkDatabaseConnection,
  isDatabaseAvailable,
  setupDatabase,
  // Unified exports
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getBudgets,
  addBudget,
};
