import { useEffect } from 'react';
import { loadAllSampleData, isSampleDataLoaded } from '../utils/sampleData';
import { getExpenses } from '../utils/storage';
import { getEntries } from '../utils/diaryStorage';

// Hook to automatically load sample data for new users
export const useSampleDataLoader = () => {
  useEffect(() => {
    const checkAndLoadSampleData = () => {
      // Check if sample data is already loaded
      if (isSampleDataLoaded()) {
        return;
      }

      // Check if user has any data at all
      const hasMoneyManagerData = getExpenses().length > 0;
      const hasDiaryData = getEntries('daily').length > 0;
      const hasCoreOSData = localStorage.getItem('coreos_tasks') && 
                            JSON.parse(localStorage.getItem('coreos_tasks') || '[]').length > 0;
      const hasFreedomOSData = localStorage.getItem('freedomos_networth') && 
                               JSON.parse(localStorage.getItem('freedomos_networth') || '[]').length > 0;

      // If user has no data at all, they're a new user - load sample data
      if (!hasMoneyManagerData && !hasDiaryData && !hasCoreOSData && !hasFreedomOSData) {
        console.log('New user detected, loading sample data...');
        try {
          loadAllSampleData();
        } catch (error) {
          console.error('Failed to load sample data:', error);
        }
      }
    };

    // Run the check after a small delay to ensure all storage systems are initialized
    const timeoutId = setTimeout(checkAndLoadSampleData, 1000);

    return () => clearTimeout(timeoutId);
  }, []);
};

export default useSampleDataLoader;