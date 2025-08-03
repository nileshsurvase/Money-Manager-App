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
      {/* Beautiful Header with Dashboard Theme */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 w-2 h-2 bg-orange-400/40 rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-8 w-1 h-1 bg-red-400/60 rounded-full animate-ping"></div>
          <div className="absolute bottom-6 left-12 w-1.5 h-1.5 bg-orange-500/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-4 right-16 w-1 h-1 bg-red-500/40 rounded-full" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <Card variant="glass" className="relative">
          <div className="flex flex-col space-y-4 sm:space-y-6">
          <div className="space-y-2">
              <motion.h1 
                className="text-gradient flex items-center gap-2 sm:gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                </motion.div>
                Settings & Preferences
            </motion.h1>
              <motion.p 
                className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                Customize your ClarityOS experience with <span className="text-orange-500 font-medium">advanced controls</span>
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
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-2xl blur-xl"></div>
          <Card variant="glass" className="relative">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Appearance & Theme
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customize how ClarityOS looks and feels
                  </p>
                </div>
                </div>
                
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Theme Toggle */}
                <motion.div 
                  className="glass-panel p-4 rounded-xl border border-purple-200/20 dark:border-purple-700/20"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ rotate: isDark ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                      {isDark ? (
                        <Moon className="h-5 w-5 text-indigo-500" />
                      ) : (
                        <Sun className="h-5 w-5 text-yellow-500" />
                      )}
                      </motion.div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Dark Mode
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isDark ? 'Dark theme active' : 'Light theme active'}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={toggleTheme}
                      whileTap={{ scale: 0.95 }}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 shadow-md ${
                        isDark ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-purple-500/25' : 'bg-gray-200 shadow-gray-300/25'
                      }`}
                    >
                      <motion.span
                        layout
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
                          isDark ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>
          </motion.div>

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

      {/* Data Management & Export */}
          <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-2xl blur-xl"></div>
          <Card variant="glass" className="relative">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Data Management
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Export, import, and manage your financial data
                  </p>
                </div>
              </div>

              {/* Export Actions */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Advanced Excel Exports
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <motion.button
                    onClick={exportMoneyManagerCSV}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className="glass-panel p-4 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all duration-300 group border border-emerald-200/30 dark:border-emerald-700/30 shadow-lg hover:shadow-emerald-500/20"
                  >
                      <div className="flex items-center space-x-3">
                      <motion.div 
                        className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: [0, -10, 10, -5, 0] }}
                        transition={{ duration: 0.4 }}
                      >
                        <FileSpreadsheet className="h-4 w-4 text-white" />
                      </motion.div>
                      <div className="text-left">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                          Expenses CSV
                          </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          All expense data
                          </p>
                      </div>
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 3, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors duration-300" />
                      </motion.div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={exportBudgetsCSV}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className="glass-panel p-4 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 group border border-blue-200/30 dark:border-blue-700/30 shadow-lg hover:shadow-blue-500/20"
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: [0, 10, -10, 5, 0] }}
                        transition={{ duration: 0.4 }}
                      >
                        <Target className="h-4 w-4 text-white" />
                  </motion.div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Budgets CSV
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Budget tracking data
                        </p>
                      </div>
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 3, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                      </motion.div>
                    </div>
                  </motion.button>

                  <motion.button
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
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className="glass-panel p-4 rounded-xl hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all duration-300 group border border-orange-200/30 dark:border-orange-700/30 shadow-lg hover:shadow-orange-500/20"
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, -5, 5, 0]
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <Shield className="h-4 w-4 text-white" />
                  </motion.div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Full Backup
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Complete data export
                      </p>
                    </div>
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 3, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
                      </motion.div>
                    </div>
                  </motion.button>
                </div>
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