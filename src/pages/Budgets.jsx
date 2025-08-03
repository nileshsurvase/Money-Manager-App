import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Target, 
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import { 
  getBudgets, 
  getExpenses, 
  getCategories,
  addBudget,
  updateBudget,
  deleteBudget
} from '../utils/storage';
import { 
  getCurrentMonthExpenses,
  getPreviousMonthRange,
  getMonthRange,
  getMonthName,
  filterExpensesByDateRange,
  calculateTotal,
  groupExpensesByCategory
} from '../utils/dateHelpers';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  
  // Month navigation state
  const [timeFilter, setTimeFilter] = useState('month'); // 'lastMonth', 'month'
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0); // 0 = current month, -1 = previous month, etc.

  // Form state
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly', // monthly, weekly
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const budgetsData = getBudgets();
      const expensesData = getExpenses();
      const categoriesData = getCategories();
      
      setBudgets(budgetsData);
      setExpenses(expensesData);
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

  // Get filtered expenses based on selected time period
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

  const expensesByCategory = groupExpensesByCategory(filteredExpenses);

  const budgetProgress = useMemo(() => {
    return budgets.map(budget => {
      const category = categories.find(cat => cat.id === budget.categoryId);
      const spent = calculateTotal(expensesByCategory[budget.categoryId] || []);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const remaining = budget.amount - spent;
      
      return {
        ...budget,
        category,
        spent,
        percentage,
        remaining,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
      };
    });
  }, [budgets, categories, expensesByCategory]);

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgetProgress.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  // Helper function to format large numbers to prevent overflow
  const formatNumber = (number) => {
    const absNumber = Math.abs(number);
    if (absNumber >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (absNumber >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toFixed(2);
  };

  // Helper function to get display period name
  const getDisplayPeriodName = () => {
    if (currentMonthOffset !== 0) {
      return currentSelectedMonthName;
    }
    return timeFilter === 'lastMonth' ? 'Last Month' : 'This Month';
  };

  const availableCategories = categories.filter(category => 
    !budgets.some(budget => budget.categoryId === category.id) || 
    (editingBudget && editingBudget.categoryId === category.id)
  );

  const categoryOptions = availableCategories.map(cat => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name}`,
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const budgetData = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id, budgetData);
      } else {
        await addBudget(budgetData);
      }

      loadData();
      handleModalClose();
    } catch (error) {
      console.error('Error saving budget:', error);
      setErrors({ submit: 'Failed to save budget. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      period: budget.period,
    });
    setIsBudgetModalOpen(true);
  };

  const handleDeleteClick = (budget) => {
    setBudgetToDelete(budget);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (budgetToDelete) {
      await deleteBudget(budgetToDelete.id);
      loadData();
      setDeleteModalOpen(false);
      setBudgetToDelete(null);
    }
  };

  const handleModalClose = () => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
    setFormData({
      categoryId: '',
      amount: '',
      period: 'monthly',
    });
    setErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Budgets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set and track your spending limits by category
          </p>
        </div>
      </div>

      {/* Time Filter and Month Navigation */}
      <Card>
        <div className="flex items-center justify-between">
          {/* Time Filter Buttons */}
          <div className="flex space-x-2">
            <Button
              variant={timeFilter === 'month' && currentMonthOffset === 0 ? 'primary' : 'secondary'}
              size="small"
              onClick={() => handleTimeFilterChange('month')}
            >
              This Month
            </Button>
            <Button
              variant={timeFilter === 'lastMonth' && currentMonthOffset === 0 ? 'primary' : 'secondary'}
              size="small"
              onClick={() => handleTimeFilterChange('lastMonth')}
            >
              Last Month
            </Button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="small"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2 min-w-[200px] justify-center">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {getDisplayPeriodName()}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="small"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-primary-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Budget
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 break-all">
                  ${formatNumber(totalBudget)}
                </p>
              </div>
            </div>
            <Button onClick={() => setIsBudgetModalOpen(true)} variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Spent
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 break-all">
                  ${formatNumber(totalSpent)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className={`h-8 w-8 ${totalRemaining >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Remaining
                </p>
                <p className={`text-2xl font-bold break-all ${totalRemaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${formatNumber(totalRemaining)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Budget Progress */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Budget Progress - {getDisplayPeriodName()}
        </h3>
        
        <div className="space-y-6">
          <AnimatePresence>
            {budgetProgress.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: item.category?.color || '#6b7280' }}
                    >
                      {item.category?.icon || '📝'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.category?.name || 'Unknown Category'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                        ${formatNumber(item.spent)} of ${formatNumber(item.amount)}
                      </p>
                    </div>
                    {item.status === 'exceeded' && (
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className={`text-sm font-medium ${
                      item.status === 'exceeded' ? 'text-red-500' :
                      item.status === 'warning' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {item.percentage.toFixed(1)}%
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleEditBudget(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.percentage, 100)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      item.status === 'exceeded' ? 'bg-red-500' :
                      item.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span className="break-all">Spent: ${formatNumber(item.spent)}</span>
                  <span className={`break-all ${item.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.remaining >= 0 ? 'Remaining' : 'Over budget'}: ${formatNumber(Math.abs(item.remaining))}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {budgetProgress.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No budgets set
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start managing your spending by setting budgets for different categories.
              </p>
              <Button onClick={() => setIsBudgetModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Budget Modal */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={handleModalClose}
        title={editingBudget ? 'Edit Budget' : 'Add New Budget'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Category"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            options={categoryOptions}
            error={errors.categoryId}
            placeholder="Select a category"
            required
          />

          <Input
            label="Budget Amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleInputChange}
            error={errors.amount}
            placeholder="0.00"
            required
          />

          <Select
            label="Period"
            name="period"
            value={formData.period}
            onChange={handleInputChange}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'weekly', label: 'Weekly' },
            ]}
            required
          />

          {errors.submit && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleModalClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={saving}
            >
              {editingBudget ? 'Update' : 'Add'} Budget
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Budget"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this budget? This action cannot be undone.
          </p>
          {budgetToDelete && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {categories.find(cat => cat.id === budgetToDelete.categoryId)?.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                ${formatNumber(budgetToDelete.amount)} {budgetToDelete.period}
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Budgets; 