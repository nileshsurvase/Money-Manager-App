import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Quote,
  Flame,
  Target,
  Clock,
  Heart,
  Sparkles,
  PenTool,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Brain,
  Activity,
  Zap,
  Plus,
  X,
  Check,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Trash,
  Edit,
  Save
} from 'lucide-react';
import { format, isToday, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  calculateStreak, 
  hasEntryForToday, 
  getRandomQuote, 
  getEmotionAnalytics,
  getEntries,
  EMOTIONS,
  getTodaysDue,
  deleteEntry,
  // Wellness tracking imports
  getTodayWellness,
  getWellnessAnalytics,
  getWellnessStreak,
  getMoodIcon
} from '../../utils/diaryStorage';
import { autoCleanupOnLoad } from '../../utils/dataCleanup';

const DiaryDashboard = () => {
  const [streaks, setStreaks] = useState(() => {
    try {
      return {
        daily: { current: 0, longest: 0 },
        weekly: { current: 0, longest: 0 },
        monthly: { current: 0, longest: 0 }
      };
    } catch (error) {
      console.error('Error initializing streaks:', error);
      return {
        daily: { current: 0, longest: 0 },
        weekly: { current: 0, longest: 0 },
        monthly: { current: 0, longest: 0 }
      };
    }
  });
  const [todayStatus, setTodayStatus] = useState({
    daily: false,
    weekly: false,
    monthly: false
  });
  const [quote, setQuote] = useState(null);
  const [emotionAnalytics, setEmotionAnalytics] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [dueToday, setDueToday] = useState([]);
  
  // Wellness tracking state
  const [wellnessData, setWellnessData] = useState(null);
  const [wellnessAnalytics, setWellnessAnalytics] = useState(null);
  const [wellnessStreak, setWellnessStreak] = useState({ current: 0, longest: 0 });

  // Habit tracking state
  const [habits, setHabits] = useState([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [flippedHabit, setFlippedHabit] = useState(null);
  const [habitCalendarView, setHabitCalendarView] = useState(new Date());
  
  // Habit edit/delete state
  const [editingHabit, setEditingHabit] = useState(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [showDeleteHabitConfirm, setShowDeleteHabitConfirm] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);


  useEffect(() => {
    try {
      loadDashboardData();
    } catch (error) {
      console.error('Error in loadDashboardData:', error);
    }
  }, []);

  const loadDashboardData = () => {
    console.log('Starting loadDashboardData...');
    
    // Auto-cleanup any corrupted data first
    try {
      console.log('Running auto cleanup...');
      autoCleanupOnLoad();
      console.log('Auto cleanup completed');
    } catch (error) {
      console.error('Auto-cleanup failed:', error);
    }
    
    // Load streaks
    try {
      console.log('Loading streaks...');
      const dailyStreak = calculateStreak('daily');
      console.log('Daily streak loaded:', dailyStreak);
      const weeklyStreak = calculateStreak('weekly');
      console.log('Weekly streak loaded:', weeklyStreak);
      const monthlyStreak = calculateStreak('monthly');
      console.log('Monthly streak loaded:', monthlyStreak);
      
      setStreaks({
        daily: dailyStreak,
        weekly: weeklyStreak,
        monthly: monthlyStreak
      });
      console.log('Streaks set successfully');
    } catch (error) {
      console.error('Error loading streaks:', error);
      setStreaks({
        daily: { current: 0, longest: 0 },
        weekly: { current: 0, longest: 0 },
        monthly: { current: 0, longest: 0 }
      });
    }

    // Check today's status
    setTodayStatus({
      daily: hasEntryForToday('daily'),
      weekly: hasEntryForToday('weekly'),
      monthly: hasEntryForToday('monthly')
    });

    // Get today's due journals
    setDueToday(getTodaysDue());

    // Get quote of the day
    setQuote(getRandomQuote());

    // Get emotion analytics
    setEmotionAnalytics(getEmotionAnalytics());

    // Get recent entries (last 5 from all types)
    try {
      const allEntries = [
        ...getEntries('daily').map(e => ({ ...e, type: 'daily' })),
        ...getEntries('weekly').map(e => ({ ...e, type: 'weekly' })),
        ...getEntries('monthly').map(e => ({ ...e, type: 'monthly' }))
      ];
      
      const sortedEntries = allEntries
        .filter(entry => entry.createdAt && !isNaN(new Date(entry.createdAt))) // Filter valid dates
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setRecentEntries(sortedEntries);
    } catch (error) {
      console.error('Error loading recent entries:', error);
      setRecentEntries([]);
    }

    // Load wellness data
    setWellnessData(getTodayWellness());
    setWellnessAnalytics(getWellnessAnalytics(7)); // Last 7 days
    setWellnessStreak(getWellnessStreak());

    // Load habits data
    loadHabitsData();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'daily': return PenTool;
      case 'weekly': return BookOpen;
      case 'monthly': return Calendar;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'daily': return 'from-emerald-500 to-green-500';
      case 'weekly': return 'from-green-500 to-teal-500';
      case 'monthly': return 'from-teal-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeRoute = (type) => {
    switch (type) {
      case 'daily': return '/diary/daily';
      case 'weekly': return '/diary/weekly';
      case 'monthly': return '/diary/monthly';
      default: return '/diary';
    }
  };

  const getJournalStatus = (type) => {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayOfMonth = today.getDate();
      
      const hasEntry = hasEntryForToday(type);
      
      if (type === 'daily') {
        return {
          completed: hasEntry,
          isDue: true,
          isBlurred: false
        };
      } else if (type === 'weekly') {
        return {
          completed: hasEntry,
          isDue: dayOfWeek === 0, // Only due on Sunday
          isBlurred: dayOfWeek !== 0 && !hasEntry
        };
      } else if (type === 'monthly') {
        return {
          completed: hasEntry,
          isDue: dayOfMonth === 1, // Only due on 1st of month
          isBlurred: dayOfMonth !== 1 && !hasEntry
        };
      }
      
      return { completed: false, isDue: false, isBlurred: false };
    } catch (error) {
      console.error('Error in getJournalStatus:', error);
      return { completed: false, isDue: false, isBlurred: false };
    }
  };

  const getMostFrequentEmotion = () => {
    if (emotionAnalytics.length === 0) return null;
    return emotionAnalytics.reduce((prev, current) => 
      prev.count > current.count ? prev : current
    );
  };

  const mostFrequentEmotion = getMostFrequentEmotion();

  // Habit tracking functions
  const loadHabitsData = () => {
    const savedHabits = JSON.parse(localStorage.getItem('diary_habits') || '[]');
    if (savedHabits.length === 0) {
      // Add some default habits for demonstration
      const defaultHabits = [
        { id: 1, name: 'Wake up early', color: 'blue', createdAt: new Date().toISOString() },
        { id: 2, name: 'Exercise', color: 'green', createdAt: new Date().toISOString() },
        { id: 3, name: 'Read', color: 'purple', createdAt: new Date().toISOString() }
      ];
      setHabits(defaultHabits);
      localStorage.setItem('diary_habits', JSON.stringify(defaultHabits));
    } else {
      setHabits(savedHabits);
    }
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    
    const colors = ['blue', 'green', 'purple', 'pink', 'orange', 'teal'];
    const newHabit = {
      id: Date.now(),
      name: newHabitName,
      color: colors[habits.length % colors.length],
      createdAt: new Date().toISOString()
    };
    
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    localStorage.setItem('diary_habits', JSON.stringify(updatedHabits));
    setNewHabitName('');
    setShowAddHabit(false);
  };

  const startEditHabit = (habit) => {
    setEditingHabit(habit.id);
    setEditHabitName(habit.name);
  };

  const saveEditHabit = () => {
    if (!editHabitName.trim()) return;
    
    const updatedHabits = habits.map(habit => 
      habit.id === editingHabit 
        ? { ...habit, name: editHabitName, updatedAt: new Date().toISOString() }
        : habit
    );
    
    setHabits(updatedHabits);
    localStorage.setItem('diary_habits', JSON.stringify(updatedHabits));
    setEditingHabit(null);
    setEditHabitName('');
  };

  const cancelEditHabit = () => {
    setEditingHabit(null);
    setEditHabitName('');
  };

  const confirmDeleteHabit = (habit) => {
    setHabitToDelete(habit);
    setShowDeleteHabitConfirm(true);
  };

  const deleteHabit = () => {
    if (!habitToDelete) return;
    
    // Remove habit from habits list
    const updatedHabits = habits.filter(habit => habit.id !== habitToDelete.id);
    setHabits(updatedHabits);
    localStorage.setItem('diary_habits', JSON.stringify(updatedHabits));
    
    // Remove all completions for this habit
    const completedHabits = JSON.parse(localStorage.getItem('diary_habit_completions') || '{}');
    Object.keys(completedHabits).forEach(dateKey => {
      const habitIndex = completedHabits[dateKey].indexOf(habitToDelete.id);
      if (habitIndex > -1) {
        completedHabits[dateKey].splice(habitIndex, 1);
      }
    });
    localStorage.setItem('diary_habit_completions', JSON.stringify(completedHabits));
    
    setShowDeleteHabitConfirm(false);
    setHabitToDelete(null);
  };

  const toggleHabitCompletion = (habitId, date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const completedHabits = JSON.parse(localStorage.getItem('diary_habit_completions') || '{}');
    
    if (!completedHabits[dateKey]) {
      completedHabits[dateKey] = [];
    }
    
    const habitIndex = completedHabits[dateKey].indexOf(habitId);
    if (habitIndex > -1) {
      completedHabits[dateKey].splice(habitIndex, 1);
    } else {
      completedHabits[dateKey].push(habitId);
    }
    
    localStorage.setItem('diary_habit_completions', JSON.stringify(completedHabits));
  };

  const isHabitCompleted = (habitId, date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const completedHabits = JSON.parse(localStorage.getItem('diary_habit_completions') || '{}');
    const dayCompletions = completedHabits[dateKey];
    return Array.isArray(dayCompletions) && dayCompletions.includes(habitId) || false;
  };

  const getHabitStreak = (habitId) => {
    const completedHabits = JSON.parse(localStorage.getItem('diary_habit_completions') || '{}');
    const today = new Date();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    // Calculate current streak (backwards from today)
    for (let i = 0; i < 365; i++) {
      const checkDate = subDays(today, i);
      const dateKey = format(checkDate, 'yyyy-MM-dd');
      
      if (Array.isArray(completedHabits[dateKey]) && completedHabits[dateKey].includes(habitId)) {
        if (i === currentStreak) {
          currentStreak++;
        }
        tempStreak++;
      } else {
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
        tempStreak = 0;
      }
    }
    
    bestStreak = Math.max(bestStreak, tempStreak);
    return { current: currentStreak, best: bestStreak };
  };

  const getHabitCompletionDates = (habitId) => {
    const completedHabits = JSON.parse(localStorage.getItem('diary_habit_completions') || '{}');
    const dates = [];
    
    Object.keys(completedHabits).forEach(dateKey => {
      if (Array.isArray(completedHabits[dateKey]) && completedHabits[dateKey].includes(habitId)) {
        dates.push(new Date(dateKey));
      }
    });
    
    return dates.sort((a, b) => b - a);
  };

  const getHabitColor = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 border-blue-200',
      green: 'bg-green-500 text-green-600 border-green-200',
      purple: 'bg-purple-500 text-purple-600 border-purple-200',
      pink: 'bg-pink-500 text-pink-600 border-pink-200',
      orange: 'bg-orange-500 text-orange-600 border-orange-200',
      teal: 'bg-teal-500 text-teal-600 border-teal-200'
    };
    return colors[color] || colors.blue;
  };

  const getScrollableDays = () => {
    const days = [];
    // Show current day on left (index 0), then previous 3 days
    for (let i = 0; i < 4; i++) { // Show only 4 days
      days.push(subDays(new Date(), i));
    }
    return days;
  };

  const getHabitTotalStats = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return { totalDays: 0, completedDays: 0, completionRate: 0, firstCompletionDate: null };
    
    const completedHabits = JSON.parse(localStorage.getItem('diary_habit_completions') || '{}');
    let completedDays = 0;
    let firstCompletionDate = null;
    let lastCompletionDate = null;
    
    // Find all completion dates for this habit
    const completionDates = [];
    Object.keys(completedHabits).forEach(dateKey => {
      if (Array.isArray(completedHabits[dateKey]) && completedHabits[dateKey].includes(habitId)) {
        const date = new Date(dateKey);
        completionDates.push(date);
        completedDays++;
      }
    });
    
    if (completionDates.length === 0) {
      return { totalDays: 0, completedDays: 0, completionRate: 0, firstCompletionDate: null };
    }
    
    // Sort dates to find first and last completion
    completionDates.sort((a, b) => a - b);
    firstCompletionDate = completionDates[0];
    lastCompletionDate = completionDates[completionDates.length - 1];
    
    // Calculate total days from first completion to today
    const today = new Date();
    const totalDays = Math.floor((today - firstCompletionDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    
    return { totalDays, completedDays, completionRate, firstCompletionDate, lastCompletionDate };
  };

  const scrollableDays = getScrollableDays();

  // Calendar navigation functions
  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setHabitCalendarView(subMonths(habitCalendarView, 1));
    } else {
      setHabitCalendarView(addMonths(habitCalendarView, 1));
    }
  };

  // Delete entry handler
  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;
    
    try {
      await deleteEntry(entryToDelete.id, entryToDelete.type);
      setShowDeleteConfirm(false);
      setEntryToDelete(null);
      // Reload dashboard data to refresh the recent entries
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const confirmDelete = (entry) => {
    setEntryToDelete(entry);
    setShowDeleteConfirm(true);
  };



  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card variant="glass" className="relative">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <h1 className="text-gradient flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 animate-pulse" />
                My Diary Dashboard
              </h1>
            </div>
            
            {/* Journal Status */}
            <div className="flex flex-wrap gap-3">
              {Object.entries(todayStatus).map(([type, completed]) => {
                const status = getJournalStatus(type);
                let statusClass = '';
                let isClickable = true;
                
                if (status.completed) {
                  statusClass = 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
                } else if (status.isDue) {
                  statusClass = 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
                } else if (status.isBlurred) {
                  statusClass = 'bg-gray-100 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 opacity-50';
                  isClickable = false;
                } else {
                  statusClass = 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
                }
                
                return (
                  <div
                    key={type}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium ${statusClass} ${
                      isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-not-allowed'
                    }`}
                  >
                    {status.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span className="capitalize">{type} Journal</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Today's Due Section */}
      {dueToday.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-red-500 animate-pulse" />
                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                  Due Today
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dueToday.map((dueItem) => {
                  const Icon = getTypeIcon(dueItem.type);
                  return (
                    <motion.div
                      key={dueItem.type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link to={getTypeRoute(dueItem.type)}>
                        <div className="p-4 rounded-xl border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 transition-all duration-200 hover:shadow-md">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-red-200 dark:bg-red-800">
                              <Icon className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                {dueItem.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {dueItem.description}
                              </p>
                              <div className="flex items-center space-x-1 mt-1">
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                  Due Today
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Streaks & Stats */}
      <div className="grid grid-cols-3 gap-4">
        {['daily', 'weekly', 'monthly'].map((type, index) => {
          const streak = streaks[type];
          const Icon = getTypeIcon(type);
          const colorClass = getTypeColor(type);
          
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card variant="stat">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize mb-1">
                    {type} Streak
                  </p>
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {streak.current}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Best: {streak.longest}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Habit Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="-mb-4"
      >
        <div className="relative perspective-1000" style={{ minHeight: `${Math.max(400, habits.length * 60 + 200)}px` }}>
          <motion.div
            className={`w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
              flippedHabit ? 'rotate-y-180' : ''
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front Side - Habit Grid */}
            <div className="absolute inset-0 backface-hidden">
              <Card className="habit-tracker-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-indigo-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Habit Tracker
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => setShowAddHabit(true)}
                      className="p-2"
                    >
                      <Plus className="h-5 w-5 text-indigo-500" />
                    </Button>
                  </div>

                  {showAddHabit && (
                    <div className="flex space-x-2 mb-4">
                      <input
                        type="text"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder="Enter habit name..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                      />
                      <Button variant="primary" size="small" onClick={addHabit}>
                        Add
                      </Button>
                      <Button variant="ghost" size="small" onClick={() => setShowAddHabit(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Habit Grid Header */}
                  <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-600 dark:text-gray-400 habit-grid-header mb-4">
                    <div className="text-left">Habit</div>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      {scrollableDays.map((day, index) => (
                        <div key={index} className="text-center">
                          <div className={index === 0 ? 'text-blue-600 font-bold text-xs' : 'text-xs'}>
                            {index === 0 ? 'TODAY' : format(day, 'EEE').toUpperCase()}
                          </div>
                          <div className="text-xs">{format(day, 'd')}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Habits List - All habits */}
                  <div className="flex-1 space-y-3">
                    {habits.map((habit, habitIndex) => (
                      <div key={habit.id} className="grid grid-cols-2 gap-4 items-center group">
                        {/* Habit Name - Left Half */}
                        <div className="flex items-center space-x-2">
                          {editingHabit === habit.id ? (
                            <div className="flex items-center space-x-2 flex-1">
                              <input
                                type="text"
                                value={editHabitName}
                                onChange={(e) => setEditHabitName(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                onKeyPress={(e) => e.key === 'Enter' && saveEditHabit()}
                                autoFocus
                              />
                              <button
                                onClick={saveEditHabit}
                                className="p-1 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 hover:text-green-700"
                                title="Save changes"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEditHabit}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-600"
                                title="Cancel editing"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div
                                onClick={() => {
                                  setFlippedHabit(habit);
                                  setHabitCalendarView(new Date());
                                }}
                                className="flex-1 text-left hover:text-indigo-600 hover:underline transition-all duration-200 cursor-pointer font-medium text-gray-900 dark:text-gray-100 px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm leading-tight"
                                title={habit.name}
                              >
                                {habit.name}
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditHabit(habit);
                                  }}
                                  className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-500 hover:text-blue-600"
                                  title="Edit habit"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDeleteHabit(habit);
                                  }}
                                  className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600"
                                  title="Delete habit"
                                >
                                  <Trash className="h-3 w-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* Habit Circles - Right Half */}
                        <div className="grid grid-cols-4 gap-1 justify-items-center">
                          {scrollableDays.map((day, dayIndex) => {
                            const isCompleted = isHabitCompleted(habit.id, day);
                            const isToday = dayIndex === 0; // First day is always today
                            
                            return (
                              <button
                                key={dayIndex}
                                onClick={() => {
                                  toggleHabitCompletion(habit.id, day);
                                  // Force re-render by updating a state
                                  setHabits([...habits]);
                                }}
                                className={`habit-day-button-tiny ${
                                  isCompleted
                                    ? 'habit-completed'
                                    : 'habit-incomplete'
                                } ${
                                  isToday ? 'habit-today-ring' : ''
                                }`}
                                title={format(day, 'MMM dd, yyyy')}
                              >
                                {isCompleted ? (
                                  <Check className="h-2 w-2 text-white" />
                                ) : (
                                  <X className="h-1.5 w-1.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}



                    {habits.length === 0 && (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No habits yet. Click the + to add your first habit!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Back Side - Habit Details */}
            <div className="absolute inset-0 backface-hidden rotate-y-180">
              <Card className="habit-tracker-card">
                <div className="space-y-4 overflow-y-auto" style={{ maxHeight: `${Math.max(400, habits.length * 60 + 200)}px` }}>
                  <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {flippedHabit?.name || 'Habit Details'}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => setFlippedHabit(null)}
                      className="p-2"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  </div>

                  {flippedHabit && (
                    <div className="space-y-4 flex-1 overflow-y-auto">
                      {/* Streak & Completion Stats */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {getHabitStreak(flippedHabit.id).current}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Current Streak</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {getHabitStreak(flippedHabit.id).best}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Best Streak</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700/30">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {getHabitTotalStats(flippedHabit.id).completedDays}
                          </div>
                          <div className="text-xs text-purple-600/70 dark:text-purple-400/70 font-medium">
                            Total Days Done
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Since {getHabitTotalStats(flippedHabit.id).firstCompletionDate && !isNaN(new Date(getHabitTotalStats(flippedHabit.id).firstCompletionDate))
                              ? format(getHabitTotalStats(flippedHabit.id).firstCompletionDate, 'MMM dd, yyyy')
                              : 'No completions yet'}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 p-3 rounded-lg border border-orange-200 dark:border-orange-700/30">
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {getHabitTotalStats(flippedHabit.id).completionRate}%
                          </div>
                          <div className="text-xs text-orange-600/70 dark:text-orange-400/70 font-medium">
                            Success Rate
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {getHabitTotalStats(flippedHabit.id).completedDays} of {getHabitTotalStats(flippedHabit.id).totalDays} days
                          </div>
                        </div>
                      </div>
                      
                      {/* Total Days Summary */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Total Progress
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {getHabitTotalStats(flippedHabit.id).completedDays} / {getHabitTotalStats(flippedHabit.id).totalDays} days
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${getHabitTotalStats(flippedHabit.id).completionRate}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mini Calendar */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <button
                            onClick={() => navigateMonth('prev')}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Previous month"
                          >
                            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {format(habitCalendarView, 'MMMM yyyy')}
                          </h4>
                          <button
                            onClick={() => navigateMonth('next')}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Next month"
                          >
                            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-xs">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center font-medium text-gray-600 dark:text-gray-400 py-1">
                              {day}
                            </div>
                          ))}
                          {eachDayOfInterval({
                            start: startOfMonth(habitCalendarView),
                            end: endOfMonth(habitCalendarView)
                          }).map((day, index) => {
                            const isCompleted = isHabitCompleted(flippedHabit.id, day);
                            
                            return (
                              <div
                                key={index}
                                className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                                  isCompleted
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 dark:text-gray-400'
                                } ${
                                  isToday(day) ? 'ring-2 ring-blue-300' : ''
                                }`}
                              >
                                {format(day, 'd')}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Recent Completions */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Recent Activity
                        </h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {getHabitCompletionDates(flippedHabit.id).slice(0, 10).map((date, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="text-gray-600 dark:text-gray-400">
                                {date && !isNaN(new Date(date)) 
                                  ? format(date, 'MMM dd, yyyy')
                                  : 'Invalid date'
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Mood Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="-mt-4"
      >
        <Card>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Mood Tracker
              </h3>
            </div>
            
            {mostFrequentEmotion ? (
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {mostFrequentEmotion.emotionData?.emoji}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {mostFrequentEmotion.emotionData?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Most frequent mood ({mostFrequentEmotion.count} times)
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🤔</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Start journaling to track your moods
                </p>
              </div>
            )}

            {/* Emotion Grid */}
            <div className="grid grid-cols-5 gap-2">
              {EMOTIONS.slice(0, 10).map((emotion) => {
                const analytics = emotionAnalytics.find(a => a.emotion === emotion.name);
                const count = analytics?.count || 0;
                
                return (
                  <div
                    key={emotion.name}
                    className={`p-2 rounded-lg text-center transition-all duration-200 ${
                      count > 0 
                        ? 'bg-gray-100 dark:bg-gray-800 scale-110' 
                        : 'bg-gray-50 dark:bg-gray-900 opacity-50'
                    }`}
                  >
                    <div className="text-lg">{emotion.emoji}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Wellness Tracking Section */}
      {(wellnessData || wellnessAnalytics?.totalEntries > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Wellness Tracking
                  </h3>
                </div>
                <Link to="/diary/daily">
                  <Button variant="secondary" size="sm">
                    {wellnessData ? 'Update' : 'Check In'}
                  </Button>
                </Link>
              </div>

              {wellnessData ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Today's Wellness Score */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {wellnessData.wellnessScore}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Wellness Score
                    </div>
                    <div className="text-lg mt-1">🧠</div>
                  </div>

                  {/* Mood */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-1">{getMoodIcon(wellnessData.mood).icon}</div>
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {wellnessData.mood}/10
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Mood</div>
                  </div>

                  {/* Stress */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-1">😰</div>
                    <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {wellnessData.stress}/10
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Stress</div>
                  </div>

                  {/* Energy */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                      {wellnessData.energy}/10
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Energy</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Track Your Daily Wellness
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Monitor your mood, stress, and energy levels
                  </p>
                  <Link to="/diary/daily">
                    <Button variant="primary">
                      <Heart className="h-4 w-4 mr-2" />
                      Start Wellness Check-in
                    </Button>
                  </Link>
                </div>
              )}


            </div>
          </Card>
        </motion.div>
      )}

      {/* Recent Entries - Moved to bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Entries
                </h3>
              </div>
              <Link to="/diary/recent-entries">
                <Button variant="secondary" size="sm" className="text-emerald-600 hover:text-emerald-700">
                  View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentEntries.length > 0 ? (
                  recentEntries.map((entry) => {
                    const Icon = getTypeIcon(entry.type);
                    
                    return (
                      <div key={entry.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                        <div className={`w-8 h-8 bg-gradient-to-br ${getTypeColor(entry.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <Link to={getTypeRoute(entry.type)} className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                              {entry.type}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {entry.createdAt && !isNaN(new Date(entry.createdAt)) 
                                ? format(new Date(entry.createdAt), 'MMM dd')
                                : 'No date'
                              }
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {entry.content?.slice(0, 100)}...
                          </p>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            confirmDelete(entry);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600"
                          title="Delete entry"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No entries yet. Start journaling!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && entryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Delete {entryToDelete.type.charAt(0).toUpperCase() + entryToDelete.type.slice(1)} Entry
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this {entryToDelete.type} journal entry from {entryToDelete.createdAt && !isNaN(new Date(entryToDelete.createdAt)) 
                    ? format(new Date(entryToDelete.createdAt), 'MMMM dd, yyyy')
                    : 'unknown date'
                  }? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setEntryToDelete(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDeleteEntry}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Entry
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Habit Delete Confirmation Dialog */}
        {showDeleteHabitConfirm && habitToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Delete Habit
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete the habit "{habitToDelete.name}"? This will also remove all completion history for this habit. This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDeleteHabitConfirm(false);
                      setHabitToDelete(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={deleteHabit}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Habit
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
    </div>
  );
};

export default DiaryDashboard; 