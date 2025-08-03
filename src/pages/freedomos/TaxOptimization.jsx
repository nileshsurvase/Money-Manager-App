import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Info,
  BarChart3,
  PieChart
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';

const TaxOptimization = () => {
  const [profile, setProfile] = useState({
    grossSalary: 1200000,
    age: 30,
    regime: 'new', // 'old' or 'new'
    pfContribution: 0,
    vpfContribution: 0,
    elssInvestment: 0,
    lifeInsurance: 0,
    healthInsurance: 0,
    homeLoanInterest: 0,
    rentPaid: 0,
    cityType: 'metro', // 'metro' or 'non-metro'
    npsContribution: 0,
    mediclaim: 0,
    educationLoan: 0
  });

  const [taxComparison, setTaxComparison] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    calculateTax();
  }, [profile]);

  const calculateTax = () => {
    const newRegimeTax = calculateNewRegimeTax();
    const oldRegimeTax = calculateOldRegimeTax();
    
    setTaxComparison({
      newRegime: newRegimeTax,
      oldRegime: oldRegimeTax,
      savings: oldRegimeTax.totalTax - newRegimeTax.totalTax,
      recommendedRegime: oldRegimeTax.totalTax < newRegimeTax.totalTax ? 'old' : 'new'
    });

    generateRecommendations(newRegimeTax, oldRegimeTax);
  };

  const calculateNewRegimeTax = () => {
    let taxableIncome = profile.grossSalary;
    
    // Standard deduction (new regime)
    const standardDeduction = Math.min(50000, taxableIncome);
    taxableIncome -= standardDeduction;

    // PF deduction (limited in new regime)
    const pfDeduction = Math.min(profile.pfContribution, 150000);
    taxableIncome -= pfDeduction;

    const tax = calculateIncomeTax(taxableIncome, 'new');
    const cess = tax * 0.04; // 4% Health and Education Cess
    
    return {
      taxableIncome,
      incomeTax: tax,
      cess,
      totalTax: tax + cess,
      deductions: {
        standardDeduction,
        pfDeduction,
        total: standardDeduction + pfDeduction
      }
    };
  };

  const calculateOldRegimeTax = () => {
    let taxableIncome = profile.grossSalary;
    
    // Standard deduction (old regime)
    const standardDeduction = Math.min(50000, taxableIncome);
    taxableIncome -= standardDeduction;

    // Section 80C deductions
    const section80C = Math.min(
      profile.pfContribution + profile.vpfContribution + profile.elssInvestment + profile.lifeInsurance,
      150000
    );
    taxableIncome -= section80C;

    // Section 80D (Health Insurance)
    const section80D = Math.min(profile.healthInsurance + profile.mediclaim, 
      profile.age >= 60 ? 50000 : 25000);
    taxableIncome -= section80D;

    // Section 24(b) - Home Loan Interest
    const homeLoanDeduction = Math.min(profile.homeLoanInterest, 200000);
    taxableIncome -= homeLoanDeduction;

    // HRA exemption
    const hraExemption = calculateHRAExemption();
    taxableIncome -= hraExemption;

    // Section 80CCD(1B) - NPS
    const npsDeduction = Math.min(profile.npsContribution, 50000);
    taxableIncome -= npsDeduction;

    // Section 80E - Education Loan
    taxableIncome -= profile.educationLoan;

    const tax = calculateIncomeTax(Math.max(0, taxableIncome), 'old');
    const cess = tax * 0.04; // 4% Health and Education Cess
    
    return {
      taxableIncome: Math.max(0, taxableIncome),
      incomeTax: tax,
      cess,
      totalTax: tax + cess,
      deductions: {
        standardDeduction,
        section80C,
        section80D,
        homeLoanDeduction,
        hraExemption,
        npsDeduction,
        educationLoan: profile.educationLoan,
        total: standardDeduction + section80C + section80D + homeLoanDeduction + hraExemption + npsDeduction + profile.educationLoan
      }
    };
  };

  const calculateIncomeTax = (taxableIncome, regime) => {
    let tax = 0;

    if (regime === 'new') {
      // New Tax Regime Slabs (FY 2023-24)
      if (taxableIncome > 300000) tax += Math.min(taxableIncome - 300000, 300000) * 0.05;
      if (taxableIncome > 600000) tax += Math.min(taxableIncome - 600000, 300000) * 0.10;
      if (taxableIncome > 900000) tax += Math.min(taxableIncome - 900000, 300000) * 0.15;
      if (taxableIncome > 1200000) tax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
      if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30;
    } else {
      // Old Tax Regime Slabs
      if (taxableIncome > 250000) tax += Math.min(taxableIncome - 250000, 250000) * 0.05;
      if (taxableIncome > 500000) tax += Math.min(taxableIncome - 500000, 500000) * 0.20;
      if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30;
    }

    return tax;
  };

  const calculateHRAExemption = () => {
    if (profile.rentPaid === 0) return 0;
    
    const basicSalary = profile.grossSalary * 0.5; // Assuming 50% is basic
    const hraReceived = basicSalary * 0.4; // Assuming 40% HRA
    const excessRent = Math.max(0, profile.rentPaid - basicSalary * 0.1);
    const cityLimit = profile.cityType === 'metro' ? hraReceived * 0.5 : hraReceived * 0.4;
    
    return Math.min(hraReceived, excessRent, cityLimit);
  };

  const generateRecommendations = (newRegime, oldRegime) => {
    const recs = [];

    if (oldRegime.totalTax < newRegime.totalTax) {
      recs.push({
        type: 'success',
        title: 'Old Regime is Better',
        description: `You can save ₹${(newRegime.totalTax - oldRegime.totalTax).toLocaleString()} by choosing the old tax regime.`,
        action: 'Continue with old regime and maximize deductions'
      });
    } else {
      recs.push({
        type: 'info',
        title: 'New Regime is Better',
        description: `You can save ₹${(oldRegime.totalTax - newRegime.totalTax).toLocaleString()} by choosing the new tax regime.`,
        action: 'Switch to new regime for lower tax burden'
      });
    }

    // Section 80C optimization
    const currentSection80C = profile.pfContribution + profile.vpfContribution + profile.elssInvestment + profile.lifeInsurance;
    if (currentSection80C < 150000 && profile.regime === 'old') {
      recs.push({
        type: 'warning',
        title: 'Underutilized Section 80C',
        description: `You can invest ₹${(150000 - currentSection80C).toLocaleString()} more to maximize your Section 80C deduction.`,
        action: 'Consider ELSS, PPF, or Life Insurance to reach the limit'
      });
    }

    // Health Insurance
    const maxHealthInsurance = profile.age >= 60 ? 50000 : 25000;
    if (profile.healthInsurance < maxHealthInsurance && profile.regime === 'old') {
      recs.push({
        type: 'warning',
        title: 'Health Insurance Deduction',
        description: `You can claim up to ₹${(maxHealthInsurance - profile.healthInsurance).toLocaleString()} more under Section 80D.`,
        action: 'Consider increasing health insurance coverage'
      });
    }

    // NPS deduction
    if (profile.npsContribution < 50000 && profile.regime === 'old') {
      recs.push({
        type: 'suggestion',
        title: 'NPS Investment Opportunity',
        description: `You can invest up to ₹${(50000 - profile.npsContribution).toLocaleString()} in NPS for additional tax benefit under Section 80CCD(1B).`,
        action: 'Consider NPS investment for retirement and tax savings'
      });
    }

    setRecommendations(recs);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      default: return Info;
    }
  };

  const getRecommendationColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
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
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold flex items-center gap-3">
                <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                <span className="whitespace-nowrap">Tax Optimization</span>
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Old vs New regime advisor and deduction planning
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Profile Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Tax Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gross Annual Salary
                </label>
                <Input
                  type="number"
                  value={profile.grossSalary}
                  onChange={(e) => setProfile({...profile, grossSalary: Number(e.target.value)})}
                  placeholder="Annual salary"
                />
              </div>

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
                  City Type
                </label>
                <select
                  value={profile.cityType}
                  onChange={(e) => setProfile({...profile, cityType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="metro">Metro City</option>
                  <option value="non-metro">Non-Metro City</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PF Contribution
                </label>
                <Input
                  type="number"
                  value={profile.pfContribution}
                  onChange={(e) => setProfile({...profile, pfContribution: Number(e.target.value)})}
                  placeholder="PF contribution"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  VPF Contribution
                </label>
                <Input
                  type="number"
                  value={profile.vpfContribution}
                  onChange={(e) => setProfile({...profile, vpfContribution: Number(e.target.value)})}
                  placeholder="VPF contribution"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ELSS Investment
                </label>
                <Input
                  type="number"
                  value={profile.elssInvestment}
                  onChange={(e) => setProfile({...profile, elssInvestment: Number(e.target.value)})}
                  placeholder="ELSS investment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Life Insurance Premium
                </label>
                <Input
                  type="number"
                  value={profile.lifeInsurance}
                  onChange={(e) => setProfile({...profile, lifeInsurance: Number(e.target.value)})}
                  placeholder="Life insurance premium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Health Insurance Premium
                </label>
                <Input
                  type="number"
                  value={profile.healthInsurance}
                  onChange={(e) => setProfile({...profile, healthInsurance: Number(e.target.value)})}
                  placeholder="Health insurance premium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Home Loan Interest
                </label>
                <Input
                  type="number"
                  value={profile.homeLoanInterest}
                  onChange={(e) => setProfile({...profile, homeLoanInterest: Number(e.target.value)})}
                  placeholder="Home loan interest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rent Paid
                </label>
                <Input
                  type="number"
                  value={profile.rentPaid}
                  onChange={(e) => setProfile({...profile, rentPaid: Number(e.target.value)})}
                  placeholder="Annual rent paid"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  NPS Contribution
                </label>
                <Input
                  type="number"
                  value={profile.npsContribution}
                  onChange={(e) => setProfile({...profile, npsContribution: Number(e.target.value)})}
                  placeholder="NPS contribution"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Education Loan Interest
                </label>
                <Input
                  type="number"
                  value={profile.educationLoan}
                  onChange={(e) => setProfile({...profile, educationLoan: Number(e.target.value)})}
                  placeholder="Education loan interest"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tax Comparison */}
      {taxComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Tax Regime Comparison
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Old Regime */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Old Tax Regime</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gross Salary:</span>
                      <span className="font-medium">{formatCurrency(profile.grossSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Deductions:</span>
                      <span className="font-medium text-green-600">{formatCurrency(taxComparison.oldRegime.deductions.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxable Income:</span>
                      <span className="font-medium">{formatCurrency(taxComparison.oldRegime.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Total Tax:</span>
                      <span className="font-bold text-lg">{formatCurrency(taxComparison.oldRegime.totalTax)}</span>
                    </div>
                  </div>
                </div>

                {/* New Regime */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">New Tax Regime</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gross Salary:</span>
                      <span className="font-medium">{formatCurrency(profile.grossSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Deductions:</span>
                      <span className="font-medium text-green-600">{formatCurrency(taxComparison.newRegime.deductions.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxable Income:</span>
                      <span className="font-medium">{formatCurrency(taxComparison.newRegime.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Total Tax:</span>
                      <span className="font-bold text-lg">{formatCurrency(taxComparison.newRegime.totalTax)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`p-4 rounded-lg border-2 ${
                taxComparison.recommendedRegime === 'old' 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                  : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
              }`}>
                <div className="flex items-center space-x-3">
                  <Shield className={`h-8 w-8 ${
                    taxComparison.recommendedRegime === 'old' ? 'text-blue-600' : 'text-green-600'
                  }`} />
                  <div>
                    <h4 className={`font-bold text-lg ${
                      taxComparison.recommendedRegime === 'old' ? 'text-blue-800' : 'text-green-800'
                    }`}>
                      {taxComparison.recommendedRegime === 'old' ? 'Old Regime Recommended' : 'New Regime Recommended'}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {Math.abs(taxComparison.savings) > 0 
                        ? `You can save ${formatCurrency(Math.abs(taxComparison.savings))} annually`
                        : 'Both regimes result in similar tax liability'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Tax Optimization Recommendations
              </h3>

              <div className="space-y-3">
                {recommendations.map((rec, index) => {
                  const Icon = getRecommendationIcon(rec.type);
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${getRecommendationColor(rec.type)}`}>
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{rec.title}</h4>
                          <p className="text-sm mb-2">{rec.description}</p>
                          <p className="text-xs font-medium">{rec.action}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
      </Card>
        </motion.div>
      )}
    </div>
  );
};

export default TaxOptimization; 