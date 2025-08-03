import { format, isToday, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';
import { 
  getTodayTasks, 
  getTodayHabits, 
  getTodayFitness, 
  getTodayMentalHealth,
  getActiveStreak 
} from './coreosStorage';

// AI-powered recommendation engine for CoreOS
export const generateSmartRecommendations = async () => {
  try {
    const [tasks, habits, fitness, mental] = await Promise.all([
      getTodayTasks(),
      getTodayHabits(),
      getTodayFitness(),
      getTodayMentalHealth()
    ]);

    const streaks = {
      tasks: getActiveStreak('tasks'),
      habits: getActiveStreak('habits'),
      fitness: getActiveStreak('fitness'),
      mental: getActiveStreak('mental')
    };

    const recommendations = [];

    // Analyze task patterns
    const taskAnalysis = analyzeTaskPatterns(tasks);
    recommendations.push(...taskAnalysis);

    // Analyze habit patterns
    const habitAnalysis = analyzeHabitPatterns(habits, streaks.habits);
    recommendations.push(...habitAnalysis);

    // Analyze fitness patterns
    const fitnessAnalysis = analyzeFitnessPatterns(fitness, streaks.fitness);
    recommendations.push(...fitnessAnalysis);

    // Analyze mental health patterns
    const mentalAnalysis = analyzeMentalPatterns(mental, streaks.mental);
    recommendations.push(...mentalAnalysis);

    // Cross-pattern analysis
    const crossAnalysis = analyzeCrossPatterns(tasks, habits, fitness, mental);
    recommendations.push(...crossAnalysis);

    // Priority and time-based recommendations
    const timeAnalysis = analyzeTimePatterns(tasks, habits);
    recommendations.push(...timeAnalysis);

    return recommendations.slice(0, 8); // Return top 8 recommendations
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

// Analyze task completion patterns
const analyzeTaskPatterns = (tasks) => {
  const recommendations = [];
  const completedTasks = tasks.filter(task => task.completed);
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  if (completionRate < 30) {
    recommendations.push({
      type: 'productivity',
      priority: 'high',
      title: 'Break Down Large Tasks',
      description: 'Your task completion rate is low. Try breaking large tasks into smaller, manageable chunks.',
      action: 'Create 2-3 small tasks instead of 1 large one',
      icon: '🎯',
      category: 'productivity'
    });
  }

  if (tasks.length > 8) {
    recommendations.push({
      type: 'productivity',
      priority: 'medium',
      title: 'Focus on Priority Tasks',
      description: 'You have many tasks today. Focus on 3-5 high-priority items first.',
      action: 'Use the Eisenhower Matrix to prioritize',
      icon: '📋',
      category: 'productivity'
    });
  }

  // Analyze task timing patterns
  const morningTasks = tasks.filter(task => 
    task.timeBlock && task.timeBlock.toLowerCase().includes('morning')
  );
  
  if (morningTasks.length === 0 && tasks.length > 0) {
    recommendations.push({
      type: 'productivity',
      priority: 'medium',
      title: 'Add Morning Routine',
      description: 'Consider scheduling important tasks in the morning when energy is highest.',
      action: 'Block 2 hours for focused work in the morning',
      icon: '🌅',
      category: 'productivity'
    });
  }

  return recommendations;
};

// Analyze habit formation patterns
const analyzeHabitPatterns = (habits, streak) => {
  const recommendations = [];
  const completedHabits = habits.filter(habit => habit.completed);
  const completionRate = habits.length > 0 ? (completedHabits.length / habits.length) * 100 : 0;

  if (streak >= 21) {
    recommendations.push({
      type: 'habits',
      priority: 'low',
      title: 'Habit Mastery Achieved!',
      description: `Amazing ${streak}-day streak! Consider adding a new challenging habit.`,
      action: 'Add a complementary habit to your routine',
      icon: '🏆',
      category: 'habits'
    });
  } else if (streak >= 7) {
    recommendations.push({
      type: 'habits',
      priority: 'medium',
      title: 'Strengthen Your Streak',
      description: `Great ${streak}-day streak! Focus on consistency to reach 21 days.`,
      action: 'Set up environmental cues for habit triggers',
      icon: '🔥',
      category: 'habits'
    });
  }

  if (completionRate < 50 && habits.length > 0) {
    recommendations.push({
      type: 'habits',
      priority: 'high',
      title: 'Simplify Your Habits',
      description: 'Low habit completion suggests overcommitment. Start with 1-2 core habits.',
      action: 'Reduce to 2 most important habits',
      icon: '🎯',
      category: 'habits'
    });
  }

  // Habit stacking recommendation
  if (habits.length >= 2 && completionRate > 70) {
    recommendations.push({
      type: 'habits',
      priority: 'low',
      title: 'Try Habit Stacking',
      description: 'Link new habits to existing strong ones for better consistency.',
      action: 'After [existing habit], I will [new habit]',
      icon: '🔗',
      category: 'habits'
    });
  }

  return recommendations;
};

// Analyze fitness patterns
const analyzeFitnessPatterns = (fitness, streak) => {
  const recommendations = [];
  const fitnessScore = fitness?.dailyScore || 0;

  if (fitnessScore < 30) {
    recommendations.push({
      type: 'fitness',
      priority: 'high',
      title: 'Start Small with Fitness',
      description: 'Begin with 10-15 minutes of light exercise to build the habit.',
      action: 'Schedule a 15-minute walk today',
      icon: '🚶‍♂️',
      category: 'fitness'
    });
  } else if (fitnessScore >= 80) {
    recommendations.push({
      type: 'fitness',
      priority: 'low',
      title: 'Fitness Champion!',
      description: 'Excellent fitness score! Consider setting a new challenge.',
      action: 'Try a new workout style or increase intensity',
      icon: '💪',
      category: 'fitness'
    });
  }

  if (streak === 0 && fitnessScore === 0) {
    recommendations.push({
      type: 'fitness',
      priority: 'medium',
      title: 'Movement is Medicine',
      description: 'Regular movement improves both physical and mental health.',
      action: 'Set a daily step goal or do 5 minutes of stretching',
      icon: '🏃‍♀️',
      category: 'fitness'
    });
  }

  return recommendations;
};

// Analyze mental health patterns
const analyzeMentalPatterns = (mental, streak) => {
  const recommendations = [];
  const mentalScore = mental?.dailyScore || 0;

  if (mentalScore < 40) {
    recommendations.push({
      type: 'mental',
      priority: 'high',
      title: 'Prioritize Mental Wellness',
      description: 'Low mental health score. Take time for self-care and stress relief.',
      action: 'Try 5 minutes of deep breathing or meditation',
      icon: '🧘‍♀️',
      category: 'mental'
    });
  }

  if (streak >= 7) {
    recommendations.push({
      type: 'mental',
      priority: 'low',
      title: 'Mental Health Consistency',
      description: `Great ${streak}-day mental health streak! Keep nurturing your mind.`,
      action: 'Add gratitude journaling to your routine',
      icon: '💝',
      category: 'mental'
    });
  }

  if (mentalScore === 0) {
    recommendations.push({
      type: 'mental',
      priority: 'medium',
      title: 'Mind-Body Connection',
      description: 'Mental health check-ins help you understand your emotional patterns.',
      action: 'Rate your mood and write 3 things you\'re grateful for',
      icon: '❤️',
      category: 'mental'
    });
  }

  return recommendations;
};

// Cross-pattern analysis
const analyzeCrossPatterns = (tasks, habits, fitness, mental) => {
  const recommendations = [];
  const completedTasks = tasks.filter(t => t.completed).length;
  const completedHabits = habits.filter(h => h.completed).length;
  const fitnessScore = fitness?.dailyScore || 0;
  const mentalScore = mental?.dailyScore || 0;

  // High productivity but low wellness
  if (completedTasks >= 5 && (fitnessScore < 30 || mentalScore < 30)) {
    recommendations.push({
      type: 'balance',
      priority: 'high',
      title: 'Work-Life Balance Check',
      description: 'High productivity but low wellness scores. Remember to care for yourself.',
      action: 'Schedule breaks between tasks for movement or mindfulness',
      icon: '⚖️',
      category: 'balance'
    });
  }

  // High wellness but low productivity
  if ((fitnessScore > 70 || mentalScore > 70) && completedTasks < 2) {
    recommendations.push({
      type: 'balance',
      priority: 'medium',
      title: 'Channel Your Energy',
      description: 'Great wellness scores! Use this positive energy for productive tasks.',
      action: 'Tackle one important task while energy is high',
      icon: '⚡',
      category: 'balance'
    });
  }

  // Suggest integration
  if (tasks.length > 0 && habits.length > 0) {
    recommendations.push({
      type: 'integration',
      priority: 'low',
      title: 'Link Tasks to Habits',
      description: 'Connect your daily tasks to long-term habits for better consistency.',
      action: 'Use the Goal Integration feature to link activities',
      icon: '🔗',
      category: 'integration'
    });
  }

  return recommendations;
};

// Time-based pattern analysis
const analyzeTimePatterns = (tasks, habits) => {
  const recommendations = [];
  const currentHour = new Date().getHours();

  // Morning recommendations (6-11 AM)
  if (currentHour >= 6 && currentHour <= 11) {
    const morningTasks = tasks.filter(task => !task.completed);
    if (morningTasks.length > 0) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        title: 'Golden Hour Productivity',
        description: 'Morning is prime time for focused work. Tackle your most important task now.',
        action: 'Start with your highest priority task',
        icon: '🌅',
        category: 'timing'
      });
    }
  }

  // Afternoon recommendations (12-17 PM)
  if (currentHour >= 12 && currentHour <= 17) {
    const morningHabits = habits.filter(h => h.timeOfDay === 'morning' && !h.completed);
    if (morningHabits.length > 0) {
      recommendations.push({
        type: 'timing',
        priority: 'high',
        title: 'Catch Up on Morning Habits',
        description: 'You missed some morning habits. It\'s not too late to complete them.',
        action: 'Do a quick version of your morning habits now',
        icon: '⏰',
        category: 'timing'
      });
    }
  }

  // Evening recommendations (18-22 PM)
  if (currentHour >= 18 && currentHour <= 22) {
    recommendations.push({
      type: 'timing',
      priority: 'medium',
      title: 'Evening Reflection',
      description: 'Perfect time to review your day and plan for tomorrow.',
      action: 'Spend 10 minutes reviewing your achievements and planning tomorrow',
      icon: '🌙',
      category: 'timing'
    });
  }

  return recommendations;
};

// Get personalized insights based on user data
export const getPersonalizedInsights = async () => {
  const recommendations = await generateSmartRecommendations();
  
  const insights = {
    productivity: recommendations.filter(r => r.category === 'productivity').length,
    wellness: recommendations.filter(r => ['fitness', 'mental'].includes(r.category)).length,
    habits: recommendations.filter(r => r.category === 'habits').length,
    balance: recommendations.filter(r => ['balance', 'integration'].includes(r.category)).length,
    totalRecommendations: recommendations.length,
    highPriority: recommendations.filter(r => r.priority === 'high').length
  };

  return {
    recommendations,
    insights,
    summary: generateInsightsSummary(insights)
  };
};

// Generate a summary of insights
const generateInsightsSummary = (insights) => {
  if (insights.highPriority > 2) {
    return {
      type: 'warning',
      message: 'Several areas need attention. Focus on high-priority recommendations first.',
      emoji: '🚨'
    };
  } else if (insights.productivity > insights.wellness) {
    return {
      type: 'balance',
      message: 'You\'re productive but consider focusing more on wellness and self-care.',
      emoji: '⚖️'
    };
  } else if (insights.wellness > insights.productivity) {
    return {
      type: 'energy',
      message: 'Great wellness focus! Channel this positive energy into productive tasks.',
      emoji: '⚡'
    };
  } else {
    return {
      type: 'positive',
      message: 'You\'re maintaining a good balance across all areas. Keep it up!',
      emoji: '🌟'
    };
  }
}; 