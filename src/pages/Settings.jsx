import { useState, useEffect } from 'react';
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
  TrendingUp
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import StorageModeToggle from '../components/StorageModeToggle';
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

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { currency, updateCurrency } = useCurrency();
  const { success, error, warning } = useToast();
  const [settings, setSettings] = useState({
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    startOfWeek: 1,
  });
  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [clearDataModalOpen, setClearDataModalOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  // Sync settings with currency context
  useEffect(() => {
    if (currency && currency !== settings.currency) {
      setSettings(prev => ({
        ...prev,
        currency: currency
      }));
    }
  }, [currency, settings.currency]);

  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const loadSettings = () => {
    const savedSettings = getSettings();
    setSettings(savedSettings);
    setOriginalSettings(savedSettings);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    
    // Update currency context immediately if currency is changed
    if (key === 'currency') {
      updateCurrency(value);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      setOriginalSettings(settings);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings(originalSettings);
  };

  const exportData = () => {
    const data = {
      expenses: getExpenses(),
      budgets: getBudgets(),
      categories: getCategories(),
      settings: getSettings(),
      // Include diary data in main export
      diaryData: {
        dailyEntries: JSON.parse(localStorage.getItem('diary_daily_entries') || '[]'),
        weeklyEntries: JSON.parse(localStorage.getItem('diary_weekly_entries') || '[]'),
        monthlyEntries: JSON.parse(localStorage.getItem('diary_monthly_entries') || '[]'),
        wellnessData: JSON.parse(localStorage.getItem('diary_wellness_data') || '[]'),
        habits: JSON.parse(localStorage.getItem('diary_habits') || '[]'),
        habitCompletions: JSON.parse(localStorage.getItem('diary_habit_completions') || '{}'),
        diarySettings: JSON.parse(localStorage.getItem('diary_settings') || '{}')
      },
      exportDate: new Date().toISOString(),
      version: '1.1',
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `money-manager-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportModalOpen(false);
  };

  const exportMoneyManagerCSV = async () => {
    setSaving(true);
    try {
      const csvData = exportMoneyManagerToCSV();
      const dataBlob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `money-manager-expenses-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success message
      success('CSV export completed successfully!', {
        title: 'Export Complete',
        duration: 4000
      });
    } catch (error) {
      console.error('CSV export failed:', error);
      error('Export failed. Please try again.', {
        title: 'Export Error',
        duration: 6000
      });
    } finally {
      setSaving(false);
    }
  };

  const exportBudgetsCSV = async () => {
    setSaving(true);
    try {
      const csvData = exportBudgetsToCSV();
      const dataBlob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `money-manager-budgets-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success message
      success('CSV export completed successfully!', {
        title: 'Export Complete',
        duration: 4000
      });
    } catch (error) {
      console.error('Budgets CSV export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // World-Class Excel Export
  const exportWorldClassExcel = async () => {
    setSaving(true);
    try {
      success('🚀 Creating your world-class Excel analytics report...', {
        title: 'Excel Export Started',
        duration: 3000
      });

      // Dynamic import to handle missing dependency gracefully
      const { default: ExcelExportMaster } = await import('../utils/excellExport.js');

      // Get all data
      const expenses = getExpenses();
      const budgets = getBudgets();
      const categories = getCategories();

      // Create Excel export master
      const excelMaster = new ExcelExportMaster();
      
      // Generate world-class Excel workbook
      const workbook = await excelMaster.createMoneyManagerExport(expenses, budgets, categories);
      
      // Get buffer and create download
      const buffer = await excelMaster.getBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MoneyManager-Analytics-Pro-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success message
      success('🎉 World-class Excel report created successfully! This level of financial analytics is typically only found in enterprise software.', {
        title: 'Excel Analytics Complete',
        duration: 8000
      });
    } catch (error) {
      console.error('Excel export failed:', error);
      if (error.message?.includes('exceljs') || error.message?.includes('resolve import')) {
        error('Excel functionality is currently unavailable. Please use CSV export instead.', {
          title: 'Excel Export Unavailable',
          duration: 6000
        });
      } else {
        error('Excel export failed. Please try again.', {
          title: 'Export Error',
          duration: 6000
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleImport = () => {
    try {
      setImportError('');
      const data = JSON.parse(importData);
      
      // Validate data structure
      if (!data.expenses || !data.budgets || !data.categories) {
        throw new Error('Invalid data format. Missing required fields.');
      }

      // Import data
      saveExpenses(data.expenses);
      saveBudgets(data.budgets);
      saveCategories(data.categories);
      
      if (data.settings) {
        saveSettings(data.settings);
        loadSettings();
      }

      setImportModalOpen(false);
      setImportData('');
      
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      setImportError('Invalid JSON format or corrupted data.');
    }
  };

  const clearAllData = () => {
    // Clear all storage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    setClearDataModalOpen(false);
    
    // Reload page
    window.location.reload();
  };

  const downloadSampleFile = () => {
    try {
      const sampleData = generateSampleMoneyManagerFile();
      const dataBlob = new Blob([sampleData], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'money-manager-sample-import.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      success('Sample file downloaded! Use this format to import your data.', {
        title: 'Sample Downloaded',
        duration: 5000
      });
    } catch (error) {
      console.error('Sample file download failed:', error);
      error('Failed to download sample file. Please try again.', {
        title: 'Download Error',
        duration: 4000
      });
    }
  };

  const currencyOptions = [
    { value: 'INR', label: '₹ INR (Indian Rupee)' },
    { value: 'USD', label: '$ USD' },
    { value: 'EUR', label: '€ EUR' },
    { value: 'GBP', label: '£ GBP' },
    { value: 'JPY', label: '¥ JPY' },
    { value: 'CAD', label: '$ CAD' },
    { value: 'AUD', label: '$ AUD' },
  ];

  const dateFormatOptions = [
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US)' },
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (UK)' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (ISO)' },
    { value: 'dd.MM.yyyy', label: 'DD.MM.YYYY (DE)' },
  ];

  const weekStartOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card variant="glass" className="relative">
          <div className="space-y-2">
            <h1 className="text-gradient flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 animate-pulse" />
              Money Manager Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Customize your financial management experience
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Appearance Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Appearance
                  </h3>
                </div>
                
                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isDark ? (
                        <Moon className="h-5 w-5 text-indigo-500" />
                      ) : (
                        <Sun className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Theme Mode
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isDark ? 'Dark mode is active' : 'Light mode is active'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={toggleTheme}
                      className="min-w-[110px] flex items-center space-x-2"
                    >
                      {isDark ? (
                        <>
                          <Sun className="h-4 w-4" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Regional Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Regional Settings
                  </h3>
                </div>
                
                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span>Currency</span>
                    </label>
                    <Select
                      options={currencyOptions}
                      value={settings.currency}
                      onChange={(e) => handleSettingChange('currency', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>Date Format</span>
                    </label>
                    <Select
                      options={dateFormatOptions}
                      value={settings.dateFormat}
                      onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span>Week Starts On</span>
                    </label>
                    <Select
                      options={weekStartOptions}
                      value={settings.startOfWeek}
                      onChange={(e) => handleSettingChange('startOfWeek', Number(e.target.value))}
                    />
                  </div>
                </div>
                
                {hasChanges && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-end space-x-3 pt-4 border-t border-blue-200 dark:border-blue-700"
                  >
                    <Button variant="secondary" onClick={handleResetSettings} size="sm">
                      Reset
                    </Button>
                    <Button onClick={handleSaveSettings} loading={saving} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Data Export */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Data Export
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {/* Main Export */}
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Download className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Complete Backup
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            All data in JSON format
                          </p>
                        </div>
                      </div>
                      <Button variant="secondary" onClick={() => setExportModalOpen(true)} size="sm">
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* World-Class Excel Export */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-bl-full"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="font-bold text-emerald-900 dark:text-emerald-100">
                            🚀 World-Class Excel Analytics
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                            Enterprise-grade financial insights
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="primary" 
                        onClick={exportWorldClassExcel} 
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {saving ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Creating Excel...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4" />
                            <span>Generate Analytics Report</span>
                          </div>
                        )}
                      </Button>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                        ✨ 8 sheets • Charts • AI insights • Enterprise quality
                      </p>
                    </div>
                  </div>

                  {/* CSV Exports */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileSpreadsheet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        CSV Exports
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="secondary" 
                        onClick={exportMoneyManagerCSV} 
                        disabled={saving}
                        className="flex items-center justify-center space-x-2 text-sm"
                        size="sm"
                      >
                        <Download className="h-3 w-3" />
                        <span>{saving ? 'Exporting...' : 'Expenses CSV'}</span>
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={exportBudgetsCSV} 
                        disabled={saving}
                        className="flex items-center justify-center space-x-2 text-sm"
                        size="sm"
                      >
                        <Download className="h-3 w-3" />
                        <span>{saving ? 'Exporting...' : 'Budgets CSV'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Storage Mode */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Storage Mode
                  </h3>
                </div>
                
                <StorageModeToggle />
              </div>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Data Management
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {/* Import */}
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Upload className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Import Data
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Restore from backup
                          </p>
                        </div>
                      </div>
                      <Button variant="secondary" onClick={() => setImportModalOpen(true)} size="sm">
                        Import
                      </Button>
                    </div>
                    
                    {/* Sample File Download */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Download className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Download Sample File
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              JSON format example
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" onClick={downloadSampleFile} size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Sample
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-100">
                            Danger Zone
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Clear all data
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="danger" 
                        onClick={() => setClearDataModalOpen(true)}
                        size="sm"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>



      {/* Export Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Data"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            This will download all your expenses, budgets, categories, and settings as a JSON file. 
            You can use this file to restore your data later.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  What's included:
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                  <li>• All your expenses and transactions</li>
                  <li>• Budget settings and categories</li>
                  <li>• Diary entries (daily, weekly, monthly)</li>
                  <li>• Wellness tracking data</li>
                  <li>• Habit completion records</li>
                  <li>• Application preferences</li>
                  <li>• Export timestamp for reference</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Data"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Paste the JSON data from your export file below. This will replace all existing data.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-2">
              <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Need help with the format?
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Download the sample file from the import section to see the expected JSON structure.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              JSON Data
            </label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={8}
              className="input-field resize-none font-mono text-sm"
              placeholder="Paste your exported JSON data here..."
            />
          </div>
          
          {importError && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {importError}
            </div>
          )}
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  Warning
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This will replace all your current data. Make sure to export your current data first if you want to keep it.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!importData.trim()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* Clear Data Modal */}
      <Modal
        isOpen={clearDataModalOpen}
        onClose={() => setClearDataModalOpen(false)}
        title="Clear All Data"
        size="small"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  Permanent Action
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  This action cannot be undone. All your expenses, budgets, categories, and settings will be permanently deleted.
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to clear all data? Consider exporting your data first.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setClearDataModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={clearAllData}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings; 