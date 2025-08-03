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
  ArrowRight
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

// Ultra-smooth card animation for diary settings
const diaryCardAnimation = {
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

// Beautiful toggle switch component for diary
const DiaryToggleSwitch = memo(({ enabled, onChange, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'peer-checked:bg-emerald-500',
    purple: 'peer-checked:bg-purple-500',
    blue: 'peer-checked:bg-blue-500',
    orange: 'peer-checked:bg-orange-500'
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className={`w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300/30 dark:peer-focus:ring-emerald-800/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${colorMap[color]} transition-all duration-300`}></div>
    </label>
  );
});

DiaryToggleSwitch.displayName = 'DiaryToggleSwitch';

// Modern action button component for diary
const DiaryActionButton = memo(({ icon: Icon, title, description, onClick, variant = 'primary', disabled = false, loading = false }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled || loading}
    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
      variant === 'primary' 
        ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 dark:from-emerald-950/30 dark:to-green-950/30 dark:hover:from-emerald-950/50 dark:hover:to-green-950/50 dark:border-emerald-800/30'
        : variant === 'success'
        ? 'border-green-200 bg-gradient-to-r from-green-50 to-lime-50 hover:from-green-100 hover:to-lime-100 dark:from-green-950/30 dark:to-lime-950/30 dark:hover:from-green-950/50 dark:hover:to-lime-950/50 dark:border-green-800/30'
        : variant === 'danger'
        ? 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-950/30 dark:to-pink-950/30 dark:hover:from-red-950/50 dark:hover:to-pink-950/50 dark:border-red-800/30'
        : variant === 'purple'
        ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 dark:from-purple-950/30 dark:to-indigo-950/30 dark:hover:from-purple-950/50 dark:hover:to-indigo-950/50 dark:border-purple-800/30'
        : 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 dark:from-gray-950/30 dark:to-slate-950/30 dark:hover:from-gray-950/50 dark:hover:to-slate-950/50 dark:border-gray-800/30'
    } disabled:opacity-50 disabled:cursor-not-allowed group`}
    whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  >
    <div className="flex items-center space-x-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        variant === 'primary' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
        variant === 'success' ? 'bg-gradient-to-r from-green-500 to-lime-500' :
        variant === 'danger' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
        variant === 'purple' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
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

DiaryActionButton.displayName = 'DiaryActionButton';

// Notification reminder card component
const ReminderCard = memo(({ type, reminder, onChange, icon: Icon, title, color }) => (
  <div className={`p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-${color}-200/50 dark:border-${color}-700/50`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <Icon className={`h-5 w-5 text-${color}-500`} />
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {title}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {type === 'random' ? `Every ${reminder?.frequency || 3} hours` : `Daily at ${reminder?.time || '20:00'}`}
          </p>
        </div>
      </div>
      <DiaryToggleSwitch
        enabled={reminder?.enabled || false}
        onChange={(enabled) => onChange(type, 'enabled', enabled)}
        color={color}
      />
    </div>
    
    {reminder?.enabled && type !== 'random' && (
      <div className="mt-3">
        <input
          type="time"
          value={reminder?.time || '20:00'}
          onChange={(e) => onChange(type, 'time', e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>
    )}
  </div>
));

ReminderCard.displayName = 'ReminderCard';

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

  const exportData = useCallback((format) => {
    try {
      if (format === 'comprehensive') {
        exportComprehensiveDiaryData();
      } else if (format === 'csv') {
        exportDiaryDataAsCSV();
      } else if (format === 'daily') {
        exportDailyJournalToCSV();
      } else if (format === 'weekly') {
        exportWeeklyJournalToCSV();
      } else if (format === 'monthly') {
        exportMonthlyJournalToCSV();
      } else if (format === 'habits') {
        exportHabitsToCSV();
      } else if (format === 'wellbeing') {
        exportWellbeingToCSV();
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  }, []);

  const generateSampleData = useCallback(() => {
    try {
      generateSampleDiaryFile();
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Sample data error:', error);
    }
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
          <SettingsIcon className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          Diary Settings
            </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your journaling experience
            </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={diaryCardAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20">
              <div className="space-y-4">
              <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Quick Actions
                  </h3>
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DiaryActionButton
                icon={Save}
                title="Save Settings"
                description={hasChanges ? "You have unsaved changes" : "All settings saved"}
                onClick={saveSettings}
                variant={hasChanges ? "primary" : "secondary"}
                loading={saving}
                disabled={!hasChanges}
              />
              
              <DiaryActionButton
                icon={RefreshCw}
                title="Refresh Data"
                description="Reload all settings"
                onClick={() => {
                  loadSettings();
                  loadReminders();
                  loadNotificationStatus();
                }}
                variant="secondary"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* General Preferences */}
      <motion.div
        variants={diaryCardAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20">
              <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                General Preferences
              </h3>
            </div>

            <div className="space-y-4">
              {/* Auto Save */}
              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-center space-x-3">
                  <Save className="h-5 w-5 text-purple-500" />
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                    Auto Save
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Save entries automatically
                  </p>
                </div>
                </div>
                <DiaryToggleSwitch
                  enabled={settings.autoSave}
                  onChange={(value) => handleSettingChange('autoSave', value)}
                  color="purple"
                />
              </div>

              {/* Show Emotions */}
              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-purple-500" />
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                    Show Emotions
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Display emotion tracking
                  </p>
                </div>
                </div>
                <DiaryToggleSwitch
                  enabled={settings.showEmotions}
                  onChange={(value) => handleSettingChange('showEmotions', value)}
                  color="purple"
                />
              </div>

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
                <DiaryToggleSwitch
                  enabled={isDark}
                  onChange={toggleTheme}
                  color="purple"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notifications & Reminders */}
      <motion.div
        variants={diaryCardAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
      >
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Notifications & Reminders
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

            <div className="space-y-3">
              <ReminderCard
                type="daily"
                reminder={reminders.daily}
                onChange={handleReminderChange}
                icon={BookOpen}
                title="Daily Journal"
                color="emerald"
              />
              
              <ReminderCard
                type="weekly"
                reminder={reminders.weekly}
                onChange={handleReminderChange}
                icon={Calendar}
                title="Weekly Review"
                color="blue"
              />
              
              <ReminderCard
                type="monthly"
                reminder={reminders.monthly}
                onChange={handleReminderChange}
                icon={Target}
                title="Monthly Reflection"
                color="purple"
              />
              
              <ReminderCard
                type="random"
                reminder={reminders.random}
                onChange={handleReminderChange}
                icon={Sparkles}
                title="Random Check-ins"
                color="orange"
              />
                </div>

                <div className="pt-2">
              <DiaryActionButton
                icon={TestTube}
                title="Test Notification"
                description="Send a test notification"
                    onClick={testNotification}
                variant="purple"
                    disabled={notificationStatus.permission !== 'granted'}
              />
                </div>
              </div>
            </Card>
          </motion.div>

      {/* Data Export & Management */}
          <motion.div
        variants={diaryCardAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
      >
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50/50 to-lime-50/50 dark:from-green-950/20 dark:to-lime-950/20">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Data Export & Management
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DiaryActionButton
                icon={Download}
                title="Export All Data"
                description="Complete diary backup"
                        onClick={() => exportData('comprehensive')}
                variant="success"
              />
              
              <DiaryActionButton
                icon={FileSpreadsheet}
                title="Export as CSV"
                description="Spreadsheet format"
                        onClick={() => exportData('csv')}
                variant="success"
              />
              
              <DiaryActionButton
                icon={Upload}
                title="Import Data"
                description="Restore from backup"
                onClick={() => document.getElementById('diary-import-file').click()}
                variant="primary"
                loading={importing}
              />
              
              <DiaryActionButton
                icon={Sparkles}
                title="Sample Data"
                description="Generate demo entries"
                onClick={generateSampleData}
                        variant="secondary"
              />
                  </div>

            {/* Hidden file input */}
            <input
              id="diary-import-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
              </div>
            </Card>
          </motion.div>

      {/* Mobile Performance */}
          <motion.div
        variants={diaryCardAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.5 }}
      >
        <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Mobile Performance
                  </h3>
                </div>
                
            <div className="flex items-center justify-center space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
                <PenTool className="h-6 w-6 text-white" />
                        </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Optimized Journaling
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Smooth writing experience on mobile
                            </p>
                          </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
        </Card>
      </motion.div>

                  {/* Danger Zone */}
      <motion.div
        variants={diaryCardAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.6 }}
      >
        <Card className="border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50/50 to-pink-50/50 dark:from-red-950/20 dark:to-pink-950/20">
          <div className="space-y-4">
                      <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Danger Zone
              </h3>
                  </div>
            
            <DiaryActionButton
              icon={Trash2}
              title="Delete All Diary Data"
              description="Permanently remove all entries"
              onClick={() => setShowDeleteModal(true)}
                  variant="danger" 
            />
          </div>
        </Card>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full space-y-4"
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
          </div>
        </div>
      )}
    </div>
  );
});

DiarySettings.displayName = 'DiarySettings';

export default DiarySettings; 