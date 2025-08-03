import React, { useState, useEffect } from 'react';
import { 
  getStorageMode, 
  setStorageMode, 
  getStorageModeInfo, 
  STORAGE_MODES 
} from '../utils/storageManager';
import toast from 'react-hot-toast';

const StorageModeToggle = () => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageModeInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
      toast.error('Failed to check storage options');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = async (newMode) => {
    if (switching) return;
    
    setSwitching(true);
    try {
      if (newMode === STORAGE_MODES.SERVER && !storageInfo.serverAvailable) {
        toast.error('Server storage is not available. Please check your database connection.');
        return;
      }

      setStorageMode(newMode);
      await loadStorageInfo();
      
      if (newMode === STORAGE_MODES.SERVER) {
        toast.success('🌥️ Switched to server storage! Your data is now saved in the cloud.');
      } else {
        toast.success('💾 Switched to local storage! Your data is saved in your browser.');
      }
      
      // Suggest page refresh for components to pick up the change
      setTimeout(() => {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span>Refresh the page to see all your data with the new storage mode.</span>
            <button
              onClick={() => {
                window.location.reload();
                toast.dismiss(t.id);
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Refresh Now
            </button>
          </div>
        ), { duration: 8000 });
      }, 1000);
      
    } catch (error) {
      console.error('Failed to switch storage mode:', error);
      toast.error('Failed to switch storage mode');
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600">Checking storage options...</span>
      </div>
    );
  }

  if (!storageInfo) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Failed to load storage options</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Data Storage Mode</h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            storageInfo.currentMode === STORAGE_MODES.SERVER 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {storageInfo.currentMode === STORAGE_MODES.SERVER ? '🌥️ Cloud' : '💾 Local'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Local Storage Option */}
        <div className={`p-3 border rounded-lg cursor-pointer transition-all ${
          storageInfo.currentMode === STORAGE_MODES.LOCAL 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => handleModeChange(STORAGE_MODES.LOCAL)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">💾</span>
                <h4 className="font-medium">Local Storage</h4>
                {storageInfo.currentMode === STORAGE_MODES.LOCAL && (
                  <span className="text-blue-600 text-sm">• Current</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Data is stored in your browser. Fast but only available on this device.
              </p>
            </div>
            <input
              type="radio"
              checked={storageInfo.currentMode === STORAGE_MODES.LOCAL}
              onChange={() => {}}
              className="mt-1"
              disabled={switching}
            />
          </div>
        </div>

        {/* Server Storage Option */}
        <div className={`p-3 border rounded-lg cursor-pointer transition-all ${
          !storageInfo.serverAvailable 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
            : storageInfo.currentMode === STORAGE_MODES.SERVER 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => storageInfo.serverAvailable && handleModeChange(STORAGE_MODES.SERVER)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌥️</span>
                <h4 className="font-medium">Cloud Storage</h4>
                {storageInfo.currentMode === STORAGE_MODES.SERVER && (
                  <span className="text-green-600 text-sm">• Current</span>
                )}
                {!storageInfo.serverAvailable && (
                  <span className="text-red-600 text-sm">• Unavailable</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Data is stored in your Neon database. Sync across devices and secure backup.
              </p>
              {!storageInfo.serverAvailable && (
                <p className="text-sm text-red-600 mt-1">
                  Database connection not configured. Please set up your Neon database first.
                </p>
              )}
            </div>
            <input
              type="radio"
              checked={storageInfo.currentMode === STORAGE_MODES.SERVER}
              onChange={() => {}}
              className="mt-1"
              disabled={!storageInfo.serverAvailable || switching}
            />
          </div>
        </div>
      </div>

      {switching && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700">Switching storage mode...</span>
        </div>
      )}

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <strong>Note:</strong> Switching storage modes doesn't automatically migrate your data. 
        Use the database test tool to migrate data between storage modes.
      </div>
    </div>
  );
};

export default StorageModeToggle;