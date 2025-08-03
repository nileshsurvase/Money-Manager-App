import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, subMonths, addMonths } from 'date-fns';

// Format date for display
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  return format(new Date(date), formatString);
};

// Get current month range
export const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
};

// Get current week range
export const getCurrentWeekRange = () => {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(now, { weekStartsOn: 1 }),
  };
};

// Get specific month range
export const getMonthRange = (year, month) => {
  const date = new Date(year, month, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

// Get previous month range
export const getPreviousMonthRange = () => {
  const now = new Date();
  const prevMonth = subMonths(now, 1);
  return {
    start: startOfMonth(prevMonth),
    end: endOfMonth(prevMonth),
  };
};

// Get next month range
export const getNextMonthRange = () => {
  const now = new Date();
  const nextMonth = addMonths(now, 1);
  return {
    start: startOfMonth(nextMonth),
    end: endOfMonth(nextMonth),
  };
};

// Filter expenses by date range
export const filterExpensesByDateRange = (expenses, startDate, endDate) => {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return isWithinInterval(expenseDate, { start: new Date(startDate), end: new Date(endDate) });
  });
};

// Get expenses for current month
export const getCurrentMonthExpenses = (expenses) => {
  const { start, end } = getCurrentMonthRange();
  return filterExpensesByDateRange(expenses, start, end);
};

// Get expenses for current week
export const getCurrentWeekExpenses = (expenses) => {
  const { start, end } = getCurrentWeekRange();
  return filterExpensesByDateRange(expenses, start, end);
};

// Group expenses by month
export const groupExpensesByMonth = (expenses) => {
  const grouped = {};
  expenses.forEach(expense => {
    const monthKey = format(new Date(expense.date), 'yyyy-MM');
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(expense);
  });
  return grouped;
};

// Group expenses by category
export const groupExpensesByCategory = (expenses) => {
  const grouped = {};
  expenses.forEach(expense => {
    if (!grouped[expense.categoryId]) {
      grouped[expense.categoryId] = [];
    }
    grouped[expense.categoryId].push(expense);
  });
  return grouped;
};

// Calculate total for expenses
export const calculateTotal = (expenses) => {
  return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
};

// Get month name from date
export const getMonthName = (date) => {
  return format(new Date(date), 'MMMM yyyy');
};

// Get available months from expenses data
export const getAvailableMonths = (expenses) => {
  const months = [...new Set(expenses.map(expense => 
    format(new Date(expense.date), 'yyyy-MM')
  ))];
  return months.sort().reverse(); // Most recent first
};

// Helper function to format large numbers to prevent overflow
export const formatNumber = (number) => {
  const absNumber = Math.abs(number);
  if (absNumber >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (absNumber >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toFixed(2);
};

// Helper function to format currency with overflow protection
export const formatCurrencyNumber = (number, currencySymbol = '$') => {
  return `${currencySymbol}${formatNumber(number)}`;
}; 