import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  BookOpen 
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getEntryForDate } from '../../utils/diaryStorage';

const DiaryCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getEntryStatus = (date) => {
    const dailyEntry = getEntryForDate('daily', date);
    const weeklyEntry = getEntryForDate('weekly', date);
    const monthlyEntry = getEntryForDate('monthly', date);
    
    return {
      daily: !!dailyEntry,
      weekly: !!weeklyEntry,
      monthly: !!monthlyEntry,
      hasAny: !!(dailyEntry || weeklyEntry || monthlyEntry)
    };
  };

  const getJournalStatus = (date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfMonth = date.getDate();
    const today = new Date();
    
    const dailyEntry = getEntryForDate('daily', date);
    const weeklyEntry = getEntryForDate('weekly', date);
    const monthlyEntry = getEntryForDate('monthly', date);
    
    return {
      daily: {
        completed: !!dailyEntry,
        isDue: true, // Always due
        isBlurred: false,
        isClickable: true
      },
      weekly: {
        completed: !!weeklyEntry,
        isDue: dayOfWeek === 0, // Only due on Sunday
        isBlurred: dayOfWeek !== 0 && !weeklyEntry,
        isClickable: dayOfWeek === 0 || !!weeklyEntry
      },
      monthly: {
        completed: !!monthlyEntry,
        isDue: dayOfMonth === 1, // Only due on 1st of month
        isBlurred: dayOfMonth !== 1 && !monthlyEntry,
        isClickable: dayOfMonth === 1 || !!monthlyEntry
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card variant="glass" className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="space-y-2">
              <h1 className="text-gradient flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 animate-pulse" />
                Diary Calendar
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Track your journaling journey
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              
              <Button variant="ghost" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {monthDays.map((day) => {
                const status = getEntryStatus(day);
                const isSelected = isSameDay(day, selectedDate);
                
                return (
                  <motion.button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`relative p-3 text-sm rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-gray-900 dark:text-gray-100">
                      {format(day, 'd')}
                    </div>
                    
                    {/* Entry Indicators */}
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      {status.daily && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      {status.weekly && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      {status.monthly && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Daily Entry</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Entry</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Entry</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Selected Date Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Daily Status */}
              {(() => {
                const status = getJournalStatus(selectedDate);
                let statusClass = '';
                
                if (status.daily.completed) {
                  statusClass = 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30';
                } else if (status.daily.isDue) {
                  statusClass = 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30';
                } else {
                  statusClass = 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30 opacity-50';
                }
                
                return (
                  <div className={`p-4 rounded-lg border ${statusClass} ${
                    status.daily.isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-not-allowed'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {status.daily.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">Daily Entry</span>
                    </div>
                  </div>
                );
              })()}

              {/* Weekly Status */}
              {(() => {
                const status = getJournalStatus(selectedDate);
                let statusClass = '';
                
                if (status.weekly.completed) {
                  statusClass = 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30';
                } else if (status.weekly.isDue) {
                  statusClass = 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30';
                } else if (status.weekly.isBlurred) {
                  statusClass = 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30 opacity-50';
                } else {
                  statusClass = 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30';
                }
                
                return (
                  <div className={`p-4 rounded-lg border ${statusClass} ${
                    status.weekly.isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-not-allowed'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {status.weekly.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : status.weekly.isBlurred ? (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`font-medium ${status.weekly.isBlurred ? 'text-gray-400' : ''}`}>
                        Weekly Entry
                      </span>
                      {status.weekly.isDue && !status.weekly.completed && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Due</span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Monthly Status */}
              {(() => {
                const status = getJournalStatus(selectedDate);
                let statusClass = '';
                
                if (status.monthly.completed) {
                  statusClass = 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30';
                } else if (status.monthly.isDue) {
                  statusClass = 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30';
                } else if (status.monthly.isBlurred) {
                  statusClass = 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30 opacity-50';
                } else {
                  statusClass = 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30';
                }
                
                return (
                  <div className={`p-4 rounded-lg border ${statusClass} ${
                    status.monthly.isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-not-allowed'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {status.monthly.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : status.monthly.isBlurred ? (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`font-medium ${status.monthly.isBlurred ? 'text-gray-400' : ''}`}>
                        Monthly Entry
                      </span>
                      {status.monthly.isDue && !status.monthly.completed && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Due</span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default DiaryCalendar; 