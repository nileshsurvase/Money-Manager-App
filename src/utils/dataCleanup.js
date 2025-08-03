// Data cleanup utility for fixing corrupted diary entries
export const cleanupCorruptedData = () => {
  try {
    console.log('🧹 Starting data cleanup...');
    
    const diaryKeys = [
      'diary_daily_entries',
      'diary_weekly_entries', 
      'diary_monthly_entries',
      'diary_wellness_data',
      'diary_habits',
      'diary_habit_completions'
    ];
    
    let cleanedCount = 0;
    
    diaryKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            // Filter out entries with invalid dates
            const cleaned = parsed.filter(entry => {
              if (!entry) return false;
              
              // Check main date field
              if (entry.date && isNaN(new Date(entry.date))) {
                console.log(`❌ Removing entry with invalid date: ${entry.date}`);
                cleanedCount++;
                return false;
              }
              
              // Check createdAt field
              if (entry.createdAt && isNaN(new Date(entry.createdAt))) {
                console.log(`❌ Removing entry with invalid createdAt: ${entry.createdAt}`);
                cleanedCount++;
                return false;
              }
              
              // Check updatedAt field
              if (entry.updatedAt && isNaN(new Date(entry.updatedAt))) {
                console.log(`❌ Removing entry with invalid updatedAt: ${entry.updatedAt}`);
                cleanedCount++;
                return false;
              }
              
              return true;
            });
            
            // Save cleaned data back
            localStorage.setItem(key, JSON.stringify(cleaned));
            console.log(`✅ Cleaned ${key}: ${parsed.length} → ${cleaned.length} entries`);
          }
        }
      } catch (error) {
        console.error(`Error cleaning ${key}:`, error);
        // If data is completely corrupted, remove it
        localStorage.removeItem(key);
        console.log(`🗑️ Removed corrupted ${key}`);
      }
    });
    
    console.log(`✨ Data cleanup complete! Removed ${cleanedCount} corrupted entries.`);
    console.log('🔄 Please refresh the page to see the changes.');
    
    return {
      success: true,
      cleanedCount,
      message: 'Data cleanup completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Data cleanup failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Auto-cleanup on import if there are any issues
export const autoCleanupOnLoad = () => {
  try {
    // Check if there are any existing entries with invalid dates
    const diaryEntries = localStorage.getItem('diary_daily_entries');
    if (diaryEntries) {
      const parsed = JSON.parse(diaryEntries);
      const hasInvalidDates = parsed.some(entry => 
        (entry.date && isNaN(new Date(entry.date))) ||
        (entry.createdAt && isNaN(new Date(entry.createdAt)))
      );
      
      if (hasInvalidDates) {
        console.log('🔧 Detected corrupted diary data, running auto-cleanup...');
        cleanupCorruptedData();
      }
    }
  } catch (error) {
    console.error('Auto-cleanup failed:', error);
  }
};

// Complete data reset function
export const resetAllDiaryData = () => {
  console.log('🔄 Performing complete diary data reset...');
  
  const keysToRemove = [
    'diary_daily_entries',
    'diary_weekly_entries', 
    'diary_monthly_entries',
    'diary_wellness_data',
    'diary_habits',
    'diary_habit_completions',
    'sample_data_loaded'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
  });
  
  console.log('✨ Complete reset done! Refreshing page...');
  setTimeout(() => window.location.reload(), 500);
};

// Export for browser console usage
if (typeof window !== 'undefined') {
  window.cleanupDiaryData = cleanupCorruptedData;
  window.autoCleanupDiaryData = autoCleanupOnLoad;
  window.resetAllDiaryData = resetAllDiaryData;
}