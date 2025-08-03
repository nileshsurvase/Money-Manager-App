import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Download, 
  Upload, 
  Trash2,
  Moon,
  Sun,
  Globe,
  DollarSign,
  Calendar,
  AlertTriangle,
  Settings as SettingsIcon,
  Palette,
  Database,
  FileSpreadsheet,
  Shield,
  HelpCircle,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Smartphone,
  Zap,
  Heart,
  RefreshCcw,
  Eye,
  EyeOff,
  ArrowUpRight,
  Target
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../components/ToastProvider';
import { 
  getSettings, 
  saveSettings,
  getExpenses,
  getCategories,
  getBudgets,
  saveExpenses,
  saveCategories,
  saveBudgets,
  STORAGE_KEYS,
  exportMoneyManagerToCSV,
  exportBudgetsToCSV,
  generateSampleMoneyManagerFile
} from '../utils/storage';

const Settings = memo(() => {
  const { isDark, toggleTheme } = useTheme();
  const { currency, setCurrency, currencies } = useCurrency();
  const toast = useToast();
  
  const [settings, setSettings] = useState({
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    notifications: true,
    autoBackup: false,
    darkMode: isDark
  });
  
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = getSettings();
      setSettings(prev => ({ ...prev, ...savedSettings, darkMode: isDark }));
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error?.('Failed to load settings');
    }
  }, [isDark, toast]);

  const handleSettingChange = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const saveSettingsData = useCallback(async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      setHasChanges(false);
      toast.success?.('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error?.('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [settings, toast]);

  const exportMoneyManagerCSV = useCallback(async () => {
    try {
      await exportMoneyManagerToCSV();
      toast.success?.('Expenses exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error?.('Failed to export data');
    }
  }, [toast]);

  const exportBudgetsCSV = useCallback(async () => {
    try {
      await exportBudgetsToCSV();
      toast.success?.('Budgets exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error?.('Failed to export budgets');
    }
  }, [toast]);

  const handleImport = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.expenses) saveExpenses(data.expenses);
        if (data.categories) saveCategories(data.categories);
        if (data.budgets) saveBudgets(data.budgets);
        
        toast.success?.('Data imported successfully!');
        setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
        console.error('Import error:', error);
        toast.error?.('Failed to import data');
      } finally {
        setImporting(false);
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  }, [toast]);

  const deleteAllData = useCallback(async () => {
    try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
      toast.success?.('All data deleted successfully!');
      setShowDeleteModal(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error?.('Failed to delete data');
    }
  }, [toast]);

  const generateSampleData = useCallback(async () => {
    try {
      await generateSampleMoneyManagerFile();
      toast.success?.('Sample data generated!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Sample data error:', error);
      toast.error?.('Failed to generate sample data');
    }
  }, [toast]);

  return (
    <div className="spacing-lg">
      {/* Stunning Header with Premium Design */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-pink-500/10 rounded-3xl blur-2xl animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/5 to-amber-400/5 rounded-3xl blur-xl"></div>
        <Card variant="glass" className="relative overflow-hidden border-orange-200/30 dark:border-orange-700/30">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
          <div className="flex flex-col space-y-4 sm:space-y-6">
          <div className="space-y-3">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-gradient flex items-center gap-2 sm:gap-3 text-2xl sm:text-3xl font-bold"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </motion.div>
                Money Manager Settings
            </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg"
              >
                🎨 Customize your financial management experience with premium controls
              </motion.p>
            </div>
            
            {/* Quick Save Action */}
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex rounded-xl border border-orange-200/50 dark:border-orange-700/50 bg-orange-50/50 dark:bg-orange-900/20 backdrop-blur-md p-4"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      You have unsaved changes
                    </span>
                  </div>
                  <Button
                    onClick={saveSettingsData}
                    loading={saving}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {saving ? 'Saving...' : 'Save Now'}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </div>
        
      {/* Appearance & Theme */}
          <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-indigo-500/6 to-blue-500/8 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/3 to-indigo-400/3 rounded-2xl"></div>
          <Card variant="glass" className="relative border-purple-200/30 dark:border-purple-700/30 hover:border-purple-300/50 dark:hover:border-purple-600/50 transition-all duration-300">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center space-x-3"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg"
                >
                  <Palette className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    🎨 Appearance & Theme
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ✨ Customize how your app looks and feels
                  </p>
                </div>
                </motion.div>
                
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Theme Toggle */}
                <div className="glass-panel p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isDark ? (
                        <Moon className="h-5 w-5 text-indigo-500" />
                      ) : (
                        <Sun className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Dark Mode
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isDark ? 'Dark theme active' : 'Light theme active'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        isDark ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          isDark ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Currency Selection */}
                <div className="glass-panel p-4 rounded-xl">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Currency
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your preferred currency
                        </p>
                  </div>
                  </div>
                    <Select
                      value={currency}
                      onChange={(value) => {
                        setCurrency(value);
                        handleSettingChange('currency', value);
                      }}
                      options={currencies?.map(curr => ({
                        value: curr.code,
                        label: `${curr.symbol} ${curr.code} - ${curr.name}`
                      })) || []}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              </div>
            </Card>
        </div>
      </motion.div>

      {/* Premium Data Management & Export */}
          <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        className="group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-green-500/6 to-teal-500/8 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/3 to-green-400/3 rounded-2xl"></div>
          <Card variant="glass" className="relative border-emerald-200/30 dark:border-emerald-700/30 hover:border-emerald-300/50 dark:hover:border-emerald-600/50 transition-all duration-300">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-3"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center shadow-lg"
                >
                  <Database className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    📊 Data Management
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    🚀 Export, import, and manage your financial data with ease
                  </p>
                </div>
              </motion.div>

              {/* Export Actions */}
              <div className="space-y-4">
                <motion.h4 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 py-2 px-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/50"
                >
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Download className="h-4 w-4 text-emerald-600" />
                  </motion.div>
                  ✨ Advanced Excel Exports
                </motion.h4>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, staggerChildren: 0.1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={exportMoneyManagerCSV}
                    className="glass-panel p-5 rounded-2xl hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all duration-300 group border border-emerald-200/30 dark:border-emerald-700/30 hover:border-emerald-300/50 dark:hover:border-emerald-600/50 shadow-lg hover:shadow-emerald-500/10"
                  >
                      <div className="flex items-center space-x-4">
                      <motion.div 
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center group-hover:shadow-lg transition-all duration-300"
                      >
                        <FileSpreadsheet className="h-5 w-5 text-white" />
                      </motion.div>
                      <div className="text-left flex-1">
                          <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          📊 Expenses CSV
                          </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Complete expense records
                          </p>
                      </div>
                      <motion.div
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors duration-300" />
                      </motion.div>
                    </div>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={exportBudgetsCSV}
                    className="glass-panel p-5 rounded-2xl hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 group border border-blue-200/30 dark:border-blue-700/30 hover:border-blue-300/50 dark:hover:border-blue-600/50 shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        whileHover={{ rotate: -5, scale: 1.1 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-500 flex items-center justify-center group-hover:shadow-lg transition-all duration-300"
                      >
                        <Target className="h-5 w-5 text-white" />
                  </motion.div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          🎯 Budgets CSV
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Budget tracking records
                        </p>
                      </div>
                      <motion.div
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      >
                        <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                      </motion.div>
                    </div>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const allData = {
                        expenses: getExpenses(),
                        categories: getCategories(),
                        budgets: getBudgets(),
                        settings: settings,
                        exportDate: new Date().toISOString(),
                        version: '2.0'
                      };
                      const dataStr = JSON.stringify(allData, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(dataBlob);
                      link.download = `money-manager-full-backup-${new Date().toISOString().split('T')[0]}.json`;
                      link.click();
                      toast.success?.('Complete backup exported!');
                    }}
                    className="glass-panel p-5 rounded-2xl hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all duration-300 group border border-orange-200/30 dark:border-orange-700/30 hover:border-orange-300/50 dark:hover:border-orange-600/50 shadow-lg hover:shadow-orange-500/10"
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center group-hover:shadow-lg transition-all duration-300"
                      >
                        <Shield className="h-5 w-5 text-white" />
                  </motion.div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          🛡️ Full Backup
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Complete data protection
                      </p>
                    </div>
                      <motion.div
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      >
                        <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
                      </motion.div>
                    </div>
                  </motion.button>
                </motion.div>
              </div>

              {/* Import & Other Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  onClick={() => document.getElementById('import-file').click()}
                  disabled={importing}
                  className="glass-panel p-4 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 group disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                      {importing ? (
          <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <Upload className="h-4 w-4 text-white" />
                      )}
                </div>
                    <div className="text-left">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                        {importing ? 'Importing...' : 'Import Data'}
                          </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                            Restore from backup
                          </p>
                        </div>
                      </div>
                </button>

                <button
                  onClick={generateSampleData}
                  className="glass-panel p-4 rounded-xl hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Sample Data
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Generate demo data
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              </div>
            </Card>
        </div>
      </motion.div>



      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-2xl blur-xl"></div>
          <Card variant="glass" className="relative border-red-200/30 dark:border-red-800/30">
        <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
              <div>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80">
                    Irreversible actions - proceed with caution
                  </p>
            </div>
          </div>
          
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full p-4 rounded-xl border-2 border-red-200/50 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-100/50 dark:hover:bg-red-900/40 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Trash2 className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium text-red-600 dark:text-red-400">
                    Delete All Data
                  </span>
          </div>
              </button>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete All Data"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0" />
              <div>
              <p className="font-semibold text-red-900 dark:text-red-100">
                This action cannot be undone!
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                All your expenses, budgets, and settings will be permanently deleted.
                </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={deleteAllData}
              className="flex-1"
            >
              Delete Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

Settings.displayName = 'Settings';

export default Settings; 