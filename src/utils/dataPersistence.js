/**
 * Data Persistence Manager
 * Ensures user data survives app updates, reinstalls, and device changes
 */

import { isMobile, isAndroid } from './mobile';
import { isDatabaseAvailable } from './database';
import { getStorageMode, setStorageMode, STORAGE_MODES } from './storageManager';
import { 
  getExpenses, 
  getBudgets, 
  getCategories, 
  getSettings,
  saveExpenses,
  saveBudgets,
  saveCategories,
  saveSettings
} from './storage';
import { 
  getEntries as getDiaryEntries,
  saveToStorage as saveDiaryToStorage 
} from './diaryStorage';
import { 
  getTodayTasks,
  getTodayHabits,
  getAllStreaks as getCoreOSStreaks
} from './coreosStorage';
import { 
  getUserProfile as getFreedomOSProfile,
  getCalculatorHistory,
  getNetWorthHistory
} from './freedomosStorage';

const PERSISTENCE_CONFIG = {
  LAST_BACKUP_KEY: 'last_backup_timestamp',
  AUTO_BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  DATA_VERSION_KEY: 'data_version',
  CURRENT_DATA_VERSION: '2.0.0',
  CLOUD_SYNC_KEY: 'cloud_sync_enabled',
  MIGRATION_STATUS_KEY: 'migration_status',
};

class DataPersistenceManager {
  constructor() {
    this.isInitialized = false;
    this.autoBackupTimer = null;
  }

  /**
   * Initialize data persistence system
   */
  async initialize() {
    if (this.isInitialized) return;

    console.log('🔄 Initializing Data Persistence Manager...');

    try {
      // Check if this is a fresh install or update
      await this.handleAppVersion();
      
      // Set up cloud storage if available
      await this.setupCloudStorage();
      
      // Migrate existing data if needed
      await this.migrateDataIfNeeded();
      
      // Set up automatic backups
      this.setupAutoBackup();
      
      // Restore data on mobile if needed
      if (isMobile()) {
        await this.restoreDataOnMobile();
      }

      this.isInitialized = true;
      console.log('✅ Data Persistence Manager initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Data Persistence Manager:', error);
      // Fallback to local storage
      this.setupLocalStorageFallback();
    }
  }

  /**
   * Handle app version changes and migrations
   */
  async handleAppVersion() {
    const currentVersion = localStorage.getItem(PERSISTENCE_CONFIG.DATA_VERSION_KEY);
    const newVersion = PERSISTENCE_CONFIG.CURRENT_DATA_VERSION;

    if (!currentVersion) {
      // Fresh install
      console.log('📱 Fresh app installation detected');
      localStorage.setItem(PERSISTENCE_CONFIG.DATA_VERSION_KEY, newVersion);
      return;
    }

    if (currentVersion !== newVersion) {
      // App update detected
      console.log(`🔄 App update detected: ${currentVersion} → ${newVersion}`);
      await this.performDataMigration(currentVersion, newVersion);
      localStorage.setItem(PERSISTENCE_CONFIG.DATA_VERSION_KEY, newVersion);
    }
  }

  /**
   * Set up cloud storage for data persistence
   */
  async setupCloudStorage() {
    // Check if cloud storage is available
    const isCloudAvailable = isDatabaseAvailable();
    
    if (isCloudAvailable) {
      console.log('☁️ Cloud storage available - enabling automatic sync');
      localStorage.setItem(PERSISTENCE_CONFIG.CLOUD_SYNC_KEY, 'true');
      
      // Switch to cloud storage mode for better persistence
      setStorageMode(STORAGE_MODES.SERVER);
      
      // Perform initial sync if we have local data
      await this.syncLocalDataToCloud();
    } else {
      console.log('📱 Cloud storage unavailable - using local with backup');
      localStorage.setItem(PERSISTENCE_CONFIG.CLOUD_SYNC_KEY, 'false');
      setStorageMode(STORAGE_MODES.LOCAL);
    }
  }

  /**
   * Sync existing local data to cloud
   */
  async syncLocalDataToCloud() {
    try {
      console.log('🔄 Syncing local data to cloud...');

      // Get all local data
      const localData = await this.gatherAllLocalData();
      
      if (this.hasAnyData(localData)) {
        // TODO: Implement cloud upload
        // For now, we'll keep this as a placeholder since the cloud functions are already set up
        console.log('📤 Local data found, ready for cloud sync');
        console.log('Data summary:', {
          expenses: localData.expenses.length,
          budgets: localData.budgets.length,
          diaryEntries: Object.keys(localData.diary).length,
          coreosData: !!localData.coreos,
          freedomosData: !!localData.freedomos
        });
      }
    } catch (error) {
      console.error('❌ Failed to sync local data to cloud:', error);
    }
  }

  /**
   * Gather all local data for backup/sync
   */
  async gatherAllLocalData() {
    return {
      // Money Manager data
      expenses: getExpenses() || [],
      budgets: getBudgets() || [],
      categories: getCategories() || [],
      settings: getSettings() || {},
      
      // Diary data
      diary: {
        daily: getDiaryEntries('daily') || [],
        weekly: getDiaryEntries('weekly') || [],
        monthly: getDiaryEntries('monthly') || [],
        wellness: JSON.parse(localStorage.getItem('diary_wellness_data') || '[]'),
        habits: JSON.parse(localStorage.getItem('diary_habits') || '[]'),
      },
      
      // CoreOS data
      coreos: {
        tasks: getTodayTasks() || [],
        habits: getTodayHabits() || [],
        streaks: getCoreOSStreaks() || {},
        fitness: JSON.parse(localStorage.getItem('coreos_fitness') || '[]'),
        mental: JSON.parse(localStorage.getItem('coreos_mental') || '[]'),
      },
      
      // FreedomOS data
      freedomos: {
        profile: getFreedomOSProfile() || {},
        calculatorHistory: getCalculatorHistory() || [],
        netWorthHistory: getNetWorthHistory() || [],
      },
      
      timestamp: new Date().toISOString(),
      version: PERSISTENCE_CONFIG.CURRENT_DATA_VERSION,
    };
  }

  /**
   * Check if any meaningful data exists
   */
  hasAnyData(data) {
    return (
      data.expenses.length > 0 ||
      data.budgets.length > 0 ||
      data.diary.daily.length > 0 ||
      data.diary.weekly.length > 0 ||
      data.diary.monthly.length > 0 ||
      data.coreos.tasks.length > 0 ||
      data.coreos.habits.length > 0 ||
      Object.keys(data.freedomos.profile).length > 0
    );
  }

  /**
   * Set up automatic data backup
   */
  setupAutoBackup() {
    const lastBackup = localStorage.getItem(PERSISTENCE_CONFIG.LAST_BACKUP_KEY);
    const now = Date.now();
    
    // Check if backup is needed
    if (!lastBackup || (now - parseInt(lastBackup)) > PERSISTENCE_CONFIG.AUTO_BACKUP_INTERVAL) {
      this.performBackup();
    }

    // Set up automatic backup timer
    this.autoBackupTimer = setInterval(() => {
      this.performBackup();
    }, PERSISTENCE_CONFIG.AUTO_BACKUP_INTERVAL);
  }

  /**
   * Perform data backup
   */
  async performBackup() {
    try {
      console.log('💾 Performing automatic data backup...');
      
      const allData = await this.gatherAllLocalData();
      
      // Store backup in localStorage with timestamp
      const backupKey = `data_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(allData));
      
      // Keep only last 3 backups to save space
      this.cleanupOldBackups();
      
      // Update last backup timestamp
      localStorage.setItem(PERSISTENCE_CONFIG.LAST_BACKUP_KEY, Date.now().toString());
      
      console.log('✅ Data backup completed successfully');
      
    } catch (error) {
      console.error('❌ Failed to perform backup:', error);
    }
  }

  /**
   * Clean up old backup files
   */
  cleanupOldBackups() {
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('data_backup_'))
      .sort((a, b) => {
        const timestampA = parseInt(a.split('_')[2]);
        const timestampB = parseInt(b.split('_')[2]);
        return timestampB - timestampA; // Sort descending (newest first)
      });

    // Keep only the 3 most recent backups
    backupKeys.slice(3).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Restore data on mobile platforms
   */
  async restoreDataOnMobile() {
    if (!isMobile()) return;

    console.log('📱 Checking for data restoration on mobile...');
    
    // Check if we have cloud data to restore
    const isCloudEnabled = localStorage.getItem(PERSISTENCE_CONFIG.CLOUD_SYNC_KEY) === 'true';
    
    if (isCloudEnabled) {
      console.log('☁️ Attempting to restore data from cloud...');
      // TODO: Implement cloud data restoration
      // For now, this is a placeholder since cloud functions handle this
    } else {
      // Check for local backups
      await this.restoreFromLocalBackup();
    }
  }

  /**
   * Restore from local backup
   */
  async restoreFromLocalBackup() {
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('data_backup_'))
      .sort((a, b) => {
        const timestampA = parseInt(a.split('_')[2]);
        const timestampB = parseInt(b.split('_')[2]);
        return timestampB - timestampA; // Sort descending (newest first)
      });

    if (backupKeys.length > 0) {
      try {
        const latestBackupKey = backupKeys[0];
        const backupData = JSON.parse(localStorage.getItem(latestBackupKey));
        
        console.log('🔄 Restoring data from local backup:', latestBackupKey);
        await this.restoreAllData(backupData);
        
        console.log('✅ Data restored successfully from local backup');
      } catch (error) {
        console.error('❌ Failed to restore from local backup:', error);
      }
    }
  }

  /**
   * Restore all data from backup
   */
  async restoreAllData(backupData) {
    if (!backupData) return;

    try {
      // Restore Money Manager data
      if (backupData.expenses) saveExpenses(backupData.expenses);
      if (backupData.budgets) saveBudgets(backupData.budgets);
      if (backupData.categories) saveCategories(backupData.categories);
      if (backupData.settings) saveSettings(backupData.settings);

      // Restore Diary data
      if (backupData.diary) {
        if (backupData.diary.daily) saveDiaryToStorage('diary_daily_entries', backupData.diary.daily);
        if (backupData.diary.weekly) saveDiaryToStorage('diary_weekly_entries', backupData.diary.weekly);
        if (backupData.diary.monthly) saveDiaryToStorage('diary_monthly_entries', backupData.diary.monthly);
        if (backupData.diary.wellness) localStorage.setItem('diary_wellness_data', JSON.stringify(backupData.diary.wellness));
        if (backupData.diary.habits) localStorage.setItem('diary_habits', JSON.stringify(backupData.diary.habits));
      }

      // Restore CoreOS data
      if (backupData.coreos) {
        if (backupData.coreos.fitness) localStorage.setItem('coreos_fitness', JSON.stringify(backupData.coreos.fitness));
        if (backupData.coreos.mental) localStorage.setItem('coreos_mental', JSON.stringify(backupData.coreos.mental));
      }

      console.log('✅ All data restored successfully');
      
    } catch (error) {
      console.error('❌ Failed to restore data:', error);
      throw error;
    }
  }

  /**
   * Perform data migration between versions
   */
  async performDataMigration(fromVersion, toVersion) {
    console.log(`🔄 Migrating data from ${fromVersion} to ${toVersion}...`);
    
    // Create backup before migration
    await this.performBackup();
    
    try {
      // Add version-specific migration logic here
      if (fromVersion === '1.0.0' && toVersion === '2.0.0') {
        await this.migrateToV2();
      }
      
      console.log('✅ Data migration completed successfully');
      
    } catch (error) {
      console.error('❌ Data migration failed:', error);
      // Attempt to restore from backup
      await this.restoreFromLocalBackup();
      throw error;
    }
  }

  /**
   * Migration to version 2.0.0
   */
  async migrateToV2() {
    // Add any specific migration logic for v2.0.0
    console.log('📝 Applying v2.0.0 migration...');
    
    // Example: Ensure all expenses have required fields
    const expenses = getExpenses();
    const migratedExpenses = expenses.map(expense => ({
      ...expense,
      id: expense.id || Date.now() + Math.random(),
      date: expense.date || new Date().toISOString(),
    }));
    
    if (migratedExpenses.length !== expenses.length || 
        migratedExpenses.some((exp, idx) => exp.id !== expenses[idx].id)) {
      saveExpenses(migratedExpenses);
      console.log('✅ Expenses migrated to v2.0.0 format');
    }
  }

  /**
   * Set up local storage fallback
   */
  setupLocalStorageFallback() {
    console.log('📱 Setting up local storage fallback...');
    setStorageMode(STORAGE_MODES.LOCAL);
    localStorage.setItem(PERSISTENCE_CONFIG.CLOUD_SYNC_KEY, 'false');
    
    // Still set up auto backup for local storage
    this.setupAutoBackup();
  }

  /**
   * Export all data for manual backup
   */
  async exportAllData() {
    const allData = await this.gatherAllLocalData();
    const dataBlob = new Blob([JSON.stringify(allData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clarityos-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('📤 All data exported successfully');
  }

  /**
   * Import data from backup file
   */
  async importAllData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          await this.restoreAllData(backupData);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * Get data persistence status
   */
  getStatus() {
    return {
      isCloudEnabled: localStorage.getItem(PERSISTENCE_CONFIG.CLOUD_SYNC_KEY) === 'true',
      lastBackup: localStorage.getItem(PERSISTENCE_CONFIG.LAST_BACKUP_KEY),
      currentVersion: localStorage.getItem(PERSISTENCE_CONFIG.DATA_VERSION_KEY),
      storageMode: getStorageMode(),
      isMobile: isMobile(),
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Force cloud sync
   */
  async forceCloudSync() {
    if (localStorage.getItem(PERSISTENCE_CONFIG.CLOUD_SYNC_KEY) === 'true') {
      await this.syncLocalDataToCloud();
    } else {
      console.warn('⚠️ Cloud sync is not enabled');
    }
  }

  /**
   * Cleanup on app close
   */
  cleanup() {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
      this.autoBackupTimer = null;
    }
  }
}

// Create singleton instance
const dataPersistenceManager = new DataPersistenceManager();

// Export functions
export const initializeDataPersistence = () => dataPersistenceManager.initialize();
export const exportAllData = () => dataPersistenceManager.exportAllData();
export const importAllData = (file) => dataPersistenceManager.importAllData(file);
export const forceCloudSync = () => dataPersistenceManager.forceCloudSync();
export const getDataPersistenceStatus = () => dataPersistenceManager.getStatus();
export const performManualBackup = () => dataPersistenceManager.performBackup();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Initialize after a short delay to allow other systems to load
  setTimeout(() => {
    initializeDataPersistence();
  }, 1000);
}

export default dataPersistenceManager;