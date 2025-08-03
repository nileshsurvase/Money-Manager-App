import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Modal from "../components/Modal";
import ExpenseModal from "../components/ExpenseModal";
import { getExpenses, deleteExpense } from "../utils/database";
import { getCategories } from "../utils/storage";
import {
  formatDate,
  getCurrentMonthRange,
  filterExpensesByDateRange,
  calculateTotal,
  getAvailableMonths,
  formatNumber,
  formatCurrencyNumber,
} from "../utils/dateHelpers";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedExpenses, setExpandedExpenses] = useState(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Add a small delay to ensure database has updated
      await new Promise((resolve) => setTimeout(resolve, 500));

      const expensesData = await getExpenses();
      const categoriesData = getCategories();

      console.log("Loaded expenses:", expensesData);
      console.log("Loaded categories:", categoriesData);

      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableMonths = useMemo(() => {
    return getAvailableMonths(expenses);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (expense) => expense.categoryId === selectedCategory
      );
    }

    // Month filter
    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-");
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filtered = filterExpensesByDateRange(filtered, startDate, endDate);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "description":
          comparison = a.description.localeCompare(b.description);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    expenses,
    searchTerm,
    selectedCategory,
    selectedMonth,
    sortBy,
    sortOrder,
  ]);

  const totalAmount = calculateTotal(filteredExpenses);

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: `${cat.icon} ${cat.name}`,
    })),
  ];

  const monthOptions = [
    { value: "", label: "All Months" },
    ...availableMonths.map((month) => ({
      value: month,
      label: formatDate(`${month}-01`, "MMMM yyyy"),
    })),
  ];

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "amount", label: "Amount" },
    { value: "description", label: "Description" },
  ];

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (expenseToDelete) {
      await deleteExpense(expenseToDelete.id);
      loadData();
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleExpenseModalClose = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const toggleExpenseExpansion = (expenseId) => {
    setExpandedExpenses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(expenseId)) {
        newSet.delete(expenseId);
      } else {
        newSet.add(expenseId);
      }
      return newSet;
    });
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Expenses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track your expenses
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-48"
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              placeholder="All Categories"
              className="flex-1"
            />
            <Select
              options={monthOptions}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              placeholder="All Months"
              className="flex-1 ml-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              placeholder="Sort by"
              className="flex-1"
            />
            <Button
              variant="secondary"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="ml-4"
            >
              {sortOrder === "asc" ? "↑" : "↓"} {sortOrder.toUpperCase()}
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <div className="space-y-4">
        <Card padding="small">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Expenses
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 break-all">
              ${formatNumber(totalAmount)}
            </p>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Card padding="small">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 break-all">
                $
                {filteredExpenses.length > 0
                  ? formatNumber(totalAmount / filteredExpenses.length)
                  : "0.00"}
              </p>
            </div>
          </Card>
          <Card padding="small">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Transactions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredExpenses.length}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Expenses List */}
      <Card>
        <div className="space-y-2">
          <AnimatePresence>
            {filteredExpenses.map((expense, index) => {
              const category = categories.find(
                (cat) => cat.id === expense.categoryId
              );
              const isExpanded = expandedExpenses.has(expense.id);
              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  {/* Collapsible Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => toggleExpenseExpansion(expense.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                          style={{
                            backgroundColor: category?.color || "#6b7280",
                          }}
                        >
                          {category?.icon || "📝"}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {expense.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(expense.date)} •{" "}
                          {category?.name || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 break-all">
                        ${formatNumber(expense.amount)}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-500"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="p-4 space-y-3">
                          {expense.notes && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Notes:
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {expense.notes}
                              </p>
                            </div>
                          )}
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditExpense(expense);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(expense);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💸</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No expenses found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {expenses.length === 0
                  ? "Start tracking your expenses by adding your first expense."
                  : "Try adjusting your filters to see more expenses."}
              </p>
              <Button onClick={() => setIsExpenseModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Expense
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={handleExpenseModalClose}
        expense={editingExpense}
        onSuccess={loadData}
      />

      {/* Floating Action Button */}
      <button
        onClick={() => {
          console.log('Floating button clicked!');
          console.log('Current modal state:', isExpenseModalOpen);
          setIsExpenseModalOpen(true);
          console.log('Modal state after set:', true);
        }}
        className="floating-action-button bg-gradient-to-r from-orange-500 to-red-500 text-white"
        style={{
          position: 'fixed',
          zIndex: 99999,
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease'
        }}
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Expense"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this expense? This action cannot be
            undone.
          </p>
          {expenseToDelete && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {expenseToDelete.description}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                ${formatNumber(expenseToDelete.amount)} •{" "}
                {formatDate(expenseToDelete.date)}
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
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

export default Expenses;
