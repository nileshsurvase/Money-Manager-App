import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

class DiaryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DiaryErrorBoundary caught an error:', error, errorInfo);
    
    // If it's a date-related error, try to clean up corrupted data
    if (error.message && error.message.includes('Invalid time value')) {
      console.log('Detected date-related error, cleaning up data...');
      this.cleanupCorruptedData();
    }
  }

  cleanupCorruptedData = () => {
    try {
      const keysToRemove = [
        'diary_daily_entries',
        'diary_weekly_entries', 
        'diary_monthly_entries',
        'diary_wellness_data',
        'diary_habits',
        'diary_habit_completions'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('Corrupted diary data cleaned up');
    } catch (error) {
      console.error('Failed to cleanup corrupted data:', error);
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8 max-w-md mx-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Diary Loading Error
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              There was an issue loading your diary data. This might be due to corrupted entries with invalid dates. 
              We've attempted to clean up the problematic data automatically.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry Loading</span>
              </Button>
              
              <details className="text-left">
                <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DiaryErrorBoundary;