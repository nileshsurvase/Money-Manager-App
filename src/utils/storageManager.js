// Universal storage manager that handles both localStorage and server storage
import { getFromStorage, saveToStorage } from './storage';
import { 
  getExpensesFromDB, 
  addExpenseToDB, 
  updateExpenseInDB, 
  deleteExpenseFromDB,
  getBudgetsFromDB,
  addBudgetToDB 
} from './database';

// Storage mode configuration
const STORAGE_MODE_KEY = 'app_storage_mode';
const STORAGE_MODES = {
  LOCAL: 'local',
  SERVER: 'server'
};

// Get current storage mode
export const getStorageMode = () => {
  return localStorage.getItem(STORAGE_MODE_KEY) || STORAGE_MODES.LOCAL;
};

// Set storage mode
export const setStorageMode = (mode) => {
  localStorage.setItem(STORAGE_MODE_KEY, mode);
  console.log(`Storage mode set to: ${mode}`);
};

// Check if server mode is available
export const isServerModeAvailable = async () => {
  try {
    const response = await fetch('/.netlify/functions/api/expenses', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Universal storage functions for expenses
export const universalExpenseStorage = {
  async getExpenses() {
    const mode = getStorageMode();
    if (mode === STORAGE_MODES.SERVER) {
      try {
        return await getExpensesFromDB();
      } catch (error) {
        console.warn('Server storage failed, falling back to local:', error);
        return getFromStorage('money_manager_expenses', []);
      }
    }
    return getFromStorage('money_manager_expenses', []);
  },

  async addExpense(expense) {
    const mode = getStorageMode();
    if (mode === STORAGE_MODES.SERVER) {
      try {
        return await addExpenseToDB(expense);
      } catch (error) {
        console.warn('Server storage failed, falling back to local:', error);
        const expenses = getFromStorage('money_manager_expenses', []);
        const newExpense = { ...expense, id: Date.now().toString() };
        expenses.push(newExpense);
        saveToStorage('money_manager_expenses', expenses);
        return newExpense;
      }
    }
    const expenses = getFromStorage('money_manager_expenses', []);
    const newExpense = { ...expense, id: Date.now().toString() };
    expenses.push(newExpense);
    saveToStorage('money_manager_expenses', expenses);
    return newExpense;
  },

  async updateExpense(id, updates) {
    const mode = getStorageMode();
    if (mode === STORAGE_MODES.SERVER) {
      try {
        return await updateExpenseInDB(id, updates);
      } catch (error) {
        console.warn('Server storage failed, falling back to local:', error);
        const expenses = getFromStorage('money_manager_expenses', []);
        const index = expenses.findIndex(exp => exp.id === id);
        if (index !== -1) {
          expenses[index] = { ...expenses[index], ...updates };
          saveToStorage('money_manager_expenses', expenses);
          return expenses[index];
        }
      }
    }
    const expenses = getFromStorage('money_manager_expenses', []);
    const index = expenses.findIndex(exp => exp.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updates };
      saveToStorage('money_manager_expenses', expenses);
      return expenses[index];
    }
    return null;
  },

  async deleteExpense(id) {
    const mode = getStorageMode();
    if (mode === STORAGE_MODES.SERVER) {
      try {
        return await deleteExpenseFromDB(id);
      } catch (error) {
        console.warn('Server storage failed, falling back to local:', error);
        const expenses = getFromStorage('money_manager_expenses', []);
        const filtered = expenses.filter(exp => exp.id !== id);
        saveToStorage('money_manager_expenses', filtered);
        return true;
      }
    }
    const expenses = getFromStorage('money_manager_expenses', []);
    const filtered = expenses.filter(exp => exp.id !== id);
    saveToStorage('money_manager_expenses', filtered);
    return true;
  }
};

// Universal storage functions for budgets
export const universalBudgetStorage = {
  async getBudgets() {
    const mode = getStorageMode();
    if (mode === STORAGE_MODES.SERVER) {
      try {
        return await getBudgetsFromDB();
      } catch (error) {
        console.warn('Server storage failed, falling back to local:', error);
        return getFromStorage('money_manager_budgets', []);
      }
    }
    return getFromStorage('money_manager_budgets', []);
  },

  async addBudget(budget) {
    const mode = getStorageMode();
    if (mode === STORAGE_MODES.SERVER) {
      try {
        return await addBudgetToDB(budget);
      } catch (error) {
        console.warn('Server storage failed, falling back to local:', error);
        const budgets = getFromStorage('money_manager_budgets', []);
        const newBudget = { ...budget, id: Date.now().toString() };
        budgets.push(newBudget);
        saveToStorage('money_manager_budgets', budgets);
        return newBudget;
      }
    }
    const budgets = getFromStorage('money_manager_budgets', []);
    const newBudget = { ...budget, id: Date.now().toString() };
    budgets.push(newBudget);
    saveToStorage('money_manager_budgets', budgets);
    return newBudget;
  }
};

// Storage mode toggle component data
export const getStorageModeInfo = async () => {
  const currentMode = getStorageMode();
  const serverAvailable = await isServerModeAvailable();
  
  return {
    currentMode,
    serverAvailable,
    modes: STORAGE_MODES,
    canSwitchToServer: serverAvailable,
    canSwitchToLocal: true
  };
};

export { STORAGE_MODES };