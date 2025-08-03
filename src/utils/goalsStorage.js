import { format, startOfDay, endOfDay, isToday, differenceInDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isAfter, isBefore } from 'date-fns';

// Storage keys for goals data
export const GOALS_STORAGE_KEYS = {
  GOALS: 'goals_list',
  PROGRESS: 'goals_progress',
  STREAKS: 'goals_streaks',
  SETTINGS: 'goals_settings',
  REVIEWS: 'goals_reviews'
};

// Goal types and frameworks
export const GOAL_TYPES = {
  SHORT_TERM: 'short-term',
  MID_TERM: 'mid-term',
  LONG_TERM: 'long-term'
};

export const GOAL_TIMEFRAMES = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime'
};

export const GOAL_FRAMEWORKS = {
  SMART: 'smart',
  OKR: 'okr',
  OGSM: 'ogsm',
  CUSTOM: 'custom'
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const GOAL_STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  ARCHIVED: 'archived'
};

// SMART Framework Template
export const SMART_TEMPLATE = {
  specific: '',
  measurable: '',
  achievable: '',
  relevant: '',
  timeBound: ''
};

// OKR Framework Template
export const OKR_TEMPLATE = {
  objective: '',
  keyResults: ['', '', ''],
  confidence: 5,
  effort: 5
};

// Default goal structure
export const createGoalTemplate = (type = GOAL_TYPES.SHORT_TERM, framework = GOAL_FRAMEWORKS.SMART) => ({
  id: generateId(),
  title: '',
  description: '',
  type,
  framework,
  timeframe: GOAL_TIMEFRAMES.MONTHLY,
  priority: PRIORITY_LEVELS.MEDIUM,
  status: GOAL_STATUS.NOT_STARTED,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  startDate: new Date().toISOString(),
  targetDate: addDays(new Date(), 30).toISOString(),
  completedAt: null,
  progress: 0,
  
  // Framework-specific data
  smart: framework === GOAL_FRAMEWORKS.SMART ? { ...SMART_TEMPLATE } : null,
  okr: framework === GOAL_FRAMEWORKS.OKR ? { ...OKR_TEMPLATE } : null,
  
  // Milestones and subtasks
  milestones: [],
  subtasks: [],
  
  // Tracking data
  checkIns: [],
  streakData: {
    current: 0,
    longest: 0,
    lastCheckIn: null
  },
  
  // Meta data
  tags: [],
  category: '',
  notes: '',
  attachments: []
});

// Helper function to generate unique IDs
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Storage functions
export const saveGoals = (goals) => {
  try {
    localStorage.setItem(GOALS_STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return true;
  } catch (error) {
    console.error('Error saving goals:', error);
    return false;
  }
};

export const getGoals = () => {
  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEYS.GOALS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading goals:', error);
    return [];
  }
};

export const createGoal = (goalData) => {
  try {
    const goals = getGoals();
    const newGoal = {
      ...createGoalTemplate(),
      ...goalData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    goals.push(newGoal);
    saveGoals(goals);
    return newGoal;
  } catch (error) {
    console.error('Error creating goal:', error);
    return null;
  }
};

export const updateGoal = (goalId, updates) => {
  try {
    const goals = getGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) return null;
    
    goals[goalIndex] = {
      ...goals[goalIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    saveGoals(goals);
    return goals[goalIndex];
  } catch (error) {
    console.error('Error updating goal:', error);
    return null;
  }
};

export const deleteGoal = (goalId) => {
  try {
    const goals = getGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    saveGoals(filteredGoals);
    return true;
  } catch (error) {
    console.error('Error deleting goal:', error);
    return false;
  }
};

export const getGoalById = (goalId) => {
  const goals = getGoals();
  return goals.find(g => g.id === goalId);
};

// Progress tracking functions
export const updateGoalProgress = (goalId, progressPercentage, checkInNote = '') => {
  try {
    const goal = getGoalById(goalId);
    if (!goal) return null;
    
    const now = new Date().toISOString();
    const checkIn = {
      id: generateId(),
      date: now,
      progress: progressPercentage,
      note: checkInNote,
      previousProgress: goal.progress
    };
    
    const updatedGoal = {
      ...goal,
      progress: Math.max(0, Math.min(100, progressPercentage)),
      checkIns: [...goal.checkIns, checkIn],
      updatedAt: now,
      status: progressPercentage >= 100 ? GOAL_STATUS.COMPLETED : 
              progressPercentage > 0 ? GOAL_STATUS.IN_PROGRESS : 
              GOAL_STATUS.NOT_STARTED,
      completedAt: progressPercentage >= 100 ? now : goal.completedAt
    };
    
    // Update streak data
    updatedGoal.streakData = updateStreakData(goal.streakData, now);
    
    return updateGoal(goalId, updatedGoal);
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return null;
  }
};

// Streak tracking
export const updateStreakData = (streakData, checkInDate) => {
  const today = startOfDay(new Date());
  const checkInDay = startOfDay(new Date(checkInDate));
  const lastCheckInDay = streakData.lastCheckIn ? startOfDay(new Date(streakData.lastCheckIn)) : null;
  
  if (!lastCheckInDay) {
    // First check-in
    return {
      current: 1,
      longest: Math.max(1, streakData.longest),
      lastCheckIn: checkInDate
    };
  }
  
  const daysSinceLastCheckIn = differenceInDays(checkInDay, lastCheckInDay);
  
  if (daysSinceLastCheckIn === 1) {
    // Consecutive day
    const newCurrent = streakData.current + 1;
    return {
      current: newCurrent,
      longest: Math.max(newCurrent, streakData.longest),
      lastCheckIn: checkInDate
    };
  } else if (daysSinceLastCheckIn === 0) {
    // Same day update
    return {
      ...streakData,
      lastCheckIn: checkInDate
    };
  } else {
    // Streak broken
    return {
      current: 1,
      longest: streakData.longest,
      lastCheckIn: checkInDate
    };
  }
};

// Analytics functions
export const getGoalsAnalytics = () => {
  const goals = getGoals();
  const now = new Date();
  
  const analytics = {
    total: goals.length,
    completed: goals.filter(g => g.status === GOAL_STATUS.COMPLETED).length,
    inProgress: goals.filter(g => g.status === GOAL_STATUS.IN_PROGRESS).length,
    notStarted: goals.filter(g => g.status === GOAL_STATUS.NOT_STARTED).length,
    overdue: goals.filter(g => 
      g.status !== GOAL_STATUS.COMPLETED && 
      new Date(g.targetDate) < now
    ).length,
    
    // Progress statistics
    averageProgress: goals.length > 0 ? 
      goals.reduce((sum, g) => sum + g.progress, 0) / goals.length : 0,
    
    // Time-based analytics
    thisWeek: {
      completed: goals.filter(g => 
        g.status === GOAL_STATUS.COMPLETED && 
        g.completedAt &&
        isThisWeek(new Date(g.completedAt))
      ).length,
      created: goals.filter(g => isThisWeek(new Date(g.createdAt))).length
    },
    
    thisMonth: {
      completed: goals.filter(g => 
        g.status === GOAL_STATUS.COMPLETED && 
        g.completedAt &&
        isThisMonth(new Date(g.completedAt))
      ).length,
      created: goals.filter(g => isThisMonth(new Date(g.createdAt))).length
    },
    
    // Priority distribution
    priorityDistribution: {
      low: goals.filter(g => g.priority === PRIORITY_LEVELS.LOW).length,
      medium: goals.filter(g => g.priority === PRIORITY_LEVELS.MEDIUM).length,
      high: goals.filter(g => g.priority === PRIORITY_LEVELS.HIGH).length,
      critical: goals.filter(g => g.priority === PRIORITY_LEVELS.CRITICAL).length
    },
    
    // Type distribution
    typeDistribution: {
      [GOAL_TYPES.SHORT_TERM]: goals.filter(g => g.type === GOAL_TYPES.SHORT_TERM).length,
      [GOAL_TYPES.MID_TERM]: goals.filter(g => g.type === GOAL_TYPES.MID_TERM).length,
      [GOAL_TYPES.LONG_TERM]: goals.filter(g => g.type === GOAL_TYPES.LONG_TERM).length
    },
    
    // Streak data
    longestStreak: Math.max(...goals.map(g => g.streakData?.longest || 0), 0),
    activeStreaks: goals.filter(g => g.streakData?.current > 0).length
  };
  
  return analytics;
};

// Milestone and subtask functions
export const addMilestone = (goalId, milestone) => {
  const goal = getGoalById(goalId);
  if (!goal) return null;
  
  const newMilestone = {
    id: generateId(),
    title: milestone.title,
    description: milestone.description || '',
    targetDate: milestone.targetDate,
    completed: false,
    completedAt: null,
    progress: 0,
    createdAt: new Date().toISOString()
  };
  
  const updatedMilestones = [...goal.milestones, newMilestone];
  return updateGoal(goalId, { milestones: updatedMilestones });
};

export const updateMilestone = (goalId, milestoneId, updates) => {
  const goal = getGoalById(goalId);
  if (!goal) return null;
  
  const milestones = goal.milestones.map(m => 
    m.id === milestoneId ? { ...m, ...updates } : m
  );
  
  return updateGoal(goalId, { milestones });
};

export const addSubtask = (goalId, subtask) => {
  const goal = getGoalById(goalId);
  if (!goal) return null;
  
  const newSubtask = {
    id: generateId(),
    title: subtask.title,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString()
  };
  
  const updatedSubtasks = [...goal.subtasks, newSubtask];
  return updateGoal(goalId, { subtasks: updatedSubtasks });
};

export const toggleSubtask = (goalId, subtaskId) => {
  const goal = getGoalById(goalId);
  if (!goal) return null;
  
  const subtasks = goal.subtasks.map(s => {
    if (s.id === subtaskId) {
      const completed = !s.completed;
      return {
        ...s,
        completed,
        completedAt: completed ? new Date().toISOString() : null
      };
    }
    return s;
  });
  
  // Calculate overall progress based on subtasks
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const progressFromSubtasks = subtasks.length > 0 ? 
    (completedSubtasks / subtasks.length) * 100 : goal.progress;
  
  return updateGoal(goalId, { 
    subtasks,
    progress: Math.max(goal.progress, progressFromSubtasks)
  });
};

// Calendar heatmap data
export const getGoalHeatmapData = (goalId, year = new Date().getFullYear()) => {
  const goal = getGoalById(goalId);
  if (!goal) return [];
  
  const checkIns = goal.checkIns || [];
  const heatmapData = [];
  
  // Generate data for each day of the year
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayCheckIns = checkIns.filter(c => 
      format(new Date(c.date), 'yyyy-MM-dd') === dateStr
    );
    
    heatmapData.push({
      date: dateStr,
      count: dayCheckIns.length,
      progress: dayCheckIns.length > 0 ? dayCheckIns[dayCheckIns.length - 1].progress : 0,
      hasActivity: dayCheckIns.length > 0
    });
  }
  
  return heatmapData;
};

// Date helper functions
const isThisWeek = (date) => {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  return date >= weekStart && date <= weekEnd;
};

const isThisMonth = (date) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  return date >= monthStart && date <= monthEnd;
};

// Review and reflection functions
export const createReview = (type, data) => {
  try {
    const reviews = getReviews();
    const newReview = {
      id: generateId(),
      type, // 'weekly', 'monthly', 'quarterly', 'yearly'
      date: new Date().toISOString(),
      data,
      goals: getGoals().map(g => ({
        id: g.id,
        title: g.title,
        progress: g.progress,
        status: g.status
      }))
    };
    
    reviews.push(newReview);
    localStorage.setItem(GOALS_STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    return newReview;
  } catch (error) {
    console.error('Error creating review:', error);
    return null;
  }
};

export const getReviews = () => {
  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEYS.REVIEWS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading reviews:', error);
    return [];
  }
};

// Export functions
export const exportGoalsData = () => {
  const data = {
    goals: getGoals(),
    reviews: getReviews(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(data, null, 2);
};

export const exportGoalsCSV = () => {
  const goals = getGoals();
  const headers = [
    'Title', 'Type', 'Priority', 'Status', 'Progress', 
    'Start Date', 'Target Date', 'Completed Date', 'Notes'
  ];
  
  const rows = goals.map(goal => [
    goal.title,
    goal.type,
    goal.priority,
    goal.status,
    `${goal.progress}%`,
    format(new Date(goal.startDate), 'yyyy-MM-dd'),
    format(new Date(goal.targetDate), 'yyyy-MM-dd'),
    goal.completedAt ? format(new Date(goal.completedAt), 'yyyy-MM-dd') : '',
    goal.notes || ''
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
}; 