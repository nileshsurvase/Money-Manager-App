import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Calendar, 
  TrendingUp,
  DollarSign,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Home,
  Car,
  GraduationCap,
  Plane,
  Heart,
  Building,
  Sparkles,
  Calculator,
  BarChart3,
  Zap,
  Shield,
  Utensils,
  FileText,
  ShoppingCart
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const GoalPlanning = () => {
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState(5); // years
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'lifestyle',
    targetAmount: 0,
    currentSaved: 0,
    timeframe: 5,
    priority: 'medium',
    description: '',
    milestones: []
  });

  const goalCategories = {
    lifestyle: { name: 'Lifestyle', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
    home: { name: 'Home', icon: Home, color: 'text-blue-600 bg-blue-50' },
    travel: { name: 'Travel', icon: Plane, color: 'text-green-600 bg-green-50' },
    education: { name: 'Education', icon: GraduationCap, color: 'text-orange-600 bg-orange-50' },
    vehicle: { name: 'Vehicle', icon: Car, color: 'text-red-600 bg-red-50' },
    family: { name: 'Family', icon: Heart, color: 'text-pink-600 bg-pink-50' },
    business: { name: 'Business', icon: Building, color: 'text-indigo-600 bg-indigo-50' },
    emergency: { name: 'Emergency', icon: MapPin, color: 'text-yellow-600 bg-yellow-50' }
  };

  const timeframeOptions = [
    { value: 1, label: '1 Year', description: 'Short-term goals' },
    { value: 3, label: '3 Years', description: 'Medium-term goals' },
    { value: 5, label: '5 Years', description: 'Long-term goals' },
    { value: 10, label: '10 Years', description: 'Life goals' }
  ];

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const savedGoals = JSON.parse(localStorage.getItem('freedomos_goals') || '[]');
    if (savedGoals.length === 0) {
      // Add sample goals
      const sampleGoals = [
        {
          id: 1,
          title: 'Dream Home Down Payment',
          category: 'home',
          targetAmount: 2500000,
          currentSaved: 500000,
          timeframe: 5,
          priority: 'high',
          description: 'Save for 25% down payment on dream home',
          createdAt: new Date().toISOString(),
          milestones: [
            { amount: 625000, description: '25% milestone', completed: true },
            { amount: 1250000, description: '50% milestone', completed: false },
            { amount: 1875000, description: '75% milestone', completed: false },
            { amount: 2500000, description: 'Goal achieved!', completed: false }
          ]
        },
        {
          id: 2,
          title: 'European Vacation',
          category: 'travel',
          targetAmount: 300000,
          currentSaved: 75000,
          timeframe: 2,
          priority: 'medium',
          description: '15-day Europe tour for 2 people',
          createdAt: new Date().toISOString(),
          milestones: [
            { amount: 75000, description: '25% milestone', completed: true },
            { amount: 150000, description: '50% milestone', completed: false },
            { amount: 225000, description: '75% milestone', completed: false },
            { amount: 300000, description: 'Goal achieved!', completed: false }
          ]
        }
      ];
      setGoals(sampleGoals);
      localStorage.setItem('freedomos_goals', JSON.stringify(sampleGoals));
    } else {
      setGoals(savedGoals);
    }
  };

  const saveGoals = (updatedGoals) => {
    localStorage.setItem('freedomos_goals', JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
  };

  const calculateSIPRecommendation = (targetAmount, timeframe, currentSaved = 0) => {
    const expectedReturn = 12; // 12% annual return assumption
    const monthlyReturn = expectedReturn / 100 / 12;
    const totalMonths = timeframe * 12;
    
    // Future value of current savings
    const futureValueOfCurrentSavings = currentSaved * Math.pow(1 + expectedReturn/100, timeframe);
    
    // Amount needed from SIP
    const amountFromSIP = Math.max(0, targetAmount - futureValueOfCurrentSavings);
    
    if (amountFromSIP <= 0) {
      return {
        monthlySIP: 0,
        totalInvestment: currentSaved,
        totalReturns: targetAmount - currentSaved,
        message: 'Your current savings are sufficient!'
      };
    }
    
    // Calculate required SIP
    const requiredSIP = amountFromSIP * monthlyReturn / (Math.pow(1 + monthlyReturn, totalMonths) - 1);
    
    return {
      monthlySIP: Math.round(requiredSIP),
      totalInvestment: (requiredSIP * totalMonths) + currentSaved,
      totalReturns: targetAmount - ((requiredSIP * totalMonths) + currentSaved),
      futureValueOfCurrentSavings: Math.round(futureValueOfCurrentSavings)
    };
  };

  const addGoal = () => {
    const goal = {
      id: Date.now(),
      ...newGoal,
      targetAmount: Number(newGoal.targetAmount),
      currentSaved: Number(newGoal.currentSaved),
      timeframe: Number(newGoal.timeframe),
      createdAt: new Date().toISOString(),
      milestones: generateMilestones(Number(newGoal.targetAmount))
    };

    const updatedGoals = [...goals, goal];
    saveGoals(updatedGoals);
    
    setNewGoal({
      title: '',
      category: 'lifestyle',
      targetAmount: 0,
      currentSaved: 0,
      timeframe: 5,
      priority: 'medium',
      description: '',
      milestones: []
    });
    setShowAddGoal(false);
  };

  const generateMilestones = (targetAmount) => {
    return [
      { amount: targetAmount * 0.25, description: '25% milestone', completed: false },
      { amount: targetAmount * 0.5, description: '50% milestone', completed: false },
      { amount: targetAmount * 0.75, description: '75% milestone', completed: false },
      { amount: targetAmount, description: 'Goal achieved!', completed: false }
    ];
  };

  const updateGoalProgress = (goalId, newAmount) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, currentSaved: newAmount };
        // Update milestone completion
        updatedGoal.milestones = updatedGoal.milestones.map(milestone => ({
          ...milestone,
          completed: newAmount >= milestone.amount
        }));
        return updatedGoal;
      }
      return goal;
    });
    saveGoals(updatedGoals);
  };

  const deleteGoal = (goalId) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    saveGoals(updatedGoals);
  };

  const getFilteredGoals = () => {
    return goals.filter(goal => goal.timeframe <= selectedTimeframe);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatLakhs = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return formatCurrency(amount);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredGoals = getFilteredGoals();
  const totalGoalAmount = filteredGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = filteredGoals.reduce((sum, goal) => sum + goal.currentSaved, 0);

  // Generate projection data
  const projectionData = [];
  for (let year = 1; year <= selectedTimeframe; year++) {
    const yearData = {
      year,
      totalSaved: 0,
      projectedValue: 0
    };
    
    filteredGoals.forEach(goal => {
      if (goal.timeframe >= year) {
        const sip = calculateSIPRecommendation(goal.targetAmount, goal.timeframe, goal.currentSaved);
        const monthsElapsed = year * 12;
        const invested = (sip.monthlySIP * monthsElapsed) + goal.currentSaved;
        const returns = invested * Math.pow(1.12, year) - invested;
        yearData.totalSaved += invested;
        yearData.projectedValue += invested + returns;
      }
    });
    
    projectionData.push(yearData);
  }

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
                <Target className="h-8 w-8 text-yellow-400" />
                Goal Planning
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Dream Builder Interface with Smart SIP Recommendations
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Timeline Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              Timeline Filter
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {timeframeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTimeframe(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTimeframe === option.value
                      ? 'bg-yellow-600 text-white border-yellow-600'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-yellow-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xl font-bold">{option.label}</div>
                    <div className="text-sm opacity-75">{option.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Goals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Goals Summary
              </h3>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {filteredGoals.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Active Goals
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Target Amount:</span>
                  <span className="font-medium">{formatLakhs(totalGoalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Currently Saved:</span>
                  <span className="font-medium">{formatLakhs(totalSaved)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span className="font-medium">{totalGoalAmount > 0 ? ((totalSaved / totalGoalAmount) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                SIP Requirements
              </h3>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(filteredGoals.reduce((sum, goal) => {
                    const sip = calculateSIPRecommendation(goal.targetAmount, goal.timeframe, goal.currentSaved);
                    return sum + sip.monthlySIP;
                  }, 0))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Monthly SIP Needed
                </div>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Assuming 12% annual returns
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                Priority Goals
              </h3>
              
              <div className="space-y-2">
                {filteredGoals
                  .filter(goal => goal.priority === 'high')
                  .slice(0, 3)
                  .map((goal, index) => (
                    <div key={goal.id} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="truncate">{goal.title}</span>
                    </div>
                  ))}
                
                {filteredGoals.filter(goal => goal.priority === 'high').length === 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                    No high priority goals
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Add Goal Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-600" />
                Dream Builder
              </h3>
              <Button
                variant="primary"
                size="small"
                onClick={() => setShowAddGoal(!showAddGoal)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              >
                <Plus className="h-4 w-4" />
                Add Dream Goal
              </Button>
            </div>

            {showAddGoal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Goal Title
                    </label>
                    <Input
                      type="text"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                      placeholder="e.g., Dream Home, World Tour"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {Object.entries(goalCategories).map(([key, category]) => (
                        <option key={key} value={key}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Amount
                    </label>
                    <Input
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                      placeholder="Target amount"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currently Saved
                    </label>
                    <Input
                      type="number"
                      value={newGoal.currentSaved}
                      onChange={(e) => setNewGoal({...newGoal, currentSaved: e.target.value})}
                      placeholder="Amount already saved"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timeframe (Years)
                    </label>
                    <select
                      value={newGoal.timeframe}
                      onChange={(e) => setNewGoal({...newGoal, timeframe: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {timeframeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    placeholder="Describe your dream goal..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows="3"
                  />
                </div>

                {/* SIP Recommendation Preview */}
                {newGoal.targetAmount > 0 && newGoal.timeframe > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Smart SIP Recommendation</h4>
                    {(() => {
                      const sip = calculateSIPRecommendation(Number(newGoal.targetAmount), Number(newGoal.timeframe), Number(newGoal.currentSaved));
                      return (
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          <div>Monthly SIP: <strong>{formatCurrency(sip.monthlySIP)}</strong></div>
                          <div>Total Investment: <strong>{formatCurrency(sip.totalInvestment)}</strong></div>
                          <div>Expected Returns: <strong>{formatCurrency(sip.totalReturns)}</strong></div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    onClick={addGoal}
                    disabled={!newGoal.title || !newGoal.targetAmount}
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  >
                    Create Dream Goal
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddGoal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Goals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Your Dream Goals ({filteredGoals.length})
            </h3>
            
            <div className="space-y-4">
              {filteredGoals.map((goal, index) => {
                const IconComponent = goalCategories[goal.category].icon;
                const progress = (goal.currentSaved / goal.targetAmount) * 100;
                const sip = calculateSIPRecommendation(goal.targetAmount, goal.timeframe, goal.currentSaved);
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-xl ${goalCategories[goal.category].color}`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                              {goal.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {goal.description}
                            </p>
                            <div className="flex items-center space-x-3 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(goal.priority)}`}>
                                {goal.priority.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {goal.timeframe} years
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="small"
                            className="p-2"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => deleteGoal(goal.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Saved: {formatLakhs(goal.currentSaved)}</span>
                          <span>Target: {formatLakhs(goal.targetAmount)}</span>
                        </div>
                      </div>

                      {/* SIP Recommendation */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrency(sip.monthlySIP)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Monthly SIP</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(sip.totalInvestment)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Total Investment</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {formatCurrency(sip.totalReturns)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Expected Returns</div>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">Milestones</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {goal.milestones.map((milestone, mIndex) => (
                            <div
                              key={mIndex}
                              className={`p-2 rounded-lg text-center text-xs ${
                                milestone.completed 
                                  ? 'bg-green-100 text-green-700 border border-green-300' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }`}
                            >
                              <div className="font-medium">{formatLakhs(milestone.amount)}</div>
                              <div>{milestone.description}</div>
                              {milestone.completed && <CheckCircle className="h-3 w-3 mx-auto mt-1" />}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Update Progress */}
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="Update current saved amount"
                            className="text-sm"
                          />
                        </div>
                        <Button
                          variant="primary"
                          size="small"
                          className="flex items-center gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          Update
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filteredGoals.length === 0 && (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No goals for this timeframe
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first dream goal to get started!
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowAddGoal(true)}
                    className="flex items-center gap-2 mx-auto bg-gradient-to-r from-orange-500 to-yellow-500"
                  >
                    <Plus className="h-4 w-4" />
                    Create Dream Goal
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Projection Chart */}
      {projectionData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Goals Achievement Projection
              </h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                    <Tooltip formatter={(value) => formatLakhs(value)} />
                    <Line 
                      type="monotone" 
                      dataKey="totalSaved" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Total Invested"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="projectedValue" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Projected Value"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Related Calculators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Related Calculators
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* SIP Goal Planner */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">SIP Goal Planner</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Input goal amount + duration → Required SIP/month
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* Wealth Builder Calculator */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Wealth Builder</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  See compounding graph over 10-20 years
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* Emergency Fund Calculator */}
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Emergency Fund</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Based on monthly expenses (6-9 months buffer)
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* Food Budget Planner */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="flex items-center gap-3 mb-3">
                  <Utensils className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Food Budget Planner</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Ideal food spending based on 50/30/20 rule
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* Tax Regime Advisor */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Tax Regime Advisor</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Old vs New tax regime - best fit for your situation
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* Purchase Affordability */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center gap-3 mb-3">
                  <ShoppingCart className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Can I Afford This?</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Check if a purchase fits your budget safely
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default GoalPlanning; 