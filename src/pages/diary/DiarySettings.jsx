import { useState, useEffect, useCallback, memo } from 'react';
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
  TrendingUp,
  CheckCircle,
  Smartphone,
  Heart,
  BookOpen,
  PenTool,
  ArrowRight,
  ArrowUpRight,
  AlertTriangle
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

const DiarySettings = memo(() => {
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
  const [importing, setImporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadSettings();
    loadReminders();
    loadNotificationStatus();
  }, []);

  const loadSettings = useCallback(() => {
    const savedSettings = localStorage.getItem('diary_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const loadReminders = useCallback(() => {
    const currentReminders = notificationService.getReminders();
    setReminders(currentReminders);
  }, []);

  const loadNotificationStatus = useCallback(() => {
    const status = notificationService.getReminderStatus();
    setNotificationStatus(status);
  }, []);

  const handleSettingChange = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleReminderChange = useCallback((type, key, value) => {
    const updatedReminder = { ...reminders[type], [key]: value };
    setReminders(prev => ({ ...prev, [type]: updatedReminder }));
    notificationService.updateReminder(type, updatedReminder);
    loadNotificationStatus();
    setHasChanges(true);
  }, [reminders]);

  const saveSettings = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('diary_settings', JSON.stringify(settings));
      setSaving(false);
      setHasChanges(false);
    }, 1000);
  }, [settings]);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationStatus(prev => ({ ...prev, permission }));
        notificationService.permission = permission;
        notificationService.refresh();
        loadNotificationStatus();
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  }, []);

  const testNotification = useCallback(() => {
    notificationService.testNotification();
  }, []);

  const handleImport = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.dailyEntries) localStorage.setItem('diary_daily_entries', JSON.stringify(data.dailyEntries));
        if (data.weeklyEntries) localStorage.setItem('diary_weekly_entries', JSON.stringify(data.weeklyEntries));
        if (data.monthlyEntries) localStorage.setItem('diary_monthly_entries', JSON.stringify(data.monthlyEntries));
        if (data.wellnessData) localStorage.setItem('diary_wellness_data', JSON.stringify(data.wellnessData));
        if (data.habits) localStorage.setItem('diary_habits', JSON.stringify(data.habits));
        if (data.habitCompletions) localStorage.setItem('diary_habit_completions', JSON.stringify(data.habitCompletions));
        if (data.settings) {
          setSettings(data.settings);
          localStorage.setItem('diary_settings', JSON.stringify(data.settings));
        }
        if (data.reminders) {
          setReminders(data.reminders);
          Object.entries(data.reminders).forEach(([type, reminder]) => {
            notificationService.updateReminder(type, reminder);
          });
        }
        
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('Import error:', error);
      } finally {
        setImporting(false);
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  }, []);

  const deleteAllData = useCallback(() => {
    try {
      const diaryKeys = [
        'diary_daily_entries',
        'diary_weekly_entries', 
        'diary_monthly_entries',
        'diary_wellness_data',
        'diary_habits',
        'diary_habit_completions',
        'diary_settings',
        'diary_reminders'
      ];
      
      diaryKeys.forEach(key => localStorage.removeItem(key));
      notificationService.clearAllReminders();
      
      setShowDeleteModal(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Delete error:', error);
    }
  }, []);

  return (
    <div className="spacing-lg">
      {/* Beautiful Header with Dashboard Theme */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card variant="glass" className="relative">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <h1 className="text-gradient flex items-center gap-2 sm:gap-3">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
                Diary Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
                Customize your journaling experience
              </p>
            </div>
            
            {/* Quick Save Action */}
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 bg-emerald-50/50 dark:bg-emerald-900/20 backdrop-blur-md p-4"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      You have unsaved changes
                    </span>
                  </div>
                  <Button
                    onClick={saveSettings}
                    loading={saving}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                  >
                    {saving ? 'Saving...' : 'Save Now'}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </div>

      {/* General Preferences */}
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
                    General Preferences
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure your diary settings and appearance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Auto Save */}
                <div className="glass-panel p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Save className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Auto Save
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Save automatically
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        settings.autoSave ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Show Emotions */}
                <div className="glass-panel p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Heart className="h-5 w-5 text-pink-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Show Emotions
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Emotion tracking
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('showEmotions', !settings.showEmotions)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        settings.showEmotions ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          settings.showEmotions ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Dark Mode */}
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
                          {isDark ? 'Dark active' : 'Light active'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        isDark ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-200'
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
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Notifications & Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl blur-xl"></div>
          <Card variant="glass" className="relative">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Notifications & Reminders
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Stay on track with smart reminders
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Daily Reminder */}
                <div className="glass-panel p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Daily Journal
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Daily at {reminders.daily?.time || '20:00'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReminderChange('daily', 'enabled', !reminders.daily?.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        reminders.daily?.enabled ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          reminders.daily?.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {reminders.daily?.enabled && (
                    <input
                      type="time"
                      value={reminders.daily?.time || '20:00'}
                      onChange={(e) => handleReminderChange('daily', 'time', e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  )}
                </div>

                {/* Weekly Reminder */}
                <div className="glass-panel p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Weekly Review
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Sundays at {reminders.weekly?.time || '19:00'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReminderChange('weekly', 'enabled', !reminders.weekly?.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        reminders.weekly?.enabled ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          reminders.weekly?.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {reminders.weekly?.enabled && (
                    <input
                      type="time"
                      value={reminders.weekly?.time || '19:00'}
                      onChange={(e) => handleReminderChange('weekly', 'time', e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>

                {/* Monthly Reminder */}
                <div className="glass-panel p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Monthly Reflection
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          1st of month at {reminders.monthly?.time || '18:00'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReminderChange('monthly', 'enabled', !reminders.monthly?.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        reminders.monthly?.enabled ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          reminders.monthly?.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {reminders.monthly?.enabled && (
                    <input
                      type="time"
                      value={reminders.monthly?.time || '18:00'}
                      onChange={(e) => handleReminderChange('monthly', 'time', e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  )}
                </div>

                {/* Random Check-ins */}
                <div className="glass-panel p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Sparkles className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Random Check-ins
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Every {reminders.random?.frequency || 3} hours
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReminderChange('random', 'enabled', !reminders.random?.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        reminders.random?.enabled ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          reminders.random?.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Notification */}
              <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  onClick={testNotification}
                  disabled={notificationStatus.permission !== 'granted'}
                  className="w-full glass-panel p-4 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 group disabled:opacity-50"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <TestTube className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Test Notification
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Data Export & Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-lime-500/5 rounded-2xl blur-xl"></div>
          <Card variant="glass" className="relative">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-lime-500 flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Data Export & Management
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Export, backup, and manage your diary data
                  </p>
                </div>
              </div>

              {/* Advanced Excel Exports */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Advanced Excel Exports
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => exportDailyJournalToCSV()}
                    className="glass-panel p-4 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Daily Journal
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          All daily entries
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors duration-300" />
                    </div>
                  </button>

                  <button
                    onClick={() => exportWeeklyJournalToCSV()}
                    className="glass-panel p-4 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Weekly Journal
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Weekly reflections
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                    </div>
                  </button>

                  <button
                    onClick={() => exportMonthlyJournalToCSV()}
                    className="glass-panel p-4 rounded-xl hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Monthly Journal
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Monthly reviews
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
                    </div>
                  </button>

                  <button
                    onClick={() => exportHabitsToCSV()}
                    className="glass-panel p-4 rounded-xl hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Habits Data
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Habit tracking
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
                    </div>
                  </button>

                  <button
                    onClick={() => exportWellbeingToCSV()}
                    className="glass-panel p-4 rounded-xl hover:bg-pink-50/50 dark:hover:bg-pink-900/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Wellbeing Data
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Mood & wellness
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-pink-500 transition-colors duration-300" />
                    </div>
                  </button>

                  <button
                    onClick={() => exportComprehensiveDiaryData()}
                    className="glass-panel p-4 rounded-xl hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Complete Backup
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Full diary export
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Import & Other Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  onClick={() => document.getElementById('diary-import-file').click()}
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
                  onClick={() => generateSampleDiaryFile()}
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
                        Generate demo entries
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <input
                id="diary-import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Mobile Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 rounded-2xl blur-xl"></div>
          <Card variant="glass" className="relative">
            <div className="flex items-center justify-center space-x-6 py-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-500" />
                  Optimized Journaling
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Smooth writing experience on mobile
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-2xl blur-xl"></div>
          <Card variant="glass" className="relative border-red-200/30 dark:border-red-800/30">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
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
                    Delete All Diary Data
                  </span>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <Shield className="h-8 w-8 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">
                  This action cannot be undone!
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  All your diary entries, habits, and settings will be permanently deleted.
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
          </motion.div>
        </div>
      )}
    </div>
  );
});

DiarySettings.displayName = 'DiarySettings';

export default DiarySettings;