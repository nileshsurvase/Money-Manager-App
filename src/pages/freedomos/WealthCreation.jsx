import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Target,
  BarChart3,
  Calculator,
  Star,
  Award,
  Zap,
  Plus,
  Edit3,
  Trash2,
  Activity,
  Eye,
  Sparkles,
  Crown,
  Filter,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  ShoppingCart,
  Car
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const WealthCreation = () => {
  const [profile, setProfile] = useState({
    age: 30,
    monthlyIncome: 75000,
    currentWealth: 500000,
    riskProfile: 'moderate',
    wealthGoal: 10000000,
    timeframe: 20
  });

  const [sips, setSips] = useState([]);
  const [showAddSIP, setShowAddSIP] = useState(false);
  const [newSIP, setNewSIP] = useState({
    fundName: '',
    category: 'large_cap',
    monthlyAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    expectedReturn: 12,
    currentValue: 0
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wealthVelocity, setWealthVelocity] = useState(0);

  const fundCategories = {
    large_cap: { name: 'Large Cap', risk: 'Low', return: '10-12%', color: 'text-blue-600 bg-blue-50' },
    mid_cap: { name: 'Mid Cap', risk: 'Medium', return: '12-15%', color: 'text-green-600 bg-green-50' },
    small_cap: { name: 'Small Cap', risk: 'High', return: '15-18%', color: 'text-red-600 bg-red-50' },
    hybrid: { name: 'Hybrid', risk: 'Low-Medium', return: '8-10%', color: 'text-purple-600 bg-purple-50' },
    index: { name: 'Index Funds', risk: 'Low', return: '10-11%', color: 'text-indigo-600 bg-indigo-50' },
    sectoral: { name: 'Sectoral', risk: 'Very High', return: '12-20%', color: 'text-orange-600 bg-orange-50' },
    international: { name: 'International', risk: 'Medium', return: '8-12%', color: 'text-pink-600 bg-pink-50' }
  };

  const topFunds = {
    large_cap: [
      { name: 'ICICI Pru Bluechip Fund', returns: { '1y': 18.5, '3y': 16.2, '5y': 14.8 }, rating: 5, aum: '₹45,000 Cr' },
      { name: 'Axis Bluechip Fund', returns: { '1y': 17.8, '3y': 15.9, '5y': 14.2 }, rating: 4, aum: '₹32,000 Cr' },
      { name: 'Mirae Asset Large Cap Fund', returns: { '1y': 16.9, '3y': 15.1, '5y': 13.8 }, rating: 4, aum: '₹28,000 Cr' }
    ],
    mid_cap: [
      { name: 'Axis Midcap Fund', returns: { '1y': 25.2, '3y': 22.1, '5y': 18.5 }, rating: 5, aum: '₹22,000 Cr' },
      { name: 'HDFC Mid-Cap Opportunities Fund', returns: { '1y': 24.8, '3y': 21.5, '5y': 17.9 }, rating: 4, aum: '₹18,000 Cr' },
      { name: 'Kotak Emerging Equity Fund', returns: { '1y': 23.9, '3y': 20.8, '5y': 17.2 }, rating: 4, aum: '₹15,000 Cr' }
    ],
    small_cap: [
      { name: 'Axis Small Cap Fund', returns: { '1y': 32.1, '3y': 28.5, '5y': 22.8 }, rating: 5, aum: '₹12,000 Cr' },
      { name: 'SBI Small Cap Fund', returns: { '1y': 30.8, '3y': 27.2, '5y': 21.5 }, rating: 4, aum: '₹10,000 Cr' },
      { name: 'DSP Small Cap Fund', returns: { '1y': 29.5, '3y': 26.1, '5y': 20.8 }, rating: 4, aum: '₹8,000 Cr' }
    ]
  };

  useEffect(() => {
    loadSIPs();
    calculateWealthVelocity();
  }, []);

  useEffect(() => {
    calculateWealthVelocity();
  }, [sips, profile]);

  const loadSIPs = () => {
    const savedSIPs = JSON.parse(localStorage.getItem('freedomos_sips') || '[]');
    if (savedSIPs.length === 0) {
      // Add sample SIPs
      const sampleSIPs = [
        {
          id: 1,
          fundName: 'ICICI Pru Bluechip Fund',
          category: 'large_cap',
          monthlyAmount: 10000,
          startDate: '2023-01-01',
          expectedReturn: 12,
          currentValue: 125000,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          fundName: 'Axis Midcap Fund',
          category: 'mid_cap',
          monthlyAmount: 15000,
          startDate: '2023-06-01',
          expectedReturn: 15,
          currentValue: 98000,
          createdAt: new Date().toISOString()
        }
      ];
      setSips(sampleSIPs);
      localStorage.setItem('freedomos_sips', JSON.stringify(sampleSIPs));
    } else {
      setSips(savedSIPs);
    }
  };

  const saveSIPs = (updatedSIPs) => {
    localStorage.setItem('freedomos_sips', JSON.stringify(updatedSIPs));
    setSips(updatedSIPs);
  };

  const calculateWealthVelocity = () => {
    const totalMonthlySIP = sips.reduce((sum, sip) => sum + sip.monthlyAmount, 0);
    const totalCurrentValue = sips.reduce((sum, sip) => sum + sip.currentValue, 0);
    
    if (totalMonthlySIP === 0) {
      setWealthVelocity(0);
      return;
    }

    // Calculate wealth velocity as (current portfolio value / monthly income) * 100
    const velocity = ((totalCurrentValue + profile.currentWealth) / profile.monthlyIncome) * 100;
    setWealthVelocity(Math.round(velocity));
  };

  const calculateIdealWealth = () => {
    const yearsToGoal = profile.timeframe;
    const requiredMonthlySIP = calculateRequiredSIP(profile.wealthGoal, yearsToGoal, profile.currentWealth);
    const totalInvestment = (requiredMonthlySIP * 12 * yearsToGoal) + profile.currentWealth;
    const totalReturns = profile.wealthGoal - totalInvestment;
    
    return {
      requiredMonthlySIP,
      totalInvestment,
      totalReturns,
      currentMonthlySIP: sips.reduce((sum, sip) => sum + sip.monthlyAmount, 0),
      gap: Math.max(0, requiredMonthlySIP - sips.reduce((sum, sip) => sum + sip.monthlyAmount, 0))
    };
  };

  const calculateRequiredSIP = (goalAmount, years, currentAmount = 0) => {
    const expectedReturn = 12; // 12% annual return
    const monthlyReturn = expectedReturn / 100 / 12;
    const totalMonths = years * 12;
    
    // Future value of current amount
    const futureValueOfCurrentAmount = currentAmount * Math.pow(1 + expectedReturn/100, years);
    
    // Amount needed from SIP
    const amountFromSIP = Math.max(0, goalAmount - futureValueOfCurrentAmount);
    
    if (amountFromSIP <= 0) return 0;
    
    // Calculate required SIP
    const requiredSIP = amountFromSIP * monthlyReturn / (Math.pow(1 + monthlyReturn, totalMonths) - 1);
    
    return Math.round(requiredSIP);
  };

  const addSIP = () => {
    const sip = {
      id: Date.now(),
      ...newSIP,
      monthlyAmount: Number(newSIP.monthlyAmount),
      expectedReturn: Number(newSIP.expectedReturn),
      currentValue: Number(newSIP.currentValue),
      createdAt: new Date().toISOString()
    };

    const updatedSIPs = [...sips, sip];
    saveSIPs(updatedSIPs);
    
    setNewSIP({
      fundName: '',
      category: 'large_cap',
      monthlyAmount: 0,
      startDate: new Date().toISOString().split('T')[0],
      expectedReturn: 12,
      currentValue: 0
    });
    setShowAddSIP(false);
  };

  const deleteSIP = (sipId) => {
    const updatedSIPs = sips.filter(sip => sip.id !== sipId);
    saveSIPs(updatedSIPs);
  };

  const getAIRecommendations = () => {
    const { age, riskProfile, monthlyIncome } = profile;
    const totalMonthlySIP = sips.reduce((sum, sip) => sum + sip.monthlyAmount, 0);
    const sipRatio = (totalMonthlySIP / monthlyIncome) * 100;
    
    let recommendations = [];

    // Age-based recommendations
    if (age < 30) {
      recommendations.push({
        type: 'allocation',
        title: 'Aggressive Growth Strategy',
        description: 'At your age, you can take higher risk for better returns.',
        suggestion: '70% Equity (30% Large + 25% Mid + 15% Small), 20% Hybrid, 10% International',
        priority: 'high'
      });
    } else if (age < 40) {
      recommendations.push({
        type: 'allocation',
        title: 'Balanced Growth Strategy',
        description: 'Balance growth with some stability.',
        suggestion: '60% Equity (40% Large + 15% Mid + 5% Small), 30% Hybrid, 10% Debt',
        priority: 'medium'
      });
    } else {
      recommendations.push({
        type: 'allocation',
        title: 'Conservative Growth Strategy',
        description: 'Focus on stability with moderate growth.',
        suggestion: '50% Equity (45% Large + 5% Mid), 35% Hybrid, 15% Debt',
        priority: 'medium'
      });
    }

    // SIP amount recommendations
    if (sipRatio < 15) {
      recommendations.push({
        type: 'amount',
        title: 'Increase SIP Amount',
        description: 'Your SIP is less than 15% of income. Consider increasing for faster wealth creation.',
        suggestion: `Increase to ₹${Math.round(monthlyIncome * 0.2)} (20% of income)`,
        priority: 'high'
      });
    } else if (sipRatio > 30) {
      recommendations.push({
        type: 'amount',
        title: 'Review SIP Amount',
        description: 'Your SIP is quite high. Ensure it doesn\'t affect your emergency fund.',
        suggestion: 'Consider balancing with emergency fund and other investments',
        priority: 'medium'
      });
    }

    // Fund diversification
    const categories = [...new Set(sips.map(sip => sip.category))];
    if (categories.length < 3 && sips.length > 2) {
      recommendations.push({
        type: 'diversification',
        title: 'Diversify Your Portfolio',
        description: 'Consider adding different fund categories for better risk management.',
        suggestion: 'Add funds from different categories like Mid-cap, Hybrid, or International',
        priority: 'medium'
      });
    }

    return recommendations;
  };

  const getFilteredSIPs = () => {
    if (selectedCategory === 'all') return sips;
    return sips.filter(sip => sip.category === selectedCategory);
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

  const filteredSIPs = getFilteredSIPs();
  const totalMonthlySIP = sips.reduce((sum, sip) => sum + sip.monthlyAmount, 0);
  const totalCurrentValue = sips.reduce((sum, sip) => sum + sip.currentValue, 0);
  const idealWealth = calculateIdealWealth();
  const aiRecommendations = getAIRecommendations();

  // Generate portfolio distribution data
  const portfolioData = Object.entries(fundCategories).map(([key, category]) => {
    const categoryAmount = sips
      .filter(sip => sip.category === key)
      .reduce((sum, sip) => sum + sip.currentValue, 0);
    
    return {
      name: category.name,
      value: categoryAmount,
      color: category.color
    };
  }).filter(item => item.value > 0);

  const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#6366F1', '#F59E0B', '#EC4899'];

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
                <TrendingUp className="h-8 w-8 text-yellow-400" />
                Wealth Creation
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                SIP Tracker & Equity Fund Selection AI
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Wealth Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-yellow-600" />
              Wealth Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                <Input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: Number(e.target.value)})}
                  placeholder="Your age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Income
                </label>
                <Input
                  type="number"
                  value={profile.monthlyIncome}
                  onChange={(e) => setProfile({...profile, monthlyIncome: Number(e.target.value)})}
                  placeholder="Monthly income"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Wealth
                </label>
                <Input
                  type="number"
                  value={profile.currentWealth}
                  onChange={(e) => setProfile({...profile, currentWealth: Number(e.target.value)})}
                  placeholder="Current wealth"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk Profile
                </label>
                <select
                  value={profile.riskProfile}
                  onChange={(e) => setProfile({...profile, riskProfile: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wealth Goal
                </label>
                <Input
                  type="number"
                  value={profile.wealthGoal}
                  onChange={(e) => setProfile({...profile, wealthGoal: Number(e.target.value)})}
                  placeholder="Target wealth"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeframe (Years)
                </label>
                <Input
                  type="number"
                  value={profile.timeframe}
                  onChange={(e) => setProfile({...profile, timeframe: Number(e.target.value)})}
                  placeholder="Years to goal"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Wealth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Wealth Velocity
              </h3>
              
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  wealthVelocity >= 200 ? 'text-green-600' :
                  wealthVelocity >= 100 ? 'text-yellow-600' : 'text-orange-600'
                }`}>
                  {wealthVelocity}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Velocity Score
                </div>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                {wealthVelocity >= 200 ? 'Excellent wealth creation!' :
                 wealthVelocity >= 100 ? 'Good progress' : 'Needs acceleration'}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Monthly SIP
              </h3>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(totalMonthlySIP)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Investment
                </div>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                {((totalMonthlySIP / profile.monthlyIncome) * 100).toFixed(1)}% of income
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Portfolio Value
              </h3>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatLakhs(totalCurrentValue)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Current Value
                </div>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                SIP Portfolio only
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Goal Progress
              </h3>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {((totalCurrentValue + profile.currentWealth) / profile.wealthGoal * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  To {formatLakhs(profile.wealthGoal)}
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(((totalCurrentValue + profile.currentWealth) / profile.wealthGoal * 100), 100)}%` }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

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
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">SIP Goal Planner</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Calculate required SIP amount for your financial goals
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
                  See how your investments grow with compounding over time
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* Freedom Meter */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Freedom Meter</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Track your progress to financial independence
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* Net Worth Visualizer */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Net Worth Visualizer</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Visualize your assets vs liabilities and get improvement tips
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* Purchase Affordability */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="flex items-center gap-3 mb-3">
                  <ShoppingCart className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Can I Afford This?</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Check if a purchase fits your budget safely
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* Vehicle Affordability */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                <div className="flex items-center gap-3 mb-3">
                  <Car className="h-5 w-5 text-indigo-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Vehicle Affordability</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  EMI + maintenance vs income analysis for bikes/cars
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

export default WealthCreation; 