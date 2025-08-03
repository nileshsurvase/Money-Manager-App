// Data Persistence and Backup Service for ClarityOS
// Ensures user data survives app updates and provides automatic backups

import { getExpenses, getBudgets, getCategories, getSettings } from './storage';
import { 
  getAllDailyEntries, 
  getAllWeeklyEntries, 
  getAllMonthlyEntries,
  getAllWellnessData,
  getHabits,
  getHabitCompletions 
} from './diaryStorage';

class DataPersistenceService {
  constructor() {
    this.BACKUP_KEY = 'clarityos_auto_backup';
    this.BACKUP_VERSION = '2.0';
    this.BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
    this.init();
  }

  init() {
    // Check if we need to create a backup
    this.checkAndCreateBackup();
    
    // Set up periodic backups
    setInterval(() => {
      this.checkAndCreateBackup();
    }, this.BACKUP_INTERVAL);

    // Listen for app updates/reinstalls
    this.detectAppUpdate();
  }

  // Create comprehensive backup of all user data
  createBackup() {
    try {
      const backupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        appId: 'com.nilesh.clarityos',
        
        // Money Manager data
        moneyManager: {
          expenses: getExpenses(),
          budgets: getBudgets(), 
          categories: getCategories(),
          settings: getSettings()
        },

        // My Diary data
        diary: {
          dailyEntries: getAllDailyEntries(),
          weeklyEntries: getAllWeeklyEntries(),
          monthlyEntries: getAllMonthlyEntries(),
          wellnessData: getAllWellnessData(),
          habits: getHabits(),
          habitCompletions: getHabitCompletions(),
          settings: localStorage.getItem('diary_settings') ? JSON.parse(localStorage.getItem('diary_settings')) : {},
          reminders: localStorage.getItem('diary_reminders') ? JSON.parse(localStorage.getItem('diary_reminders')) : {}
        },

        // App-wide settings
        appSettings: {
          theme: localStorage.getItem('theme'),
          currentApp: localStorage.getItem('currentApp'),
          userProfile: localStorage.getItem('userProfile'),
          firstLaunch: localStorage.getItem('firstLaunch')
        }
      };

      // Store backup in localStorage with multiple copies
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData));
      localStorage.setItem(`${this.BACKUP_KEY}_previous`, localStorage.getItem(`${this.BACKUP_KEY}_backup`));
      localStorage.setItem(`${this.BACKUP_KEY}_backup`, JSON.stringify(backupData));

      console.log('✅ Auto-backup created successfully:', new Date().toLocaleString());
      return true;
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
      return false;
    }
  }

  // Restore data from backup
  restoreFromBackup() {
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      if (!backupData) {
        console.log('No backup found to restore from');
        return false;
      }

      const data = JSON.parse(backupData);
      console.log('🔄 Restoring data from backup created at:', data.timestamp);

      // Restore Money Manager data
      if (data.moneyManager) {
        if (data.moneyManager.expenses) {
          localStorage.setItem('expenses', JSON.stringify(data.moneyManager.expenses));
        }
        if (data.moneyManager.budgets) {
          localStorage.setItem('budgets', JSON.stringify(data.moneyManager.budgets));
        }
        if (data.moneyManager.categories) {
          localStorage.setItem('categories', JSON.stringify(data.moneyManager.categories));
        }
        if (data.moneyManager.settings) {
          localStorage.setItem('settings', JSON.stringify(data.moneyManager.settings));
        }
      }

      // Restore Diary data
      if (data.diary) {
        if (data.diary.dailyEntries) {
          localStorage.setItem('diary_daily_entries', JSON.stringify(data.diary.dailyEntries));
        }
        if (data.diary.weeklyEntries) {
          localStorage.setItem('diary_weekly_entries', JSON.stringify(data.diary.weeklyEntries));
        }
        if (data.diary.monthlyEntries) {
          localStorage.setItem('diary_monthly_entries', JSON.stringify(data.diary.monthlyEntries));
        }
        if (data.diary.wellnessData) {
          localStorage.setItem('diary_wellness_data', JSON.stringify(data.diary.wellnessData));
        }
        if (data.diary.habits) {
          localStorage.setItem('diary_habits', JSON.stringify(data.diary.habits));
        }
        if (data.diary.habitCompletions) {
          localStorage.setItem('diary_habit_completions', JSON.stringify(data.diary.habitCompletions));
        }
        if (data.diary.settings) {
          localStorage.setItem('diary_settings', JSON.stringify(data.diary.settings));
        }
        if (data.diary.reminders) {
          localStorage.setItem('diary_reminders', JSON.stringify(data.diary.reminders));
        }
      }

      // Restore app settings
      if (data.appSettings) {
        Object.entries(data.appSettings).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            localStorage.setItem(key, value);
          }
        });
      }

      console.log('✅ Data restored successfully from backup');
      return true;
    } catch (error) {
      console.error('❌ Failed to restore from backup:', error);
      return false;
    }
  }

  // Check if backup is needed
  checkAndCreateBackup() {
    try {
      const lastBackup = localStorage.getItem(this.BACKUP_KEY);
      
      if (!lastBackup) {
        // No backup exists, create one
        this.createBackup();
        return;
      }

      const backupData = JSON.parse(lastBackup);
      const lastBackupTime = new Date(backupData.timestamp);
      const now = new Date();
      const timeDiff = now.getTime() - lastBackupTime.getTime();

      // Create backup if it's been more than 24 hours
      if (timeDiff > this.BACKUP_INTERVAL) {
        this.createBackup();
      }
    } catch (error) {
      console.error('Error checking backup status:', error);
      // If there's an error, try to create a new backup
      this.createBackup();
    }
  }

  // Detect app updates by comparing app version or build time
  detectAppUpdate() {
    try {
      const currentVersion = '2.0'; // App version
      const lastKnownVersion = localStorage.getItem('app_version');
      
      if (!lastKnownVersion) {
        // First installation
        localStorage.setItem('app_version', currentVersion);
        localStorage.setItem('first_install_date', new Date().toISOString());
        console.log('🎉 ClarityOS first installation detected');
      } else if (lastKnownVersion !== currentVersion) {
        // App update detected
        console.log('🔄 App update detected from', lastKnownVersion, 'to', currentVersion);
        
        // Ensure backup exists before update
        this.createBackup();
        
        // Update version
        localStorage.setItem('app_version', currentVersion);
        localStorage.setItem('last_update_date', new Date().toISOString());
        
        // Show update notification
        this.showUpdateNotification();
      }
    } catch (error) {
      console.error('Error detecting app update:', error);
    }
  }

  // Show notification about app update
  showUpdateNotification() {
    // Create a simple notification for the user
    const notification = {
      title: '🎉 ClarityOS Updated!',
      message: 'Your app has been updated successfully. All your data has been preserved.',
      type: 'success',
      timestamp: new Date().toISOString()
    };

    // Store notification to show in UI
    const notifications = JSON.parse(localStorage.getItem('app_notifications') || '[]');
    notifications.unshift(notification);
    // Keep only last 5 notifications
    if (notifications.length > 5) {
      notifications.splice(5);
    }
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
  }

  // Get backup information
  getBackupInfo() {
    try {
      const backup = localStorage.getItem(this.BACKUP_KEY);
      if (!backup) {
        return { exists: false };
      }

      const data = JSON.parse(backup);
      return {
        exists: true,
        timestamp: data.timestamp,
        version: data.version,
        size: new Blob([backup]).size,
        moneyManagerItems: {
          expenses: data.moneyManager?.expenses?.length || 0,
          budgets: data.moneyManager?.budgets?.length || 0,
          categories: data.moneyManager?.categories?.length || 0
        },
        diaryItems: {
          dailyEntries: data.diary?.dailyEntries?.length || 0,
          weeklyEntries: data.diary?.weeklyEntries?.length || 0,
          monthlyEntries: data.diary?.monthlyEntries?.length || 0,
          wellnessRecords: data.diary?.wellnessData?.length || 0,
          habits: data.diary?.habits?.length || 0
        }
      };
    } catch (error) {
      console.error('Error getting backup info:', error);
      return { exists: false, error: error.message };
    }
  }

  // Manual backup export for user
  exportBackupFile() {
    try {
      this.createBackup(); // Ensure latest backup
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      
      if (!backupData) {
        throw new Error('No backup data available');
      }

      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ClarityOS-Complete-Backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting backup file:', error);
      return false;
    }
  }

  // Import backup from file
  importBackupFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          // Validate backup data structure
          if (!backupData.version || !backupData.timestamp) {
            throw new Error('Invalid backup file format');
          }

          // Store the imported backup
          localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData));
          
          // Restore the data
          const restored = this.restoreFromBackup();
          
          if (restored) {
            resolve(true);
          } else {
            reject(new Error('Failed to restore data from backup'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read backup file'));
      };
      
      reader.readAsText(file);
    });
  }
}

// Create singleton instance
const dataPersistenceService = new DataPersistenceService();

export default dataPersistenceService;
export { DataPersistenceService };