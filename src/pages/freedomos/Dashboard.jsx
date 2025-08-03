import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  Crown,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Star,
  Shield,
  Heart,
  PiggyBank,
  BarChart3,
  XCircle
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
  getUserProfile,
  calculateFreedomScore,
  getCurrentStage,
  calculateNetWorth,
  getBudgetData,
  FREEDOM_STAGES
} from '../../utils/freedomosStorage';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [freedomScore, setFreedomScore] = useState(0);
  const [currentStage, setCurrentStage] = useState(FREEDOM_STAGES.STARTER);
  const [netWorth, setNetWorth] = useState(0);
  const [budgetData, setBudgetData] = useState(null);
  const [emergencyFundData, setEmergencyFundData] = useState({ current: 0, target: 0 });
  const [insuranceData, setInsuranceData] = useState({ health: false, life: false, healthAmount: 0, lifeAmount: 0 });
  const [loading, setLoading] = useState(true);

  // Financial Freedom Steps Checklist
  const [freedomSteps, setFreedomSteps] = useState({
    healthInsurance: false,
    lifeInsurance: false,
    emergencyFund: false,
    investment: false
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      const userProfile = getUserProfile();
      const score = calculateFreedomScore();
      const stage = getCurrentStage();
      const tasks = JSON.parse(localStorage.getItem('freedomos_monthly_tasks') || '[]');
      if (tasks.length === 0) {
        // Initialize with default tasks
        const defaultTasks = [
          { id: 1, title: 'Review monthly budget and expenses', category: 'Budget', completed: false },
          { id: 2, title: 'Check emergency fund progress', category: 'Emergency Fund', completed: false },
          { id: 3, title: 'Review investment portfolio performance', category: 'Investment', completed: false }
        ];
        localStorage.setItem('freedomos_monthly_tasks', JSON.stringify(defaultTasks));
      }
      const currentNetWorth = calculateNetWorth();
      const quote = JSON.parse(localStorage.getItem('freedomos_daily_quote') || '{"quote": "No quote available", "author": "N/A"}');
      const budget = getBudgetData();

      // Load additional data from other modules
      const emergencyFund = JSON.parse(localStorage.getItem('freedomos_emergency_fund') || '{"current": 0, "target": 210000}');
      const insurance = JSON.parse(localStorage.getItem('freedomos_insurance') || '{"health": false, "life": false, "healthAmount": 0, "lifeAmount": 0}');
      
      // Calculate freedom steps completion
      const steps = {
        healthInsurance: insurance.health && insurance.healthAmount > 0,
        lifeInsurance: insurance.life && insurance.lifeAmount > 0,
        emergencyFund: emergencyFund.current >= emergencyFund.target,
        investment: userProfile?.currentFinancials?.investments > 0
      };

      setProfile(userProfile);
      setFreedomScore(score);
      setCurrentStage(stage);
      setNetWorth(currentNetWorth);
      setBudgetData(budget);
      setEmergencyFundData(emergencyFund);
      setInsuranceData(insurance);
      setFreedomSteps(steps);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFreedomStep = (step) => {
    const newSteps = { ...freedomSteps, [step]: !freedomSteps[step] };
    setFreedomSteps(newSteps);
    
    // Save to localStorage and update related data
    localStorage.setItem('freedomos_freedom_steps', JSON.stringify(newSteps));
    
    // Update related module data based on the step
    if (step === 'healthInsurance' || step === 'lifeInsurance') {
      const updatedInsurance = {
        ...insuranceData,
        [step === 'healthInsurance' ? 'health' : 'life']: newSteps[step]
      };
      setInsuranceData(updatedInsurance);
      localStorage.setItem('freedomos_insurance', JSON.stringify(updatedInsurance));
    }
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task = {
      id: Date.now(),
      title: newTask.title,
      category: newTask.category,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedTasks = [...monthlyTasks, task];
    setMonthlyTasks(updatedTasks);
    localStorage.setItem('freedomos_monthly_tasks', JSON.stringify(updatedTasks));
    
    setNewTask({ title: '', category: 'General' });
    setShowAddTask(false);
  };

  const toggleTask = (taskId) => {
    const updatedTasks = monthlyTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setMonthlyTasks(updatedTasks);
    localStorage.setItem('freedomos_monthly_tasks', JSON.stringify(updatedTasks));
  };

  const deleteTask = (taskId) => {
    const updatedTasks = monthlyTasks.filter(task => task.id !== taskId);
    setMonthlyTasks(updatedTasks);
    localStorage.setItem('freedomos_monthly_tasks', JSON.stringify(updatedTasks));
  };



  const getStageInfo = (stage) => {
    switch (stage) {
      case FREEDOM_STAGES.FREE:
        return { 
          name: 'Financially Free', 
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          icon: Crown,
          description: 'You have achieved financial independence!'
        };
      case FREEDOM_STAGES.GROWER:
        return { 
          name: 'Wealth Grower', 
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          icon: TrendingUp,
          description: 'Your wealth is growing steadily'
        };
      case FREEDOM_STAGES.STABILIZER:
        return { 
          name: 'Financial Stabilizer', 
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          icon: Target,
          description: 'Building a stable financial foundation'
        };
      default:
        return { 
          name: 'Financial Starter', 
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          icon: Sparkles,
          description: 'Starting your financial freedom journey'
        };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stageInfo = getStageInfo(currentStage);
  const StageIcon = stageInfo.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  const completedSteps = Object.values(freedomSteps).filter(Boolean).length;
  const totalSteps = Object.keys(freedomSteps).length;

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 min-h-screen p-4">
      {/* Welcome Header with Navy Blue + Gold Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-yellow-500/10 rounded-2xl blur-xl"></div>
        <Card className="relative bg-gradient-to-r from-blue-900 to-blue-800 dark:from-blue-900 dark:to-blue-800 text-white border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold flex items-center gap-3">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 animate-pulse" />
                <span className="whitespace-nowrap">FreedomOS Dashboard</span>
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Your path to financial freedom starts here
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-200 mb-1">Today</div>
              <div className="text-sm font-medium">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </Card>
      </motion.div>



      {/* Module Data Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 h-full">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-blue-600" />
                Budget Overview
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Savings</span>
                  <span className="font-medium">{formatCurrency(budgetData?.actual?.savings || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Needs (50%)</span>
                  <span className="font-medium">{formatCurrency(budgetData?.actual?.needs || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Wants (30%)</span>
                  <span className="font-medium">{formatCurrency(budgetData?.actual?.wants || 0)}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Savings Rate</span>
                    <span className={`font-bold ${
                      (budgetData?.savingsRate || 0) >= 20 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {budgetData?.savingsRate || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Emergency Fund Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 h-full">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Emergency Fund
              </h3>
              
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {((emergencyFundData.current / emergencyFundData.target) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Goal Achievement</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current</span>
                    <span className="font-medium">{formatCurrency(emergencyFundData.current)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Target</span>
                    <span className="font-medium">{formatCurrency(emergencyFundData.target)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((emergencyFundData.current / emergencyFundData.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Insurance Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 h-full">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-600" />
                Insurance Coverage
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${insuranceData.health ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Health Insurance</span>
                  </div>
                  <span className="text-sm font-medium">
                    {insuranceData.health ? formatCurrency(insuranceData.healthAmount) : 'Not Covered'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${insuranceData.life ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Life Insurance</span>
                  </div>
                  <span className="text-sm font-medium">
                    {insuranceData.life ? formatCurrency(insuranceData.lifeAmount) : 'Not Covered'}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      insuranceData.health && insuranceData.life ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {insuranceData.health && insuranceData.life ? 'Fully Covered' : 'Incomplete Coverage'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Freedom Score & Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Freedom Score */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700 h-full">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Star className="h-6 w-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Freedom Score
                </h3>
              </div>
              
              <div className="relative">
                <div className="w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-yellow-200 dark:text-yellow-800"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - freedomScore / 100)}`}
                      className="text-yellow-500 transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {freedomScore}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        to freedom
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {freedomScore >= 80 ? 'Excellent!' : 
                   freedomScore >= 60 ? 'Good progress!' :
                   freedomScore >= 40 ? 'Keep building!' : 'Getting started!'}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Current Stage */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-2 border-slate-200 dark:border-slate-600 h-full">
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Current Stage
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="text-red-500 text-2xl font-bold">
                    Starter
                  </div>
                  <div className="text-red-500 text-4xl font-bold">
                    0%
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    to next stage
                  </div>
                </div>
              </div>

              {/* Progress Visualization */}
              <div className="bg-slate-600 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center flex-1">
                    <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div className="text-gray-400 text-xs">Starter</div>
                  </div>
                  
                  <div className="flex-1 h-px bg-gray-500 mx-2"></div>
                  
                  <div className="text-center flex-1">
                    <div className="w-8 h-8 bg-gray-500 rounded-full mx-auto mb-2"></div>
                    <div className="text-gray-400 text-xs">Stabilizer</div>
                  </div>
                  
                  <div className="flex-1 h-px bg-gray-500 mx-2"></div>
                  
                  <div className="text-center flex-1">
                    <div className="w-8 h-8 bg-gray-500 rounded-full mx-auto mb-2"></div>
                    <div className="text-gray-400 text-xs">Grower</div>
                  </div>
                  
                  <div className="flex-1 h-px bg-gray-500 mx-2"></div>
                  
                  <div className="text-center flex-1">
                    <div className="w-8 h-8 bg-gray-500 rounded-full mx-auto mb-2"></div>
                    <div className="text-gray-400 text-xs">Free</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Net Worth Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Net Worth Snapshot
                  </h3>
                </div>
                {netWorth >= 0 ? (
                  <ArrowUp className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDown className="h-5 w-5 text-red-500" />
                )}
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netWorth)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Current Net Worth
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(profile?.currentFinancials?.savings + profile?.currentFinancials?.investments || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Assets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(profile?.currentFinancials?.loans?.reduce((sum, loan) => sum + loan.amount, 0) || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Liabilities</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

      {/* Financial Freedom Steps Checklist - Moved to bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                Financial Freedom Steps
              </h3>
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                {completedSteps}/{totalSteps} completed
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  freedomSteps.healthInsurance 
                    ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-600' 
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600'
                }`}
                onClick={() => toggleFreedomStep('healthInsurance')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    freedomSteps.healthInsurance 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {freedomSteps.healthInsurance ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Health Insurance</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {insuranceData.health ? `₹${insuranceData.healthAmount?.toLocaleString('en-IN')} cover` : 'Not taken'}
                    </div>
                  </div>
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  freedomSteps.lifeInsurance 
                    ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-600' 
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600'
                }`}
                onClick={() => toggleFreedomStep('lifeInsurance')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    freedomSteps.lifeInsurance 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {freedomSteps.lifeInsurance ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Life Insurance</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {insuranceData.life ? `₹${insuranceData.lifeAmount?.toLocaleString('en-IN')} cover` : 'Not taken'}
                    </div>
                  </div>
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  freedomSteps.emergencyFund 
                    ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-600' 
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600'
                }`}
                onClick={() => toggleFreedomStep('emergencyFund')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    freedomSteps.emergencyFund 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {freedomSteps.emergencyFund ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Emergency Fund</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {formatCurrency(emergencyFundData.current)} / {formatCurrency(emergencyFundData.target)}
                    </div>
                  </div>
                  <PiggyBank className="h-5 w-5 text-orange-500" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  freedomSteps.investment 
                    ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-600' 
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600'
                }`}
                onClick={() => toggleFreedomStep('investment')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    freedomSteps.investment 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {freedomSteps.investment ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Investment</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {formatCurrency(profile?.currentFinancials?.investments || 0)} invested
                    </div>
                  </div>
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                </div>
              </motion.div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progress to Financial Freedom</span>
                <span>{((completedSteps / totalSteps) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard; 