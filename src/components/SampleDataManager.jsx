import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Trash2, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from './Button';
import { loadAllSampleData, clearAllSampleData, isSampleDataLoaded } from '../utils/sampleData';
import { cleanupCorruptedData } from '../utils/dataCleanup';

const SampleDataManager = () => {
  const [isLoaded, setIsLoaded] = useState(isSampleDataLoaded());
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoadSampleData = async () => {
    setLoading(true);
    try {
      // First cleanup any corrupted data
      console.log('Cleaning up any corrupted data before loading sample data...');
      cleanupCorruptedData();
      
      // Then load sample data
      const success = loadAllSampleData();
      if (success) {
        setIsLoaded(true);
        // Reload the page to show new data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to load sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSampleData = async () => {
    setLoading(true);
    try {
      const success = clearAllSampleData();
      if (success) {
        setIsLoaded(false);
        setShowConfirm(false);
        // Reload the page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to clear sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Experience All Features
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Load sample data to explore all graphs, analytics, and features across Money Manager, MyDiary, CoreOS, and FreedomOS.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleLoadSampleData}
                disabled={loading}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Download className="h-3 w-3" />
                    <span>Load Sample Data</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-4"
      >
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs font-medium text-green-900 dark:text-green-100">
                  Sample Data Active
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  All features populated
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(true)}
              className="text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Clear Sample Data?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      This will remove all sample data from Money Manager, MyDiary, CoreOS, and FreedomOS. This action cannot be undone.
                    </p>
                    
                    <div className="flex items-center space-x-3 mt-6">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowConfirm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleClearSampleData}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                            <span>Clearing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Trash2 className="h-3 w-3" />
                            <span>Clear All</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default SampleDataManager;