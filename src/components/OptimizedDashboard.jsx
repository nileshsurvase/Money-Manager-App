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
import OptimizedCard from './OptimizedCard';
import Card from './Card';
import Button from './Button';
import ExpenseModal from './ExpenseModal';
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
import { useMemoizedCalculations, cardAnimation, staggerContainer, hoverAnimation } from '../utils/performance';

// Memoized expense item to prevent unnecessary re-renders
const ExpenseItem = memo(({ expense, category, formatCurrency }) => (
  <motion.div
    variants={cardAnimation}
    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
  >
    <div className="flex items-center space-x-3">
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: category?.color || '#6b7280' }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {expense.description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {category?.name || 'Uncategorized'} • {formatDate(expense.date)}
        </p>
      </div>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {formatCurrency(expense.amount)}
      </p>
    </div>
  </motion.div>
));

ExpenseItem.displayName = 'ExpenseItem';

// Memoized stats card component
const StatsCard = memo(({ title, value, change, trend, icon: Icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 400, damping: 25 }}
  >
    <OptimizedCard variant="stat" hover={false}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              {trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-600 dark:text-green-400' :
                trend === 'down' ? 'text-red-600 dark:text-red-400' :
                'text-gray-500 dark:text-gray-400'
              }`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 sm:p-3 rounded-xl">
          <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
    </OptimizedCard>
  </motion.div>
));

StatsCard.displayName = 'StatsCard';

// Main optimized dashboard component
const OptimizedDashboard = memo(() => {
  // Currency context with fallback
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

  // State management
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('month');
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  // Memoized data loading
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [expensesData, budgetsData, categoriesData] = await Promise.all([
        getExpenses(),
        getBudgets(),
        getCategories()
      ]);
      
      setExpenses(expensesData);
      setBudgets(budgetsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Memoized calculations for optimal performance
  const calculations = useMemoizedCalculations(expenses, budgets);

  // Memoized date calculations
  const dateCalculations = useMemo(() => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    return {
      currentSelectedMonthRange: getMonthRange(targetDate.getFullYear(), targetDate.getMonth()),
      currentSelectedMonthName: getMonthName(targetDate),
      previousMonthRange: getPreviousMonthRange()
    };
  }, [currentMonthOffset]);

  // Optimized event handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonthOffset(prev => prev - 1);
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonthOffset(prev => prev + 1);
  }, []);

  const handleTimeFilterChange = useCallback((filter) => {
    setTimeFilter(filter);
    setCurrentMonthOffset(0);
  }, []);

  const toggleExpenseModal = useCallback(() => {
    setIsExpenseModalOpen(prev => !prev);
  }, []);

  const toggleShowAllExpenses = useCallback(() => {
    setShowAllExpenses(prev => !prev);
  }, []);

  // Memoized filtered expenses
  const filteredExpenses = useMemo(() => {
    if (currentMonthOffset !== 0) {
      const { start, end } = dateCalculations.currentSelectedMonthRange;
      return filterExpensesByDateRange(expenses, start, end);
    }
    
    if (timeFilter === 'lastMonth') {
      const { start, end } = dateCalculations.previousMonthRange;
      return filterExpensesByDateRange(expenses, start, end);
    }
    
    return getCurrentMonthExpenses(expenses);
  }, [expenses, timeFilter, currentMonthOffset, dateCalculations]);

  // Memoized chart data
  const chartData = useMemo(() => {
    const categoryExpenses = groupExpensesByCategory(filteredExpenses);
    const monthlyData = groupExpensesByMonth(expenses);
    
    return {
      pieData: Object.entries(categoryExpenses).map(([categoryId, categoryExpenses]) => {
        const category = categories.find(cat => cat.id === categoryId);
        return {
          name: category?.name || 'Uncategorized',
          value: calculateTotal(categoryExpenses),
          color: category?.color || '#6b7280'
        };
      }).filter(item => item.value > 0),
      
      monthlyTrend: Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, expenses]) => ({
          month: month,
          amount: calculateTotal(expenses)
        }))
    };
  }, [filteredExpenses, expenses, categories]);

  // Memoized stats calculations
  const stats = useMemo(() => {
    const totalCurrentPeriod = calculateTotal(filteredExpenses);
    const previousMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const { start, end } = dateCalculations.previousMonthRange;
      return expenseDate >= start && expenseDate <= end;
    });
    const totalPreviousMonth = calculateTotal(previousMonthExpenses);
    const percentageChange = totalPreviousMonth > 0 
      ? ((totalCurrentPeriod - totalPreviousMonth) / totalPreviousMonth) * 100 
      : 0;

    return {
      totalCurrentPeriod,
      totalPreviousMonth,
      percentageChange,
      trend: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral'
    };
  }, [filteredExpenses, expenses, dateCalculations]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Quick Actions Header */}
      <motion.div
        variants={cardAnimation}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your expenses and manage your budget
          </p>
        </div>
        
        <motion.div {...hoverAnimation}>
          <Button 
            onClick={toggleExpenseModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Current Month Overview */}
      <motion.div variants={cardAnimation}>
        <OptimizedCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Current Month Overview
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={timeFilter === 'month' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleTimeFilterChange('month')}
              >
                This Month
              </Button>
              <Button
                variant={timeFilter === 'lastMonth' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleTimeFilterChange('lastMonth')}
              >
                Last Month
              </Button>
            </div>
          </div>
        </OptimizedCard>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatsCard
          title={dateCalculations.currentSelectedMonthName}
          value={formatCurrencyNumber(stats.totalCurrentPeriod, formatCurrency(0).charAt(0))}
          delay={0.1}
          icon={DollarSign}
        />
        
        <StatsCard
          title="Previous Month"
          value={formatCurrencyNumber(stats.totalPreviousMonth, formatCurrency(0).charAt(0))}
          change={stats.percentageChange}
          trend={stats.trend}
          delay={0.2}
          icon={Calendar}
        />
        
        <StatsCard
          title="Categories"
          value={chartData.pieData.length}
          delay={0.3}
          icon={Filter}
        />
        
        <StatsCard
          title="Total Expenses"
          value={expenses.length}
          delay={0.4}
          icon={Sparkles}
        />
      </div>

      {/* Month Navigation for First Card */}
      <motion.div variants={cardAnimation}>
        <OptimizedCard variant="stat">
          <div className="flex items-center justify-between">
            <motion.button
              {...hoverAnimation}
              onClick={goToPreviousMonth}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
            
            <div className="space-y-1 sm:space-y-2 flex-1 text-center px-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                {dateCalculations.currentSelectedMonthName}
              </p>
              <p className="currency-large font-bold text-lg sm:text-xl">
                {formatCurrencyNumber(stats.totalCurrentPeriod, formatCurrency(0).charAt(0))}
              </p>
              {stats.totalCurrentPeriod >= 1000 && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatCurrency(stats.totalCurrentPeriod)}
                </p>
              )}
            </div>
            
            <motion.button
              {...hoverAnimation}
              onClick={goToNextMonth}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
        </OptimizedCard>
      </motion.div>

      {/* Charts Section */}
      {chartData.pieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <motion.div variants={cardAnimation}>
            <OptimizedCard>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Category Breakdown
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </OptimizedCard>
          </motion.div>

          {/* Monthly Trend */}
          <motion.div variants={cardAnimation}>
            <OptimizedCard>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Monthly Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="month" stroke="currentColor" opacity={0.7} />
                    <YAxis stroke="currentColor" opacity={0.7} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </OptimizedCard>
          </motion.div>
        </div>
      )}

      {/* Recent Expenses */}
      <motion.div variants={cardAnimation}>
        <OptimizedCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Expenses
            </h3>
            <motion.button
              {...hoverAnimation}
              onClick={toggleShowAllExpenses}
              className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">
                {showAllExpenses ? 'Show Less' : 'View All'}
              </span>
            </motion.button>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            className="space-y-3"
          >
            {(showAllExpenses ? filteredExpenses : filteredExpenses.slice(0, 5)).map((expense) => {
              const category = categories.find(cat => cat.id === expense.categoryId);
              return (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  category={category}
                  formatCurrency={formatCurrency}
                />
              );
            })}
            
            {filteredExpenses.length === 0 && (
              <motion.div
                variants={cardAnimation}
                className="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                <p>No expenses found for this period</p>
              </motion.div>
            )}
          </motion.div>
        </OptimizedCard>
      </motion.div>

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={toggleExpenseModal}
          onExpenseAdded={loadData}
        />
      )}
    </motion.div>
  );
});

OptimizedDashboard.displayName = 'OptimizedDashboard';

export default OptimizedDashboard;
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
import OptimizedCard from './OptimizedCard';
import Card from './Card';
import Button from './Button';
import ExpenseModal from './ExpenseModal';
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
import { useMemoizedCalculations, cardAnimation, staggerContainer, hoverAnimation } from '../utils/performance';

// Memoized expense item to prevent unnecessary re-renders
const ExpenseItem = memo(({ expense, category, formatCurrency }) => (
  <motion.div
    variants={cardAnimation}
    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
  >
    <div className="flex items-center space-x-3">
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: category?.color || '#6b7280' }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {expense.description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {category?.name || 'Uncategorized'} • {formatDate(expense.date)}
        </p>
      </div>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {formatCurrency(expense.amount)}
      </p>
    </div>
  </motion.div>
));

ExpenseItem.displayName = 'ExpenseItem';

// Memoized stats card component
const StatsCard = memo(({ title, value, change, trend, icon: Icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 400, damping: 25 }}
  >
    <OptimizedCard variant="stat" hover={false}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              {trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-600 dark:text-green-400' :
                trend === 'down' ? 'text-red-600 dark:text-red-400' :
                'text-gray-500 dark:text-gray-400'
              }`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 sm:p-3 rounded-xl">
          <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
    </OptimizedCard>
  </motion.div>
));

StatsCard.displayName = 'StatsCard';

// Main optimized dashboard component
const OptimizedDashboard = memo(() => {
  // Currency context with fallback
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

  // State management
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('month');
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  // Memoized data loading
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [expensesData, budgetsData, categoriesData] = await Promise.all([
        getExpenses(),
        getBudgets(),
        getCategories()
      ]);
      
      setExpenses(expensesData);
      setBudgets(budgetsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Memoized calculations for optimal performance
  const calculations = useMemoizedCalculations(expenses, budgets);

  // Memoized date calculations
  const dateCalculations = useMemo(() => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    return {
      currentSelectedMonthRange: getMonthRange(targetDate.getFullYear(), targetDate.getMonth()),
      currentSelectedMonthName: getMonthName(targetDate),
      previousMonthRange: getPreviousMonthRange()
    };
  }, [currentMonthOffset]);

  // Optimized event handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonthOffset(prev => prev - 1);
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonthOffset(prev => prev + 1);
  }, []);

  const handleTimeFilterChange = useCallback((filter) => {
    setTimeFilter(filter);
    setCurrentMonthOffset(0);
  }, []);

  const toggleExpenseModal = useCallback(() => {
    setIsExpenseModalOpen(prev => !prev);
  }, []);

  const toggleShowAllExpenses = useCallback(() => {
    setShowAllExpenses(prev => !prev);
  }, []);

  // Memoized filtered expenses
  const filteredExpenses = useMemo(() => {
    if (currentMonthOffset !== 0) {
      const { start, end } = dateCalculations.currentSelectedMonthRange;
      return filterExpensesByDateRange(expenses, start, end);
    }
    
    if (timeFilter === 'lastMonth') {
      const { start, end } = dateCalculations.previousMonthRange;
      return filterExpensesByDateRange(expenses, start, end);
    }
    
    return getCurrentMonthExpenses(expenses);
  }, [expenses, timeFilter, currentMonthOffset, dateCalculations]);

  // Memoized chart data
  const chartData = useMemo(() => {
    const categoryExpenses = groupExpensesByCategory(filteredExpenses);
    const monthlyData = groupExpensesByMonth(expenses);
    
    return {
      pieData: Object.entries(categoryExpenses).map(([categoryId, categoryExpenses]) => {
        const category = categories.find(cat => cat.id === categoryId);
        return {
          name: category?.name || 'Uncategorized',
          value: calculateTotal(categoryExpenses),
          color: category?.color || '#6b7280'
        };
      }).filter(item => item.value > 0),
      
      monthlyTrend: Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, expenses]) => ({
          month: month,
          amount: calculateTotal(expenses)
        }))
    };
  }, [filteredExpenses, expenses, categories]);

  // Memoized stats calculations
  const stats = useMemo(() => {
    const totalCurrentPeriod = calculateTotal(filteredExpenses);
    const previousMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const { start, end } = dateCalculations.previousMonthRange;
      return expenseDate >= start && expenseDate <= end;
    });
    const totalPreviousMonth = calculateTotal(previousMonthExpenses);
    const percentageChange = totalPreviousMonth > 0 
      ? ((totalCurrentPeriod - totalPreviousMonth) / totalPreviousMonth) * 100 
      : 0;

    return {
      totalCurrentPeriod,
      totalPreviousMonth,
      percentageChange,
      trend: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral'
    };
  }, [filteredExpenses, expenses, dateCalculations]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Quick Actions Header */}
      <motion.div
        variants={cardAnimation}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your expenses and manage your budget
          </p>
        </div>
        
        <motion.div {...hoverAnimation}>
          <Button 
            onClick={toggleExpenseModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Current Month Overview */}
      <motion.div variants={cardAnimation}>
        <OptimizedCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Current Month Overview
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={timeFilter === 'month' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleTimeFilterChange('month')}
              >
                This Month
              </Button>
              <Button
                variant={timeFilter === 'lastMonth' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleTimeFilterChange('lastMonth')}
              >
                Last Month
              </Button>
            </div>
          </div>
        </OptimizedCard>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatsCard
          title={dateCalculations.currentSelectedMonthName}
          value={formatCurrencyNumber(stats.totalCurrentPeriod, formatCurrency(0).charAt(0))}
          delay={0.1}
          icon={DollarSign}
        />
        
        <StatsCard
          title="Previous Month"
          value={formatCurrencyNumber(stats.totalPreviousMonth, formatCurrency(0).charAt(0))}
          change={stats.percentageChange}
          trend={stats.trend}
          delay={0.2}
          icon={Calendar}
        />
        
        <StatsCard
          title="Categories"
          value={chartData.pieData.length}
          delay={0.3}
          icon={Filter}
        />
        
        <StatsCard
          title="Total Expenses"
          value={expenses.length}
          delay={0.4}
          icon={Sparkles}
        />
      </div>

      {/* Month Navigation for First Card */}
      <motion.div variants={cardAnimation}>
        <OptimizedCard variant="stat">
          <div className="flex items-center justify-between">
            <motion.button
              {...hoverAnimation}
              onClick={goToPreviousMonth}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
            
            <div className="space-y-1 sm:space-y-2 flex-1 text-center px-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                {dateCalculations.currentSelectedMonthName}
              </p>
              <p className="currency-large font-bold text-lg sm:text-xl">
                {formatCurrencyNumber(stats.totalCurrentPeriod, formatCurrency(0).charAt(0))}
              </p>
              {stats.totalCurrentPeriod >= 1000 && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatCurrency(stats.totalCurrentPeriod)}
                </p>
              )}
            </div>
            
            <motion.button
              {...hoverAnimation}
              onClick={goToNextMonth}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
        </OptimizedCard>
      </motion.div>

      {/* Charts Section */}
      {chartData.pieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <motion.div variants={cardAnimation}>
            <OptimizedCard>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Category Breakdown
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </OptimizedCard>
          </motion.div>

          {/* Monthly Trend */}
          <motion.div variants={cardAnimation}>
            <OptimizedCard>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Monthly Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="month" stroke="currentColor" opacity={0.7} />
                    <YAxis stroke="currentColor" opacity={0.7} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </OptimizedCard>
          </motion.div>
        </div>
      )}

      {/* Recent Expenses */}
      <motion.div variants={cardAnimation}>
        <OptimizedCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Expenses
            </h3>
            <motion.button
              {...hoverAnimation}
              onClick={toggleShowAllExpenses}
              className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">
                {showAllExpenses ? 'Show Less' : 'View All'}
              </span>
            </motion.button>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            className="space-y-3"
          >
            {(showAllExpenses ? filteredExpenses : filteredExpenses.slice(0, 5)).map((expense) => {
              const category = categories.find(cat => cat.id === expense.categoryId);
              return (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  category={category}
                  formatCurrency={formatCurrency}
                />
              );
            })}
            
            {filteredExpenses.length === 0 && (
              <motion.div
                variants={cardAnimation}
                className="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                <p>No expenses found for this period</p>
              </motion.div>
            )}
          </motion.div>
        </OptimizedCard>
      </motion.div>

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={toggleExpenseModal}
          onExpenseAdded={loadData}
        />
      )}
    </motion.div>
  );
});

OptimizedDashboard.displayName = 'OptimizedDashboard';

export default OptimizedDashboard;