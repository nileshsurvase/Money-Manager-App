import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Plus,
  Eye,
  Filter,
  IndianRupee,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import Card from '../components/Card';
import OptimizedCard from '../components/OptimizedCard';
import Button from '../components/Button';
import ExpenseModal from '../components/ExpenseModal';
import { 
  getExpenses, 
  getBudgets
} from '../utils/database';
import { 
  getCategories
} from '../utils/storage';
import { useCurrency } from '../context/CurrencyContext';
import { 
  getCurrentMonthExpenses, 
  getCurrentWeekExpenses, 
  getPreviousMonthRange,
  getMonthRange,
  formatDate,
  calculateTotal,
  groupExpensesByCategory,
  groupExpensesByMonth,
  getMonthName,
  filterExpensesByDateRange,
  formatNumber,
  formatCurrencyNumber
} from '../utils/dateHelpers';
import { 
  cardAnimation, 
  staggerContainer, 
  hoverAnimation,
  useMemoizedCalculations,
  usePerformanceMonitor,
  useBatchState
} from '../utils/performance';

const Dashboard = memo(() => {
  // Performance monitoring
  usePerformanceMonitor('Dashboard');
  
  let formatCurrency, formatAbbreviatedAmount;
  
  try {
    const currencyContext = useCurrency();
    formatCurrency = currencyContext.formatCurrency;
    formatAbbreviatedAmount = currencyContext.formatAbbreviatedAmount;
  } catch (error) {
    console.warn('Currency context not available, using fallback:', error);
    formatCurrency = (amount) => `₹${amount}`;
    formatAbbreviatedAmount = (amount) => `₹${amount}`;
  }

  // Batch state updates for better performance
  const [state, batchUpdate] = useBatchState({
    expenses: [],
    budgets: [],
    categories: [],
    isExpenseModalOpen: false,
    timeFilter: 'month',
    currentMonthOffset: 0,
    loading: true,
    showAllExpenses: false
  });

  const { 
    expenses, 
    budgets, 
    categories, 
    isExpenseModalOpen, 
    timeFilter, 
    currentMonthOffset, 
    loading, 
    showAllExpenses 
  } = state;

  const loadData = useCallback(async () => {
    batchUpdate([
      { loading: true }
    ]);
    
    try {
      const [expensesData, budgetsData, categoriesData] = await Promise.all([
        getExpenses(),
        getBudgets(),
        getCategories()
      ]);
      
      batchUpdate([
        { expenses: expensesData },
        { budgets: budgetsData },
        { categories: categoriesData },
        { loading: false }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      batchUpdate([{ loading: false }]);
    }
  }, [batchUpdate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get the current selected month range
  const currentSelectedMonthRange = useMemo(() => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    return getMonthRange(targetDate.getFullYear(), targetDate.getMonth());
  }, [currentMonthOffset]);

  // Get the current selected month name
  const currentSelectedMonthName = useMemo(() => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    return getMonthName(targetDate);
  }, [currentMonthOffset]);

  // Memoized calculations for better performance
  const calculations = useMemoizedCalculations(expenses, budgets);

  // Get filtered expenses based on time filter
  const filteredExpenses = useMemo(() => {
    if (timeFilter === 'month') {
      return getCurrentMonthExpenses(expenses);
    } else if (timeFilter === 'week') {
      return getCurrentWeekExpenses(expenses);
    } else if (timeFilter === 'lastMonth') {
      const { start, end } = getPreviousMonthRange();
      return filterExpensesByDateRange(expenses, start, end);
    }
    return expenses;
  }, [expenses, timeFilter]);

  // Get expenses for the selected month
  const selectedMonthExpenses = useMemo(() => {
    const { start, end } = currentSelectedMonthRange;
    return filterExpensesByDateRange(expenses, start, end);
  }, [expenses, currentSelectedMonthRange]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalExpenses = calculateTotal(filteredExpenses);
    const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
    const remaining = totalBudget - totalExpenses;
    
    return {
      totalExpenses,
      totalBudget,
      remaining,
      percentage: totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0
    };
  }, [filteredExpenses, budgets]);

  // Chart data
  const chartData = useMemo(() => {
    const categoryData = groupExpensesByCategory(filteredExpenses, categories);
    return Object.entries(categoryData).map(([categoryId, amount]) => {
      const category = categories.find(cat => cat.id === categoryId);
      return {
        name: category?.name || 'Unknown',
        value: amount,
        color: category?.color || '#64748b'
      };
    });
  }, [filteredExpenses, categories]);

  // Monthly trend data
  const monthlyTrendData = useMemo(() => {
    const monthlyData = groupExpensesByMonth(expenses);
    return Object.entries(monthlyData).map(([month, amount]) => ({
      month: getMonthName(new Date(month)),
      amount
    }));
  }, [expenses]);

  // Event handlers with useCallback
  const handleAddExpense = useCallback(() => {
    batchUpdate([{ isExpenseModalOpen: true }]);
  }, [batchUpdate]);

  const handleExpenseModalClose = useCallback(() => {
    batchUpdate([{ isExpenseModalOpen: false }]);
  }, [batchUpdate]);

  const handleExpenseSuccess = useCallback(() => {
    loadData();
    handleExpenseModalClose();
  }, [loadData, handleExpenseModalClose]);

  const goToPreviousMonth = useCallback(() => {
    batchUpdate([{ currentMonthOffset: currentMonthOffset - 1 }]);
  }, [currentMonthOffset, batchUpdate]);

  const goToNextMonth = useCallback(() => {
    batchUpdate([{ currentMonthOffset: currentMonthOffset + 1 }]);
  }, [currentMonthOffset, batchUpdate]);

  const handleTimeFilterChange = useCallback((filter) => {
    batchUpdate([{ timeFilter: filter }]);
  }, [batchUpdate]);

  const toggleShowAllExpenses = useCallback(() => {
    batchUpdate([{ showAllExpenses: !showAllExpenses }]);
  }, [showAllExpenses, batchUpdate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-large"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6 p-4 sm:p-6"
    >
      {/* Header Section */}
      <motion.div variants={cardAnimation} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Money Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your expenses and stay on budget
          </p>
        </div>
        <Button
          onClick={handleAddExpense}
          className="flex items-center gap-2"
          variants={hoverAnimation}
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </motion.div>

      {/* Main Stats Cards */}
      <motion.div variants={cardAnimation} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OptimizedCard variant="stat" className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold">
                {formatCurrencyNumber(totals.totalExpenses)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-200" />
          </div>
        </OptimizedCard>

        <OptimizedCard variant="stat" className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Budget</p>
              <p className="text-2xl font-bold">
                {formatCurrencyNumber(totals.totalBudget)}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-200" />
          </div>
        </OptimizedCard>

        <OptimizedCard variant="stat" className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Remaining</p>
              <p className="text-2xl font-bold">
                {formatCurrencyNumber(totals.remaining)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </OptimizedCard>

        <OptimizedCard variant="stat" className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Usage</p>
              <p className="text-2xl font-bold">
                {totals.percentage.toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-200" />
          </div>
        </OptimizedCard>
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={cardAnimation} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OptimizedCard>
          <h3 className="text-lg font-semibold mb-4">Expense by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrencyNumber(value)} />
            </PieChart>
          </ResponsiveContainer>
        </OptimizedCard>

        <OptimizedCard>
          <h3 className="text-lg font-semibold mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrencyNumber(value)} />
              <Bar dataKey="amount" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </OptimizedCard>
      </motion.div>

      {/* Recent Expenses */}
      <motion.div variants={cardAnimation}>
        <OptimizedCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Expenses</h3>
            <Button
              variant="ghost"
              onClick={toggleShowAllExpenses}
              className="flex items-center gap-2"
            >
              {showAllExpenses ? <Eye className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
              {showAllExpenses ? 'Show Less' : 'Show All'}
            </Button>
          </div>
          
          <div className="space-y-3">
            {(showAllExpenses ? filteredExpenses : filteredExpenses.slice(0, 5)).map((expense) => (
              <motion.div
                key={expense.id}
                variants={hoverAnimation}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-red-600 dark:text-red-400">
                  -{formatCurrencyNumber(expense.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        </OptimizedCard>
      </motion.div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={handleExpenseModalClose}
        onSuccess={handleExpenseSuccess}
      />
    </motion.div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard; 