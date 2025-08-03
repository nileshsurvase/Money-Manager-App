import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Shield,
  Heart,
  PiggyBank,
  Calculator,
  Target,
  Award,
  RefreshCw,
  Download,
  BarChart3
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';

const AnnualWealthCheck = () => {
  const [profile, setProfile] = useState({
    age: 30,
    monthlyIncome: 75000,
    monthlyExpenses: 50000,
    emergencyFund: 150000,
    healthInsurance: true,
    healthInsuranceCover: 500000,
    lifeInsurance: true,
    lifeInsuranceCover: 2500000,
    investments: 500000,
    loans: 1500000,
    creditScore: 750,
    willMade: false
  });

  const [checklistResults, setChecklistResults] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadSavedData();
  }, []);

  useEffect(() => {
    performWealthCheck();
  }, [profile]);

  const loadSavedData = () => {
    const saved = localStorage.getItem('freedomos_wealth_check');
    if (saved) {
      const data = JSON.parse(saved);
      setProfile(data.profile || profile);
      setLastUpdated(data.lastUpdated || null);
    }
  };

  const saveData = () => {
    const data = {
      profile,
      checklistResults,
      overallScore,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('freedomos_wealth_check', JSON.stringify(data));
    setLastUpdated(new Date().toISOString());
  };

  const performWealthCheck = () => {
    const checks = [
      {
        id: 1,
        title: 'Emergency Fund (3-6 months expenses)',
        description: 'You should have 3-6 months of expenses saved for emergencies',
        check: () => {
          const monthsOfExpenses = profile.emergencyFund / profile.monthlyExpenses;
          const status = monthsOfExpenses >= 3 ? 'good' : monthsOfExpenses >= 1 ? 'warning' : 'poor';
          return {
            status,
            score: monthsOfExpenses >= 6 ? 10 : monthsOfExpenses >= 3 ? 8 : monthsOfExpenses >= 1 ? 5 : 0,
            details: `You have ${monthsOfExpenses.toFixed(1)} months of expenses saved (₹${profile.emergencyFund.toLocaleString()})`
          };
        },
        icon: PiggyBank,
        recommendation: 'Build emergency fund to cover 3-6 months of expenses'
      },
      {
        id: 2,
        title: 'Health Insurance Coverage',
        description: 'Adequate health insurance to cover medical emergencies',
        check: () => {
          if (!profile.healthInsurance) {
            return { status: 'poor', score: 0, details: 'No health insurance coverage' };
          }
          const adequateCover = profile.healthInsuranceCover >= (profile.monthlyIncome * 12 * 0.5);
          const status = adequateCover ? 'good' : 'warning';
          return {
            status,
            score: adequateCover ? 10 : 6,
            details: `Health insurance cover: ₹${profile.healthInsuranceCover.toLocaleString()}`
          };
        },
        icon: Heart,
        recommendation: 'Get health insurance with adequate cover (min 5-10 lakh)'
      },
      {
        id: 3,
        title: 'Life Insurance Coverage',
        description: 'Life insurance cover should be 10-15 times annual income',
        check: () => {
          if (!profile.lifeInsurance) {
            return { status: 'poor', score: 0, details: 'No life insurance coverage' };
          }
          const annualIncome = profile.monthlyIncome * 12;
          const coverRatio = profile.lifeInsuranceCover / annualIncome;
          const status = coverRatio >= 10 ? 'good' : coverRatio >= 5 ? 'warning' : 'poor';
          return {
            status,
            score: coverRatio >= 15 ? 10 : coverRatio >= 10 ? 8 : coverRatio >= 5 ? 5 : 2,
            details: `Life cover: ₹${profile.lifeInsuranceCover.toLocaleString()} (${coverRatio.toFixed(1)}x annual income)`
          };
        },
        icon: Shield,
        recommendation: 'Get life insurance cover of 10-15 times your annual income'
      },
      {
        id: 4,
        title: 'Savings Rate (>20%)',
        description: 'You should save at least 20% of your income',
        check: () => {
          const savingsRate = ((profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome) * 100;
          const status = savingsRate >= 20 ? 'good' : savingsRate >= 10 ? 'warning' : 'poor';
          return {
            status,
            score: savingsRate >= 30 ? 10 : savingsRate >= 20 ? 8 : savingsRate >= 10 ? 5 : 0,
            details: `Current savings rate: ${savingsRate.toFixed(1)}%`
          };
        },
        icon: TrendingUp,
        recommendation: 'Aim to save at least 20% of your income'
      },
      {
        id: 5,
        title: 'Investment Portfolio',
        description: 'Regular investments for wealth building',
        check: () => {
          const investmentToIncomeRatio = profile.investments / (profile.monthlyIncome * 12);
          const status = investmentToIncomeRatio >= 1 ? 'good' : investmentToIncomeRatio >= 0.5 ? 'warning' : 'poor';
          return {
            status,
            score: investmentToIncomeRatio >= 2 ? 10 : investmentToIncomeRatio >= 1 ? 8 : investmentToIncomeRatio >= 0.5 ? 5 : 2,
            details: `Investments: ₹${profile.investments.toLocaleString()} (${(investmentToIncomeRatio * 12).toFixed(1)} months of income)`
          };
        },
        icon: BarChart3,
        recommendation: 'Build a diversified investment portfolio for long-term wealth'
      },
      {
        id: 6,
        title: 'Debt Management',
        description: 'Debt should be manageable and not excessive',
        check: () => {
          const debtToIncomeRatio = profile.loans / (profile.monthlyIncome * 12);
          const status = debtToIncomeRatio <= 3 ? 'good' : debtToIncomeRatio <= 5 ? 'warning' : 'poor';
          return {
            status,
            score: debtToIncomeRatio <= 2 ? 10 : debtToIncomeRatio <= 3 ? 8 : debtToIncomeRatio <= 5 ? 5 : 0,
            details: `Total debt: ₹${profile.loans.toLocaleString()} (${debtToIncomeRatio.toFixed(1)}x annual income)`
          };
        },
        icon: Calculator,
        recommendation: 'Keep total debt below 3-4 times your annual income'
      },
      {
        id: 7,
        title: 'Credit Score (>750)',
        description: 'Good credit score for better loan terms',
        check: () => {
          const status = profile.creditScore >= 750 ? 'good' : profile.creditScore >= 650 ? 'warning' : 'poor';
          return {
            status,
            score: profile.creditScore >= 800 ? 10 : profile.creditScore >= 750 ? 8 : profile.creditScore >= 650 ? 5 : 0,
            details: `Credit score: ${profile.creditScore}`
          };
        },
        icon: Award,
        recommendation: 'Maintain credit score above 750 for best rates'
      },
      {
        id: 8,
        title: 'Retirement Planning',
        description: 'Adequate retirement savings for your age',
        check: () => {
          const targetRetirementSavings = profile.monthlyIncome * 12 * (profile.age - 25); // Rule of thumb
          const currentRetirementSavings = profile.investments * 0.6; // Assuming 60% is for retirement
          const status = currentRetirementSavings >= targetRetirementSavings ? 'good' : 
                        currentRetirementSavings >= targetRetirementSavings * 0.5 ? 'warning' : 'poor';
          return {
            status,
            score: currentRetirementSavings >= targetRetirementSavings ? 10 : 
                   currentRetirementSavings >= targetRetirementSavings * 0.7 ? 8 : 
                   currentRetirementSavings >= targetRetirementSavings * 0.3 ? 5 : 0,
            details: `Retirement savings: ₹${currentRetirementSavings.toLocaleString()} (Target: ₹${targetRetirementSavings.toLocaleString()})`
          };
        },
        icon: Target,
        recommendation: 'Start retirement planning early with systematic investments'
      },
      {
        id: 9,
        title: 'Estate Planning (Will)',
        description: 'Having a will to protect your family',
        check: () => {
          const status = profile.willMade ? 'good' : 'poor';
          return {
            status,
            score: profile.willMade ? 10 : 0,
            details: profile.willMade ? 'Will is prepared' : 'No will prepared'
          };
        },
        icon: FileCheck,
        recommendation: 'Prepare a will to ensure smooth transfer of assets'
      },
      {
        id: 10,
        title: 'Financial Discipline',
        description: 'Overall financial management and discipline',
        check: () => {
          // Calculate based on savings rate, debt management, and investment behavior
          const savingsRate = ((profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome) * 100;
          const debtToIncomeRatio = profile.loans / (profile.monthlyIncome * 12);
          const investmentRatio = profile.investments / (profile.monthlyIncome * 12);
          
          const disciplineScore = (
            (savingsRate >= 20 ? 3 : savingsRate >= 10 ? 2 : 1) +
            (debtToIncomeRatio <= 3 ? 3 : debtToIncomeRatio <= 5 ? 2 : 1) +
            (investmentRatio >= 1 ? 4 : investmentRatio >= 0.5 ? 3 : 2)
          );
          
          const status = disciplineScore >= 8 ? 'good' : disciplineScore >= 6 ? 'warning' : 'poor';
          return {
            status,
            score: disciplineScore,
            details: `Financial discipline score: ${disciplineScore}/10`
          };
        },
        icon: RefreshCw,
        recommendation: 'Maintain consistent savings and investment habits'
      }
    ];

    const results = checks.map(check => {
      const result = check.check();
      return {
        ...check,
        ...result
      };
    });

    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const maxScore = results.length * 10;
    const percentage = (totalScore / maxScore) * 100;

    setChecklistResults(results);
    setOverallScore(percentage);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Average';
    if (score >= 50) return 'Below Average';
    return 'Poor';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'poor': return XCircle;
      default: return XCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const exportReport = () => {
    const report = {
      overallScore,
      grade: getScoreGrade(overallScore),
      checklistResults,
      profile,
      generatedAt: new Date().toISOString(),
      recommendations: checklistResults
        .filter(result => result.status !== 'good')
        .map(result => result.recommendation)
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealth_check_report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="space-y-2">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold flex items-center gap-3">
                <FileCheck className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                <span className="whitespace-nowrap">Annual Wealth Check</span>
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                10-point financial health checklist
              </p>
            </div>
            {lastUpdated && (
              <div className="text-right text-blue-100 text-sm">
                Last updated: {new Date(lastUpdated).toLocaleDateString()}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`bg-gradient-to-br ${
          overallScore >= 80 ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' :
          overallScore >= 60 ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' :
          'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
        }`}>
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Financial Health Score
            </h2>
            <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
              {Math.round(overallScore)}%
            </div>
            <div className={`text-xl font-semibold ${getScoreColor(overallScore)}`}>
              {getScoreGrade(overallScore)}
            </div>
            <div className="flex justify-center space-x-4">
              <Button variant="primary" onClick={saveData}>
                Save Report
              </Button>
              <Button variant="secondary" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Profile Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Update Your Financial Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                <Input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: Number(e.target.value)})}
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emergency Fund
                </label>
                <Input
                  type="number"
                  value={profile.emergencyFund}
                  onChange={(e) => setProfile({...profile, emergencyFund: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Health Insurance Cover
                </label>
                <Input
                  type="number"
                  value={profile.healthInsuranceCover}
                  onChange={(e) => setProfile({...profile, healthInsuranceCover: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Life Insurance Cover
                </label>
                <Input
                  type="number"
                  value={profile.lifeInsuranceCover}
                  onChange={(e) => setProfile({...profile, lifeInsuranceCover: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Investments
                </label>
                <Input
                  type="number"
                  value={profile.investments}
                  onChange={(e) => setProfile({...profile, investments: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Loans
                </label>
                <Input
                  type="number"
                  value={profile.loans}
                  onChange={(e) => setProfile({...profile, loans: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Credit Score
                </label>
                <Input
                  type="number"
                  value={profile.creditScore}
                  onChange={(e) => setProfile({...profile, creditScore: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="healthInsurance"
                  checked={profile.healthInsurance}
                  onChange={(e) => setProfile({...profile, healthInsurance: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="healthInsurance" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Have Health Insurance
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lifeInsurance"
                  checked={profile.lifeInsurance}
                  onChange={(e) => setProfile({...profile, lifeInsurance: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="lifeInsurance" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Have Life Insurance
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="willMade"
                  checked={profile.willMade}
                  onChange={(e) => setProfile({...profile, willMade: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="willMade" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Will is Prepared
                </label>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Checklist Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Financial Health Checklist
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {checklistResults.map((result, index) => {
                const Icon = result.icon;
                const StatusIcon = getStatusIcon(result.status);
                
                return (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-6 w-6 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{result.title}</h4>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-5 w-5" />
                            <span className="text-sm font-bold">{result.score}/10</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {result.description}
                        </p>
                        <p className="text-sm font-medium mb-2">
                          {result.details}
                        </p>
                        {result.status !== 'good' && (
                          <p className="text-xs italic">
                            💡 {result.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnnualWealthCheck;