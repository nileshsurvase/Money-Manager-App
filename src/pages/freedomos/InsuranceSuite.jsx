import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Shield, 
  Calculator,
  Users,
  Building,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Award,
  FileText,
  Eye,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InsuranceSuite = () => {
  // Health Insurance Calculator State
  const [healthProfile, setHealthProfile] = useState({
    age: 30,
    annualIncome: 600000,
    profession: 'software_engineer', // software_engineer, doctor, teacher, business, others
    familySize: 2,
    hasParents: false,
    medicalHistory: 'none', // none, minor, major
    city: 'metro', // metro, tier1, tier2, tier3
    existingCover: 0
  });

  const [healthRecommendation, setHealthRecommendation] = useState({});

  // Life Insurance Calculator State
  const [lifeProfile, setLifeProfile] = useState({
    age: 30,
    annualIncome: 600000,
    dependents: 1,
    spouse: true,
    spouseIncome: 300000,
    children: 0,
    childrenAges: [],
    loans: 0,
    lifestyle: 'moderate', // basic, moderate, premium
    existingCover: 0,
    retirementAge: 60
  });

  const [lifeRecommendation, setLifeRecommendation] = useState({});

  // Collapsible state
  const [showHealthCalculator, setShowHealthCalculator] = useState(false);
  const [showLifeCalculator, setShowLifeCalculator] = useState(false);

  useEffect(() => {
    calculateHealthInsurance();
  }, [healthProfile]);

  useEffect(() => {
    calculateLifeInsurance();
  }, [lifeProfile]);

  const calculateHealthInsurance = () => {
    let baseCover = 500000; // Base 5 lakh

    // Age factor
    if (healthProfile.age < 30) baseCover = 500000;
    else if (healthProfile.age < 40) baseCover = 800000;
    else if (healthProfile.age < 50) baseCover = 1200000;
    else if (healthProfile.age < 60) baseCover = 1500000;
    else baseCover = 2000000;

    // Income factor (10-15% of annual income)
    const incomeBased = Math.max(healthProfile.annualIncome * 0.12, baseCover);

    // Family size multiplier
    let familyMultiplier = 1;
    if (healthProfile.familySize === 2) familyMultiplier = 1.5;
    else if (healthProfile.familySize === 3) familyMultiplier = 2;
    else if (healthProfile.familySize === 4) familyMultiplier = 2.5;
    else if (healthProfile.familySize >= 5) familyMultiplier = 3;

    // Parent factor
    if (healthProfile.hasParents) familyMultiplier += 0.5;

    // City factor (medical costs variation)
    let cityMultiplier = 1;
    if (healthProfile.city === 'metro') cityMultiplier = 1.3;
    else if (healthProfile.city === 'tier1') cityMultiplier = 1.1;
    else if (healthProfile.city === 'tier2') cityMultiplier = 0.9;
    else cityMultiplier = 0.7;

    // Medical history factor
    let historyMultiplier = 1;
    if (healthProfile.medicalHistory === 'minor') historyMultiplier = 1.2;
    else if (healthProfile.medicalHistory === 'major') historyMultiplier = 1.5;

    // Profession risk factor
    let professionMultiplier = 1;
    if (healthProfile.profession === 'doctor') professionMultiplier = 1.3;
    else if (healthProfile.profession === 'business') professionMultiplier = 1.2;
    else if (healthProfile.profession === 'software_engineer') professionMultiplier = 1;
    else if (healthProfile.profession === 'teacher') professionMultiplier = 0.9;

    const recommendedCover = Math.round(
      incomeBased * familyMultiplier * cityMultiplier * historyMultiplier * professionMultiplier
    );

    // Premium estimation (rough calculation)
    const ageFactor = healthProfile.age < 30 ? 0.4 : healthProfile.age < 40 ? 0.6 : healthProfile.age < 50 ? 0.8 : 1.2;
    const estimatedPremium = Math.round((recommendedCover / 100000) * 1200 * ageFactor * familyMultiplier);

    const gap = Math.max(0, recommendedCover - healthProfile.existingCover);

    setHealthRecommendation({
      recommendedCover,
      currentCover: healthProfile.existingCover,
      gap,
      estimatedPremium,
      factors: {
        age: healthProfile.age,
        income: healthProfile.annualIncome,
        family: healthProfile.familySize,
        city: healthProfile.city,
        medical: healthProfile.medicalHistory
      },
      topPlans: getTopHealthPlans(recommendedCover)
    });
  };

  const calculateLifeInsurance = () => {
    // Human Life Value Method + Need Analysis
    
    // 1. Income replacement (10-15 times annual income)
    const incomeReplacement = lifeProfile.annualIncome * 12;

    // 2. Outstanding loans
    const loanCover = lifeProfile.loans;

    // 3. Future goals (children education, marriage)
    let futureGoals = 0;
    if (lifeProfile.children > 0) {
      // Education cost per child (₹25 lakh average)
      futureGoals += lifeProfile.children * 2500000;
      // Marriage cost per child (₹15 lakh average for daughters)
      futureGoals += lifeProfile.children * 1500000 * 0.5; // Assuming 50% daughters
    }

    // 4. Family maintenance until spouse retirement
    const yearsToSpouseRetirement = Math.max(0, 60 - lifeProfile.age);
    const familyMaintenance = (lifeProfile.annualIncome * 0.7) * yearsToSpouseRetirement;

    // 5. Lifestyle factor
    let lifestyleMultiplier = 1;
    if (lifeProfile.lifestyle === 'basic') lifestyleMultiplier = 0.8;
    else if (lifeProfile.lifestyle === 'premium') lifestyleMultiplier = 1.5;

    // 6. Spouse income adjustment
    let spouseAdjustment = 1;
    if (lifeProfile.spouse && lifeProfile.spouseIncome > 0) {
      spouseAdjustment = Math.max(0.3, 1 - (lifeProfile.spouseIncome / lifeProfile.annualIncome) * 0.5);
    }

    const totalNeed = Math.round(
      (incomeReplacement + loanCover + futureGoals + familyMaintenance) * 
      lifestyleMultiplier * spouseAdjustment
    );

    // Premium calculation for term insurance (rough estimation)
    // Term insurance is very cheap - roughly ₹500-2000 per lakh per year
    const premiumRate = lifeProfile.age < 30 ? 0.6 : 
                       lifeProfile.age < 40 ? 0.8 : 
                       lifeProfile.age < 50 ? 1.2 : 
                       lifeProfile.age < 60 ? 2.0 : 3.5;
    
    const estimatedPremium = Math.round((totalNeed / 100000) * premiumRate * 12); // Monthly premium

    const gap = Math.max(0, totalNeed - lifeProfile.existingCover);

    setLifeRecommendation({
      recommendedCover: totalNeed,
      currentCover: lifeProfile.existingCover,
      gap,
      estimatedPremium,
      breakdown: {
        incomeReplacement,
        loans: loanCover,
        futureGoals,
        familyMaintenance: Math.round(familyMaintenance)
      },
      factors: {
        age: lifeProfile.age,
        dependents: lifeProfile.dependents,
        spouse: lifeProfile.spouse,
        children: lifeProfile.children
      },
      topPlans: getTopLifePlans(totalNeed)
    });
  };

  const getTopHealthPlans = (coverAmount) => {
    return [
      {
        company: 'HDFC ERGO',
        plan: 'My Health Suraksha',
        cover: coverAmount,
        premium: Math.round((coverAmount / 100000) * 1400),
        rating: 4.5,
        features: ['No room rent capping', 'Restore benefit', 'Wellness benefits']
      },
      {
        company: 'ICICI Lombard',
        plan: 'Complete Health Insurance',
        cover: coverAmount,
        premium: Math.round((coverAmount / 100000) * 1200),
        rating: 4.3,
        features: ['Unlimited restoration', 'Pre & post hospitalization', 'OPD coverage']
      },
      {
        company: 'Star Health',
        plan: 'Star Comprehensive',
        cover: coverAmount,
        premium: Math.round((coverAmount / 100000) * 1600),
        rating: 4.2,
        features: ['Coverage up to 100 years', 'Domiciliary treatment', 'Emergency assistance']
      }
    ];
  };

  const getTopLifePlans = (coverAmount) => {
    return [
      {
        company: 'HDFC Life',
        plan: 'Click 2 Protect Plus',
        cover: coverAmount,
        premium: Math.round((coverAmount / 100000) * 800),
        rating: 4.6,
        features: ['Return of premium option', 'Terminal illness benefit', 'Waiver of premium']
      },
      {
        company: 'ICICI Prudential',
        plan: 'iProtect Smart',
        cover: coverAmount,
        premium: Math.round((coverAmount / 100000) * 750),
        rating: 4.4,
        features: ['Multiple payout options', 'Accidental death benefit', 'Income benefit']
      },
      {
        company: 'SBI Life',
        plan: 'eShield',
        cover: coverAmount,
        premium: Math.round((coverAmount / 100000) * 700),
        rating: 4.3,
        features: ['Online purchase discount', 'Critical illness cover', 'Flexible premium payment']
      }
    ];
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

  const saveInsuranceData = () => {
    const insuranceData = {
      health: healthProfile.existingCover > 0,
      life: lifeProfile.existingCover > 0,
      healthAmount: healthRecommendation.recommendedCover || 0,
      lifeAmount: lifeRecommendation.recommendedCover || 0,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('freedomos_insurance', JSON.stringify(insuranceData));
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
                <Heart className="h-8 w-8 text-yellow-400" />
                Insurance Suite
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Optimize your health and life insurance coverage with smart calculators
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Health Insurance Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
          <div className="space-y-6">
            <button
              onClick={() => setShowHealthCalculator(!showHealthCalculator)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-600" />
                Health Insurance Optimizer
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveInsuranceData();
                  }}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Save Results
                </Button>
                {showHealthCalculator ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </button>
            
            {showHealthCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* Health Profile Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age
                    </label>
                    <Input
                      type="number"
                      value={healthProfile.age}
                      onChange={(e) => setHealthProfile({...healthProfile, age: Number(e.target.value)})}
                      placeholder="Your age"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Annual Income
                    </label>
                    <Input
                      type="number"
                      value={healthProfile.annualIncome}
                      onChange={(e) => setHealthProfile({...healthProfile, annualIncome: Number(e.target.value)})}
                      placeholder="Annual income"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profession
                    </label>
                    <select
                      value={healthProfile.profession}
                      onChange={(e) => setHealthProfile({...healthProfile, profession: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="software_engineer">Software Engineer</option>
                      <option value="doctor">Doctor</option>
                      <option value="teacher">Teacher</option>
                      <option value="business">Business Owner</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Family Size
                    </label>
                    <Input
                      type="number"
                      value={healthProfile.familySize}
                      onChange={(e) => setHealthProfile({...healthProfile, familySize: Number(e.target.value)})}
                      placeholder="Including yourself"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City Type
                    </label>
                    <select
                      value={healthProfile.city}
                      onChange={(e) => setHealthProfile({...healthProfile, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="metro">Metro City</option>
                      <option value="tier1">Tier 1 City</option>
                      <option value="tier2">Tier 2 City</option>
                      <option value="tier3">Tier 3 City</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Medical History
                    </label>
                    <select
                      value={healthProfile.medicalHistory}
                      onChange={(e) => setHealthProfile({...healthProfile, medicalHistory: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="none">No major issues</option>
                      <option value="minor">Minor conditions</option>
                      <option value="major">Major conditions</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Include Parents
                    </label>
                    <select
                      value={healthProfile.hasParents}
                      onChange={(e) => setHealthProfile({...healthProfile, hasParents: e.target.value === 'true'})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Existing Cover
                    </label>
                    <Input
                      type="number"
                      value={healthProfile.existingCover}
                      onChange={(e) => setHealthProfile({...healthProfile, existingCover: Number(e.target.value)})}
                      placeholder="Current health cover"
                    />
                  </div>
                </div>

                {/* Health Insurance Results */}
                {healthRecommendation.recommendedCover && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Recommended Coverage
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Recommended</div>
                          <div className="text-2xl font-bold text-red-600">
                            {formatLakhs(healthRecommendation.recommendedCover)}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Est. Premium</div>
                          <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(healthRecommendation.estimatedPremium)}/year
                          </div>
                        </div>
                      </div>
                      
                      {healthRecommendation.gap > 0 && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="font-medium">Coverage Gap Identified</span>
                          </div>
                          <div className="text-yellow-700 dark:text-yellow-300">
                            You need <strong>{formatLakhs(healthRecommendation.gap)}</strong> additional coverage to meet your recommended amount.
                          </div>
                        </div>
                      )}
                      
                      {healthRecommendation.gap <= 0 && healthProfile.existingCover > 0 && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Excellent! Your current coverage meets the recommendation.</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Top Recommended Plans
                      </h4>
                      
                      <div className="space-y-3">
                        {healthRecommendation.topPlans?.map((plan, index) => (
                          <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {plan.company}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600">{plan.rating}</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {plan.plan}
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg font-bold text-red-600">
                                {formatCurrency(plan.premium)}/year
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatLakhs(plan.cover)} cover
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {plan.features.map((feature, fIndex) => (
                                <span key={fIndex} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Life Insurance Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="space-y-6">
            <button
              onClick={() => setShowLifeCalculator(!showLifeCalculator)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Life Insurance Calculator
              </h3>
              {showLifeCalculator ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            
            {showLifeCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* Life Profile Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age
                    </label>
                    <Input
                      type="number"
                      value={lifeProfile.age}
                      onChange={(e) => setLifeProfile({...lifeProfile, age: Number(e.target.value)})}
                      placeholder="Your age"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Annual Income
                    </label>
                    <Input
                      type="number"
                      value={lifeProfile.annualIncome}
                      onChange={(e) => setLifeProfile({...lifeProfile, annualIncome: Number(e.target.value)})}
                      placeholder="Annual income"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Dependents
                    </label>
                    <Input
                      type="number"
                      value={lifeProfile.dependents}
                      onChange={(e) => setLifeProfile({...lifeProfile, dependents: Number(e.target.value)})}
                      placeholder="Total dependents"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Married?
                    </label>
                    <select
                      value={lifeProfile.spouse}
                      onChange={(e) => setLifeProfile({...lifeProfile, spouse: e.target.value === 'true'})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="false">Single</option>
                      <option value="true">Married</option>
                    </select>
                  </div>
                  
                  {lifeProfile.spouse && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Spouse Income
                      </label>
                      <Input
                        type="number"
                        value={lifeProfile.spouseIncome}
                        onChange={(e) => setLifeProfile({...lifeProfile, spouseIncome: Number(e.target.value)})}
                        placeholder="Spouse annual income"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Children
                    </label>
                    <Input
                      type="number"
                      value={lifeProfile.children}
                      onChange={(e) => setLifeProfile({...lifeProfile, children: Number(e.target.value)})}
                      placeholder="Number of children"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Outstanding Loans
                    </label>
                    <Input
                      type="number"
                      value={lifeProfile.loans}
                      onChange={(e) => setLifeProfile({...lifeProfile, loans: Number(e.target.value)})}
                      placeholder="Total loan amount"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Lifestyle
                    </label>
                    <select
                      value={lifeProfile.lifestyle}
                      onChange={(e) => setLifeProfile({...lifeProfile, lifestyle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="basic">Basic</option>
                      <option value="moderate">Moderate</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Existing Life Cover
                    </label>
                    <Input
                      type="number"
                      value={lifeProfile.existingCover}
                      onChange={(e) => setLifeProfile({...lifeProfile, existingCover: Number(e.target.value)})}
                      placeholder="Current life cover"
                    />
                  </div>
                </div>

                {/* Life Insurance Results */}
                {lifeRecommendation.recommendedCover && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Recommended Coverage
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Recommended</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatLakhs(lifeRecommendation.recommendedCover)}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Est. Premium</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(lifeRecommendation.estimatedPremium)}/month
                          </div>
                        </div>
                      </div>
                      
                      {/* Coverage Breakdown */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">Coverage Breakdown</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Income Replacement</span>
                            <span className="font-medium">{formatLakhs(lifeRecommendation.breakdown?.incomeReplacement || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Outstanding Loans</span>
                            <span className="font-medium">{formatLakhs(lifeRecommendation.breakdown?.loans || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Future Goals (Education, etc.)</span>
                            <span className="font-medium">{formatLakhs(lifeRecommendation.breakdown?.futureGoals || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Family Maintenance</span>
                            <span className="font-medium">{formatLakhs(lifeRecommendation.breakdown?.familyMaintenance || 0)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {lifeRecommendation.gap > 0 && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="font-medium">Coverage Gap Identified</span>
                          </div>
                          <div className="text-yellow-700 dark:text-yellow-300">
                            You need <strong>{formatLakhs(lifeRecommendation.gap)}</strong> additional life coverage to protect your family adequately.
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Top Term Insurance Plans
                      </h4>
                      
                      <div className="space-y-3">
                        {lifeRecommendation.topPlans?.map((plan, index) => (
                          <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {plan.company}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600">{plan.rating}</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {plan.plan}
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg font-bold text-blue-600">
                                {formatCurrency(plan.premium)}/month
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatLakhs(plan.cover)} cover
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {plan.features.map((feature, fIndex) => (
                                <span key={fIndex} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Insurance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Insurance Portfolio Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Health Insurance</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      {formatLakhs(healthRecommendation.recommendedCover || 0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(healthRecommendation.estimatedPremium || 0)}/year
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Life Insurance</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      {formatLakhs(lifeRecommendation.recommendedCover || 0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(lifeRecommendation.estimatedPremium || 0)}/month
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Annual Premium</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(
                      (healthRecommendation.estimatedPremium || 0) + 
                      ((lifeRecommendation.estimatedPremium || 0) * 12)
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {(((healthRecommendation.estimatedPremium || 0) + ((lifeRecommendation.estimatedPremium || 0) * 12)) / 
                      (lifeProfile.annualIncome || 1) * 100).toFixed(1)}% of annual income
                  </div>
                </div>
                
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Coverage</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatLakhs(
                      (healthRecommendation.recommendedCover || 0) + 
                      (lifeRecommendation.recommendedCover || 0)
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Complete financial protection
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button
                variant="primary"
                size="large"
                onClick={saveInsuranceData}
                className="flex items-center gap-2 mx-auto"
              >
                <FileText className="h-5 w-5" />
                Save Insurance Plan
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default InsuranceSuite; 