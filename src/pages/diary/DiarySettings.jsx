import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Save, 
  Download, 
  Upload, 
  Trash2,
  Bell,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Zap,
  TestTube,
  Volume2,
  VolumeX,
  Palette,
  Database,
  FileSpreadsheet,
  Moon,
  Sun,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Target,
  Activity,
  Sparkles,
  Brain,
  TrendingUp
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  exportComprehensiveDiaryData, 
  exportDiaryDataAsCSV,
  exportDailyJournalToCSV,
  exportWeeklyJournalToCSV,
  exportMonthlyJournalToCSV,
  exportHabitsToCSV,
  exportWellbeingToCSV,
  generateSampleDiaryFile
} from '../../utils/diaryStorage';
import Input from '../../components/Input';
import { useTheme } from '../../context/ThemeContext';
import notificationService from '../../utils/notificationService';

const DiarySettings = () => {
  const { isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    reminderTime: '20:00',
    privacy: 'private',
    autoSave: true,
    showEmotions: true,
    exportFormat: 'json'
  });
  const [reminders, setReminders] = useState({});
  const [notificationStatus, setNotificationStatus] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    loadReminders();
    loadNotificationStatus();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('diary_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const loadReminders = () => {
    const currentReminders = notificationService.getReminders();
    setReminders(currentReminders);
  };

  const loadNotificationStatus = () => {
    const status = notificationService.getReminderStatus();
    setNotificationStatus(status);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleReminderChange = (type, key, value) => {
    const updatedReminder = {
      ...reminders[type],
      [key]: value
    };
    
    setReminders(prev => ({
      ...prev,
      [type]: updatedReminder
    }));
    
    // Update the notification service
    notificationService.updateReminder(type, updatedReminder);
    
    // Refresh status
    loadNotificationStatus();
    setHasChanges(true);
  };

  const saveSettings = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('diary_settings', JSON.stringify(settings));
      setSaving(false);
      setHasChanges(false);
    }, 1000);
  };

  const testNotification = () => {
    notificationService.testNotification();
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationStatus(prev => ({ ...prev, permission }));
    }
  };

  const exportData = (format = 'json') => {
    try {
      if (format === 'comprehensive') {
        const comprehensiveData = exportComprehensiveDiaryData();
        const dataStr = JSON.stringify(comprehensiveData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `diary-comprehensive-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
      } else if (format === 'csv') {
        const csvData = exportDiaryDataAsCSV();
        const dataBlob = new Blob([csvData], { type: 'text/csv' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `diary-data-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      } else {
        // Original backup format
    const diaryData = {
      dailyEntries: JSON.parse(localStorage.getItem('diary_daily_entries') || '[]'),
      weeklyEntries: JSON.parse(localStorage.getItem('diary_weekly_entries') || '[]'),
      monthlyEntries: JSON.parse(localStorage.getItem('diary_monthly_entries') || '[]'),
      wellnessData: JSON.parse(localStorage.getItem('diary_wellness_data') || '[]'),
      habits: JSON.parse(localStorage.getItem('diary_habits') || '[]'),
      habitCompletions: JSON.parse(localStorage.getItem('diary_habit_completions') || '{}'),
      settings: settings,
      reminders: reminders,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };

    const dataStr = JSON.stringify(diaryData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `diary-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Individual CSV Export Functions
  const exportDailyJournalCSV = () => {
    try {
      const csvData = exportDailyJournalToCSV();
      const dataBlob = new Blob([csvData], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `diary-daily-journal-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Daily Journal CSV export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const exportWeeklyJournalCSV = () => {
    try {
      const csvData = exportWeeklyJournalToCSV();
      const dataBlob = new Blob([csvData], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `diary-weekly-journal-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Weekly Journal CSV export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const exportMonthlyJournalCSV = () => {
    try {
      const csvData = exportMonthlyJournalToCSV();
      const dataBlob = new Blob([csvData], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `diary-monthly-journal-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Monthly Journal CSV export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const exportHabitsCSV = () => {
    try {
      const csvData = exportHabitsToCSV();
      const dataBlob = new Blob([csvData], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `diary-habits-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Habits CSV export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const exportWellbeingCSV = () => {
    try {
      const csvData = exportWellbeingToCSV();
      const dataBlob = new Blob([csvData], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `diary-wellbeing-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Wellbeing CSV export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // World-Class Excel Export for MyDiary
  const exportWorldClassDiaryExcel = async () => {
    try {
      console.log('🚀 Starting world-class diary Excel export...');

      // Dynamic import to handle missing dependency gracefully
      const { default: DiaryExcelExportMaster } = await import('../../utils/diaryExcelExport.js');

      // Get all diary data from localStorage
      const dailyEntries = JSON.parse(localStorage.getItem('diary_daily_entries') || '[]');
      const weeklyEntries = JSON.parse(localStorage.getItem('diary_weekly_entries') || '[]');
      const monthlyEntries = JSON.parse(localStorage.getItem('diary_monthly_entries') || '[]');
      const wellnessData = JSON.parse(localStorage.getItem('diary_wellness_data') || '[]');
      const habits = JSON.parse(localStorage.getItem('diary_habits') || '[]');
      const habitCompletions = JSON.parse(localStorage.getItem('diary_habit_completions') || '{}');

      const diaryData = {
        dailyEntries,
        weeklyEntries,
        monthlyEntries,
        wellnessData,
        habits,
        habitCompletions
      };

      // Create Excel export master
      const excelMaster = new DiaryExcelExportMaster();
      
      // Generate world-class Excel workbook
      console.log('Creating diary Excel workbook...');
      const workbook = await excelMaster.createDiaryExport(diaryData);
      
      // Get buffer and create download
      const buffer = await excelMaster.getBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MyDiary-Wellness-Analytics-Pro-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Diary Excel export completed successfully!');
      alert('🎉 Wellness Analytics Pro report created successfully! This comprehensive analysis of your life patterns is now ready.');
    } catch (error) {
      console.error('❌ Diary Excel export failed:', error);
      if (error.message?.includes('exceljs') || error.message?.includes('resolve import')) {
        alert('Excel functionality is currently unavailable. Please use CSV export instead.');
      } else {
        alert(`Excel export failed: ${error.message}. Please check console for details.`);
      }
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all diary entries and habits? This action cannot be undone.')) {
      localStorage.removeItem('diary_daily_entries');
      localStorage.removeItem('diary_weekly_entries');
      localStorage.removeItem('diary_monthly_entries');
      localStorage.removeItem('diary_wellness_data');
      localStorage.removeItem('diary_habits');
      localStorage.removeItem('diary_habit_completions');
      localStorage.removeItem('diary_settings');
      window.location.reload();
    }
  };

  const downloadSampleFile = () => {
    try {
      const sampleData = generateSampleDiaryFile();
      const dataBlob = new Blob([sampleData], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mydiary-sample-import.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Sample diary file downloaded successfully!');
      alert('Sample file downloaded! Use this format to import your diary data.');
    } catch (error) {
      console.error('Sample file download failed:', error);
      alert('Failed to download sample file. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card variant="glass" className="relative">
          <div className="space-y-2">
            <h1 className="text-gradient flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
              <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 animate-pulse" />
              MyDiary Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Customize your journaling and wellness experience
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Appearance & General */}
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
                          Dark Mode
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isDark ? 'Dark theme active' : 'Light theme active'}
                        </p>
                </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                        checked={isDark}
                        onChange={toggleTheme}
                      className="sr-only peer"
                    />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* General Settings */}
      <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
              <div className="space-y-4">
            <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                General Settings
              </h3>
            </div>

                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto Save
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                        Save entries automatically
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    className="sr-only peer"
                  />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Emotions
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                        Display emotion tracking
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showEmotions}
                    onChange={(e) => handleSettingChange('showEmotions', e.target.checked)}
                    className="sr-only peer"
                  />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Privacy & Security */}
      <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Privacy & Security
              </h3>
            </div>

                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Privacy Level
                </label>
                <select
                  value={settings.privacy}
                  onChange={(e) => handleSettingChange('privacy', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="private">Private (Local only)</option>
                  <option value="cloud">Cloud Backup</option>
                  <option value="public">Public (Share with others)</option>
                </select>
              </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Data Protection
                    </h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          Your entries are stored locally on your device.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
        </div>

        {/* Middle Column - Notifications */}
        <div className="space-y-6">
          {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      notificationStatus.permission === 'granted' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {notificationStatus.permission === 'granted' ? '✓ Enabled' : '✗ Disabled'}
                    </span>
                    {notificationStatus.permission !== 'granted' && (
                      <Button size="sm" onClick={requestNotificationPermission}>
                        Enable
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
                  {/* Daily Reminders */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Daily</span>
                      <Input
                        type="time"
                        value={reminders.daily?.time || '20:00'}
                        onChange={(e) => handleReminderChange('daily', 'time', e.target.value)}
                        disabled={!reminders.daily?.enabled}
                        className="text-xs w-20"
                        size="sm"
                      />
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminders.daily?.enabled || false}
                        onChange={(e) => handleReminderChange('daily', 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Weekly Reminders */}
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Weekly (Sun)</span>
                      <Input
                        type="time"
                        value={reminders.weekly?.time || '19:00'}
                        onChange={(e) => handleReminderChange('weekly', 'time', e.target.value)}
                        disabled={!reminders.weekly?.enabled}
                        className="text-xs w-20"
                        size="sm"
                      />
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminders.weekly?.enabled || false}
                        onChange={(e) => handleReminderChange('weekly', 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Monthly Reminders */}
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Monthly (1st)</span>
                      <Input
                        type="time"
                        value={reminders.monthly?.time || '18:00'}
                        onChange={(e) => handleReminderChange('monthly', 'time', e.target.value)}
                        disabled={!reminders.monthly?.enabled}
                        className="text-xs w-20"
                        size="sm"
                      />
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminders.monthly?.enabled || false}
                        onChange={(e) => handleReminderChange('monthly', 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Random Check-ins */}
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Random Check-ins</span>
                      <select
                        value={reminders.random?.frequency || 3}
                        onChange={(e) => handleReminderChange('random', 'frequency', parseInt(e.target.value))}
                        disabled={!reminders.random?.enabled}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value={1}>1/day</option>
                        <option value={2}>2/day</option>
                        <option value={3}>3/day</option>
                        <option value={4}>4/day</option>
                        <option value={5}>5/day</option>
                      </select>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminders.random?.enabled || false}
                        onChange={(e) => handleReminderChange('random', 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {/* Test Notification Button */}
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    onClick={testNotification}
                    disabled={notificationStatus.permission !== 'granted'}
                    className="w-full flex items-center justify-center space-x-2"
                    size="sm"
                  >
                    <TestTube className="h-3 w-3" />
                    <span>Test Notification</span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Data Management */}
        <div className="space-y-6">
          {/* Data Export */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Data Export
              </h3>
            </div>

                <div className="space-y-3">
                  {/* World-Class Excel Export */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-bl-full"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-3">
                        <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">
                            🧠 Wellness Analytics Pro
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                            AI-powered life insights
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="primary" 
                        onClick={exportWorldClassDiaryExcel} 
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                        size="sm"
                      >
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-3 w-3" />
                          <span>Generate Wellness Report</span>
                        </div>
                      </Button>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                        ✨ 8 sheets • Habit trends • Wellness forecasts
                      </p>
                    </div>
                  </div>

                  {/* Main Export Options */}
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => exportData('comprehensive')}
                        className="flex items-center justify-center space-x-2 text-sm"
                        size="sm"
                      >
                        <Download className="h-3 w-3" />
                        <span>Comprehensive Export</span>
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => exportData('csv')}
                        className="flex items-center justify-center space-x-2 text-sm"
                        size="sm"
                      >
                        <FileSpreadsheet className="h-3 w-3" />
                        <span>CSV Export</span>
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => exportData('json')}
                        className="flex items-center justify-center space-x-2 text-sm"
                        size="sm"
                      >
                        <Database className="h-3 w-3" />
                        <span>Backup Export</span>
                      </Button>
                    </div>
                  </div>

                  {/* Individual CSV Exports */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileSpreadsheet className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Individual CSVs
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="secondary"
                        onClick={exportDailyJournalCSV}
                        className="flex items-center justify-center space-x-2 text-xs"
                        size="sm"
                      >
                        <Download className="h-3 w-3" />
                        <span>Daily Journal</span>
                      </Button>
                      
                      <Button
                        variant="secondary"
                        onClick={exportWeeklyJournalCSV}
                        className="flex items-center justify-center space-x-2 text-xs"
                        size="sm"
                      >
                        <Download className="h-3 w-3" />
                        <span>Weekly Journal</span>
                      </Button>
                      
                      <Button
                        variant="secondary"
                        onClick={exportMonthlyJournalCSV}
                        className="flex items-center justify-center space-x-2 text-xs"
                        size="sm"
                      >
                        <Download className="h-3 w-3" />
                        <span>Monthly Journal</span>
                      </Button>
                      
              <Button
                variant="secondary"
                        onClick={exportHabitsCSV}
                        className="flex items-center justify-center space-x-2 text-xs"
                        size="sm"
              >
                        <Download className="h-3 w-3" />
                        <span>Habits</span>
              </Button>

              <Button
                variant="secondary"
                        onClick={exportWellbeingCSV}
                        className="flex items-center justify-center space-x-2 text-xs"
                        size="sm"
                      >
                        <Download className="h-3 w-3" />
                        <span>Wellbeing</span>
                      </Button>
                    </div>
                  </div>
                </div>
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
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Upload className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Import Data
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Restore diary entries
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        className="flex items-center space-x-2"
                        size="sm"
                      >
                        <Upload className="h-3 w-3" />
                        <span>Import</span>
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
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Danger Zone
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300">
                            Delete all data
                    </p>
                  </div>
                </div>
                <Button 
                  variant="danger" 
                        onClick={clearAllData}
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



      {/* Save Changes */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button 
            variant="primary" 
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default DiarySettings; 