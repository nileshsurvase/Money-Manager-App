import { useState, useEffect, useMemo } from 'react';
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

const Dashboard = () => {
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
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('month'); // 'lastMonth', 'month'
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0); // 0 = current month, -1 = previous month, etc.
  const [loading, setLoading] = useState(true);
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const expensesData = await getExpenses();
      const budgetsData = await getBudgets();
      const categoriesData = getCategories();
      
      setExpenses(expensesData);
      setBudgets(budgetsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonthOffset(prev => prev - 1);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonthOffset(prev => prev + 1);
  };

  // Handle time filter change and reset month navigation
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    setCurrentMonthOffset(0); // Reset to current month when switching filters
  };

  const filteredExpenses = useMemo(() => {
    // If we're navigating to a different month (not current month), use custom month navigation
    if (currentMonthOffset !== 0) {
      const { start, end } = currentSelectedMonthRange;
      return filterExpensesByDateRange(expenses, start, end);
    }
    
    // Otherwise, use the selected time filter for current month
    if (timeFilter === 'lastMonth') {
      // Show previous month expenses
      const { start, end } = getPreviousMonthRange();
      return filterExpensesByDateRange(expenses, start, end);
    } else {
      // Show current month expenses (timeFilter === 'month')
      return getCurrentMonthExpenses(expenses);
    }
  }, [expenses, timeFilter, currentMonthOffset, currentSelectedMonthRange]);

  const previousMonthExpenses = useMemo(() => {
    const { start, end } = getPreviousMonthRange();
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= start && expenseDate <= end;
    });
  }, [expenses]);

  const totalCurrentPeriod = calculateTotal(filteredExpenses);
  const totalPreviousMonth = calculateTotal(previousMonthExpenses);
  const percentageChange = totalPreviousMonth > 0 
    ? ((totalCurrentPeriod - totalPreviousMonth) / totalPreviousMonth) * 100 
    : 0;

  const categoryExpenses = useMemo(() => {
    const grouped = groupExpensesByCategory(filteredExpenses);
    return categories.map(category => {
      const categoryTotal = calculateTotal(grouped[category.id] || []);
      const budget = budgets.find(b => b.categoryId === category.id);
      return {
        ...category,
        spent: categoryTotal,
        budget: budget?.amount || 0,
        percentage: budget?.amount ? (categoryTotal / budget.amount) * 100 : 0,
      };
    }).filter(cat => cat.spent > 0 || cat.budget > 0);
  }, [filteredExpenses, categories, budgets]);

  const chartData = categoryExpenses.map(cat => ({
    name: cat.name,
    value: cat.spent,
    color: cat.color,
  }));

  const monthlyTrends = useMemo(() => {
    const grouped = groupExpensesByMonth(expenses);
    return Object.keys(grouped)
      .sort()
      .slice(-6)
      .map(monthKey => ({
        month: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short' }),
        amount: calculateTotal(grouped[monthKey]),
      }));
  }, [expenses]);

  // Get recent expenses (limit to 5 by default)
  const recentExpenses = useMemo(() => {
    const displayLimit = showAllExpenses ? filteredExpenses.length : 5;
    return filteredExpenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, displayLimit);
  }, [filteredExpenses, showAllExpenses]);

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const budgetUtilization = totalBudget > 0 ? (totalCurrentPeriod / totalBudget) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center padding-responsive">
        <div className="text-center spacing-md">
          <div className="spinner-large mx-auto" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Loading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Getting your financial overview ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spacing-lg">
      {/* Mobile-First Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card variant="glass" className="relative">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <h1 className="text-gradient flex items-center gap-2 sm:gap-3">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 animate-pulse" />
                Financial Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
                Your comprehensive financial overview
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Time Filter Options */}
              <div className="flex rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-1">
                <button
                  onClick={() => handleTimeFilterChange('lastMonth')}
                  className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300 touch-target ${
                    timeFilter === 'lastMonth'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  Last Month
                </button>
                <button
                  onClick={() => handleTimeFilterChange('month')}
                  className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300 touch-target ${
                    timeFilter === 'month'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  This Month
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Mobile-Optimized Stats Cards - 2x2 Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="stat">
            <div className="flex items-center justify-between">
              <button
                onClick={goToPreviousMonth}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 touch-target"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1 text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                  {currentSelectedMonthName}
                </p>
                <p className="currency-large truncate break-all">
                  {formatCurrencyNumber(totalCurrentPeriod, formatCurrency(0).charAt(0))}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate break-all">
                  ${totalCurrentPeriod.toFixed(2)}
                </p>
              </div>
              <button
                onClick={goToNextMonth}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 touch-target"
              >
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="stat">
            <div className="flex items-center justify-between">
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                  vs Last Month
                </p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold truncate ${
                  percentageChange >= 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate break-all">
                  {formatCurrencyNumber(Math.abs(totalCurrentPeriod - totalPreviousMonth), formatCurrency(0).charAt(0))}
                </p>
              </div>
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ${
                percentageChange >= 0 
                  ? 'bg-gradient-to-br from-red-400 to-red-600' 
                  : 'bg-gradient-to-br from-green-400 to-green-600'
              }`}>
                {percentageChange >= 0 ? (
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                ) : (
                  <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="stat">
            <div className="flex items-center justify-between">
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                  Avg Daily Spend
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate break-all">
                  {formatCurrencyNumber(filteredExpenses.length > 0 ? totalCurrentPeriod / filteredExpenses.length : 0, formatCurrency(0).charAt(0))}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                  {filteredExpenses.length} Transactions
                </p>
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="stat">
            <div className="flex items-center justify-between">
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                  Budget Used
                </p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold truncate ${
                  budgetUtilization > 100 ? 'text-red-500' : 
                  budgetUtilization > 80 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {budgetUtilization.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate break-all">
                  of {formatCurrencyNumber(totalBudget, formatCurrency(0).charAt(0))}
                </p>
              </div>
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ${
                budgetUtilization > 100 ? 'bg-gradient-to-br from-red-400 to-red-600' :
                budgetUtilization > 80 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                'bg-gradient-to-br from-green-400 to-green-600'
              }`}>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold">%</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Mobile-Responsive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="default" className="chart-container">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-2">
              <div className="w-1 sm:w-2 h-4 sm:h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
              Expenses by Category
            </h3>
            {chartData.length > 0 ? (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Amount']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        fontSize: '14px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 sm:h-80 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 spacing-sm">
                <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">📊</div>
                <p className="font-medium text-center">No expenses to display</p>
                <p className="text-sm text-center">Add some expenses to see the breakdown</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card variant="default" className="chart-container">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-2">
              <div className="w-1 sm:w-2 h-4 sm:h-6 bg-gradient-to-b from-green-500 to-orange-500 rounded-full"></div>
              Monthly Trends
            </h3>
            {monthlyTrends.length > 0 ? (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => formatAbbreviatedAmount(value)}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Amount']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        fontSize: '14px',
                      }}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="url(#colorGradient)"
                      strokeWidth={3}
                      dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2, fill: '#fff' }}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 sm:h-80 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 spacing-sm">
                <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">📈</div>
                <p className="font-medium text-center">No data available</p>
                <p className="text-sm text-center">Start adding expenses to see trends</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section: Budget Progress and Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Budget Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-2">
              <div className="w-1 sm:w-2 h-4 sm:h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
              Budget Progress
            </h3>
            <div className="spacing-sm">
              {categoryExpenses.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="spacing-xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-sm sm:text-lg shadow-lg flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                          {category.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                          {formatCurrency(category.spent)} of {formatCurrency(category.budget)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-sm sm:text-lg font-bold ${
                        category.percentage > 100 ? 'text-red-500' :
                        category.percentage > 80 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(category.percentage, 100)}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                      className={`h-2 sm:h-3 rounded-full relative overflow-hidden ${
                        category.percentage > 100 ? 'bg-red-500' :
                        category.percentage > 80 ? 'bg-yellow-500' : 'bg-gradient-to-r from-orange-500 to-red-500'
                      }`}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
              {categoryExpenses.length === 0 && (
                <div className="text-center py-6 sm:py-8 spacing-sm">
                  <div className="text-4xl sm:text-6xl">🎯</div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No budgets set yet
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Create your first budget to track spending
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 min-w-0">
                <div className="w-1 sm:w-2 h-4 sm:h-6 bg-gradient-to-b from-green-500 to-orange-500 rounded-full flex-shrink-0"></div>
                <span className="truncate">Recent Expenses</span>
              </h3>
              {filteredExpenses.length > 5 && (
                <Button 
                  variant="secondary" 
                  size="small" 
                  className="flex-shrink-0"
                  onClick={() => setShowAllExpenses(!showAllExpenses)}
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {showAllExpenses ? 'Show Less' : 'View All'}
                  </span>
                  <span className="sm:hidden">
                    {showAllExpenses ? 'Less' : 'All'}
                  </span>
                </Button>
              )}
            </div>
            <div className="spacing-xs">
              {recentExpenses.map((expense, index) => {
                const category = categories.find(cat => cat.id === expense.categoryId);
                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-sm sm:text-lg shadow-lg flex-shrink-0"
                        style={{ backgroundColor: category?.color || '#6b7280' }}
                      >
                        {category?.icon || '📝'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                          {expense.description}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                          {formatDate(expense.date)} • {category?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="currency-medium">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              {recentExpenses.length === 0 && (
                <div className="text-center py-6 sm:py-8 spacing-sm">
                  <div className="text-4xl sm:text-6xl">📝</div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No recent expenses
                  </p>
                  <Button 
                    onClick={() => setIsExpenseModalOpen(true)} 
                    variant="primary"
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Expense
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsExpenseModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus className="h-6 w-6 text-white" />
      </motion.button>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Dashboard; 