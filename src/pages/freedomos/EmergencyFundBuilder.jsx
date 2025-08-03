import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  DollarSign, 
  Calculator,
  Target,
  TrendingUp,
  Users,
  Heart,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  Edit3,
  Trash2,
  PiggyBank,
  Building,
  Banknote,
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const EmergencyFundBuilder = () => {
  const [userProfile, setUserProfile] = useState({
    age: 28,
    monthlyIncome: 75000,
    monthlyExpenses: 45000,
    dependents: 1,
    jobSecurity: 'stable', // stable, unstable, freelancer
    healthInsurance: true
  });

  const [emergencyFund, setEmergencyFund] = useState({
    current: 0,
    target: 0,
    sources: []
  });

  const [showAddSource, setShowAddSource] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    type: 'savings', // savings, fd, mutual_fund, liquid_fund
    amount: 0,
    maturityDate: '',
    interestRate: 0,
    liquidity: 'immediate' // immediate, 1-3days, 1week, 1month
  });

  const [editingSource, setEditingSource] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    loadEmergencyFundData();
    calculateRecommendedAmount();
  }, [userProfile]);

  const loadEmergencyFundData = () => {
    const savedData = JSON.parse(localStorage.getItem('freedomos_emergency_fund') || '{}');
    if (savedData.sources) {
      setEmergencyFund(savedData);
    }
  };

  const saveEmergencyFundData = (data) => {
    localStorage.setItem('freedomos_emergency_fund', JSON.stringify(data));
  };

  const calculateRecommendedAmount = () => {
    let multiplier = 6; // Base 6 months

    // Adjust based on age (younger people need more due to career uncertainty)
    if (userProfile.age < 25) multiplier += 1;
    else if (userProfile.age > 50) multiplier -= 0.5;

    // Adjust based on dependents
    multiplier += userProfile.dependents * 0.5;

    // Adjust based on job security
    if (userProfile.jobSecurity === 'unstable') multiplier += 2;
    else if (userProfile.jobSecurity === 'freelancer') multiplier += 3;

    // Adjust based on health insurance
    if (!userProfile.healthInsurance) multiplier += 1;

    // Cap between 3-12 months
    multiplier = Math.max(3, Math.min(12, multiplier));

    const recommendedAmount = Math.round(userProfile.monthlyExpenses * multiplier);
    
    setEmergencyFund(prev => {
      const updated = { ...prev, target: recommendedAmount };
      saveEmergencyFundData(updated);
      return updated;
    });
  };

  const addSource = () => {
    const source = {
      id: Date.now(),
      ...newSource,
      amount: Number(newSource.amount),
      interestRate: Number(newSource.interestRate),
      createdAt: new Date().toISOString()
    };

    const updatedSources = [...emergencyFund.sources, source];
    const totalCurrent = updatedSources.reduce((sum, s) => sum + s.amount, 0);

    const updated = {
      ...emergencyFund,
      sources: updatedSources,
      current: totalCurrent
    };

    setEmergencyFund(updated);
    saveEmergencyFundData(updated);
    
    setNewSource({
      name: '',
      type: 'savings',
      amount: 0,
      maturityDate: '',
      interestRate: 0,
      liquidity: 'immediate'
    });
    setShowAddSource(false);
  };

  const updateSource = (id, updatedData) => {
    const updatedSources = emergencyFund.sources.map(source => 
      source.id === id ? { ...source, ...updatedData } : source
    );
    const totalCurrent = updatedSources.reduce((sum, s) => sum + s.amount, 0);

    const updated = {
      ...emergencyFund,
      sources: updatedSources,
      current: totalCurrent
    };

    setEmergencyFund(updated);
    saveEmergencyFundData(updated);
    setEditingSource(null);
  };

  const deleteSource = (id) => {
    const updatedSources = emergencyFund.sources.filter(source => source.id !== id);
    const totalCurrent = updatedSources.reduce((sum, s) => sum + s.amount, 0);

    const updated = {
      ...emergencyFund,
      sources: updatedSources,
      current: totalCurrent
    };

    setEmergencyFund(updated);
    saveEmergencyFundData(updated);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'savings': return <PiggyBank className="h-5 w-5" />;
      case 'fd': return <Building className="h-5 w-5" />;
      case 'mutual_fund': return <BarChart3 className="h-5 w-5" />;
      case 'liquid_fund': return <Banknote className="h-5 w-5" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'savings': return 'text-green-600 bg-green-50 border-green-200';
      case 'fd': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'mutual_fund': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'liquid_fund': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getLiquidityColor = (liquidity) => {
    switch (liquidity) {
      case 'immediate': return 'text-green-600 bg-green-100';
      case '1-3days': return 'text-yellow-600 bg-yellow-100';
      case '1week': return 'text-orange-600 bg-orange-100';
      case '1month': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const progressPercentage = emergencyFund.target > 0 ? (emergencyFund.current / emergencyFund.target) * 100 : 0;
  const shortfall = Math.max(0, emergencyFund.target - emergencyFund.current);
  const monthsToTarget = shortfall > 0 && userProfile.monthlyIncome > userProfile.monthlyExpenses 
    ? Math.ceil(shortfall / (userProfile.monthlyIncome - userProfile.monthlyExpenses))
    : 0;

  const sourceDistribution = emergencyFund.sources.map(source => ({
    name: source.name,
    value: source.amount,
    type: source.type
  }));

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

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
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-3">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                Emergency Fund Builder
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Build your financial safety net with personalized recommendations
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Emergency Fund Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <div className="space-y-4">
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-yellow-600" />
                Emergency fund calculator
              </h3>
              {showCalculator ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            
            {showCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  <Input
                    type="number"
                    value={userProfile.age}
                    onChange={(e) => setUserProfile({...userProfile, age: Number(e.target.value)})}
                    placeholder="Your age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Income
                  </label>
                  <Input
                    type="number"
                    value={userProfile.monthlyIncome}
                    onChange={(e) => setUserProfile({...userProfile, monthlyIncome: Number(e.target.value)})}
                    placeholder="Monthly income"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Expenses
                  </label>
                  <Input
                    type="number"
                    value={userProfile.monthlyExpenses}
                    onChange={(e) => setUserProfile({...userProfile, monthlyExpenses: Number(e.target.value)})}
                    placeholder="Monthly expenses"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dependents
                  </label>
                  <Input
                    type="number"
                    value={userProfile.dependents}
                    onChange={(e) => setUserProfile({...userProfile, dependents: Number(e.target.value)})}
                    placeholder="Number of dependents"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Security
                  </label>
                  <select
                    value={userProfile.jobSecurity}
                    onChange={(e) => setUserProfile({...userProfile, jobSecurity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="stable">Stable Job</option>
                    <option value="unstable">Unstable Job</option>
                    <option value="freelancer">Freelancer/Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Health Insurance
                  </label>
                  <select
                    value={userProfile.healthInsurance}
                    onChange={(e) => setUserProfile({...userProfile, healthInsurance: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="true">Yes, I have health insurance</option>
                    <option value="false">No health insurance</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Emergency Fund Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Emergency Fund Goal
              </h3>
              
              <div className="text-center space-y-4">
                <div>
                  <div className="text-3xl font-bold text-orange-600">
                    {progressPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    of target achieved
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 h-4 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {formatCurrency(emergencyFund.current)} / {formatCurrency(emergencyFund.target)}
                  </div>
                </div>
              </div>

              {shortfall > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Gap Analysis</span>
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      You need <strong>{formatCurrency(shortfall)}</strong> more to reach your emergency fund goal.
                    </div>
                    {monthsToTarget > 0 && (
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        At your current savings rate, it will take approximately <strong>{monthsToTarget} months</strong> to reach your goal.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {progressPercentage >= 100 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Congratulations! You've reached your emergency fund goal!</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Fund Distribution
              </h3>
              
              {sourceDistribution.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sourceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <PiggyBank className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <div>No emergency fund sources added yet</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Emergency Fund Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-green-600" />
                Emergency Fund Sources
              </h3>
              <Button
                variant="primary"
                size="small"
                onClick={() => setShowAddSource(!showAddSource)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Source
              </Button>
            </div>

            {showAddSource && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Source Name
                    </label>
                    <Input
                      type="text"
                      value={newSource.name}
                      onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                      placeholder="e.g., HDFC Savings, SBI FD"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newSource.type}
                      onChange={(e) => setNewSource({...newSource, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="savings">Savings Account</option>
                      <option value="fd">Fixed Deposit</option>
                      <option value="mutual_fund">Mutual Fund</option>
                      <option value="liquid_fund">Liquid Fund</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <Input
                      type="number"
                      value={newSource.amount}
                      onChange={(e) => setNewSource({...newSource, amount: e.target.value})}
                      placeholder="Amount saved"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Interest Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newSource.interestRate}
                      onChange={(e) => setNewSource({...newSource, interestRate: e.target.value})}
                      placeholder="Annual interest rate"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Liquidity
                    </label>
                    <select
                      value={newSource.liquidity}
                      onChange={(e) => setNewSource({...newSource, liquidity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="1-3days">1-3 Days</option>
                      <option value="1week">1 Week</option>
                      <option value="1month">1 Month</option>
                    </select>
                  </div>
                  
                  {(newSource.type === 'fd' || newSource.type === 'mutual_fund') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maturity Date
                      </label>
                      <Input
                        type="date"
                        value={newSource.maturityDate}
                        onChange={(e) => setNewSource({...newSource, maturityDate: e.target.value})}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    onClick={addSource}
                    disabled={!newSource.name || !newSource.amount}
                  >
                    Add Source
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddSource(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Sources List */}
            <div className="space-y-3">
              {emergencyFund.sources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  {editingSource === source.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="text"
                          value={source.name}
                          onChange={(e) => updateSource(source.id, { name: e.target.value })}
                          placeholder="Source name"
                        />
                        <Input
                          type="number"
                          value={source.amount}
                          onChange={(e) => updateSource(source.id, { amount: Number(e.target.value) })}
                          placeholder="Amount"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => setEditingSource(null)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => setEditingSource(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Main source info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg border ${getTypeColor(source.type)}`}>
                            {getTypeIcon(source.type)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              {source.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-1">
                              <span className="capitalize">{source.type.replace('_', ' ')}</span>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getLiquidityColor(source.liquidity)}`}>
                                {source.liquidity.replace('-', ' to ')}
                              </span>
                              {source.interestRate > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{source.interestRate}% p.a.</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(source.amount)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {((source.amount / emergencyFund.current) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => setEditingSource(source.id)}
                          className="p-2"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => deleteSource(source.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {emergencyFund.sources.length === 0 && (
                <div className="text-center py-8">
                  <PiggyBank className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No emergency fund sources yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start building your emergency fund by adding your first source
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowAddSource(true)}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Source
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmergencyFundBuilder; 