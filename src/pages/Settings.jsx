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
  EyeOff
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

// Ultra-smooth card animation for settings cards
const settingsCardAnimation = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 0.4
    }
  }
};

// Beautiful toggle switch component
const ToggleSwitch = memo(({ enabled, onChange, color = 'orange' }) => {
  const colorMap = {
    orange: 'peer-checked:bg-orange-500',
    green: 'peer-checked:bg-emerald-500',
    blue: 'peer-checked:bg-blue-500'
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className={`w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300/30 dark:peer-focus:ring-orange-800/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${colorMap[color]} transition-all duration-300`}></div>
    </label>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';

// Modern action button component
const ActionButton = memo(({ icon: Icon, title, description, onClick, variant = 'primary', disabled = false, loading = false }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled || loading}
    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
      variant === 'primary' 
        ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 dark:from-orange-950/30 dark:to-red-950/30 dark:hover:from-orange-950/50 dark:hover:to-red-950/50 dark:border-orange-800/30'
        : variant === 'success'
        ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 dark:from-emerald-950/30 dark:to-green-950/30 dark:hover:from-emerald-950/50 dark:hover:to-green-950/50 dark:border-emerald-800/30'
        : variant === 'danger'
        ? 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-950/30 dark:to-pink-950/30 dark:hover:from-red-950/50 dark:hover:to-pink-950/50 dark:border-red-800/30'
        : 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 dark:from-gray-950/30 dark:to-slate-950/30 dark:hover:from-gray-950/50 dark:hover:to-slate-950/50 dark:border-gray-800/30'
    } disabled:opacity-50 disabled:cursor-not-allowed group`}
    whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  >
    <div className="flex items-center space-x-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        variant === 'primary' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
        variant === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
        variant === 'danger' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
        'bg-gradient-to-r from-gray-500 to-slate-500'
      } shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          <Icon className="h-5 w-5 text-white" />
        )}
      </div>
      <div className="text-left flex-1">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  </motion.button>
));

ActionButton.displayName = 'ActionButton';

const Settings = memo(() => {
  const { isDark, toggleTheme } = useTheme();
  const { currency, setCurrency, currencies } = useCurrency();
  const { toast } = useToast();
  
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
      toast.error('Failed to load settings');
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
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [settings, toast]);

  const exportMoneyManagerCSV = useCallback(async () => {
    try {
      await exportMoneyManagerToCSV();
      toast.success('Expenses exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  }, [toast]);

  const exportBudgetsCSV = useCallback(async () => {
    try {
      await exportBudgetsToCSV();
      toast.success('Budgets exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export budgets');
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
        
        toast.success('Data imported successfully!');
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import data');
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
      
      toast.success('All data deleted successfully!');
      setShowDeleteModal(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete data');
    }
  }, [toast]);

  const generateSampleData = useCallback(async () => {
    try {
      await generateSampleMoneyManagerFile();
      toast.success('Sample data generated!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Sample data error:', error);
      toast.error('Failed to generate sample data');
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
          <SettingsIcon className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your experience
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={settingsCardAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Quick Actions
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionButton
                icon={Save}
                title="Save Settings"
                description={hasChanges ? "You have unsaved changes" : "All settings saved"}
                onClick={saveSettingsData}
                variant={hasChanges ? "primary" : "secondary"}
                loading={saving}
                disabled={!hasChanges}
              />
              
              <ActionButton
                icon={RefreshCcw}
                title="Refresh Data"
                description="Reload all settings"
                onClick={loadSettings}
                variant="secondary"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Appearance & Preferences */}
      <motion.div
        variants={settingsCardAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Appearance & Preferences
              </h3>
            </div>

            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-center space-x-3">
                  {isDark ? (
                    <Moon className="h-5 w-5 text-purple-500" />
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
                <ToggleSwitch
                  enabled={isDark}
                  onChange={toggleTheme}
                  color="purple"
                />
              </div>

              {/* Currency Selection */}
              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-center space-x-3 mb-3">
                  <DollarSign className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Currency
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose your preferred currency
                    </p>
                  </div>
                </div>
                <Select
                  value={currency}
                  onChange={(value) => {
                    setCurrency(value);
                    handleSettingChange('currency', value);
                  }}
                  options={currencies.map(curr => ({
                    value: curr.code,
                    label: `${curr.symbol} ${curr.code} - ${curr.name}`
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div
        variants={settingsCardAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
      >
        <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Data Management
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionButton
                icon={Download}
                title="Export Expenses"
                description="Download expenses as CSV"
                onClick={exportMoneyManagerCSV}
                variant="success"
              />
              
              <ActionButton
                icon={Download}
                title="Export Budgets"
                description="Download budgets as CSV"
                onClick={exportBudgetsCSV}
                variant="success"
              />
              
              <ActionButton
                icon={Upload}
                title="Import Data"
                description="Upload backup file"
                onClick={() => document.getElementById('import-file').click()}
                variant="primary"
                loading={importing}
              />
              
              <ActionButton
                icon={Sparkles}
                title="Sample Data"
                description="Generate demo data"
                onClick={generateSampleData}
                variant="secondary"
              />
            </div>

            {/* Hidden file input */}
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        variants={settingsCardAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
      >
        <Card className="border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50/50 to-pink-50/50 dark:from-red-950/20 dark:to-pink-950/20">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Danger Zone
              </h3>
            </div>
            
            <ActionButton
              icon={Trash2}
              title="Delete All Data"
              description="Permanently remove all data"
              onClick={() => setShowDeleteModal(true)}
              variant="danger"
            />
          </div>
        </Card>
      </motion.div>

      {/* Mobile Performance Info */}
      <motion.div
        variants={settingsCardAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.5 }}
      >
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Mobile Performance
              </h3>
            </div>
            
            <div className="flex items-center justify-center space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Lightning Fast Performance
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Optimized for 60fps mobile experience
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </Card>
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