import { sanitizeInput } from './security';

// FreedomOS Storage Utility - Financial Freedom Platform
// Theme: Navy Blue + Gold (wealth & control)

// Financial Freedom Stages
export const FREEDOM_STAGES = {
  STARTER: 'starter',
  STABILIZER: 'stabilizer', 
  GROWER: 'grower',
  FREE: 'free'
};

// User Profile Structure
const DEFAULT_USER_PROFILE = {
  personalInfo: {
    age: 25,
    income: 50000,
    expenses: 35000,
    dependents: 0,
    profession: '',
    city: ''
  },
  financialGoals: {
    retirementAge: 60,
    emergencyFundTarget: 300000,
    wealthTarget: 10000000,
    monthlyInvestment: 10000
  },
  currentFinancials: {
    savings: 100000,
    investments: 50000,
    loans: [],
    insurance: {
      health: 0,
      life: 0
    },
    creditScore: 750
  },
  preferences: {
    riskTolerance: 'moderate',
    investmentStyle: 'balanced'
  }
};

// Storage Keys
const STORAGE_KEYS = {
  USER_PROFILE: 'freedomos_user_profile',
  CALCULATOR_HISTORY: 'freedomos_calculator_history',
  TASKS: 'freedomos_tasks',
  NET_WORTH_HISTORY: 'freedomos_networth_history',
  BUDGET_DATA: 'freedomos_budget_data'
};

// Utility Functions
const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return defaultValue;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
    return false;
  }
};

// User Profile Management
export const getUserProfile = () => {
  return getStorageItem(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER_PROFILE);
};

export const updateUserProfile = (updates) => {
  const currentProfile = getUserProfile();
  const updatedProfile = {
    ...currentProfile,
    ...updates,
    personalInfo: { ...currentProfile.personalInfo, ...updates.personalInfo },
    financialGoals: { ...currentProfile.financialGoals, ...updates.financialGoals },
    currentFinancials: { ...currentProfile.currentFinancials, ...updates.currentFinancials },
    preferences: { ...currentProfile.preferences, ...updates.preferences }
  };
  
  return setStorageItem(STORAGE_KEYS.USER_PROFILE, updatedProfile);
};

// Financial Freedom Score Calculation
export const calculateFreedomScore = () => {
  const profile = getUserProfile();
  const { personalInfo, financialGoals, currentFinancials } = profile;
  
  let score = 0;
  let maxScore = 100;
  
  // Emergency Fund Score (25 points)
  const emergencyFundRatio = (currentFinancials.savings) / (personalInfo.expenses * 6);
  score += Math.min(emergencyFundRatio * 25, 25);
  
  // Investment Score (30 points) 
  const investmentRatio = currentFinancials.investments / financialGoals.wealthTarget;
  score += Math.min(investmentRatio * 30, 30);
  
  // Debt Score (20 points)
  const totalDebt = currentFinancials.loans.reduce((sum, loan) => sum + loan.amount, 0);
  const debtToIncomeRatio = totalDebt / personalInfo.income;
  score += Math.max(20 - (debtToIncomeRatio * 40), 0);
  
  // Savings Rate Score (25 points)
  const savingsRate = (personalInfo.income - personalInfo.expenses) / personalInfo.income;
  score += Math.min(savingsRate * 100, 25);
  
  return Math.round(Math.max(0, Math.min(score, maxScore)));
};

// Determine Current Financial Stage
export const getCurrentStage = () => {
  const score = calculateFreedomScore();
  
  if (score >= 80) return FREEDOM_STAGES.FREE;
  if (score >= 60) return FREEDOM_STAGES.GROWER;
  if (score >= 40) return FREEDOM_STAGES.STABILIZER;
  return FREEDOM_STAGES.STARTER;
};

// Daily Tasks Management
export const getTodaysTasks = () => {
  const tasks = getStorageItem(STORAGE_KEYS.TASKS, []);
  const today = new Date().toDateString();
  return tasks.filter(task => task.date === today && !task.completed);
};

export const addTask = (taskData) => {
  const tasks = getStorageItem(STORAGE_KEYS.TASKS, []);
  const newTask = {
    id: Date.now().toString(),
    ...taskData,
    date: new Date().toDateString(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  return setStorageItem(STORAGE_KEYS.TASKS, tasks);
};

export const completeTask = (taskId) => {
  const tasks = getStorageItem(STORAGE_KEYS.TASKS, []);
  const updatedTasks = tasks.map(task => 
    task.id === taskId ? { ...task, completed: true, completedAt: new Date().toISOString() } : task
  );
  
  return setStorageItem(STORAGE_KEYS.TASKS, updatedTasks);
};

// Calculator History Management
export const saveCalculatorResult = (calculatorType, inputs, results) => {
  const history = getStorageItem(STORAGE_KEYS.CALCULATOR_HISTORY, []);
  const calculation = {
    id: Date.now().toString(),
    type: calculatorType,
    inputs: sanitizeInput(inputs),
    results: sanitizeInput(results),
    timestamp: new Date().toISOString()
  };
  
  history.unshift(calculation);
  // Keep only last 100 calculations
  if (history.length > 100) {
    history.splice(100);
  }
  
  return setStorageItem(STORAGE_KEYS.CALCULATOR_HISTORY, history);
};

export const getCalculatorHistory = (calculatorType = null) => {
  const history = getStorageItem(STORAGE_KEYS.CALCULATOR_HISTORY, []);
  return calculatorType 
    ? history.filter(calc => calc.type === calculatorType)
    : history;
};

// Net Worth Tracking
export const calculateNetWorth = () => {
  const profile = getUserProfile();
  const { currentFinancials } = profile;
  
  const assets = currentFinancials.savings + currentFinancials.investments;
  const liabilities = currentFinancials.loans.reduce((sum, loan) => sum + loan.amount, 0);
  
  return assets - liabilities;
};

export const saveNetWorthSnapshot = () => {
  const history = getStorageItem(STORAGE_KEYS.NET_WORTH_HISTORY, []);
  const netWorth = calculateNetWorth();
  
  const snapshot = {
    date: new Date().toISOString(),
    netWorth,
    timestamp: Date.now()
  };
  
  history.push(snapshot);
  
  // Keep only last 365 days
  const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
  const filteredHistory = history.filter(item => item.timestamp > oneYearAgo);
  
  return setStorageItem(STORAGE_KEYS.NET_WORTH_HISTORY, filteredHistory);
};

export const getNetWorthHistory = () => {
  return getStorageItem(STORAGE_KEYS.NET_WORTH_HISTORY, []);
};

// Budget Data Management
export const getBudgetData = () => {
  return getStorageItem(STORAGE_KEYS.BUDGET_DATA, {
    income: 0,
    expenses: {
      needs: 0,
      wants: 0,
      savings: 0
    },
    categories: []
  });
};

export const updateBudgetData = (budgetData) => {
  return setStorageItem(STORAGE_KEYS.BUDGET_DATA, sanitizeInput(budgetData));
};

// Financial Quotes
export const getDailyQuote = () => {
  const quotes = [
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "It's not how much money you make, but how much money you keep. - Robert Kiyosaki",
    "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make. - Dave Ramsey",
    "The real measure of your wealth is how much you'd be worth if you lost all your money. - Anonymous",
    "Investing should be more like watching paint dry or watching grass grow. - Paul Samuelson",
    "Risk comes from not knowing what you're doing. - Warren Buffett",
    "The stock market is a device for transferring money from the impatient to the patient. - Warren Buffett",
    "Compound interest is the eighth wonder of the world. - Albert Einstein",
    "Don't save what is left after spending; spend what is left after saving. - Warren Buffett",
    "Financial freedom is available to those who learn about it and work for it. - Robert Kiyosaki"
  ];
  
  const today = new Date().getDate();
  return quotes[today % quotes.length];
};

// Export/Import Functions
export const exportFreedomOSData = () => {
  const data = {
    userProfile: getUserProfile(),
    calculatorHistory: getCalculatorHistory(),
    tasks: getStorageItem(STORAGE_KEYS.TASKS, []),
    netWorthHistory: getNetWorthHistory(),
    budgetData: getBudgetData(),
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
};

export const importFreedomOSData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.userProfile) setStorageItem(STORAGE_KEYS.USER_PROFILE, data.userProfile);
    if (data.calculatorHistory) setStorageItem(STORAGE_KEYS.CALCULATOR_HISTORY, data.calculatorHistory);
    if (data.tasks) setStorageItem(STORAGE_KEYS.TASKS, data.tasks);
    if (data.netWorthHistory) setStorageItem(STORAGE_KEYS.NET_WORTH_HISTORY, data.netWorthHistory);
    if (data.budgetData) setStorageItem(STORAGE_KEYS.BUDGET_DATA, data.budgetData);
    
    return true;
  } catch (error) {
    console.error('Error importing FreedomOS data:', error);
    return false;
  }
};

// Clear all data
export const clearAllFreedomOSData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  return true;
}; 