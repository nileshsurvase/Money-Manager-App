import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  TrendingDown, 
  Calculator,
  Calendar,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  Edit3,
  Trash2,
  Zap,
  Award,
  BarChart3,
  Eye,
  PieChart,
  Home
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const LoanCrusher = () => {
  const [userProfile, setUserProfile] = useState({
    monthlyIncome: 75000,
    profession: 'software_engineer',
    age: 30,
    creditScore: 750
  });

  const [loans, setLoans] = useState([]);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [newLoan, setNewLoan] = useState({
    name: '',
    type: 'personal', // personal, home, car, credit_card, education
    principal: 0,
    interestRate: 0,
    tenure: 0,
    emi: 0,
    outstandingAmount: 0,
    nextDueDate: ''
  });

  const [editingLoan, setEditingLoan] = useState(null);
  const [payoffStrategy, setPayoffStrategy] = useState('avalanche');
  const [extraPayment, setExtraPayment] = useState(5000);

  useEffect(() => {
    loadLoansData();
  }, []);

  useEffect(() => {
    calculateEMIForNewLoan();
  }, [newLoan.principal, newLoan.interestRate, newLoan.tenure]);

  const loadLoansData = () => {
    const savedLoans = JSON.parse(localStorage.getItem('freedomos_loans') || '[]');
    if (savedLoans.length === 0) {
      // Add some default loans for demonstration
      const defaultLoans = [
        {
          id: 1,
          name: 'Home Loan - HDFC',
          type: 'home',
          principal: 2500000,
          interestRate: 8.5,
          tenure: 240, // 20 years
          emi: 21455,
          outstandingAmount: 2200000,
          nextDueDate: '2024-01-15'
        },
        {
          id: 2,
          name: 'Car Loan - SBI',
          type: 'car',
          principal: 800000,
          interestRate: 9.2,
          tenure: 84, // 7 years
          emi: 13245,
          outstandingAmount: 650000,
          nextDueDate: '2024-01-10'
        },
        {
          id: 3,
          name: 'Personal Loan - ICICI',
          type: 'personal',
          principal: 300000,
          interestRate: 14.5,
          tenure: 48, // 4 years
          emi: 8456,
          outstandingAmount: 180000,
          nextDueDate: '2024-01-05'
        }
      ];
      setLoans(defaultLoans);
      localStorage.setItem('freedomos_loans', JSON.stringify(defaultLoans));
    } else {
      setLoans(savedLoans);
    }
  };

  const saveLoansData = (updatedLoans) => {
    localStorage.setItem('freedomos_loans', JSON.stringify(updatedLoans));
    setLoans(updatedLoans);
  };

  const calculateEMIForNewLoan = () => {
    if (newLoan.principal && newLoan.interestRate && newLoan.tenure) {
      const p = newLoan.principal;
      const r = newLoan.interestRate / 100 / 12;
      const n = newLoan.tenure;
      
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setNewLoan(prev => ({ 
        ...prev, 
        emi: Math.round(emi),
        outstandingAmount: p
      }));
    }
  };

  const addLoan = () => {
    const loan = {
      id: Date.now(),
      ...newLoan,
      principal: Number(newLoan.principal),
      interestRate: Number(newLoan.interestRate),
      tenure: Number(newLoan.tenure),
      emi: Number(newLoan.emi),
      outstandingAmount: Number(newLoan.outstandingAmount)
    };

    const updatedLoans = [...loans, loan];
    saveLoansData(updatedLoans);
    
    setNewLoan({
      name: '',
      type: 'personal',
      principal: 0,
      interestRate: 0,
      tenure: 0,
      emi: 0,
      outstandingAmount: 0,
      nextDueDate: ''
    });
    setShowAddLoan(false);
  };

  const updateLoan = (id, updatedData) => {
    const updatedLoans = loans.map(loan => 
      loan.id === id ? { ...loan, ...updatedData } : loan
    );
    saveLoansData(updatedLoans);
    setEditingLoan(null);
  };

  const deleteLoan = (id) => {
    const updatedLoans = loans.filter(loan => loan.id !== id);
    saveLoansData(updatedLoans);
  };

  const calculateDebtPayoffPlan = () => {
    if (loans.length === 0) return { plan: [], totalTime: 0, totalInterest: 0 };

    let sortedLoans = [...loans];
    
    if (payoffStrategy === 'avalanche') {
      // Highest interest rate first
      sortedLoans.sort((a, b) => b.interestRate - a.interestRate);
    } else {
      // Smallest balance first (snowball)
      sortedLoans.sort((a, b) => a.outstandingAmount - b.outstandingAmount);
    }

    let totalExtraPayment = extraPayment;
    let totalTime = 0;
    let totalInterest = 0;
    const plan = [];

    sortedLoans.forEach((loan, index) => {
      const monthlyRate = loan.interestRate / 100 / 12;
      let balance = loan.outstandingAmount;
      let months = 0;
      let totalInterestPaid = 0;

      // Calculate extra payment for this loan
      const extraForThisLoan = index === 0 ? totalExtraPayment : 0; // Apply extra payment to first loan
      const totalPayment = loan.emi + extraForThisLoan;

      while (balance > 0 && months < 600) { // Max 50 years safety
        const interestPayment = balance * monthlyRate;
        const principalPayment = Math.min(totalPayment - interestPayment, balance);
        
        totalInterestPaid += interestPayment;
        balance -= principalPayment;
        months++;
      }

      plan.push({
        ...loan,
        monthsToPayoff: months,
        totalInterestPaid: Math.round(totalInterestPaid),
        extraPayment: extraForThisLoan,
        totalPayment
      });

      totalTime = Math.max(totalTime, months);
      totalInterest += totalInterestPaid;
    });

    return { plan, totalTime, totalInterest: Math.round(totalInterest) };
  };

  const generateEMICalendar = () => {
    const calendar = [];
    const currentDate = new Date();
    
    loans.forEach(loan => {
      for (let i = 0; i < 12; i++) {
        const dueDate = new Date(currentDate);
        dueDate.setMonth(currentDate.getMonth() + i);
        
        calendar.push({
          loanName: loan.name,
          dueDate: dueDate.toISOString().split('T')[0],
          emi: loan.emi,
          type: loan.type,
          month: dueDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        });
      }
    });

    return calendar.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  const getCreditScoreRecommendations = () => {
    const totalEMI = loans.reduce((sum, loan) => sum + loan.emi, 0);
    const dtiRatio = (totalEMI / userProfile.monthlyIncome) * 100;
    const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);

    let recommendations = [];
    let riskLevel = 'low';

    if (dtiRatio > 50) {
      riskLevel = 'high';
      recommendations.push({
        type: 'critical',
        title: 'Very High Debt-to-Income Ratio',
        description: `Your EMI obligations (${dtiRatio.toFixed(1)}%) are too high. Consider debt consolidation or restructuring.`,
        action: 'Reduce EMIs by extending tenure or consolidating loans'
      });
    } else if (dtiRatio > 30) {
      riskLevel = 'medium';
      recommendations.push({
        type: 'warning',
        title: 'High Debt-to-Income Ratio',
        description: `Your EMI obligations (${dtiRatio.toFixed(1)}%) are on the higher side. Monitor closely.`,
        action: 'Consider extra payments to reduce debt faster'
      });
    }

    if (userProfile.creditScore < 650) {
      recommendations.push({
        type: 'critical',
        title: 'Poor Credit Score',
        description: 'Your credit score is below 650, which may affect future loan approvals.',
        action: 'Pay all EMIs on time, maintain low credit utilization'
      });
    } else if (userProfile.creditScore < 750) {
      recommendations.push({
        type: 'warning',
        title: 'Average Credit Score',
        description: 'Your credit score can be improved for better loan terms.',
        action: 'Maintain payment discipline and reduce credit utilization'
      });
    }

    // High interest rate loans
    const highInterestLoans = loans.filter(loan => loan.interestRate > 12);
    if (highInterestLoans.length > 0) {
      recommendations.push({
        type: 'suggestion',
        title: 'High Interest Rate Loans',
        description: `You have ${highInterestLoans.length} loan(s) with interest rates above 12%.`,
        action: 'Consider refinancing or prepayment for high-interest loans'
      });
    }

    return { recommendations, riskLevel, dtiRatio };
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

  const getLoanTypeIcon = (type) => {
    switch (type) {
      case 'home': return '🏠';
      case 'car': return '🚗';
      case 'personal': return '💰';
      case 'credit_card': return '💳';
      case 'education': return '📚';
      default: return '💸';
    }
  };

  const getLoanTypeColor = (type) => {
    switch (type) {
      case 'home': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'car': return 'text-green-600 bg-green-50 border-green-200';
      case 'personal': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'credit_card': return 'text-red-600 bg-red-50 border-red-200';
      case 'education': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const payoffPlan = calculateDebtPayoffPlan();
  const emiCalendar = generateEMICalendar();
  const creditAnalysis = getCreditScoreRecommendations();

  const totalEMI = loans.reduce((sum, loan) => sum + loan.emi, 0);
  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);

  const loanDistribution = loans.map(loan => ({
    name: loan.name,
    value: loan.outstandingAmount,
    type: loan.type
  }));

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

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
                <TrendingDown className="h-8 w-8 text-yellow-400" />
                Loan Crusher
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Crush your debt with smart payoff strategies and credit optimization
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* User Profile & Credit Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Credit Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  Profession
                </label>
                <select
                  value={userProfile.profession}
                  onChange={(e) => setUserProfile({...userProfile, profession: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="software_engineer">Software Engineer</option>
                  <option value="doctor">Doctor</option>
                  <option value="teacher">Teacher</option>
                  <option value="business">Business Owner</option>
                  <option value="banker">Banker</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Credit Score
                </label>
                <Input
                  type="number"
                  value={userProfile.creditScore}
                  onChange={(e) => setUserProfile({...userProfile, creditScore: Number(e.target.value)})}
                  placeholder="Credit score"
                  min="300"
                  max="900"
                />
              </div>
            </div>
            
            {/* Credit Score Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    userProfile.creditScore >= 750 ? 'text-green-600' :
                    userProfile.creditScore >= 650 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {userProfile.creditScore}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Credit Score</div>
                  <div className={`text-xs px-2 py-1 rounded-full mt-2 ${
                    userProfile.creditScore >= 750 ? 'bg-green-100 text-green-700' :
                    userProfile.creditScore >= 650 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {userProfile.creditScore >= 750 ? 'Excellent' :
                     userProfile.creditScore >= 650 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    creditAnalysis.dtiRatio <= 30 ? 'text-green-600' :
                    creditAnalysis.dtiRatio <= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {creditAnalysis.dtiRatio.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Debt-to-Income</div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(totalEMI)} / {formatCurrency(userProfile.monthlyIncome)}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="text-center">
                  <div className={`text-lg font-bold px-3 py-1 rounded-full ${
                    creditAnalysis.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                    creditAnalysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {creditAnalysis.riskLevel.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Risk Level</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Loan Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                Loan Portfolio
              </h3>
              <Button
                variant="primary"
                size="small"
                onClick={() => setShowAddLoan(!showAddLoan)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Loan
              </Button>
            </div>

            {showAddLoan && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Loan Name
                    </label>
                    <Input
                      type="text"
                      value={newLoan.name}
                      onChange={(e) => setNewLoan({...newLoan, name: e.target.value})}
                      placeholder="e.g., Home Loan - HDFC"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Loan Type
                    </label>
                    <select
                      value={newLoan.type}
                      onChange={(e) => setNewLoan({...newLoan, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="personal">Personal Loan</option>
                      <option value="home">Home Loan</option>
                      <option value="car">Car Loan</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="education">Education Loan</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Principal Amount
                    </label>
                    <Input
                      type="number"
                      value={newLoan.principal}
                      onChange={(e) => setNewLoan({...newLoan, principal: e.target.value})}
                      placeholder="Loan amount"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Interest Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newLoan.interestRate}
                      onChange={(e) => setNewLoan({...newLoan, interestRate: e.target.value})}
                      placeholder="Annual interest rate"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tenure (months)
                    </label>
                    <Input
                      type="number"
                      value={newLoan.tenure}
                      onChange={(e) => setNewLoan({...newLoan, tenure: e.target.value})}
                      placeholder="Loan tenure"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Outstanding Amount
                    </label>
                    <Input
                      type="number"
                      value={newLoan.outstandingAmount}
                      onChange={(e) => setNewLoan({...newLoan, outstandingAmount: e.target.value})}
                      placeholder="Current outstanding"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      EMI (Auto-calculated)
                    </label>
                    <Input
                      type="number"
                      value={newLoan.emi}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-600"
                      placeholder="EMI will be calculated"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Next Due Date
                    </label>
                    <Input
                      type="date"
                      value={newLoan.nextDueDate}
                      onChange={(e) => setNewLoan({...newLoan, nextDueDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    onClick={addLoan}
                    disabled={!newLoan.name || !newLoan.principal}
                  >
                    Add Loan
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddLoan(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Loans List */}
            <div className="space-y-3">
              {loans.map((loan, index) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-4 sm:space-y-0">
                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getLoanTypeIcon(loan.type)}</div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              {loan.name}
                            </div>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${getLoanTypeColor(loan.type)}`}>
                              {loan.type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => setEditingLoan(loan.id)}
                            className="p-2"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => deleteLoan(loan.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Interest Rate</span>
                          <div className="font-medium">{loan.interestRate}% p.a.</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">EMI</span>
                          <div className="font-medium">{formatCurrency(loan.emi)}</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600 dark:text-gray-400">Outstanding</span>
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {formatLakhs(loan.outstandingAmount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{getLoanTypeIcon(loan.type)}</div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {loan.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${getLoanTypeColor(loan.type)}`}>
                              {loan.type.replace('_', ' ').toUpperCase()}
                            </span>
                            <span>{loan.interestRate}% p.a.</span>
                            <span>EMI: {formatCurrency(loan.emi)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {formatLakhs(loan.outstandingAmount)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Outstanding
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => setEditingLoan(loan.id)}
                            className="p-2"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => deleteLoan(loan.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {loans.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No loans added yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add your loans to get personalized debt payoff strategies
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowAddLoan(true)}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Loan
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {loans.length > 0 && (
        <>
          {/* Debt Payoff Strategy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Debt Payoff Strategy
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Extra Payment:
                      </label>
                      <Input
                        type="number"
                        value={extraPayment}
                        onChange={(e) => setExtraPayment(Number(e.target.value))}
                        placeholder="Extra payment"
                        className="w-full sm:w-32"
                      />
                    </div>
                    
                    <select
                      value={payoffStrategy}
                      onChange={(e) => setPayoffStrategy(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="avalanche">Debt Avalanche (High Interest First)</option>
                      <option value="snowball">Debt Snowball (Small Balance First)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {payoffStrategy === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'} Plan
                    </h4>
                    
                    <div className="space-y-3">
                      {payoffPlan.plan.map((loan, index) => (
                        <div key={loan.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                              <span className="font-medium">{loan.name}</span>
                            </div>
                            <span className="text-sm text-gray-600">{loan.interestRate}% p.a.</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Outstanding:</span>
                              <span className="font-medium ml-2">{formatLakhs(loan.outstandingAmount)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Payoff Time:</span>
                              <span className="font-medium ml-2">{loan.monthsToPayoff} months</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Total Payment:</span>
                              <span className="font-medium ml-2">{formatCurrency(loan.totalPayment)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Interest Paid:</span>
                              <span className="font-medium ml-2">{formatLakhs(loan.totalInterestPaid)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      Summary
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Debt-Free Time</div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(payoffPlan.totalTime / 12)} years {payoffPlan.totalTime % 12} months
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Interest Saved</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatLakhs(payoffPlan.totalInterest)}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Commitment</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(totalEMI + extraPayment)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Credit Score Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Credit Score Optimization
                </h3>
                
                <div className="space-y-3">
                  {creditAnalysis.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`p-4 rounded-lg border ${
                        rec.type === 'critical' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700' :
                        rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700' :
                        'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`mt-1 ${
                          rec.type === 'critical' ? 'text-red-600' :
                          rec.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {rec.type === 'critical' ? <AlertTriangle className="h-5 w-5" /> :
                           rec.type === 'warning' ? <Info className="h-5 w-5" /> :
                           <CheckCircle className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {rec.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {rec.description}
                          </div>
                          <div className={`text-sm font-medium ${
                            rec.type === 'critical' ? 'text-red-700 dark:text-red-300' :
                            rec.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                            'text-blue-700 dark:text-blue-300'
                          }`}>
                            💡 {rec.action}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {creditAnalysis.recommendations.length === 0 && (
                    <div className="text-center py-6">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Excellent Credit Health!
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Your debt management is on track. Keep up the good work!
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* EMI Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  EMI Calendar (Next 12 Months)
                </h3>
                
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {emiCalendar.slice(0, 12).reduce((acc, emi, index) => {
                      const monthKey = emi.month;
                      if (!acc[monthKey]) {
                        acc[monthKey] = {
                          month: monthKey,
                          emis: [],
                          total: 0
                        };
                      }
                      acc[monthKey].emis.push(emi);
                      acc[monthKey].total += emi.emi;
                      return acc;
                    }, {}) && Object.values(emiCalendar.slice(0, 12).reduce((acc, emi) => {
                      const monthKey = emi.month;
                      if (!acc[monthKey]) {
                        acc[monthKey] = {
                          month: monthKey,
                          emis: [],
                          total: 0
                        };
                      }
                      acc[monthKey].emis.push(emi);
                      acc[monthKey].total += emi.emi;
                      return acc;
                    }, {})).slice(0, 6).map((monthData, index) => (
                      <motion.div
                        key={monthData.month}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                      >
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {monthData.month}
                        </div>
                        <div className="space-y-2">
                          {monthData.emis.map((emi, emiIndex) => (
                            <div key={emiIndex} className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{emi.loanName?.split(' -')[0] || 'Unknown Loan'}</span>
                              <span className="font-medium">{formatCurrency(emi.emi)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Total</span>
                            <span className="text-blue-600">{formatCurrency(monthData.total)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
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
              <Calculator className="h-5 w-5 text-purple-600" />
              Related Calculators
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Loan Repayment Optimizer */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Loan Repayment Optimizer</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Calculate EMI payoff time and prepayment savings
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* Debt Avalanche Planner */}
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Debt Avalanche Planner</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Choose which loan to close first for maximum savings
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* Credit Card Interest Estimator */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Credit Card Interest</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Shows hidden cost of minimum credit card payments
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* Debt-Free Timeline */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Debt-Free Timeline</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Simulate becoming debt-free with extra EMI payments
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* House Affordability */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-3">
                  <Home className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">House Affordability</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Complete home loan affordability calculator
                </p>
                <Button variant="secondary" size="small" className="w-full">
                  Use Calculator
                </Button>
              </div>

              {/* 50/30/20 Budget Planner */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center gap-3 mb-3">
                  <PieChart className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Budget Planner</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  50/30/20 budget allocations and overspending detection
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

export default LoanCrusher; 