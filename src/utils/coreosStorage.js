import { format, isToday, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { sanitizeInput, isValidDate } from './security';
import toast from 'react-hot-toast';

// Storage keys for CoreOS modules
export const COREOS_STORAGE_KEYS = {
  TASKS: 'coreos_tasks',
  HABITS: 'coreos_habits',
  FITNESS: 'coreos_fitness',
  MENTAL_HEALTH: 'coreos_mental_health',
  STREAKS: 'coreos_streaks',
  USER_PREFERENCES: 'coreos_preferences'
};

// Helper function to get data from localStorage
const getFromStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading from storage (${key}):`, error);
    return defaultValue;
  }
};

// Helper function to save data to localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    toast.error('Failed to save data locally');
    return false;
  }
};

// ==================== DAILY TASKS + HABITOS ====================

// Task structure
const createTask = (title, timeBlock = null, priority = 'medium', category = 'general') => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  title: sanitizeInput(title),
  timeBlock: timeBlock ? sanitizeInput(timeBlock) : null,
  priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
  category: sanitizeInput(category),
  completed: false,
  completedAt: null,
  createdAt: new Date().toISOString(),
  date: format(new Date(), 'yyyy-MM-dd'),
  estimatedDuration: 30, // minutes
  actualDuration: null,
  notes: ''
});

// Habit structure with Cue-Routine-Reward model
const createHabit = (name, cue, routine, reward, frequency = 'daily') => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: sanitizeInput(name),
  cue: sanitizeInput(cue), // What triggers the habit
  routine: sanitizeInput(routine), // The habit itself
  reward: sanitizeInput(reward), // What you get from it
  frequency: ['daily', 'weekly', 'monthly'].includes(frequency) ? frequency : 'daily',
  streak: 0,
  longestStreak: 0,
  completions: [], // Array of completion dates
  createdAt: new Date().toISOString(),
  isActive: true,
  category: 'personal',
  difficulty: 'medium', // easy, medium, hard
  timeOfDay: 'morning' // morning, afternoon, evening, anytime
});

// Get today's tasks
export const getTodayTasks = () => {
  const tasks = getFromStorage(COREOS_STORAGE_KEYS.TASKS, []);
  const today = format(new Date(), 'yyyy-MM-dd');
  return tasks.filter(task => task.date === today);
};

// Add new task
export const addTask = (title, timeBlock = null, priority = 'medium', category = 'general') => {
  const tasks = getFromStorage(COREOS_STORAGE_KEYS.TASKS, []);
  const newTask = createTask(title, timeBlock, priority, category);
  tasks.push(newTask);
  
  if (saveToStorage(COREOS_STORAGE_KEYS.TASKS, tasks)) {
    toast.success('Task added successfully!');
    return newTask;
  }
  return null;
};

// Complete task
export const completeTask = (taskId) => {
  const tasks = getFromStorage(COREOS_STORAGE_KEYS.TASKS, []);
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = true;
    tasks[taskIndex].completedAt = new Date().toISOString();
    
    if (saveToStorage(COREOS_STORAGE_KEYS.TASKS, tasks)) {
      updateStreak('tasks');
      toast.success('Task completed! 🎉');
      return tasks[taskIndex];
    }
  }
  return null;
};

// Get today's habits
export const getTodayHabits = () => {
  const habits = getFromStorage(COREOS_STORAGE_KEYS.HABITS, []);
  const today = format(new Date(), 'yyyy-MM-dd');
  
  return habits.filter(habit => habit.isActive).map(habit => ({
    ...habit,
    completed: habit.completions.some(completion => 
      format(new Date(completion), 'yyyy-MM-dd') === today
    )
  }));
};

// Add new habit
export const addHabit = (name, cue, routine, reward, frequency = 'daily') => {
  const habits = getFromStorage(COREOS_STORAGE_KEYS.HABITS, []);
  const newHabit = createHabit(name, cue, routine, reward, frequency);
  habits.push(newHabit);
  
  if (saveToStorage(COREOS_STORAGE_KEYS.HABITS, habits)) {
    toast.success('Habit added successfully!');
    return newHabit;
  }
  return null;
};

// Complete habit
export const completeHabit = (habitId) => {
  const habits = getFromStorage(COREOS_STORAGE_KEYS.HABITS, []);
  const habitIndex = habits.findIndex(habit => habit.id === habitId);
  
  if (habitIndex !== -1) {
    const today = new Date().toISOString();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    // Check if already completed today
    const alreadyCompleted = habits[habitIndex].completions.some(completion => 
      format(new Date(completion), 'yyyy-MM-dd') === todayStr
    );
    
    if (!alreadyCompleted) {
      habits[habitIndex].completions.push(today);
      habits[habitIndex].streak = calculateHabitStreak(habits[habitIndex].completions);
      habits[habitIndex].longestStreak = Math.max(
        habits[habitIndex].longestStreak, 
        habits[habitIndex].streak
      );
      
      if (saveToStorage(COREOS_STORAGE_KEYS.HABITS, habits)) {
        updateStreak('habits');
        toast.success(`Habit completed! 🔥 ${habits[habitIndex].streak} day streak!`);
        return habits[habitIndex];
      }
    } else {
      toast.info('Habit already completed today!');
    }
  }
  return null;
};

// Calculate habit streak
const calculateHabitStreak = (completions) => {
  if (completions.length === 0) return 0;
  
  const sortedDates = completions
    .map(date => format(new Date(date), 'yyyy-MM-dd'))
    .sort()
    .reverse();
  
  let streak = 0;
  let currentDate = new Date();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = format(subDays(currentDate, i), 'yyyy-MM-dd');
    if (sortedDates[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// ==================== FITNESS TRACKER ====================

// Workout structure
const createWorkout = (type, exercises = [], duration = 0) => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  type: sanitizeInput(type), // strength, cardio, flexibility, sports
  exercises: exercises.map(exercise => ({
    name: sanitizeInput(exercise.name),
    sets: exercise.sets || 1,
    reps: exercise.reps || 0,
    weight: exercise.weight || 0,
    duration: exercise.duration || 0, // for cardio
    distance: exercise.distance || 0, // for running/cycling
    notes: sanitizeInput(exercise.notes || '')
  })),
  duration: duration, // total workout duration in minutes
  caloriesBurned: 0,
  date: new Date().toISOString(),
  mood: 'good', // how you felt during workout
  difficulty: 'medium',
  location: 'gym'
});

// Meal structure
const createMeal = (name, calories, protein = 0, carbs = 0, fat = 0) => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: sanitizeInput(name),
  calories: parseFloat(calories) || 0,
  macros: {
    protein: parseFloat(protein) || 0,
    carbs: parseFloat(carbs) || 0,
    fat: parseFloat(fat) || 0
  },
  date: new Date().toISOString(),
  mealType: 'other', // breakfast, lunch, dinner, snack
  ingredients: [],
  notes: ''
});

// Body metrics structure
const createBodyMetrics = (weight, bodyFat = null, hrv = null) => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  weight: parseFloat(weight) || 0,
  bodyFat: bodyFat ? parseFloat(bodyFat) : null,
  hrv: hrv ? parseFloat(hrv) : null, // Heart Rate Variability
  date: new Date().toISOString(),
  notes: ''
});

// Get today's fitness data
export const getTodayFitness = () => {
  const fitness = getFromStorage(COREOS_STORAGE_KEYS.FITNESS, {
    workouts: [],
    meals: [],
    bodyMetrics: [],
    goals: {
      dailyCalories: 2000,
      dailyProtein: 150,
      weeklyWorkouts: 4
    }
  });
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayWorkouts = fitness.workouts.filter(workout => 
    format(new Date(workout.date), 'yyyy-MM-dd') === today
  );
  const todayMeals = fitness.meals.filter(meal => 
    format(new Date(meal.date), 'yyyy-MM-dd') === today
  );
  
  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.macros.protein, 0);
  
  const dailyScore = Math.min(100, Math.round(
    (todayWorkouts.length > 0 ? 50 : 0) + // 50% for workout
    (totalCalories > 0 ? (totalCalories / fitness.goals.dailyCalories) * 50 : 0) // 50% for nutrition
  ));
  
  return {
    workouts: todayWorkouts,
    meals: todayMeals,
    workoutsToday: todayWorkouts.length,
    totalCalories,
    totalProtein,
    dailyScore,
    goals: fitness.goals
  };
};

// Add workout
export const addWorkout = (type, exercises, duration) => {
  const fitness = getFromStorage(COREOS_STORAGE_KEYS.FITNESS, {
    workouts: [],
    meals: [],
    bodyMetrics: [],
    goals: { dailyCalories: 2000, dailyProtein: 150, weeklyWorkouts: 4 }
  });
  
  const newWorkout = createWorkout(type, exercises, duration);
  fitness.workouts.push(newWorkout);
  
  if (saveToStorage(COREOS_STORAGE_KEYS.FITNESS, fitness)) {
    updateStreak('fitness');
    toast.success('Workout logged! 💪');
    return newWorkout;
  }
  return null;
};

// Add meal
export const addMeal = (name, calories, protein, carbs, fat) => {
  const fitness = getFromStorage(COREOS_STORAGE_KEYS.FITNESS, {
    workouts: [],
    meals: [],
    bodyMetrics: [],
    goals: { dailyCalories: 2000, dailyProtein: 150, weeklyWorkouts: 4 }
  });
  
  const newMeal = createMeal(name, calories, protein, carbs, fat);
  fitness.meals.push(newMeal);
  
  if (saveToStorage(COREOS_STORAGE_KEYS.FITNESS, fitness)) {
    toast.success('Meal logged! 🍎');
    return newMeal;
  }
  return null;
};

// ==================== MENTAL RESET ====================

// Mental health check-in structure
const createMentalCheckIn = (mood, stress, energy, notes = '') => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  mood: mood, // 1-10 scale
  stress: stress, // 1-10 scale
  energy: energy, // 1-10 scale
  emotions: [], // array of emotion tags
  stressors: [], // what's causing stress
  gratitude: [], // things you're grateful for
  notes: sanitizeInput(notes),
  date: new Date().toISOString(),
  activities: [] // meditation, breathwork, etc.
});

// Meditation/breathwork session
const createMeditationSession = (type, duration, notes = '') => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  type: sanitizeInput(type), // meditation, breathwork, mindfulness
  duration: parseFloat(duration) || 0, // minutes
  technique: '', // specific technique used
  effectiveness: 5, // 1-10 how effective it felt
  notes: sanitizeInput(notes),
  date: new Date().toISOString()
});

// Get today's mental health data
export const getTodayMentalHealth = () => {
  const mentalHealth = getFromStorage(COREOS_STORAGE_KEYS.MENTAL_HEALTH, {
    checkIns: [],
    meditations: [],
    goals: {
      dailyMeditation: 10, // minutes
      weeklyCheckIns: 7
    }
  });
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayCheckIn = mentalHealth.checkIns.find(checkIn => 
    format(new Date(checkIn.date), 'yyyy-MM-dd') === today
  );
  const todayMeditations = mentalHealth.meditations.filter(meditation => 
    format(new Date(meditation.date), 'yyyy-MM-dd') === today
  );
  
  const totalMeditationTime = todayMeditations.reduce((sum, session) => sum + session.duration, 0);
  
  const dailyScore = Math.min(100, Math.round(
    (todayCheckIn ? 40 : 0) + // 40% for daily check-in
    (totalMeditationTime > 0 ? (totalMeditationTime / mentalHealth.goals.dailyMeditation) * 60 : 0) // 60% for meditation
  ));
  
  return {
    checkIn: todayCheckIn,
    meditations: todayMeditations,
    totalMeditationTime,
    dailyScore,
    mood: todayCheckIn ? getMoodLabel(todayCheckIn.mood) : null,
    goals: mentalHealth.goals
  };
};

// Get mood label
const getMoodLabel = (moodScore) => {
  if (moodScore >= 8) return 'Excellent';
  if (moodScore >= 6) return 'Good';
  if (moodScore >= 4) return 'Okay';
  if (moodScore >= 2) return 'Poor';
  return 'Very Poor';
};

// Add mental health check-in
export const addMentalCheckIn = (mood, stress, energy, notes = '') => {
  const mentalHealth = getFromStorage(COREOS_STORAGE_KEYS.MENTAL_HEALTH, {
    checkIns: [],
    meditations: [],
    goals: { dailyMeditation: 10, weeklyCheckIns: 7 }
  });
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const existingCheckInIndex = mentalHealth.checkIns.findIndex(checkIn => 
    format(new Date(checkIn.date), 'yyyy-MM-dd') === today
  );
  
  const newCheckIn = createMentalCheckIn(mood, stress, energy, notes);
  
  if (existingCheckInIndex !== -1) {
    mentalHealth.checkIns[existingCheckInIndex] = newCheckIn;
    toast.success('Mental health check-in updated! 🧠');
  } else {
    mentalHealth.checkIns.push(newCheckIn);
    updateStreak('mental');
    toast.success('Mental health check-in completed! 🧠');
  }
  
  if (saveToStorage(COREOS_STORAGE_KEYS.MENTAL_HEALTH, mentalHealth)) {
    return newCheckIn;
  }
  return null;
};

// Add meditation session
export const addMeditationSession = (type, duration, notes = '') => {
  const mentalHealth = getFromStorage(COREOS_STORAGE_KEYS.MENTAL_HEALTH, {
    checkIns: [],
    meditations: [],
    goals: { dailyMeditation: 10, weeklyCheckIns: 7 }
  });
  
  const newSession = createMeditationSession(type, duration, notes);
  mentalHealth.meditations.push(newSession);
  
  if (saveToStorage(COREOS_STORAGE_KEYS.MENTAL_HEALTH, mentalHealth)) {
    toast.success(`Meditation session completed! 🧘‍♀️ ${duration} minutes`);
    return newSession;
  }
  return null;
};

// ==================== STREAK MANAGEMENT ====================

// Update streak for a module
export const updateStreak = (module) => {
  const streaks = getFromStorage(COREOS_STORAGE_KEYS.STREAKS, {});
  const today = format(new Date(), 'yyyy-MM-dd');
  
  if (!streaks[module]) {
    streaks[module] = {
      current: 0,
      longest: 0,
      lastUpdate: null,
      history: []
    };
  }
  
  // Check if already updated today
  if (streaks[module].lastUpdate === today) {
    return streaks[module].current;
  }
  
  // Check if streak should continue (yesterday was completed)
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const shouldContinue = streaks[module].lastUpdate === yesterday;
  
  if (shouldContinue) {
    streaks[module].current += 1;
  } else {
    streaks[module].current = 1; // Reset streak
  }
  
  streaks[module].longest = Math.max(streaks[module].longest, streaks[module].current);
  streaks[module].lastUpdate = today;
  streaks[module].history.push({
    date: today,
    streak: streaks[module].current
  });
  
  saveToStorage(COREOS_STORAGE_KEYS.STREAKS, streaks);
  return streaks[module].current;
};

// Get active streak for a module
export const getActiveStreak = (module) => {
  const streaks = getFromStorage(COREOS_STORAGE_KEYS.STREAKS, {});
  return streaks[module]?.current || 0;
};

// Get all streaks
export const getAllStreaks = () => {
  return getFromStorage(COREOS_STORAGE_KEYS.STREAKS, {});
};

// ==================== GOAL INTEGRATION ====================

// Link task to goal
export const linkTaskToGoal = (taskId, goalId) => {
  const tasks = getFromStorage(COREOS_STORAGE_KEYS.TASKS, []);
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].linkedGoal = goalId;
    if (saveToStorage(COREOS_STORAGE_KEYS.TASKS, tasks)) {
      toast.success('Task linked to goal successfully!');
      return tasks[taskIndex];
    }
  }
  return null;
};

// Link habit to goal
export const linkHabitToGoal = (habitId, goalId) => {
  const habits = getFromStorage(COREOS_STORAGE_KEYS.HABITS, []);
  const habitIndex = habits.findIndex(habit => habit.id === habitId);
  
  if (habitIndex !== -1) {
    habits[habitIndex].linkedGoal = goalId;
    if (saveToStorage(COREOS_STORAGE_KEYS.HABITS, habits)) {
      toast.success('Habit linked to goal successfully!');
      return habits[habitIndex];
    }
  }
  return null;
};

// Get goal progress from linked activities
export const getGoalProgress = (goalId) => {
  const tasks = getFromStorage(COREOS_STORAGE_KEYS.TASKS, []);
  const habits = getFromStorage(COREOS_STORAGE_KEYS.HABITS, []);
  
  const linkedTasks = tasks.filter(task => task.linkedGoal === goalId);
  const linkedHabits = habits.filter(habit => habit.linkedGoal === goalId);
  
  const completedTasks = linkedTasks.filter(task => task.completed).length;
  const completedHabits = linkedHabits.filter(habit => habit.completed).length;
  
  const totalLinked = linkedTasks.length + linkedHabits.length;
  const totalCompleted = completedTasks + completedHabits;
  
  return {
    linkedTasks: linkedTasks.length,
    linkedHabits: linkedHabits.length,
    completedTasks,
    completedHabits,
    progressFromActivities: totalLinked > 0 ? (totalCompleted / totalLinked) * 100 : 0
  };
};

// ==================== ANALYTICS DATA ====================

// Get weekly data for analytics
export const getWeeklyData = () => {
  const tasks = getFromStorage(COREOS_STORAGE_KEYS.TASKS, []);
  const habits = getFromStorage(COREOS_STORAGE_KEYS.HABITS, []);
  const fitness = getFromStorage(COREOS_STORAGE_KEYS.FITNESS, []);
  const mental = getFromStorage(COREOS_STORAGE_KEYS.MENTAL_HEALTH, []);
  
  const weekData = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayTasks = tasks.filter(task => task.date === dateStr);
    const dayHabits = habits.filter(habit => 
      habit.completions.some(completion => 
        format(new Date(completion), 'yyyy-MM-dd') === dateStr
      )
    );
    const dayFitness = fitness.filter(workout => 
      format(new Date(workout.date), 'yyyy-MM-dd') === dateStr
    );
    const dayMental = mental.filter(session => 
      format(new Date(session.date), 'yyyy-MM-dd') === dateStr
    );
    
    weekData.push({
      date: format(date, 'MMM dd'),
      tasks: dayTasks.length,
      completedTasks: dayTasks.filter(t => t.completed).length,
      habits: dayHabits.length,
      fitness: dayFitness.length,
      mental: dayMental.length,
      fitnessScore: dayFitness.reduce((acc, w) => acc + (w.score || 0), 0) / (dayFitness.length || 1),
      mentalScore: dayMental.reduce((acc, s) => acc + (s.score || 0), 0) / (dayMental.length || 1)
    });
  }
  
  return weekData;
};

// Get monthly data for analytics
export const getMonthlyData = () => {
  const tasks = getFromStorage(COREOS_STORAGE_KEYS.TASKS, []);
  const habits = getFromStorage(COREOS_STORAGE_KEYS.HABITS, []);
  
  const monthData = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayTasks = tasks.filter(task => task.date === dateStr);
    const dayHabits = habits.filter(habit => 
      habit.completions.some(completion => 
        format(new Date(completion), 'yyyy-MM-dd') === dateStr
      )
    );
    
    monthData.push({
      date: format(date, 'MMM dd'),
      tasks: dayTasks.length,
      completedTasks: dayTasks.filter(t => t.completed).length,
      habits: dayHabits.length,
      productivity: dayTasks.length > 0 ? (dayTasks.filter(t => t.completed).length / dayTasks.length) * 100 : 0
    });
  }
  
  return monthData;
};

// ==================== EXPORT ALL FUNCTIONS ====================

export default {
  // Tasks
  getTodayTasks,
  addTask,
  completeTask,
  
  // Habits
  getTodayHabits,
  addHabit,
  completeHabit,
  
  // Fitness
  getTodayFitness,
  addWorkout,
  addMeal,
  
  // Mental Health
  getTodayMentalHealth,
  addMentalCheckIn,
  addMeditationSession,
  
  // Streaks
  updateStreak,
  getActiveStreak,
  getAllStreaks
}; 