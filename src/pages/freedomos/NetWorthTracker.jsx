import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Edit3,
  Trash2,
  PieChart,
  BarChart3,
  Upload,
  Download,
  Home,
  Car,
  CreditCard,
  Briefcase,
  Banknote,
  Building
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const NetWorthTracker = () => {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddLiability, setShowAddLiability] = useState(false);
  const [netWorthHistory, setNetWorthHistory] = useState([]);
  
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'cash', // cash, savings, investment, real_estate, vehicle, other
    value: 0,
    description: ''
  });

  const [newLiability, setNewLiability] = useState({
    name: '',
    type: 'home_loan', // home_loan, car_loan, personal_loan, credit_card, other
    amount: 0,
    description: ''
  });

  const [editingAsset, setEditingAsset] = useState(null);
  const [editingLiability, setEditingLiability] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
    updateNetWorthHistory();
  }, [assets, liabilities]);

  const loadData = () => {
    const savedAssets = JSON.parse(localStorage.getItem('freedomos_assets') || '[]');
    const savedLiabilities = JSON.parse(localStorage.getItem('freedomos_liabilities') || '[]');
    const savedHistory = JSON.parse(localStorage.getItem('freedomos_networth_history') || '[]');

    if (savedAssets.length === 0) {
      // Add some default assets for demonstration
      const defaultAssets = [
        { id: 1, name: 'Savings Account', type: 'savings', value: 250000, description: 'Emergency fund' },
        { id: 2, name: 'Mutual Funds', type: 'investment', value: 500000, description: 'SIP investments' },
        { id: 3, name: 'Apartment', type: 'real_estate', value: 3500000, description: '2BHK apartment' }
      ];
      setAssets(defaultAssets);
    } else {
      setAssets(savedAssets);
    }

    if (savedLiabilities.length === 0) {
      // Add some default liabilities for demonstration
      const defaultLiabilities = [
        { id: 1, name: 'Home Loan', type: 'home_loan', amount: 2200000, description: 'HDFC Home Loan' },
        { id: 2, name: 'Car Loan', type: 'car_loan', amount: 350000, description: 'Vehicle financing' }
      ];
      setLiabilities(defaultLiabilities);
    } else {
      setLiabilities(savedLiabilities);
    }

    setNetWorthHistory(savedHistory);
  };

  const saveData = () => {
    localStorage.setItem('freedomos_assets', JSON.stringify(assets));
    localStorage.setItem('freedomos_liabilities', JSON.stringify(liabilities));
  };

  const updateNetWorthHistory = () => {
    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
    
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    setNetWorthHistory(prev => {
      const existingIndex = prev.findIndex(entry => entry.month === currentMonth);
      const newEntry = {
        month: currentMonth,
        assets: totalAssets,
        liabilities: totalLiabilities,
        netWorth,
        date: new Date().toLocaleDateString()
      };
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newEntry;
        localStorage.setItem('freedomos_networth_history', JSON.stringify(updated));
        return updated;
      } else {
        const updated = [...prev, newEntry].slice(-12); // Keep last 12 months
        localStorage.setItem('freedomos_networth_history', JSON.stringify(updated));
        return updated;
      }
    });
  };

  const addAsset = () => {
    if (!newAsset.name || !newAsset.value) return;
    
    const asset = {
      id: Date.now(),
      ...newAsset,
      value: Number(newAsset.value),
      createdAt: new Date().toISOString()
    };
    
    setAssets([...assets, asset]);
    setNewAsset({ name: '', type: 'cash', value: 0, description: '' });
    setShowAddAsset(false);
  };

  const addLiability = () => {
    if (!newLiability.name || !newLiability.amount) return;
    
    const liability = {
      id: Date.now(),
      ...newLiability,
      amount: Number(newLiability.amount),
      createdAt: new Date().toISOString()
    };
    
    setLiabilities([...liabilities, liability]);
    setNewLiability({ name: '', type: 'home_loan', amount: 0, description: '' });
    setShowAddLiability(false);
  };

  const updateAsset = (id, updatedAsset) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, ...updatedAsset } : asset
    ));
    setEditingAsset(null);
  };

  const updateLiability = (id, updatedLiability) => {
    setLiabilities(liabilities.map(liability => 
      liability.id === id ? { ...liability, ...updatedLiability } : liability
    ));
    setEditingLiability(null);
  };

  const deleteAsset = (id) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const deleteLiability = (id) => {
    setLiabilities(liabilities.filter(liability => liability.id !== id));
  };

  const exportData = () => {
    const data = {
      assets,
      liabilities,
      netWorthHistory,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `networth_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.assets) setAssets(data.assets);
        if (data.liabilities) setLiabilities(data.liabilities);
        if (data.netWorthHistory) setNetWorthHistory(data.netWorthHistory);
      } catch (error) {
        console.error('Error importing data:', error);
      }
    };
    reader.readAsText(file);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'real_estate': return Home;
      case 'vehicle': return Car;
      case 'investment': return TrendingUp;
      case 'savings': return Banknote;
      case 'cash': return DollarSign;
      default: return Briefcase;
    }
  };

  const getLiabilityIcon = (type) => {
    switch (type) {
      case 'home_loan': return Home;
      case 'car_loan': return Car;
      case 'credit_card': return CreditCard;
      default: return Building;
    }
  };

  const getAssetColor = (type) => {
    switch (type) {
      case 'real_estate': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'vehicle': return 'text-green-600 bg-green-50 border-green-200';
      case 'investment': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'savings': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'cash': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getLiabilityColor = (type) => {
    switch (type) {
      case 'home_loan': return 'text-red-600 bg-red-50 border-red-200';
      case 'car_loan': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'credit_card': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const assetDistribution = assets.map(asset => ({
    name: asset.name,
    value: asset.value,
    type: asset.type
  }));

  const liabilityDistribution = liabilities.map(liability => ({
    name: liability.name,
    value: liability.amount,
    type: liability.type
  }));

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];

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
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                <span className="whitespace-nowrap">Net Worth Tracker</span>
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Track assets vs liabilities with real-time trends
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={exportData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-colors">
                <Upload className="h-4 w-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Net Worth Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalAssets)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Assets</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
            <div className="text-center">
              <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalLiabilities)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Liabilities</div>
            </div>
          </Card>

          <Card className={`bg-gradient-to-br ${
            netWorth >= 0 
              ? 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
              : 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
          }`}>
            <div className="text-center">
              <DollarSign className={`h-8 w-8 mx-auto mb-2 ${
                netWorth >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`} />
              <div className={`text-2xl font-bold ${
                netWorth >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {formatCurrency(netWorth)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Net Worth</div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Net Worth Trend */}
      {netWorthHistory.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Net Worth Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={netWorthHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                    <Line 
                      type="monotone" 
                      dataKey="netWorth" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Assets Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Assets ({formatCurrency(totalAssets)})
              </h3>
              <Button
                variant="primary"
                onClick={() => setShowAddAsset(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Asset
              </Button>
            </div>

            {/* Add Asset Form */}
            {showAddAsset && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Asset Name
                    </label>
                    <Input
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                      placeholder="e.g., Savings Account"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newAsset.type}
                      onChange={(e) => setNewAsset({...newAsset, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="cash">Cash</option>
                      <option value="savings">Savings</option>
                      <option value="investment">Investment</option>
                      <option value="real_estate">Real Estate</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Value
                    </label>
                    <Input
                      type="number"
                      value={newAsset.value}
                      onChange={(e) => setNewAsset({...newAsset, value: e.target.value})}
                      placeholder="Asset value"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <Input
                      value={newAsset.description}
                      onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button variant="primary" onClick={addAsset}>Add Asset</Button>
                  <Button variant="secondary" onClick={() => setShowAddAsset(false)}>Cancel</Button>
                </div>
              </motion.div>
            )}

            {/* Assets List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {assets.map((asset) => {
                const Icon = getAssetIcon(asset.type);
                return (
                  <div key={asset.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-6 w-6 text-green-600" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {asset.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {asset.description}
                          </div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getAssetColor(asset.type)}`}>
                            {asset.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(asset.value)}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => setEditingAsset(asset.id)}
                            className="p-2"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => deleteAsset(asset.id)}
                            className="p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Liabilities Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Liabilities ({formatCurrency(totalLiabilities)})
              </h3>
              <Button
                variant="primary"
                onClick={() => setShowAddLiability(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Liability
              </Button>
            </div>

            {/* Add Liability Form */}
            {showAddLiability && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Liability Name
                    </label>
                    <Input
                      value={newLiability.name}
                      onChange={(e) => setNewLiability({...newLiability, name: e.target.value})}
                      placeholder="e.g., Home Loan"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newLiability.type}
                      onChange={(e) => setNewLiability({...newLiability, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="home_loan">Home Loan</option>
                      <option value="car_loan">Car Loan</option>
                      <option value="personal_loan">Personal Loan</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <Input
                      type="number"
                      value={newLiability.amount}
                      onChange={(e) => setNewLiability({...newLiability, amount: e.target.value})}
                      placeholder="Outstanding amount"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <Input
                      value={newLiability.description}
                      onChange={(e) => setNewLiability({...newLiability, description: e.target.value})}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button variant="primary" onClick={addLiability}>Add Liability</Button>
                  <Button variant="secondary" onClick={() => setShowAddLiability(false)}>Cancel</Button>
                </div>
              </motion.div>
            )}

            {/* Liabilities List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {liabilities.map((liability) => {
                const Icon = getLiabilityIcon(liability.type);
                return (
                  <div key={liability.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-6 w-6 text-red-600" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {liability.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {liability.description}
                          </div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getLiabilityColor(liability.type)}`}>
                            {liability.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            {formatCurrency(liability.amount)}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => setEditingLiability(liability.id)}
                            className="p-2"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => deleteLiability(liability.id)}
                            className="p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Distribution Charts */}
      {(assets.length > 0 || liabilities.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Distribution */}
            {assets.length > 0 && (
              <Card>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    Asset Distribution
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={assetDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {assetDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            )}

            {/* Liability Distribution */}
            {liabilities.length > 0 && (
              <Card>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-red-600" />
                    Liability Distribution
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={liabilityDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {liabilityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NetWorthTracker;