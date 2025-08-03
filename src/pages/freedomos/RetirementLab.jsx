import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  TrendingUp, 
  Calculator,
  Calendar,
  DollarSign,
  Target,
  BarChart3,
  Clock,
  Heart,
  Shield
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const RetirementLab = () => {
  const [profile, setProfile] = useState({
    currentAge: 30,
    retirementAge: 60,
    currentSalary: 600000,
    currentSavings: 500000,
    monthlyExpenses: 40000,
    inflationRate: 6,
    expectedReturn: 12,
    lifeExpectancy: 80
  });

  const [results, setResults] = useState({});

  useEffect(() => {
    calculateRetirement();
  }, [profile]);

  const calculateRetirement = () => {
    const yearsToRetirement = profile.retirementAge - profile.currentAge;
    const yearsInRetirement = profile.lifeExpectancy - profile.retirementAge;
    
    // Calculate required corpus using inflation-adjusted expenses
    const inflationAdjustedExpenses = profile.monthlyExpenses * Math.pow(1 + profile.inflationRate/100, yearsToRetirement);
    const annualExpensesAtRetirement = inflationAdjustedExpenses * 12;
    
    // Using 4% withdrawal rule (25x annual expenses)
    const requiredCorpus = annualExpensesAtRetirement * 25;
    
    // Calculate current portfolio value at retirement
    const futureValueOfCurrentSavings = profile.currentSavings * Math.pow(1 + profile.expectedReturn/100, yearsToRetirement);
    
    // Gap to be filled by monthly investments
    const gap = Math.max(0, requiredCorpus - futureValueOfCurrentSavings);
    
    // Calculate required SIP
    const monthlyReturn = profile.expectedReturn / 100 / 12;
    const totalMonths = yearsToRetirement * 12;
    const requiredSIP = gap * monthlyReturn / (Math.pow(1 + monthlyReturn, totalMonths) - 1);
    
    // Generate year-wise projection
    const projectionData = [];
    for (let year = 0; year <= yearsToRetirement; year++) {
      const age = profile.currentAge + year;
      const portfolioValue = profile.currentSavings * Math.pow(1 + profile.expectedReturn/100, year) +
                            (requiredSIP * 12) * ((Math.pow(1 + profile.expectedReturn/100, year) - 1) / (profile.expectedReturn/100));
      
      projectionData.push({
        age,
        year,
        portfolioValue: Math.round(portfolioValue),
        target: Math.round(requiredCorpus * (year / yearsToRetirement))
      });
    }

    setResults({
      requiredCorpus,
      futureValueOfCurrentSavings,
      gap,
      requiredSIP: Math.max(0, requiredSIP),
      inflationAdjustedExpenses,
      yearsToRetirement,
      yearsInRetirement,
      projectionData
    });
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
                <Trophy className="h-8 w-8 text-yellow-400" />
                Retirement Lab
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Plan your retirement corpus and investment strategy
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Profile Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-yellow-600" />
              Retirement Planning Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Age
                </label>
                <Input
                  type="number"
                  value={profile.currentAge}
                  onChange={(e) => setProfile({...profile, currentAge: Number(e.target.value)})}
                  placeholder="Your current age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Retirement Age
                </label>
                <Input
                  type="number"
                  value={profile.retirementAge}
                  onChange={(e) => setProfile({...profile, retirementAge: Number(e.target.value)})}
                  placeholder="Planned retirement age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Annual Salary
                </label>
                <Input
                  type="number"
                  value={profile.currentSalary}
                  onChange={(e) => setProfile({...profile, currentSalary: Number(e.target.value)})}
                  placeholder="Current annual salary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Savings
                </label>
                <Input
                  type="number"
                  value={profile.currentSavings}
                  onChange={(e) => setProfile({...profile, currentSavings: Number(e.target.value)})}
                  placeholder="Current retirement savings"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Expenses
                </label>
                <Input
                  type="number"
                  value={profile.monthlyExpenses}
                  onChange={(e) => setProfile({...profile, monthlyExpenses: Number(e.target.value)})}
                  placeholder="Current monthly expenses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inflation Rate (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={profile.inflationRate}
                  onChange={(e) => setProfile({...profile, inflationRate: Number(e.target.value)})}
                  placeholder="Expected inflation rate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Return (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={profile.expectedReturn}
                  onChange={(e) => setProfile({...profile, expectedReturn: Number(e.target.value)})}
                  placeholder="Expected annual return"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Life Expectancy
                </label>
                <Input
                  type="number"
                  value={profile.lifeExpectancy}
                  onChange={(e) => setProfile({...profile, lifeExpectancy: Number(e.target.value)})}
                  placeholder="Expected life expectancy"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Retirement Corpus Goal
              </h3>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatLakhs(results.requiredCorpus || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Required at retirement
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Years to retirement:</span>
                  <span className="font-medium">{results.yearsToRetirement || 0} years</span>
                </div>
                <div className="flex justify-between">
                  <span>Inflation adjusted expenses:</span>
                  <span className="font-medium">{formatCurrency(results.inflationAdjustedExpenses || 0)}/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Current savings growth:</span>
                  <span className="font-medium">{formatLakhs(results.futureValueOfCurrentSavings || 0)}</span>
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
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Investment Required
              </h3>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(results.requiredSIP || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Monthly SIP required
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Total investment needed:</span>
                  <span className="font-medium">{formatLakhs(results.gap || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Investment period:</span>
                  <span className="font-medium">{results.yearsToRetirement || 0} years</span>
                </div>
                <div className="flex justify-between">
                  <span>As % of current income:</span>
                  <span className="font-medium">{((results.requiredSIP || 0) * 12 / profile.currentSalary * 100).toFixed(1)}%</span>
                </div>
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
                <Clock className="h-5 w-5 text-purple-600" />
                Longevity Stress Test
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Retirement Duration</div>
                  <div className="text-xl font-bold text-purple-600">
                    {results.yearsInRetirement || 0} years
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Corpus Withdrawal</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency((results.requiredCorpus || 0) / 300)} {/* 25 years = 300 months */}
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400">
                  * Based on 4% safe withdrawal rule
                  <br />
                  * Assumes portfolio continues earning returns
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Projection Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Retirement Corpus Projection
            </h3>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.projectionData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`} />
                  <Tooltip formatter={(value) => formatLakhs(value)} />
                  <Line 
                    type="monotone" 
                    dataKey="portfolioValue" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Portfolio Value"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Investment Allocation Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              Recommended Investment Mix
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Equity Allocation */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Equity</h4>
                    <span className="text-2xl font-bold text-blue-600">
                      {Math.max(20, 100 - profile.currentAge)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Large cap mutual funds, Index funds, Blue chip stocks
                  </p>
                  <div className="text-xs text-blue-600">
                    Expected: 12-15% returns
                  </div>
                </div>
              </div>

              {/* Debt Allocation */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Debt</h4>
                    <span className="text-2xl font-bold text-green-600">
                      {Math.min(80, profile.currentAge)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    PPF, EPF, Government bonds, Debt mutual funds
                  </p>
                  <div className="text-xs text-green-600">
                    Expected: 7-9% returns
                  </div>
                </div>
              </div>

              {/* Alternative Investments */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Others</h4>
                    <span className="text-2xl font-bold text-purple-600">10%</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Real estate, Gold, REITs, International funds
                  </p>
                  <div className="text-xs text-purple-600">
                    Expected: 8-12% returns
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-start space-x-3">
                <Heart className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <div className="font-medium text-blue-900 dark:text-blue-100">Age-based Asset Allocation</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    As you age, gradually shift from equity to debt to reduce risk. 
                    The formula: (100 - your age)% in equity works well for Indian markets.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RetirementLab; 