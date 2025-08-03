import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PiggyBank, 
  DollarSign, 
  TrendingUp, 
  Calculator,
  Target,
  CheckCircle,
  Info,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  Save
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getBudgetData, updateBudgetData, saveCalculatorResult } from '../../utils/freedomosStorage';

const BudgetingEngine = () => {
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [budgetData, setBudgetData] = useState(null);
  const [monthlyEntries, setMonthlyEntries] = useState([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState(null);
  
  // New entry form
  const [newEntry, setNewEntry] = useState({
    month: getCurrentMonth(),
    year: new Date().getFullYear(),
    saved: 0,
    invested: 0,
    needs: 0,
    wants: 0
  });

  useEffect(() => {
    calculateBudget();
    loadMonthlyEntries();
  }, [monthlyIncome]);

  function getCurrentMonth() {
    return new Date().toLocaleDateString('en-US', { month: 'long' });
  }

  const calculateBudget = () => {
    const needs = Math.round(monthlyIncome * 0.5);
    const wants = Math.round(monthlyIncome * 0.3);
    const savings = Math.round(monthlyIncome * 0.2);

    const budget = {
      income: monthlyIncome,
      ideal: { needs, wants, savings },
      actual: {
        needs: newEntry.needs || needs,
        wants: newEntry.wants || wants,
        savings: (newEntry.saved || 0) + (newEntry.invested || 0)
      },
      totalExpenses: (newEntry.needs || needs) + (newEntry.wants || wants),
      savingsRate: (((newEntry.saved || 0) + (newEntry.invested || 0)) / monthlyIncome * 100).toFixed(1)
    };

    setBudgetData(budget);
    updateBudgetData(budget);
  };

  const loadMonthlyEntries = () => {
    const entries = JSON.parse(localStorage.getItem('freedomos_monthly_budgets') || '[]');
    
    // Generate default entries from August 2025 if none exist
    if (entries.length === 0) {
      const defaultEntries = generateDefaultEntries();
      setMonthlyEntries(defaultEntries);
      localStorage.setItem('freedomos_monthly_budgets', JSON.stringify(defaultEntries));
    } else {
      setMonthlyEntries(entries);
    }
  };

  const generateDefaultEntries = () => {
    const months = [
      'August', 'September', 'October', 'November', 'December'
    ];
    
    return months.map((month, index) => ({
      id: Date.now() + index,
      month,
      year: 2025,
      saved: Math.round(monthlyIncome * 0.1 + Math.random() * monthlyIncome * 0.1),
      invested: Math.round(monthlyIncome * 0.1 + Math.random() * monthlyIncome * 0.1),
      needs: Math.round(monthlyIncome * 0.5 + Math.random() * monthlyIncome * 0.05),
      wants: Math.round(monthlyIncome * 0.3 + Math.random() * monthlyIncome * 0.05),
      createdAt: new Date().toISOString()
    }));
  };

  const addMonthlyEntry = () => {
    const entry = {
      ...newEntry,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    const updatedEntries = [entry, ...monthlyEntries];
    setMonthlyEntries(updatedEntries);
    localStorage.setItem('freedomos_monthly_budgets', JSON.stringify(updatedEntries));
    
    // Reset form
    setNewEntry({
      month: getCurrentMonth(),
      year: new Date().getFullYear(),
      saved: 0,
      invested: 0,
      needs: 0,
      wants: 0
    });
    setShowAddEntry(false);
    
    // Recalculate budget
    calculateBudget();
  };

  const toggleMonthExpansion = (monthId) => {
    setExpandedMonth(expandedMonth === monthId ? null : monthId);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const pieData = budgetData ? [
    { name: 'Needs (50%)', value: budgetData.ideal.needs, color: '#3B82F6' },
    { name: 'Wants (30%)', value: budgetData.ideal.wants, color: '#F59E0B' },
    { name: 'Savings (20%)', value: budgetData.ideal.savings, color: '#10B981' }
  ] : [];

  const comparisonData = budgetData ? [
    { category: 'Needs', ideal: budgetData.ideal.needs, actual: budgetData.actual.needs },
    { category: 'Wants', ideal: budgetData.ideal.wants, actual: budgetData.actual.wants },
    { category: 'Savings', ideal: budgetData.ideal.savings, actual: budgetData.actual.savings }
  ] : [];

  const getMonthlyTrend = () => {
    return monthlyEntries.slice(0, 6).reverse().map(entry => ({
      month: `${entry.month.slice(0, 3)} ${entry.year}`,
      saved: entry.saved,
      invested: entry.invested,
      needs: entry.needs,
      wants: entry.wants,
      total: entry.saved + entry.invested
    }));
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-yellow-500/10 rounded-2xl blur-xl"></div>
        <Card className="relative bg-gradient-to-r from-blue-900 to-blue-800 text-white border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <PiggyBank className="h-8 w-8 text-yellow-400" />
                Budgeting Engine
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Master the 50/30/20 rule and track monthly progress
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Income Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              Monthly Income
            </h3>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                placeholder="Enter monthly income"
                className="flex-1"
              />
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(monthlyIncome)}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Add Monthly Entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Add Monthly Budget Entry
              </h3>
              <Button
                variant="primary"
                size="small"
                onClick={() => setShowAddEntry(!showAddEntry)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            </div>
            
            {showAddEntry && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Month
                    </label>
                    <select
                      value={newEntry.month}
                      onChange={(e) => setNewEntry({...newEntry, month: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year
                    </label>
                    <Input
                      type="number"
                      value={newEntry.year}
                      onChange={(e) => setNewEntry({...newEntry, year: Number(e.target.value)})}
                      placeholder="Year"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount Saved
                    </label>
                    <Input
                      type="number"
                      value={newEntry.saved}
                      onChange={(e) => setNewEntry({...newEntry, saved: Number(e.target.value)})}
                      placeholder="Amount saved"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount Invested
                    </label>
                    <Input
                      type="number"
                      value={newEntry.invested}
                      onChange={(e) => setNewEntry({...newEntry, invested: Number(e.target.value)})}
                      placeholder="Amount invested"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Needs Spending
                    </label>
                    <Input
                      type="number"
                      value={newEntry.needs}
                      onChange={(e) => setNewEntry({...newEntry, needs: Number(e.target.value)})}
                      placeholder="Needs spending"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Wants Spending
                    </label>
                    <Input
                      type="number"
                      value={newEntry.wants}
                      onChange={(e) => setNewEntry({...newEntry, wants: Number(e.target.value)})}
                      placeholder="Wants spending"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    onClick={addMonthlyEntry}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Entry
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddEntry(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* 50/30/20 Rule Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ideal Budget Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Ideal 50/30/20 Budget
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Needs (50%)</span>
                  </div>
                  <span className="font-medium">{formatCurrency(budgetData?.ideal.needs || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Wants (30%)</span>
                  </div>
                  <span className="font-medium">{formatCurrency(budgetData?.ideal.wants || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Savings (20%)</span>
                  </div>
                  <span className="font-medium">{formatCurrency(budgetData?.ideal.savings || 0)}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Monthly Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Monthly Savings Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMonthlyTrend()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="saved" fill="#10B981" name="Saved" />
                    <Bar dataKey="invested" fill="#3B82F6" name="Invested" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Monthly Savings</div>
                <div className={`text-2xl font-bold ${
                  budgetData?.savingsRate >= 20 ? 'text-green-600' : 
                  budgetData?.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {budgetData?.savingsRate || 0}%
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Entries History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Monthly Budget History
            </h3>
            
            <div className="space-y-2">
              {monthlyEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div
                    className="p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => toggleMonthExpansion(entry.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {entry.month} {entry.year}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total Savings: {formatCurrency(entry.saved + entry.invested)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`text-sm px-2 py-1 rounded-full ${
                          ((entry.saved + entry.invested) / monthlyIncome * 100) >= 20
                            ? 'bg-green-100 text-green-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {((entry.saved + entry.invested) / monthlyIncome * 100).toFixed(1)}% saved
                        </div>
                        {expandedMonth === entry.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedMonth === entry.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(entry.saved)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(entry.invested)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Invested</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(entry.needs)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Needs</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(entry.wants)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Wants</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Distribution: 
                          <span className="ml-2">
                            Needs: {((entry.needs / monthlyIncome) * 100).toFixed(1)}% | 
                            Wants: {((entry.wants / monthlyIncome) * 100).toFixed(1)}% | 
                            Savings: {(((entry.saved + entry.invested) / monthlyIncome) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default BudgetingEngine; 