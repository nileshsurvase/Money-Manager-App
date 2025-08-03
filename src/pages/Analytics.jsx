import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target,
  DollarSign
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  getExpenses, 
  getBudgets, 
  getCategories 
} from '../utils/storage';
import { 
  groupExpensesByMonth,
  groupExpensesByCategory,
  calculateTotal,
  formatDate,
  getCurrentMonthExpenses,
  getPreviousMonthRange,
  filterExpensesByDateRange,
  formatNumber,
  formatCurrencyNumber
} from '../utils/dateHelpers';

const Analytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('6months'); // 3months, 6months, 1year

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const expensesData = getExpenses();
      const budgetsData = getBudgets();
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

  // Monthly trends data
  const monthlyTrends = useMemo(() => {
    const grouped = groupExpensesByMonth(expenses);
    const months = Object.keys(grouped).sort();
    
    const timeframePeriods = {
      '3months': 3,
      '6months': 6,
      '1year': 12
    };
    
    const periodCount = timeframePeriods[timeframe];
    const recentMonths = months.slice(-periodCount);
    
    return recentMonths.map(monthKey => {
      const monthExpenses = grouped[monthKey];
      const categoryBreakdown = groupExpensesByCategory(monthExpenses);
      
      const data = {
        month: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        total: calculateTotal(monthExpenses),
        fullMonth: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
      
      // Add category totals
      categories.forEach(category => {
        data[category.name] = calculateTotal(categoryBreakdown[category.id] || []);
      });
      
      return data;
    });
  }, [expenses, categories, timeframe]);

  // Category analysis
  const categoryAnalysis = useMemo(() => {
    const currentMonth = getCurrentMonthExpenses(expenses);
    const grouped = groupExpensesByCategory(currentMonth);
    
    return categories.map(category => {
      const categoryExpenses = grouped[category.id] || [];
      const spent = calculateTotal(categoryExpenses);
      const budget = budgets.find(b => b.categoryId === category.id);
      const transactionCount = categoryExpenses.length;
      
      // Calculate average transaction amount
      const avgTransaction = transactionCount > 0 ? spent / transactionCount : 0;
      
      return {
        ...category,
        spent,
        budget: budget?.amount || 0,
        transactionCount,
        avgTransaction,
        percentage: budget?.amount ? (spent / budget.amount) * 100 : 0,
      };
    }).filter(cat => cat.spent > 0).sort((a, b) => b.spent - a.spent);
  }, [expenses, categories, budgets]);

  // Spending patterns
  const spendingPatterns = useMemo(() => {
    const currentMonth = getCurrentMonthExpenses(expenses);
    const { start: prevStart, end: prevEnd } = getPreviousMonthRange();
    const previousMonth = filterExpensesByDateRange(expenses, prevStart, prevEnd);
    
    const currentTotal = calculateTotal(currentMonth);
    const previousTotal = calculateTotal(previousMonth);
    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
    
    // Daily averages
    const daysInCurrentMonth = new Date().getDate();
    const dailyAverage = currentTotal / daysInCurrentMonth;
    
    // Category with highest spending
    const topCategory = categoryAnalysis[0];
    
    // Most frequent transaction amount range
    const amounts = currentMonth.map(exp => exp.amount);
    const ranges = {
      '0-25': amounts.filter(a => a >= 0 && a <= 25).length,
      '25-50': amounts.filter(a => a > 25 && a <= 50).length,
      '50-100': amounts.filter(a => a > 50 && a <= 100).length,
      '100+': amounts.filter(a => a > 100).length,
    };
    const mostCommonRange = Object.entries(ranges).reduce((a, b) => ranges[a[0]] > ranges[b[0]] ? a : b)[0];
    
    return {
      currentTotal,
      previousTotal,
      change,
      dailyAverage,
      topCategory,
      mostCommonRange,
      transactionCount: currentMonth.length,
    };
  }, [expenses, categoryAnalysis]);

  // Chart colors for categories
  const categoryColors = categories.reduce((acc, cat, index) => {
    acc[cat.name] = cat.color;
    return acc;
  }, {});

  const pieChartData = categoryAnalysis.map(cat => ({
    name: cat.name,
    value: cat.spent,
    color: cat.color,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Insights and trends from your spending data
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex rounded-lg border border-gray-200 dark:border-gray-700">
          {[
            { key: '3months', label: '3M' },
            { key: '6months', label: '6M' },
            { key: '1year', label: '1Y' },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setTimeframe(option.key)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                timeframe === option.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${option.key === '3months' ? 'rounded-l-lg' : option.key === '1year' ? 'rounded-r-lg' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-primary-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${formatNumber(spendingPatterns.currentTotal)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {spendingPatterns.change >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-red-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-green-500" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  vs Last Month
                </p>
                <p className={`text-2xl font-bold ${
                  spendingPatterns.change >= 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {spendingPatterns.change >= 0 ? '+' : ''}{spendingPatterns.change.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-accent-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Daily Average
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${formatNumber(spendingPatterns.dailyAverage)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {spendingPatterns.transactionCount}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trends */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Monthly Spending Trends
          </h3>
          {monthlyTrends.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${formatNumber(value)}`, 'Amount']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8b5cf6" 
                    fill="url(#colorGradient)"
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </Card>

        {/* Category Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Category Distribution (This Month)
          </h3>
          {pieChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${formatNumber(value)}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No expenses this month
            </div>
          )}
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Category Breakdown (This Month)
        </h3>
        
        <div className="space-y-6">
          {categoryAnalysis.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.transactionCount} transactions • Avg: ${formatNumber(category.avgTransaction)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    ${formatNumber(category.spent)}
                  </p>
                  {category.budget > 0 && (
                    <p className={`text-sm ${
                      category.percentage > 100 ? 'text-red-500' :
                      category.percentage > 80 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {category.percentage.toFixed(1)}% of budget
                    </p>
                  )}
                </div>
              </div>
              
              {category.budget > 0 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      category.percentage > 100 ? 'bg-red-500' :
                      category.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(category.percentage, 100)}%` }}
                  />
                </div>
              )}
            </motion.div>
          ))}
          
          {categoryAnalysis.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No expenses this month to analyze
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Insights */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Spending Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Top Spending Category
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {spendingPatterns.topCategory ? (
                  <>
                    <span className="font-medium">{spendingPatterns.topCategory.name}</span> accounts for{' '}
                    <span className="font-bold break-all">${formatNumber(spendingPatterns.topCategory.spent)}</span> of your spending this month.
                  </>
                ) : (
                  'No spending data available for this month.'
                )}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Transaction Patterns
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Most of your transactions ({spendingPatterns.mostCommonRange}) fall in the $
                {spendingPatterns.mostCommonRange.replace('-', ' - $')} range.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Monthly Comparison
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {spendingPatterns.change >= 0 ? (
                  <>You've spent <span className="font-bold">{spendingPatterns.change.toFixed(1)}% more</span> this month compared to last month.</>
                ) : (
                  <>You've spent <span className="font-bold">{Math.abs(spendingPatterns.change).toFixed(1)}% less</span> this month compared to last month.</>
                )}
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                Daily Spending
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Your daily average spending is <span className="font-bold break-all">${formatNumber(spendingPatterns.dailyAverage)}</span> this month.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Analytics; 