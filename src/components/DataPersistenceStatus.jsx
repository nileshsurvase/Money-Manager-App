import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  Smartphone, 
  Shield, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Database,
  HardDrive
} from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { 
  getDataPersistenceStatus, 
  performManualBackup, 
  exportAllData,
  forceCloudSync 
} from '../utils/dataPersistence';

const DataPersistenceStatus = () => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = () => {
    try {
      const currentStatus = getDataPersistenceStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Failed to load persistence status:', error);
    }
  };

  const handleManualBackup = async () => {
    setIsLoading(true);
    setLastAction('Creating backup...');
    
    try {
      await performManualBackup();
      setLastAction('✅ Backup created successfully');
      loadStatus();
    } catch (error) {
      setLastAction('❌ Backup failed');
      console.error('Manual backup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    setLastAction('Exporting data...');
    
    try {
      await exportAllData();
      setLastAction('✅ Data exported successfully');
    } catch (error) {
      setLastAction('❌ Export failed');
      console.error('Data export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloudSync = async () => {
    setIsLoading(true);
    setLastAction('Syncing to cloud...');
    
    try {
      await forceCloudSync();
      setLastAction('✅ Cloud sync completed');
      loadStatus();
    } catch (error) {
      setLastAction('❌ Cloud sync failed');
      console.error('Cloud sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastBackup = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  if (!status) {
    return (
      <Card className="animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="glass" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Data Protection
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your data is safe across app updates
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  {status.isCloudEnabled ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  )}
                  <span className="text-sm font-medium">
                    {status.isCloudEnabled ? 'Protected' : 'Local Only'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {status.isCloudEnabled ? (
                    <Cloud className="h-5 w-5 text-blue-500" />
                  ) : (
                    <HardDrive className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Storage Mode
                </div>
                <div className="text-sm font-semibold">
                  {status.isCloudEnabled ? 'Cloud + Local' : 'Local Only'}
                </div>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Database className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Last Backup
                </div>
                <div className="text-sm font-semibold">
                  {formatLastBackup(status.lastBackup).split(' at')[0]}
                </div>
              </div>
            </div>

            {status.isMobile && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Mobile: Android backup enabled + automatic cloud sync
                </span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="glass">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Data Protection Actions
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={handleManualBackup}
                disabled={isLoading}
                variant="secondary"
                className="flex items-center justify-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span>Backup Now</span>
              </Button>

              <Button
                onClick={handleExportData}
                disabled={isLoading}
                variant="secondary"
                className="flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export All</span>
              </Button>

              {status.isCloudEnabled && (
                <Button
                  onClick={handleCloudSync}
                  disabled={isLoading}
                  variant="secondary"
                  className="flex items-center justify-center space-x-2"
                >
                  <Cloud className="h-4 w-4" />
                  <span>Sync Cloud</span>
                </Button>
              )}
            </div>

            {lastAction && (
              <div className="text-sm text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {lastAction}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Technical Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <details className="group">
          <summary className="cursor-pointer list-none">
            <Card variant="glass" className="group-open:rounded-b-none transition-all">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Technical Details
                </span>
                <RefreshCw className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform" />
              </div>
            </Card>
          </summary>
          
          <Card className="rounded-t-none border-t-0 bg-gray-50 dark:bg-gray-800/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">App Version:</span>
                <span className="font-mono">{status.currentVersion || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Platform:</span>
                <span className="font-mono">{status.isMobile ? 'Mobile (Android)' : 'Web'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Storage Mode:</span>
                <span className="font-mono">{status.storageMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Initialized:</span>
                <span className="font-mono">{status.isInitialized ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Backup:</span>
                <span className="font-mono text-xs">{formatLastBackup(status.lastBackup)}</span>
              </div>
            </div>
          </Card>
        </details>
      </motion.div>
    </div>
  );
};

export default DataPersistenceStatus;