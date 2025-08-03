import { format, startOfDay, endOfDay, isToday, isThisWeek, isThisMonth, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays, subDays, eachDayOfInterval } from 'date-fns';
import { downloadCSV, downloadJSON, generateFilename } from './downloadHelper';

// Storage keys for diary data
export const DIARY_STORAGE_KEYS = {
  DAILY_ENTRIES: 'diary_daily_entries',
  WEEKLY_ENTRIES: 'diary_weekly_entries',
  MONTHLY_ENTRIES: 'diary_monthly_entries',
  DIARY_SETTINGS: 'diary_settings',
  USER_STREAK: 'diary_user_streak',
  WELLNESS_DATA: 'diary_wellness_data'
};

// Wellness emotion tags for daily tracking
export const WELLNESS_EMOTIONS = [
  { id: 'happy', name: 'Happy', emoji: '😊', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'calm', name: 'Calm', emoji: '😌', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  { id: 'anxious', name: 'Anxious', emoji: '😰', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  { id: 'sad', name: 'Sad', emoji: '😢', color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30' },
  { id: 'angry', name: 'Angry', emoji: '😠', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  { id: 'excited', name: 'Excited', emoji: '🤩', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  { id: 'tired', name: 'Tired', emoji: '😴', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
  { id: 'grateful', name: 'Grateful', emoji: '🙏', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  { id: 'stressed', name: 'Stressed', emoji: '😣', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  { id: 'energetic', name: 'Energetic', emoji: '⚡', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' }
];

// Entry types
export const ENTRY_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Motivational quotes
export const MOTIVATIONAL_QUOTES = [
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    quote: "Don't let yesterday take up too much of today.",
    author: "Will Rogers"
  },
  {
    quote: "You learn more from failure than from success.",
    author: "Unknown"
  },
  {
    quote: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins"
  },
  {
    quote: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon"
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    quote: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  }
];

// Writing prompts for different entry types
export const WRITING_PROMPTS = {
  daily: [
    "How did you feel today?",
    "What are you grateful for today?",
    "What made you proud today?",
    "What's your favorite moment from today?",
    "What mistake did you make, and how will you improve tomorrow?",
    "What do you want more of in your life?",
    "What do you want less of in your life?",
    "Write a positive affirmation for yourself"
  ],
  weekly: [
    "What was your biggest win this week?",
    "What challenged you the most this week?",
    "How did you grow as a person this week?",
    "What patterns do you notice in your behavior this week?",
    "What relationships improved this week?",
    "What goals did you make progress on?",
    "What would you do differently next week?",
    "What are you looking forward to next week?"
  ],
  monthly: [
    "What were your biggest accomplishments this month?",
    "What lessons did you learn this month?",
    "How have you changed compared to last month?",
    "What habits did you develop or break this month?",
    "What relationships evolved this month?",
    "What goals are you setting for next month?",
    "What are you most proud of from this month?",
    "What do you want to focus on improving next month?"
  ]
};

// Emotion options
export const EMOTIONS = [
  { emoji: '😊', name: 'Happy', color: '#FDE047' },
  { emoji: '😔', name: 'Sad', color: '#60A5FA' },
  { emoji: '😡', name: 'Angry', color: '#F87171' },
  { emoji: '😰', name: 'Anxious', color: '#A78BFA' },
  { emoji: '🥰', name: 'Loved', color: '#FB7185' },
  { emoji: '😴', name: 'Tired', color: '#94A3B8' },
  { emoji: '🤔', name: 'Thoughtful', color: '#34D399' },
  { emoji: '🎉', name: 'Excited', color: '#FBBF24' },
  { emoji: '😌', name: 'Peaceful', color: '#6EE7B7' },
  { emoji: '🙄', name: 'Frustrated', color: '#F472B6' }
];

// Helper functions
const getFromStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Entry management functions
export const createEntry = (type, data) => {
  const entry = {
    id: `${type}_${Date.now()}`,
    type,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data
  };
  
  const key = type === 'daily' ? DIARY_STORAGE_KEYS.DAILY_ENTRIES :
              type === 'weekly' ? DIARY_STORAGE_KEYS.WEEKLY_ENTRIES :
              DIARY_STORAGE_KEYS.MONTHLY_ENTRIES;
  
  const entries = getFromStorage(key);
  entries.push(entry);
  saveToStorage(key, entries);
  
  return entry;
};

export const updateEntry = (entryId, type, data) => {
  const key = type === 'daily' ? DIARY_STORAGE_KEYS.DAILY_ENTRIES :
              type === 'weekly' ? DIARY_STORAGE_KEYS.WEEKLY_ENTRIES :
              DIARY_STORAGE_KEYS.MONTHLY_ENTRIES;
  
  const entries = getFromStorage(key);
  const entryIndex = entries.findIndex(entry => entry.id === entryId);
  
  if (entryIndex !== -1) {
    entries[entryIndex] = {
      ...entries[entryIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(key, entries);
    return entries[entryIndex];
  }
  
  return null;
};

export const deleteEntry = (entryId, type) => {
  const key = type === 'daily' ? DIARY_STORAGE_KEYS.DAILY_ENTRIES :
              type === 'weekly' ? DIARY_STORAGE_KEYS.WEEKLY_ENTRIES :
              DIARY_STORAGE_KEYS.MONTHLY_ENTRIES;
  
  const entries = getFromStorage(key);
  const filteredEntries = entries.filter(entry => entry.id !== entryId);
  
  saveToStorage(key, filteredEntries);
  return true;
};

export const getEntries = (type) => {
  const key = type === 'daily' ? DIARY_STORAGE_KEYS.DAILY_ENTRIES :
              type === 'weekly' ? DIARY_STORAGE_KEYS.WEEKLY_ENTRIES :
              DIARY_STORAGE_KEYS.MONTHLY_ENTRIES;
  
  let entries = getFromStorage(key);
  
  // Filter out entries with invalid dates
  entries = entries.filter(entry => {
    const hasValidDate = entry.date && !isNaN(new Date(entry.date));
    const hasValidCreatedAt = entry.createdAt && !isNaN(new Date(entry.createdAt));
    return hasValidDate && hasValidCreatedAt;
  });
  
  // Auto-load sample data if no entries exist and sample data is loaded
  if (entries.length === 0) {
    const sampleDataLoaded = localStorage.getItem('sample_data_loaded') === 'true';
    if (sampleDataLoaded) {
      // Return sample entries if they exist
      return getFromStorage(key, []);
    }
  }
  
  return entries;
};

export const getEntryForDate = (type, date) => {
  try {
    const entries = getEntries(type);
    const targetDate = format(new Date(date), 'yyyy-MM-dd');
    
    return entries.find(entry => {
      try {
        // Validate entry date before formatting
        if (!entry.date || isNaN(new Date(entry.date))) {
          return false;
        }
        
        const entryDate = format(new Date(entry.date), 'yyyy-MM-dd');
        
        if (type === 'daily') {
          return entryDate === targetDate;
        } else if (type === 'weekly') {
          const entryWeekStart = format(startOfWeek(new Date(entry.date)), 'yyyy-MM-dd');
          const targetWeekStart = format(startOfWeek(new Date(date)), 'yyyy-MM-dd');
          return entryWeekStart === targetWeekStart;
        } else if (type === 'monthly') {
          const entryMonth = format(new Date(entry.date), 'yyyy-MM');
          const targetMonth = format(new Date(date), 'yyyy-MM');
          return entryMonth === targetMonth;
        }
        return false;
      } catch (error) {
        console.error('Error comparing entry date:', error, entry);
        return false;
      }
    });
  } catch (error) {
    console.error('Error in getEntryForDate:', error);
    return null;
  }
};

export const hasEntryForToday = (type) => {
  return !!getEntryForDate(type, new Date());
};

// Streak calculation functions
export const calculateStreak = (type) => {
  try {
    const entries = getEntries(type);
    if (entries.length === 0) return { current: 0, longest: 0 };

    // Filter out entries with invalid dates before sorting
    const validEntries = entries.filter(entry => {
      return entry.date && !isNaN(new Date(entry.date));
    });

    if (validEntries.length === 0) return { current: 0, longest: 0 };

    // Sort entries by date
    const sortedEntries = validEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Calculate current streak
  const today = new Date();
  let checkDate = today;
  
  for (let i = 0; i < 365; i++) { // Check up to a year back
    const hasEntry = getEntryForDate(type, checkDate);
    
    if (hasEntry) {
      if (i === 0 || currentStreak > 0) {
        currentStreak++;
      }
      tempStreak++;
    } else {
      if (currentStreak > 0 && i > 0) {
        break; // End of current streak
      }
      tempStreak = 0;
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Move to previous day/week/month based on type
    if (type === 'daily') {
      checkDate = subDays(checkDate, 1);
    } else if (type === 'weekly') {
      checkDate = subDays(checkDate, 7);
    } else if (type === 'monthly') {
      checkDate = new Date(checkDate.getFullYear(), checkDate.getMonth() - 1, checkDate.getDate());
    }
  }
  
  return { current: currentStreak, longest: longestStreak };
  
  } catch (error) {
    console.error('Error calculating streak:', error);
    return { current: 0, longest: 0 };
  }
};

// Analytics functions
export const getEmotionAnalytics = () => {
  const dailyEntries = getEntries('daily');
  const emotionCounts = {};
  
  dailyEntries.forEach(entry => {
    if (entry.emotion) {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    }
  });
  
  return Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion,
    count,
    emotionData: EMOTIONS.find(e => e.name === emotion)
  }));
};

export const getWordFrequency = () => {
  const allEntries = [
    ...getEntries('daily'),
    ...getEntries('weekly'),
    ...getEntries('monthly')
  ];
  
  const wordCounts = {};
  
  allEntries.forEach(entry => {
    if (entry.content) {
      const words = entry.content.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    }
  });
  
  return Object.entries(wordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
};

// Get random motivational quote
export const getRandomQuote = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const quoteIndex = today.split('-').reduce((acc, num) => acc + parseInt(num), 0) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[quoteIndex];
};

// Calendar heatmap data
export const getCalendarHeatmapData = (type, year = new Date().getFullYear()) => {
  const entries = getEntries(type);
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  const daysOfYear = eachDayOfInterval({ start: startDate, end: endDate });
  
  return daysOfYear.map(date => {
    const hasEntry = !!getEntryForDate(type, date);
    return {
      date: format(date, 'yyyy-MM-dd'),
      hasEntry,
      count: hasEntry ? 1 : 0
    };
  });
};

// Date navigation utilities
export const getNavigationDate = (currentDate, type, direction) => {
  const date = new Date(currentDate);
  
  if (type === 'daily') {
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
  } else if (type === 'weekly') {
    if (direction === 'prev') {
      date.setDate(date.getDate() - 7);
    } else {
      date.setDate(date.getDate() + 7);
    }
  } else if (type === 'monthly') {
    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
  }
  
  return date;
};

export const getPreviousEntries = (type, currentDate, limit = 5) => {
  const entries = getEntries(type);
  const current = new Date(currentDate);
  
  // Filter entries that are before the current date
  const previousEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate < current;
  });
  
  // Sort by date (most recent first) and limit
  return previousEntries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

export const getEntryPreview = (entry) => {
  if (!entry) return null;
  
  const date = new Date(entry.date);
  const dayName = format(date, 'EEEE');
  const dateStr = format(date, 'MMM dd, yyyy');
  
  return {
    id: entry.id,
    date: dateStr,
    day: dayName,
    mood: entry.emotion || 'Unknown',
    preview: entry.content ? entry.content.substring(0, 100) + '...' : 'No content',
    fullEntry: entry
  };
};

// Due notification utilities
export const getTodaysDue = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayOfMonth = today.getDate();
  
  const due = [];
  
  // Daily journal is always due
  if (!hasEntryForToday('daily')) {
    due.push({
      type: 'daily',
      title: 'Daily Journal',
      description: 'Write your daily reflection',
      urgent: false
    });
  }
  
  // Weekly journal due on Sundays
  if (dayOfWeek === 0 && !hasEntryForToday('weekly')) {
    due.push({
      type: 'weekly',
      title: 'Weekly Journal',
      description: 'Write your weekly reflection',
      urgent: true
    });
  }
  
  // Monthly journal due on 1st of every month
  if (dayOfMonth === 1 && !hasEntryForToday('monthly')) {
    due.push({
      type: 'monthly',
      title: 'Monthly Journal',
      description: 'Write your monthly reflection',
      urgent: true
    });
  }
  
  return due;
}; 

// Advanced Analytics Functions (inspired by best journaling apps)

// Mood correlation with activities
export const getMoodActivityCorrelations = () => {
  const allEntries = [
    ...getEntries('daily'),
    ...getEntries('weekly'), 
    ...getEntries('monthly')
  ];
  
  const correlations = {};
  
  allEntries.forEach(entry => {
    if (entry.emotion && entry.activities) {
      const moodScore = getMoodScore(entry.emotion);
      entry.activities.forEach(activity => {
        if (!correlations[activity]) {
          correlations[activity] = { total: 0, count: 0, entries: [] };
        }
        correlations[activity].total += moodScore;
        correlations[activity].count += 1;
        correlations[activity].entries.push({
          date: entry.date,
          mood: moodScore,
          emotion: entry.emotion
        });
      });
    }
  });
  
  // Calculate averages and categorize
  const results = Object.entries(correlations).map(([activity, data]) => ({
    activity,
    averageMood: data.total / data.count,
    frequency: data.count,
    impact: data.total / data.count > 3 ? 'positive' : data.total / data.count < 3 ? 'negative' : 'neutral',
    entries: data.entries
  }));
  
  return results.sort((a, b) => b.averageMood - a.averageMood);
};

// Time-based mood patterns
export const getMoodTimePatterns = () => {
  const allEntries = [
    ...getEntries('daily'),
    ...getEntries('weekly'),
    ...getEntries('monthly')
  ];
  
  const patterns = {
    dailyAverage: new Array(24).fill(0).map(() => ({ total: 0, count: 0 })),
    weeklyAverage: new Array(7).fill(0).map(() => ({ total: 0, count: 0 })),
    monthlyTrend: []
  };
  
  allEntries.forEach(entry => {
    if (entry.emotion) {
      const moodScore = getMoodScore(entry.emotion);
      const date = new Date(entry.createdAt || entry.date);
      
      // Hour analysis (for daily entries)
      if (entry.type === 'daily') {
        const hour = date.getHours();
        patterns.dailyAverage[hour].total += moodScore;
        patterns.dailyAverage[hour].count += 1;
      }
      
      // Day of week analysis
      const dayOfWeek = date.getDay();
      patterns.weeklyAverage[dayOfWeek].total += moodScore;
      patterns.weeklyAverage[dayOfWeek].count += 1;
    }
  });
  
  // Calculate averages
  patterns.dailyAverage = patterns.dailyAverage.map((data, hour) => ({
    hour,
    averageMood: data.count > 0 ? data.total / data.count : 0,
    entryCount: data.count
  }));
  
  patterns.weeklyAverage = patterns.weeklyAverage.map((data, day) => ({
    day,
    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
    averageMood: data.count > 0 ? data.total / data.count : 0,
    entryCount: data.count
  }));
  
  return patterns;
};

// WELLNESS TRACKING FUNCTIONS

// Create wellness check-in entry
export const addWellnessCheckIn = (mood, stress, energy, emotions = [], notes = '') => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const wellnessData = getFromStorage(DIARY_STORAGE_KEYS.WELLNESS_DATA, []);
    
    // Check if already checked in today
    const existingIndex = wellnessData.findIndex(entry => entry.date === today);
    
    const wellnessEntry = {
      id: `wellness_${Date.now()}`,
      date: today,
      mood: Math.max(1, Math.min(10, parseInt(mood))), // Ensure 1-10 range
      stress: Math.max(1, Math.min(10, parseInt(stress))),
      energy: Math.max(1, Math.min(10, parseInt(energy))),
      emotions: emotions.filter(emotion => WELLNESS_EMOTIONS.find(e => e.id === emotion)),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      wellnessScore: calculateWellnessScore(mood, stress, energy)
    };
    
    if (existingIndex !== -1) {
      // Update existing entry
      wellnessData[existingIndex] = { ...wellnessData[existingIndex], ...wellnessEntry, id: wellnessData[existingIndex].id };
    } else {
      // Add new entry
      wellnessData.push(wellnessEntry);
    }
    
    saveToStorage(DIARY_STORAGE_KEYS.WELLNESS_DATA, wellnessData);
    return wellnessEntry;
  } catch (error) {
    console.error('Error adding wellness check-in:', error);
    return null;
  }
};

// Calculate wellness score based on mood, stress, and energy
const calculateWellnessScore = (mood, stress, energy) => {
  // Higher mood and energy = better, lower stress = better
  // Formula: ((mood + energy + (11 - stress)) / 3) * 10
  const score = ((parseInt(mood) + parseInt(energy) + (11 - parseInt(stress))) / 3) * 10;
  return Math.round(Math.max(0, Math.min(100, score)));
};

// Get today's wellness data
export const getTodayWellness = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const wellnessData = getFromStorage(DIARY_STORAGE_KEYS.WELLNESS_DATA, []);
  return wellnessData.find(entry => entry.date === today);
};

// Get wellness data for a specific date
export const getWellnessForDate = (date) => {
  const targetDate = format(new Date(date), 'yyyy-MM-dd');
  const wellnessData = getFromStorage(DIARY_STORAGE_KEYS.WELLNESS_DATA, []);
  return wellnessData.find(entry => entry.date === targetDate);
};

// Get wellness analytics for the past N days
export const getWellnessAnalytics = (days = 30) => {
  const wellnessData = getFromStorage(DIARY_STORAGE_KEYS.WELLNESS_DATA, []);
  const cutoffDate = subDays(new Date(), days);
  
  const recentData = wellnessData
    .filter(entry => new Date(entry.date) >= cutoffDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  if (recentData.length === 0) {
    return {
      totalEntries: 0,
      averageMood: 0,
      averageStress: 0,
      averageEnergy: 0,
      averageWellnessScore: 0,
      moodTrend: [],
      stressTrend: [],
      energyTrend: [],
      wellnessTrend: [],
      commonEmotions: [],
      bestDay: null,
      worstDay: null
    };
  }
  
  const totalEntries = recentData.length;
  const averageMood = recentData.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries;
  const averageStress = recentData.reduce((sum, entry) => sum + entry.stress, 0) / totalEntries;
  const averageEnergy = recentData.reduce((sum, entry) => sum + entry.energy, 0) / totalEntries;
  const averageWellnessScore = recentData.reduce((sum, entry) => sum + entry.wellnessScore, 0) / totalEntries;
  
  // Find best and worst days
  const bestDay = recentData.reduce((best, current) => 
    current.wellnessScore > best.wellnessScore ? current : best
  );
  const worstDay = recentData.reduce((worst, current) => 
    current.wellnessScore < worst.wellnessScore ? current : worst
  );
  
  // Count emotion frequencies
  const emotionCounts = {};
  recentData.forEach(entry => {
    if (entry.emotions && Array.isArray(entry.emotions)) {
      entry.emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    }
  });
  
  const commonEmotions = Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: (count / totalEntries) * 100,
      ...WELLNESS_EMOTIONS.find(e => e.id === emotion)
    }));
  
  return {
    totalEntries,
    averageMood: Math.round(averageMood * 10) / 10,
    averageStress: Math.round(averageStress * 10) / 10,
    averageEnergy: Math.round(averageEnergy * 10) / 10,
    averageWellnessScore: Math.round(averageWellnessScore),
    moodTrend: recentData.map(entry => ({ date: entry.date, value: entry.mood })),
    stressTrend: recentData.map(entry => ({ date: entry.date, value: entry.stress })),
    energyTrend: recentData.map(entry => ({ date: entry.date, value: entry.energy })),
    wellnessTrend: recentData.map(entry => ({ date: entry.date, value: entry.wellnessScore })),
    commonEmotions,
    bestDay,
    worstDay
  };
};

// Get wellness streak (consecutive days with check-ins)
export const getWellnessStreak = () => {
  const wellnessData = getFromStorage(DIARY_STORAGE_KEYS.WELLNESS_DATA, [])
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (wellnessData.length === 0) return { current: 0, longest: 0 };
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let currentDate = new Date();
  
  // Check if we have an entry for today or yesterday to start the current streak
  const today = format(currentDate, 'yyyy-MM-dd');
  const yesterday = format(subDays(currentDate, 1), 'yyyy-MM-dd');
  
  if (wellnessData[0].date === today) {
    currentStreak = 1;
    currentDate = subDays(currentDate, 1);
  } else if (wellnessData[0].date === yesterday) {
    currentStreak = 1;
    currentDate = subDays(currentDate, 2);
  }
  
  // Count consecutive days from the most recent entry
  for (let i = (currentStreak > 0 ? 1 : 0); i < wellnessData.length; i++) {
    const expectedDate = format(currentDate, 'yyyy-MM-dd');
    
    if (wellnessData[i].date === expectedDate) {
      if (currentStreak > 0) currentStreak++;
      tempStreak++;
      currentDate = subDays(currentDate, 1);
    } else {
      if (currentStreak === 0 && tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      tempStreak = 0;
      // Reset date to this entry's date for new streak calculation
      currentDate = subDays(new Date(wellnessData[i].date), 1);
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
  
  return { current: currentStreak, longest: longestStreak };
};

// Get mood icon helper function
export const getMoodIcon = (moodScore) => {
  if (moodScore >= 9) return { icon: '😍', label: 'Euphoric', color: 'text-green-600' };
  if (moodScore >= 8) return { icon: '😊', label: 'Great', color: 'text-green-500' };
  if (moodScore >= 7) return { icon: '🙂', label: 'Good', color: 'text-green-400' };
  if (moodScore >= 6) return { icon: '😐', label: 'Okay', color: 'text-yellow-500' };
  if (moodScore >= 5) return { icon: '😕', label: 'Meh', color: 'text-yellow-600' };
  if (moodScore >= 4) return { icon: '😔', label: 'Down', color: 'text-orange-500' };
  if (moodScore >= 3) return { icon: '😢', label: 'Sad', color: 'text-red-400' };
  if (moodScore >= 2) return { icon: '😭', label: 'Very Sad', color: 'text-red-500' };
  return { icon: '😩', label: 'Terrible', color: 'text-red-600' };
};

// Writing insights
export const getWritingInsights = () => {
  const allEntries = [
    ...getEntries('daily'),
    ...getEntries('weekly'),
    ...getEntries('monthly')
  ];
  
  let totalWords = 0;
  let totalCharacters = 0;
  let longestEntry = { words: 0, date: null, content: '' };
  let shortestEntry = { words: Infinity, date: null, content: '' };
  const writingDays = new Set();
  
  allEntries.forEach(entry => {
    if (entry.content) {
      const words = entry.content.split(/\s+/).filter(word => word.length > 0).length;
      const characters = entry.content.length;
      
      totalWords += words;
      totalCharacters += characters;
      writingDays.add(format(new Date(entry.date), 'yyyy-MM-dd'));
      
      if (words > longestEntry.words) {
        longestEntry = { words, date: entry.date, content: entry.content };
      }
      
      if (words < shortestEntry.words && words > 0) {
        shortestEntry = { words, date: entry.date, content: entry.content };
      }
    }
  });
  
  const averageWordsPerEntry = totalWords / Math.max(allEntries.filter(e => e.content).length, 1);
  const averageCharactersPerEntry = totalCharacters / Math.max(allEntries.filter(e => e.content).length, 1);
  
  return {
    totalWords,
    totalCharacters,
    averageWordsPerEntry: Math.round(averageWordsPerEntry),
    averageCharactersPerEntry: Math.round(averageCharactersPerEntry),
    longestEntry,
    shortestEntry: shortestEntry.words === Infinity ? null : shortestEntry,
    uniqueWritingDays: writingDays.size,
    entriesWithText: allEntries.filter(e => e.content).length
  };
};

// Goal progress tracking
export const getGoalProgress = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const dailyEntries = getEntries('daily');
  const weeklyEntries = getEntries('weekly');
  const monthlyEntries = getEntries('monthly');
  
  // Calculate monthly goals
  const monthlyDailyGoal = new Date(currentYear, currentMonth + 1, 0).getDate(); // Days in month
  const monthlyWeeklyGoal = Math.ceil(monthlyDailyGoal / 7); // Weeks in month
  const monthlyMonthlyGoal = 1; // One monthly entry
  
  const thisMonthDaily = dailyEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  }).length;
  
  const thisMonthWeekly = weeklyEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  }).length;
  
  const thisMonthMonthly = monthlyEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  }).length;
  
  return {
    daily: {
      current: thisMonthDaily,
      goal: monthlyDailyGoal,
      percentage: Math.round((thisMonthDaily / monthlyDailyGoal) * 100)
    },
    weekly: {
      current: thisMonthWeekly,
      goal: monthlyWeeklyGoal,
      percentage: Math.round((thisMonthWeekly / monthlyWeeklyGoal) * 100)
    },
    monthly: {
      current: thisMonthMonthly,
      goal: monthlyMonthlyGoal,
      percentage: Math.round((thisMonthMonthly / monthlyMonthlyGoal) * 100)
    }
  };
};

// Mood score helper function
const getMoodScore = (emotion) => {
  const moodMap = {
    'Very Happy': 5,
    'Happy': 4,
    'Content': 3,
    'Sad': 2,
    'Very Sad': 1,
    'Angry': 1,
    'Anxious': 2,
    'Excited': 4,
    'Grateful': 5,
    'Peaceful': 4,
    'Energetic': 4,
    'Tired': 2,
    'Stressed': 1,
    'Relaxed': 4,
    'Motivated': 4
  };
  return moodMap[emotion] || 3;
};

// Personal growth insights
export const getPersonalGrowthInsights = () => {
  const allEntries = [
    ...getEntries('daily'),
    ...getEntries('weekly'),
    ...getEntries('monthly')
  ];
  
  const recentEntries = allEntries
    .filter(entry => {
      const entryDate = new Date(entry.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return entryDate >= thirtyDaysAgo;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const insights = [];
  
  // Consistency insight
  const currentStreak = Math.max(
    calculateStreak('daily').current,
    calculateStreak('weekly').current,
    calculateStreak('monthly').current
  );
  
  if (currentStreak >= 7) {
    insights.push({
      type: 'achievement',
      title: 'Consistency Champion',
      message: `You've maintained a ${currentStreak}-day journaling streak! This shows incredible dedication to self-reflection.`,
      icon: '🏆'
    });
  } else if (currentStreak >= 3) {
    insights.push({
      type: 'progress',
      title: 'Building Momentum',
      message: `You're on a ${currentStreak}-day streak. Keep it up to build a lasting habit!`,
      icon: '📈'
    });
  }
  
  // Emotional awareness
  const emotionAnalytics = getEmotionAnalytics();
  if (emotionAnalytics.length >= 3) {
    const topEmotion = emotionAnalytics[0];
    insights.push({
      type: 'awareness',
      title: 'Emotional Pattern',
      message: `Your most frequent emotion is "${topEmotion.emotion}". Understanding your emotional patterns is key to personal growth.`,
      icon: '💡'
    });
  }
  
  // Writing progress
  const writingStats = getWritingInsights();
  if (writingStats.totalWords > 1000) {
    insights.push({
      type: 'milestone',
      title: 'Words of Wisdom',
      message: `You've written ${writingStats.totalWords} words in your journal! That's ${Math.ceil(writingStats.totalWords / 250)} pages of self-discovery.`,
      icon: '📝'
    });
  }
  
  return insights;
};

// COMPREHENSIVE DATA EXPORT FUNCTIONS

/**
 * Comprehensive Diary Data Export
 * 
 * This function exports ALL diary data organized day by day, providing a complete
 * timeline of the user's journaling journey. The export includes:
 * 
 * 1. DAILY JOURNALS: All daily journal entries with content, emotions, mood, etc.
 * 2. WEEKLY JOURNALS: Weekly reflections with achievements, challenges, lessons
 * 3. MONTHLY JOURNALS: Monthly reviews with accomplishments and growth insights
 * 4. WELLNESS DATA: Daily wellness check-ins with mood, stress, energy scores
 * 5. HABIT TRACKING: Day-by-day habit completion records showing:
 *    - Which habits were completed each day
 *    - Completion rates and streaks
 *    - All habits with their status for each day
 * 
 * DATA STRUCTURE:
 * {
 *   exportInfo: { date, version, totalDays, dateRange },
 *   summary: { counts of all data types },
 *   habits: [ { habit details with total completions } ],
 *   settings: { user preferences },
 *   dailyData: [
 *     {
 *       date: "2024-01-15",
 *       dayOfWeek: "Monday",
 *       formattedDate: "January 15, 2024",
 *       dailyJournal: { content, emotion, mood, ... },
 *       weeklyJournal: { content, achievements, ... },
 *       monthlyJournal: { content, accomplishments, ... },
 *       wellness: { mood, stress, energy, wellnessScore, ... },
 *       habits: {
 *         completedHabits: [ { name, completed: true } ],
 *         allHabits: [ { name, completed: true/false } ],
 *         completionRate: 75
 *       }
 *     }
 *   ]
 * }
 */

// Export all diary data organized by date
export const exportComprehensiveDiaryData = () => {
  try {
    // Get all data from localStorage
    const dailyEntries = getFromStorage(DIARY_STORAGE_KEYS.DAILY_ENTRIES, []);
    const weeklyEntries = getFromStorage(DIARY_STORAGE_KEYS.WEEKLY_ENTRIES, []);
    const monthlyEntries = getFromStorage(DIARY_STORAGE_KEYS.MONTHLY_ENTRIES, []);
    const wellnessData = getFromStorage(DIARY_STORAGE_KEYS.WELLNESS_DATA, []);
    const habits = JSON.parse(localStorage.getItem('diary_habits') || '[]');
    const habitCompletions = JSON.parse(localStorage.getItem('diary_habit_completions') || '{}');
    const settings = JSON.parse(localStorage.getItem('diary_settings') || '{}');

    // Organize data by date
    const dataByDate = {};
    const allDates = new Set();

    // Process daily entries
    dailyEntries.forEach(entry => {
      const date = format(new Date(entry.date), 'yyyy-MM-dd');
      allDates.add(date);
      if (!dataByDate[date]) dataByDate[date] = {};
      dataByDate[date].dailyJournal = {
        id: entry.id,
        content: entry.content,
        emotion: entry.emotion,
        mood: entry.mood,
        gratitude: entry.gratitude,
        highlights: entry.highlights,
        challenges: entry.challenges,
        goals: entry.goals,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      };
    });

    // Process weekly entries
    weeklyEntries.forEach(entry => {
      const date = format(new Date(entry.date), 'yyyy-MM-dd');
      allDates.add(date);
      if (!dataByDate[date]) dataByDate[date] = {};
      dataByDate[date].weeklyJournal = {
        id: entry.id,
        content: entry.content,
        weekStartDate: format(startOfWeek(new Date(entry.date)), 'yyyy-MM-dd'),
        weekEndDate: format(endOfWeek(new Date(entry.date)), 'yyyy-MM-dd'),
        achievements: entry.achievements,
        challenges: entry.challenges,
        lessons: entry.lessons,
        nextWeekGoals: entry.nextWeekGoals,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      };
    });

    // Process monthly entries
    monthlyEntries.forEach(entry => {
      const date = format(new Date(entry.date), 'yyyy-MM-dd');
      allDates.add(date);
      if (!dataByDate[date]) dataByDate[date] = {};
      dataByDate[date].monthlyJournal = {
        id: entry.id,
        content: entry.content,
        monthYear: format(new Date(entry.date), 'MMMM yyyy'),
        accomplishments: entry.accomplishments,
        lessons: entry.lessons,
        growth: entry.growth,
        nextMonthGoals: entry.nextMonthGoals,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      };
    });

    // Process wellness data
    wellnessData.forEach(entry => {
      const date = entry.date; // Already in yyyy-MM-dd format
      allDates.add(date);
      if (!dataByDate[date]) dataByDate[date] = {};
      dataByDate[date].wellness = {
        id: entry.id,
        mood: entry.mood,
        stress: entry.stress,
        energy: entry.energy,
        emotions: entry.emotions,
        notes: entry.notes,
        wellnessScore: entry.wellnessScore,
        createdAt: entry.createdAt
      };
    });

    // Process habit completions day by day
    Object.keys(habitCompletions).forEach(date => {
      allDates.add(date);
      if (!dataByDate[date]) dataByDate[date] = {};
      
      const completedHabitIds = habitCompletions[date];
      const completedHabits = completedHabitIds.map(habitId => {
        const habit = habits.find(h => h.id === habitId);
        return habit ? {
          id: habit.id,
          name: habit.name,
          color: habit.color,
          completed: true
        } : null;
      }).filter(Boolean);

      // Also include all habits for this date showing completion status
      const allHabitsForDate = habits.map(habit => ({
        id: habit.id,
        name: habit.name,
        color: habit.color,
        completed: completedHabitIds.includes(habit.id)
      }));

      dataByDate[date].habits = {
        completedHabits,
        allHabits: allHabitsForDate,
        completedCount: completedHabits.length,
        totalHabits: habits.length,
        completionRate: habits.length > 0 ? Math.round((completedHabits.length / habits.length) * 100) : 0
      };
    });

    // Convert to sorted array
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(b) - new Date(a));
    const dailyData = sortedDates.map(date => ({
      date,
      dayOfWeek: format(new Date(date), 'EEEE'),
      formattedDate: format(new Date(date), 'MMMM dd, yyyy'),
      ...dataByDate[date]
    }));

    // Create comprehensive export object
    const comprehensiveExport = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        exportType: 'comprehensive',
        version: '3.0',
        totalDays: sortedDates.length,
        dateRange: {
          from: sortedDates[sortedDates.length - 1],
          to: sortedDates[0]
        }
      },
      summary: {
        totalDailyEntries: dailyEntries.length,
        totalWeeklyEntries: weeklyEntries.length,
        totalMonthlyEntries: monthlyEntries.length,
        totalWellnessCheckIns: wellnessData.length,
        totalHabits: habits.length,
        totalDaysWithHabitData: Object.keys(habitCompletions).length,
        totalDaysWithData: sortedDates.length
      },
      habits: habits.map(habit => ({
        id: habit.id,
        name: habit.name,
        color: habit.color,
        createdAt: habit.createdAt,
        totalCompletions: Object.values(habitCompletions).flat().filter(id => id === habit.id).length
      })),
      settings,
      dailyData
    };

    return comprehensiveExport;
  } catch (error) {
    console.error('Error creating comprehensive export:', error);
    throw error;
  }
};

// Export data as CSV format for spreadsheet analysis
export const exportDiaryDataAsCSV = () => {
  try {
    const data = exportComprehensiveDiaryData();
    const csvRows = [];
    
    // CSV Headers
    const headers = [
      'Date',
      'Day of Week',
      'Daily Journal',
      'Daily Mood/Emotion',
      'Weekly Journal',
      'Monthly Journal',
      'Wellness Mood (1-10)',
      'Wellness Stress (1-10)',
      'Wellness Energy (1-10)',
      'Wellness Score',
      'Wellness Emotions',
      'Habits Completed',
      'Habits Completion Rate (%)',
      'Total Habits'
    ];
    csvRows.push(headers.join(','));

    // Data rows
    data.dailyData.forEach(dayData => {
      const row = [
        dayData.date,
        dayData.dayOfWeek,
        dayData.dailyJournal ? `"${dayData.dailyJournal.content?.replace(/"/g, '""') || ''}"` : '',
        dayData.dailyJournal?.emotion || '',
        dayData.weeklyJournal ? `"${dayData.weeklyJournal.content?.replace(/"/g, '""') || ''}"` : '',
        dayData.monthlyJournal ? `"${dayData.monthlyJournal.content?.replace(/"/g, '""') || ''}"` : '',
        dayData.wellness?.mood || '',
        dayData.wellness?.stress || '',
        dayData.wellness?.energy || '',
        dayData.wellness?.wellnessScore || '',
        dayData.wellness?.emotions ? `"${dayData.wellness.emotions.join(', ')}"` : '',
        dayData.habits ? `"${dayData.habits.completedHabits.map(h => h.name).join(', ')}"` : '',
        dayData.habits?.completionRate || '',
        dayData.habits?.totalHabits || ''
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  } catch (error) {
    console.error('Error creating CSV export:', error);
    throw error;
  }
};

// Export specific date range
export const exportDateRangeData = (startDate, endDate) => {
  try {
    const fullData = exportComprehensiveDiaryData();
    const start = format(new Date(startDate), 'yyyy-MM-dd');
    const end = format(new Date(endDate), 'yyyy-MM-dd');
    
    const filteredData = fullData.dailyData.filter(dayData => {
      return dayData.date >= start && dayData.date <= end;
    });

    return {
      ...fullData,
      exportInfo: {
        ...fullData.exportInfo,
        exportType: 'date-range',
        dateRange: { from: start, to: end }
      },
      dailyData: filteredData,
      summary: {
        ...fullData.summary,
        totalDaysWithData: filteredData.length
      }
    };
  } catch (error) {
    console.error('Error creating date range export:', error);
    throw error;
  }
};

// Individual CSV Export Functions for Diary Data

// 1. Daily Journal CSV Export
export const exportDailyJournalToCSV = () => {
  try {
    const dailyEntries = getFromStorage(DIARY_STORAGE_KEYS.DAILY_ENTRIES, []);
    
    let csvContent;
    if (dailyEntries.length === 0) {
      csvContent = 'Date,Day,Emotion,Grateful For,Proud Of,Favorite Moment,Mistake & Learning,More Of,Less Of,Affirmation,Additional Thoughts,Created At\nNo daily journal entries found';
    } else {
      const rows = dailyEntries.map(entry => ({
        'Date': format(new Date(entry.date), 'dd/MM/yyyy'),
        'Day': format(new Date(entry.date), 'EEEE'),
        'Emotion': entry.emotion || '',
        'Grateful For': entry.grateful || '',
        'Proud Of': entry.proud || '',
        'Favorite Moment': entry.favoritemoment || '',
        'Mistake & Learning': `${entry.mistake || ''} → ${entry.improvement || ''}`,
        'More Of': entry.moreOf || '',
        'Less Of': entry.lessOf || '',
        'Affirmation': entry.affirmation || '',
        'Additional Thoughts': entry.additionalThoughts || '',
        'Created At': format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')
      }));
      
      csvContent = convertToCSV(rows);
    }
    
    // Download the CSV file
    const filename = generateFilename('ClarityOS-MyDiary', 'Daily-Journal');
    return downloadCSV(csvContent, filename);
  } catch (error) {
    console.error('Error creating Daily Journal CSV:', error);
    throw new Error('Failed to export daily journal data');
  }
};

// 2. Weekly Journal CSV Export
export const exportWeeklyJournalToCSV = () => {
  try {
    const weeklyEntries = getFromStorage(DIARY_STORAGE_KEYS.WEEKLY_ENTRIES, []);
    
    let csvContent;
    if (weeklyEntries.length === 0) {
      csvContent = 'Week Start,Week End,Biggest Win,Biggest Challenge,Personal Growth,Behavior Patterns,Relationships,Goals Progress,Next Week Differently,Looking Forward,Additional Reflections,Created At\nNo weekly journal entries found';
    } else {
      const rows = weeklyEntries.map(entry => {
        const weekStart = startOfWeek(new Date(entry.date));
        const weekEnd = endOfWeek(new Date(entry.date));
        
        return {
          'Week Start': format(weekStart, 'dd/MM/yyyy'),
          'Week End': format(weekEnd, 'dd/MM/yyyy'),
          'Biggest Win': entry.biggestWin || '',
          'Biggest Challenge': entry.biggestChallenge || '',
          'Personal Growth': entry.personalGrowth || '',
          'Behavior Patterns': entry.behaviorPatterns || '',
          'Relationships': entry.relationships || '',
          'Goals Progress': entry.goalsProgress || '',
          'Next Week Differently': entry.nextWeekDifferently || '',
          'Looking Forward': entry.lookingForward || '',
          'Additional Reflections': entry.additionalReflections || '',
          'Created At': format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')
        };
      });
      
      csvContent = convertToCSV(rows);
    }
    
    // Download the CSV file
    const filename = generateFilename('ClarityOS-MyDiary', 'Weekly-Journal');
    return downloadCSV(csvContent, filename);
  } catch (error) {
    console.error('Error creating Weekly Journal CSV:', error);
    throw new Error('Failed to export weekly journal data');
  }
};

// 3. Monthly Journal CSV Export
export const exportMonthlyJournalToCSV = () => {
  try {
    const monthlyEntries = getFromStorage(DIARY_STORAGE_KEYS.MONTHLY_ENTRIES, []);
    
    if (monthlyEntries.length === 0) {
      return 'Month,Year,Accomplishments,Lessons Learned,Personal Changes,Habits Evolved,Relationship Evolution,Next Month Goals,Proudest Moments,Focus Areas,Additional Insights,Created At\nNo monthly journal entries found';
    }
    
    const rows = monthlyEntries.map(entry => {
      const monthStart = startOfMonth(new Date(entry.date));
      
      return {
        'Month': format(monthStart, 'MMMM'),
        'Year': format(monthStart, 'yyyy'),
        'Accomplishments': entry.accomplishments || '',
        'Lessons Learned': entry.lessonsLearned || '',
        'Personal Changes': entry.personalChanges || '',
        'Habits Evolved': entry.habitsEvolved || '',
        'Relationship Evolution': entry.relationshipEvolution || '',
        'Next Month Goals': entry.nextMonthGoals || '',
        'Proudest Moments': entry.proudestMoments || '',
        'Focus Areas': entry.focusAreas || '',
        'Additional Insights': entry.additionalInsights || '',
        'Created At': format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')
      };
    });
    
    return convertToCSV(rows);
  } catch (error) {
    console.error('Error creating Monthly Journal CSV:', error);
    return 'Error,Message\nExport Failed,Unable to export monthly journal data';
  }
};

// 4. Habits CSV Export
export const exportHabitsToCSV = () => {
  try {
    const habits = JSON.parse(localStorage.getItem('diary_habits') || '[]');
    const habitCompletions = JSON.parse(localStorage.getItem('diary_habit_completions') || '{}');
    
    if (habits.length === 0) {
      return 'Date,Habit Name,Completed,Habit Color,Habit Created\nNo habits found';
    }
    
    const rows = [];
    
    // Create a comprehensive list of all dates with habit completions
    Object.keys(habitCompletions).forEach(date => {
      const completedHabitIds = habitCompletions[date] || [];
      
      habits.forEach(habit => {
        const isCompleted = completedHabitIds.includes(habit.id);
        rows.push({
          'Date': format(new Date(date), 'dd/MM/yyyy'),
          'Day': format(new Date(date), 'EEEE'),
          'Habit Name': habit.name,
          'Completed': isCompleted ? 'Yes' : 'No',
          'Habit Color': habit.color || '',
          'Habit Created': format(new Date(habit.createdAt), 'dd/MM/yyyy')
        });
      });
    });
    
    if (rows.length === 0) {
      return 'Date,Day,Habit Name,Completed,Habit Color,Habit Created\nNo habit completion data found';
    }
    
    // Sort by date and habit name
    rows.sort((a, b) => {
      const dateCompare = new Date(a.Date.split('/').reverse().join('-')) - new Date(b.Date.split('/').reverse().join('-'));
      if (dateCompare !== 0) return dateCompare;
      return a['Habit Name'].localeCompare(b['Habit Name']);
    });
    
    return convertToCSV(rows);
  } catch (error) {
    console.error('Error creating Habits CSV:', error);
    return 'Error,Message\nExport Failed,Unable to export habits data';
  }
};

// 5. Wellbeing CSV Export
export const exportWellbeingToCSV = () => {
  try {
    const wellnessData = getFromStorage(DIARY_STORAGE_KEYS.WELLNESS_DATA, []);
    
    if (wellnessData.length === 0) {
      return 'Date,Day,Mood,Stress Level,Energy Level,Wellness Score,Emotions,Notes,Created At\nNo wellbeing data found';
    }
    
    const rows = wellnessData.map(entry => ({
      'Date': format(new Date(entry.date), 'dd/MM/yyyy'),
      'Day': format(new Date(entry.date), 'EEEE'),
      'Mood': entry.mood || '',
      'Stress Level': entry.stress || '',
      'Energy Level': entry.energy || '',
      'Wellness Score': entry.wellnessScore || '',
      'Emotions': (entry.emotions || []).join('; '),
      'Notes': entry.notes || '',
      'Created At': format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')
    }));
    
    return convertToCSV(rows);
  } catch (error) {
    console.error('Error creating Wellbeing CSV:', error);
    return 'Error,Message\nExport Failed,Unable to export wellbeing data';
  }
};

// Helper function to convert data to CSV format
const convertToCSV = (data) => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

// Generate sample MyDiary import file
export const generateSampleDiaryFile = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const sampleData = {
    dailyEntries: [
      {
        id: 'daily-sample-1',
        date: format(today, 'yyyy-MM-dd'),
        entry: 'Today was a productive day! Started my morning with meditation and completed my work tasks efficiently. Feeling grateful for the small victories.',
        mood: 'Happy',
        emotions: ['happy', 'grateful', 'energetic'],
        moodScore: 8,
        energyLevel: 7,
        stressLevel: 3,
        sleepHours: 7.5,
        gratitude: 'Grateful for my health and supportive family',
        achievements: 'Completed the monthly report, had a great workout',
        challenges: 'Had some difficulty focusing in the afternoon',
        tomorrow: 'Focus on deep work sessions and take regular breaks',
        createdAt: new Date(today).toISOString(),
        updatedAt: new Date(today).toISOString()
      },
      {
        id: 'daily-sample-2',
        date: format(yesterday, 'yyyy-MM-dd'),
        entry: 'Yesterday was a learning experience. Had some challenges at work but managed to overcome them with team support.',
        mood: 'Calm',
        emotions: ['calm', 'tired'],
        moodScore: 6,
        energyLevel: 5,
        stressLevel: 5,
        sleepHours: 6.5,
        gratitude: 'Grateful for my supportive colleagues',
        achievements: 'Solved a complex problem at work',
        challenges: 'Time management was difficult',
        tomorrow: 'Plan my day better and prioritize tasks',
        createdAt: new Date(yesterday).toISOString(),
        updatedAt: new Date(yesterday).toISOString()
      }
    ],
    weeklyEntries: [
      {
        id: 'weekly-sample-1',
        week: format(lastWeek, 'yyyy-MM-dd'),
        entry: 'This week has been about growth and learning. I pushed myself out of my comfort zone by taking on new responsibilities at work. The week had its ups and downs, but overall, I feel like I made significant progress toward my goals.',
        highlights: 'Successfully presented my project to the team, started a new fitness routine',
        challenges: 'Struggled with work-life balance, had a few stressful days',
        lessons: 'Learned the importance of setting boundaries and asking for help when needed',
        nextWeekFocus: 'Focus on maintaining work-life balance and continuing the fitness routine',
        goals: 'Complete the new course module, exercise 4 times',
        mood: 'Energetic',
        overallRating: 7,
        createdAt: new Date(lastWeek).toISOString(),
        updatedAt: new Date(lastWeek).toISOString()
      }
    ],
    monthlyEntries: [
      {
        id: 'monthly-sample-1',
        month: format(lastMonth, 'yyyy-MM'),
        entry: 'This month has been transformative. I set clear goals at the beginning and worked consistently toward achieving them. There were moments of doubt and challenges, but I persevered and learned valuable lessons about resilience and self-care.',
        accomplishments: 'Completed a major project, improved my fitness level, read 3 books',
        challenges: 'Managing stress during busy periods, maintaining consistent sleep schedule',
        growth: 'Became more confident in public speaking, learned to manage my time better',
        relationships: 'Strengthened bonds with family, made new professional connections',
        habits: 'Established morning meditation routine, consistent workout schedule',
        nextMonthGoals: 'Start learning a new skill, plan a vacation, focus on creative projects',
        overallRating: 8,
        mood: 'Grateful',
        createdAt: new Date(lastMonth).toISOString(),
        updatedAt: new Date(lastMonth).toISOString()
      }
    ],
    wellnessData: [
      {
        id: 'wellness-sample-1',
        date: format(today, 'yyyy-MM-dd'),
        mood: 'Happy',
        moodScore: 8,
        energyLevel: 7,
        stressLevel: 3,
        sleepHours: 7.5,
        waterIntake: 8,
        exercise: true,
        exerciseType: 'Running',
        exerciseDuration: 30,
        meditation: true,
        meditationDuration: 15,
        socialConnection: true,
        notes: 'Had a great day with balanced activities',
        createdAt: new Date(today).toISOString()
      },
      {
        id: 'wellness-sample-2',
        date: format(yesterday, 'yyyy-MM-dd'),
        mood: 'Calm',
        moodScore: 6,
        energyLevel: 5,
        stressLevel: 5,
        sleepHours: 6.5,
        waterIntake: 6,
        exercise: false,
        meditation: true,
        meditationDuration: 10,
        socialConnection: true,
        notes: 'Rest day but maintained mindfulness practices',
        createdAt: new Date(yesterday).toISOString()
      }
    ],
    habits: [
      {
        id: 'habit-sample-1',
        name: 'Morning Meditation',
        description: 'Start each day with 10-15 minutes of mindfulness meditation',
        category: 'Wellness',
        color: '#10b981',
        target: 'daily',
        createdAt: new Date(lastMonth).toISOString()
      },
      {
        id: 'habit-sample-2',
        name: 'Daily Exercise',
        description: 'Engage in physical activity for at least 30 minutes',
        category: 'Health',
        color: '#f59e0b',
        target: 'daily',
        createdAt: new Date(lastMonth).toISOString()
      },
      {
        id: 'habit-sample-3',
        name: 'Reading',
        description: 'Read for personal development or entertainment',
        category: 'Learning',
        color: '#8b5cf6',
        target: 'daily',
        createdAt: new Date(lastMonth).toISOString()
      },
      {
        id: 'habit-sample-4',
        name: 'Gratitude Journal',
        description: 'Write down three things I am grateful for',
        category: 'Mindfulness',
        color: '#ec4899',
        target: 'daily',
        createdAt: new Date(lastMonth).toISOString()
      }
    ],
    habitCompletions: {
      [format(today, 'yyyy-MM-dd')]: {
        'habit-sample-1': true,
        'habit-sample-2': true,
        'habit-sample-3': true,
        'habit-sample-4': true
      },
      [format(yesterday, 'yyyy-MM-dd')]: {
        'habit-sample-1': true,
        'habit-sample-2': false,
        'habit-sample-3': true,
        'habit-sample-4': true
      }
    },
    settings: {
      notifications: true,
      reminderTime: '20:00',
      privacy: 'private',
      autoSave: true,
      showEmotions: true,
      exportFormat: 'json'
    },
    reminders: {
      daily: { enabled: true, time: '20:00' },
      weekly: { enabled: true, time: '19:00' },
      monthly: { enabled: true, time: '18:00' },
      random: { enabled: false, frequency: 3 }
    },
    exportDate: new Date().toISOString(),
    version: '2.0'
  };

  return JSON.stringify(sampleData, null, 2);
}; 
      daily: { enabled: true, time: '20:00' },
      weekly: { enabled: true, time: '19:00' },
      monthly: { enabled: true, time: '18:00' },
      random: { enabled: false, frequency: 3 }
    },
    exportDate: new Date().toISOString(),
    version: '2.0'
  };

  return JSON.stringify(sampleData, null, 2);
}; 