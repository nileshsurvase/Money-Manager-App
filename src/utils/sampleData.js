// Comprehensive sample data for all applications
import { format, subDays, subWeeks, subMonths, addDays, startOfMonth, endOfMonth } from 'date-fns';

// Utility function to ensure valid dates
const ensureValidDate = (date) => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date() : d;
};

// Sample data state key
export const SAMPLE_DATA_KEY = 'sample_data_loaded';

// Money Manager Sample Data
export const generateMoneyManagerSampleData = () => {
  const today = new Date();
  const expenses = [];
  const budgets = [];
  
  // Generate 30 days of realistic expenses
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i);
    const dayOfWeek = date.getDay();
    
    // Morning expenses
    if (Math.random() > 0.3) {
      expenses.push({
        id: `expense-${i}-morning`,
        amount: Math.floor(Math.random() * 200) + 50,
        categoryId: 'food',
        description: ['Coffee and breakfast', 'Tea and snacks', 'Morning juice', 'Breakfast at cafe'][Math.floor(Math.random() * 4)],
        date: format(date, 'yyyy-MM-dd'),
        notes: 'Morning meal',
        createdAt: new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString()
      });
    }
    
    // Lunch expenses
    if (Math.random() > 0.2) {
      expenses.push({
        id: `expense-${i}-lunch`,
        amount: Math.floor(Math.random() * 400) + 150,
        categoryId: 'food',
        description: ['Office lunch', 'Restaurant meal', 'Food delivery', 'Lunch with colleagues'][Math.floor(Math.random() * 4)],
        date: format(date, 'yyyy-MM-dd'),
        notes: 'Lunch expense',
        createdAt: new Date(date.getTime() + 13 * 60 * 60 * 1000).toISOString()
      });
    }
    
    // Transportation
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Weekdays
      expenses.push({
        id: `expense-${i}-transport`,
        amount: Math.floor(Math.random() * 100) + 50,
        categoryId: 'travel',
        description: ['Metro ticket', 'Bus fare', 'Auto rickshaw', 'Taxi ride'][Math.floor(Math.random() * 4)],
        date: format(date, 'yyyy-MM-dd'),
        notes: 'Daily commute',
        createdAt: new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString()
      });
    }
    
    // Weekend expenses
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (Math.random() > 0.4) {
        expenses.push({
          id: `expense-${i}-weekend`,
          amount: Math.floor(Math.random() * 800) + 200,
          categoryId: 'entertainment',
          description: ['Movie tickets', 'Shopping mall', 'Restaurant dinner', 'Weekend outing'][Math.floor(Math.random() * 4)],
          date: format(date, 'yyyy-MM-dd'),
          notes: 'Weekend activity',
          createdAt: new Date(date.getTime() + 16 * 60 * 60 * 1000).toISOString()
        });
      }
    }
    
    // Random other expenses
    if (Math.random() > 0.7) {
      const categories = ['groceries', 'health', 'utilities', 'shopping', 'investment'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const amounts = {
        groceries: [500, 1200, 800, 1500],
        health: [200, 500, 300, 1000],
        utilities: [800, 1200, 400, 600],
        shopping: [600, 2000, 1200, 3000],
        investment: [2000, 5000, 10000, 15000]
      };
      
      expenses.push({
        id: `expense-${i}-${category}`,
        amount: amounts[category][Math.floor(Math.random() * amounts[category].length)],
        categoryId: category,
        description: getExpenseDescription(category),
        date: format(date, 'yyyy-MM-dd'),
        notes: `${category.charAt(0).toUpperCase() + category.slice(1)} expense`,
        createdAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }
  
  // Create budgets for all categories
  const budgetCategories = [
    { id: 'food', amount: 12000 },
    { id: 'travel', amount: 3000 },
    { id: 'entertainment', amount: 5000 },
    { id: 'groceries', amount: 8000 },
    { id: 'health', amount: 4000 },
    { id: 'utilities', amount: 6000 },
    { id: 'shopping', amount: 10000 },
    { id: 'investment', amount: 25000 }
  ];
  
  budgetCategories.forEach((budget, index) => {
    budgets.push({
      id: `budget-${index}`,
      categoryId: budget.id,
      amount: budget.amount,
      period: 'monthly',
      createdAt: startOfMonth(today).toISOString()
    });
  });
  
  return { expenses, budgets };
};

function getExpenseDescription(category) {
  const descriptions = {
    groceries: ['Weekly grocery shopping', 'Fruits and vegetables', 'Monthly provisions', 'Organic products'],
    health: ['Medical checkup', 'Pharmacy medicines', 'Dental visit', 'Health supplements'],
    utilities: ['Electricity bill', 'Water bill', 'Internet charges', 'Mobile recharge'],
    shopping: ['Clothing purchase', 'Electronics item', 'Home accessories', 'Gift shopping'],
    investment: ['Mutual fund SIP', 'Stock purchase', 'Fixed deposit', 'Gold investment']
  };
  
  return descriptions[category][Math.floor(Math.random() * descriptions[category].length)];
}

// MyDiary Sample Data
export const generateDiarySampleData = () => {
  const today = new Date();
  const dailyEntries = [];
  const weeklyEntries = [];
  const monthlyEntries = [];
  const wellnessData = [];
  const habits = [];
  const habitCompletions = {};
  
  // Create habits first
  const habitList = [
    { name: 'Morning Meditation', description: '15 minutes of mindfulness', category: 'Wellness', color: '#10b981' },
    { name: 'Daily Exercise', description: '30 minutes of physical activity', category: 'Health', color: '#f59e0b' },
    { name: 'Reading', description: 'Read for personal development', category: 'Learning', color: '#8b5cf6' },
    { name: 'Gratitude Journal', description: 'Write 3 things I am grateful for', category: 'Mindfulness', color: '#ec4899' },
    { name: 'Drink Water', description: '8 glasses of water daily', category: 'Health', color: '#06b6d4' },
    { name: 'Sleep Early', description: 'Sleep before 11 PM', category: 'Health', color: '#6366f1' },
    { name: 'No Social Media', description: 'Avoid social media after 9 PM', category: 'Digital Wellness', color: '#84cc16' },
    { name: 'Deep Work', description: '2 hours of focused work', category: 'Productivity', color: '#f97316' }
  ];
  
  habitList.forEach((habit, index) => {
    habits.push({
      id: `habit-${index}`,
      ...habit,
      target: 'daily',
      createdAt: subDays(today, 30).toISOString()
    });
  });
  
  // Generate daily entries for 30 days
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Daily journal entry
    if (Math.random() > 0.2) {
      dailyEntries.push({
        id: `daily-${i}`,
        date: dateStr,
        entry: generateDailyJournalEntry(i),
        mood: ['Happy', 'Calm', 'Excited', 'Grateful', 'Energetic'][Math.floor(Math.random() * 5)],
        emotions: getRandomEmotions(),
        moodScore: Math.floor(Math.random() * 4) + 7, // 7-10
        energyLevel: Math.floor(Math.random() * 4) + 6, // 6-9
        stressLevel: Math.floor(Math.random() * 4) + 2, // 2-5
        sleepHours: 6 + Math.random() * 3, // 6-9 hours
        gratitude: generateGratitudeEntry(),
        achievements: generateAchievement(),
        challenges: generateChallenge(),
        tomorrow: generateTomorrowPlan(),
        createdAt: new Date(date).toISOString(),
        updatedAt: new Date(date).toISOString()
      });
    }
    
    // Wellness data
    const emotionsList = ['happy', 'calm', 'excited', 'grateful', 'content', 'energetic', 'peaceful', 'motivated'];
    const randomEmotions = [];
    const numEmotions = Math.floor(Math.random() * 3) + 1; // 1-3 emotions
    for (let j = 0; j < numEmotions; j++) {
      const emotion = emotionsList[Math.floor(Math.random() * emotionsList.length)];
      if (!randomEmotions.includes(emotion)) {
        randomEmotions.push(emotion);
      }
    }
    
    const moodScore = Math.floor(Math.random() * 3) + 7;
    const energyLevel = Math.floor(Math.random() * 3) + 6;
    const stressLevel = Math.floor(Math.random() * 4) + 2;
    
    wellnessData.push({
      id: `wellness-${i}`,
      date: dateStr,
      mood: ['Happy', 'Calm', 'Excited', 'Grateful'][Math.floor(Math.random() * 4)],
      moodScore,
      energyLevel,
      stressLevel,
      emotions: randomEmotions,
      wellnessScore: Math.round((moodScore + energyLevel + (10 - stressLevel)) / 3),
      sleepHours: 6.5 + Math.random() * 2,
      waterIntake: Math.floor(Math.random() * 4) + 6,
      exercise: Math.random() > 0.3,
      exerciseType: ['Running', 'Yoga', 'Gym', 'Walking', 'Cycling'][Math.floor(Math.random() * 5)],
      exerciseDuration: Math.floor(Math.random() * 60) + 30,
      meditation: Math.random() > 0.4,
      meditationDuration: Math.floor(Math.random() * 20) + 10,
      socialConnection: Math.random() > 0.3,
      notes: generateWellnessNote(),
      createdAt: new Date(date).toISOString()
    });
    
    // Habit completions
    habitCompletions[dateStr] = [];
    habits.forEach(habit => {
      // More realistic completion pattern
      const completionRate = habit.name === 'Drink Water' ? 0.9 : 
                           habit.name === 'Sleep Early' ? 0.6 :
                           habit.name === 'Morning Meditation' ? 0.7 : 0.75;
      if (Math.random() < completionRate) {
        habitCompletions[dateStr].push(habit.id);
      }
    });
  }
  
  // Generate weekly entries (4 weeks)
  for (let i = 0; i < 4; i++) {
    const weekStart = subWeeks(today, i);
    weeklyEntries.push({
      id: `weekly-${i}`,
      week: format(weekStart, 'yyyy-MM-dd'),
      entry: generateWeeklyJournalEntry(i),
      highlights: generateWeeklyHighlights(),
      challenges: generateWeeklyChallenges(),
      lessons: generateWeeklyLessons(),
      nextWeekFocus: generateNextWeekFocus(),
      goals: generateWeeklyGoals(),
      mood: ['Energetic', 'Productive', 'Reflective', 'Optimistic'][Math.floor(Math.random() * 4)],
      overallRating: Math.floor(Math.random() * 3) + 7,
      createdAt: new Date(weekStart).toISOString(),
      updatedAt: new Date(weekStart).toISOString()
    });
  }
  
  // Generate monthly entries (3 months)
  for (let i = 0; i < 3; i++) {
    const monthStart = subMonths(today, i);
    monthlyEntries.push({
      id: `monthly-${i}`,
      month: format(monthStart, 'yyyy-MM'),
      entry: generateMonthlyJournalEntry(i),
      accomplishments: generateMonthlyAccomplishments(),
      challenges: generateMonthlyChallenges(),
      growth: generateMonthlyGrowth(),
      relationships: generateRelationshipUpdate(),
      habits: generateHabitUpdate(),
      nextMonthGoals: generateNextMonthGoals(),
      overallRating: Math.floor(Math.random() * 3) + 7,
      mood: ['Grateful', 'Accomplished', 'Reflective', 'Optimistic'][Math.floor(Math.random() * 4)],
      createdAt: new Date(monthStart).toISOString(),
      updatedAt: new Date(monthStart).toISOString()
    });
  }
  
  return {
    dailyEntries,
    weeklyEntries,
    monthlyEntries,
    wellnessData,
    habits,
    habitCompletions
  };
};

// Helper functions for generating realistic content
function generateDailyJournalEntry(dayIndex) {
  const entries = [
    "Today was incredibly productive! I managed to complete all my planned tasks and even had time for some personal projects. The weather was perfect for a morning walk, which really set a positive tone for the day.",
    "Had a challenging day at work, but I'm proud of how I handled the pressure. The team meeting went well and we made significant progress on the project. Ended the day with a relaxing yoga session.",
    "Woke up feeling grateful for all the opportunities in my life. Spent quality time with family and had meaningful conversations. Sometimes the simple moments are the most precious.",
    "Pushed myself out of my comfort zone today by trying something new. It was scary at first, but the sense of accomplishment was worth it. Growth happens when we embrace discomfort.",
    "Today was a reminder that it's okay to have slower days. I focused on rest and reflection rather than productivity. Self-care is just as important as achievement.",
    "Had an amazing breakthrough in my personal project today. All the hard work and persistence is finally paying off. Feeling motivated to keep pushing forward.",
    "Spent the day connecting with old friends and making new memories. Human connections are what make life truly meaningful. Grateful for the people in my life.",
    "Today I practiced mindfulness and really paid attention to the present moment. It's amazing how much beauty we miss when we're constantly rushing through life."
  ];
  
  return entries[dayIndex % entries.length];
}

function getRandomEmotions() {
  const emotions = ['happy', 'calm', 'grateful', 'energetic', 'excited'];
  const count = Math.floor(Math.random() * 3) + 2; // 2-4 emotions
  return emotions.sort(() => 0.5 - Math.random()).slice(0, count);
}

function generateGratitudeEntry() {
  const gratitudes = [
    "Grateful for my health and the energy to pursue my goals",
    "Thankful for the supportive people in my life",
    "Appreciative of the learning opportunities that come my way",
    "Grateful for the roof over my head and food on my table",
    "Thankful for moments of peace and tranquility",
    "Appreciative of the beauty in nature around me",
    "Grateful for the ability to help others and make a difference"
  ];
  
  return gratitudes[Math.floor(Math.random() * gratitudes.length)];
}

function generateAchievement() {
  const achievements = [
    "Completed my morning workout routine",
    "Had a productive work session without distractions",
    "Cooked a healthy meal from scratch",
    "Called an old friend to catch up",
    "Finished reading a chapter of my book",
    "Organized my workspace",
    "Practiced meditation for 20 minutes",
    "Learned something new online"
  ];
  
  return achievements[Math.floor(Math.random() * achievements.length)];
}

function generateChallenge() {
  const challenges = [
    "Managing time effectively between work and personal life",
    "Staying focused during lengthy meetings",
    "Dealing with unexpected changes in plans",
    "Maintaining energy levels throughout the day",
    "Avoiding distractions from social media",
    "Finding motivation for exercise after work",
    "Balancing social commitments with alone time"
  ];
  
  return challenges[Math.floor(Math.random() * challenges.length)];
}

function generateTomorrowPlan() {
  const plans = [
    "Start the day with meditation and set clear intentions",
    "Focus on deep work during my most productive hours",
    "Take regular breaks and practice mindful breathing",
    "Prioritize the most important tasks first",
    "Make time for physical activity and movement",
    "Practice gratitude and positive self-talk",
    "Connect with someone meaningful in my life"
  ];
  
  return plans[Math.floor(Math.random() * plans.length)];
}

function generateWellnessNote() {
  const notes = [
    "Felt energized after morning exercise",
    "Needed extra rest today, listening to my body",
    "Great day for outdoor activities",
    "Focused on hydration and nutrition",
    "Practiced deep breathing during stressful moments",
    "Enjoyed quality time with loved ones",
    "Maintained good work-life balance"
  ];
  
  return notes[Math.floor(Math.random() * notes.length)];
}

function generateWeeklyJournalEntry(weekIndex) {
  const entries = [
    "This week has been about finding balance and rhythm. I've established better routines and feel more in control of my daily schedule. The key breakthrough was realizing that small, consistent actions compound into significant results.",
    "A week of growth and challenges. I pushed myself in areas where I've been comfortable for too long. The discomfort was real, but so was the learning. I'm proud of the progress I've made.",
    "This week taught me the importance of flexibility. When my original plans didn't work out, I had to adapt and find new approaches. Sometimes the unexpected path leads to better destinations.",
    "A week focused on relationships and connections. I made time for people who matter to me and had several meaningful conversations. These interactions reminded me what truly brings joy to life."
  ];
  
  return entries[weekIndex % entries.length];
}

function generateWeeklyHighlights() {
  const highlights = [
    "Successfully completed all planned workouts, launched new project at work",
    "Had meaningful conversations with family, discovered a new hobby",
    "Achieved a personal best in my fitness routine, learned a new skill",
    "Made progress on long-term goals, enjoyed quality time with friends"
  ];
  
  return highlights[Math.floor(Math.random() * highlights.length)];
}

function generateWeeklyChallenges() {
  const challenges = [
    "Struggled with time management during busy periods",
    "Faced technical difficulties with work projects",
    "Had to navigate unexpected schedule changes",
    "Dealt with energy dips mid-week"
  ];
  
  return challenges[Math.floor(Math.random() * challenges.length)];
}

function generateWeeklyLessons() {
  const lessons = [
    "Consistency beats perfection in building habits",
    "Taking breaks actually increases productivity",
    "Communication is key to resolving conflicts",
    "Small celebrations keep motivation high"
  ];
  
  return lessons[Math.floor(Math.random() * lessons.length)];
}

function generateNextWeekFocus() {
  const focus = [
    "Prioritize deep work sessions and minimize distractions",
    "Focus on building stronger routines and consistency",
    "Emphasize self-care and stress management",
    "Concentrate on learning and skill development"
  ];
  
  return focus[Math.floor(Math.random() * focus.length)];
}

function generateWeeklyGoals() {
  const goals = [
    "Exercise 5 times, complete 2 work projects, read 50 pages",
    "Meditate daily, call 3 friends, organize workspace",
    "Learn new cooking recipe, finish online course, plan weekend trip",
    "Write in journal daily, practice instrument, volunteer time"
  ];
  
  return goals[Math.floor(Math.random() * goals.length)];
}

function generateMonthlyJournalEntry(monthIndex) {
  const entries = [
    "This month has been transformative in ways I didn't expect. I've grown more comfortable with uncertainty and learned to find opportunity in challenging situations. The habits I've been building are starting to feel natural.",
    "A month of steady progress and meaningful connections. I've deepened relationships with people who matter to me and made significant strides toward my long-term goals. The journey is becoming as rewarding as the destination.",
    "This month taught me the power of patience and persistence. Not everything happened according to my timeline, but I learned to trust the process and stay committed to my values. Growth isn't always linear."
  ];
  
  return entries[monthIndex % entries.length];
}

function generateMonthlyAccomplishments() {
  const accomplishments = [
    "Completed a major project, established morning routine, improved fitness significantly",
    "Learned new professional skills, strengthened family relationships, achieved financial goals",
    "Launched personal initiative, developed consistent meditation practice, read 4 books"
  ];
  
  return accomplishments[Math.floor(Math.random() * accomplishments.length)];
}

function generateMonthlyChallenges() {
  const challenges = [
    "Managing increased workload while maintaining work-life balance",
    "Dealing with unexpected family responsibilities and schedule changes",
    "Overcoming procrastination on important but non-urgent tasks"
  ];
  
  return challenges[Math.floor(Math.random() * challenges.length)];
}

function generateMonthlyGrowth() {
  const growth = [
    "Became more confident in decision-making and trusting my intuition",
    "Developed better communication skills and emotional intelligence",
    "Improved ability to manage stress and maintain perspective during challenges"
  ];
  
  return growth[Math.floor(Math.random() * growth.length)];
}

function generateRelationshipUpdate() {
  const updates = [
    "Strengthened bonds with family through regular check-ins and quality time",
    "Made new professional connections that opened unexpected opportunities",
    "Deepened friendships by being more present and supportive"
  ];
  
  return updates[Math.floor(Math.random() * updates.length)];
}

function generateHabitUpdate() {
  const updates = [
    "Successfully established morning meditation routine, exercise consistency improved",
    "Reading habit is now automatic, water intake tracking is helping health goals",
    "Sleep schedule is more consistent, gratitude practice is shifting my mindset"
  ];
  
  return updates[Math.floor(Math.random() * updates.length)];
}

function generateNextMonthGoals() {
  const goals = [
    "Launch creative side project, improve cooking skills, plan meaningful vacation",
    "Advance professional development, deepen spiritual practice, strengthen community connections",
    "Focus on financial planning, learn new language basics, prioritize mental health"
  ];
  
  return goals[Math.floor(Math.random() * goals.length)];
}

// CoreOS Sample Data
export const generateCoreOSSampleData = () => {
  const today = new Date();
  const tasks = [];
  const habits = [];
  const fitnessData = [];
  
  // Generate daily tasks for 7 days
  const taskCategories = ['Work', 'Personal', 'Health', 'Learning', 'Social'];
  const taskTemplates = {
    Work: ['Complete project proposal', 'Attend team meeting', 'Review quarterly reports', 'Update client documentation'],
    Personal: ['Organize home office', 'Plan weekend activities', 'Update personal budget', 'Call family members'],
    Health: ['Morning workout', 'Prepare healthy meals', 'Schedule health checkup', 'Practice mindfulness'],
    Learning: ['Read industry articles', 'Complete online course module', 'Practice new skill', 'Listen to educational podcast'],
    Social: ['Coffee with friend', 'Plan group outing', 'Respond to messages', 'Attend community event']
  };
  
  for (let i = 0; i < 21; i++) { // 3 weeks of tasks
    const date = subDays(today, i);
    const category = taskCategories[Math.floor(Math.random() * taskCategories.length)];
    const taskList = taskTemplates[category];
    
    tasks.push({
      id: `task-${i}`,
      title: taskList[Math.floor(Math.random() * taskList.length)],
      description: `Daily task for ${format(date, 'MMMM do')}`,
      category,
      priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.3 ? 'completed' : 'pending',
      dueDate: date.toISOString(),
      createdAt: new Date(date.getTime() - 2 * 60 * 60 * 1000).toISOString()
    });
  }
  
  // Generate habits
  const habitTemplates = [
    { name: 'Morning Exercise', category: 'Health', description: 'Start day with 30min workout' },
    { name: 'Read Daily', category: 'Personal', description: 'Read for at least 20 minutes' },
    { name: 'Meditation', category: 'Mental', description: '10 minutes of mindfulness' },
    { name: 'Drink Water', category: 'Health', description: 'Drink 8 glasses of water' },
    { name: 'Plan Tomorrow', category: 'Productivity', description: 'Plan next day tasks' },
    { name: 'No Social Media', category: 'Digital', description: 'Avoid social media distractions' }
  ];
  
  habitTemplates.forEach((habit, index) => {
    habits.push({
      id: `habit-${index}`,
      ...habit,
      streak: Math.floor(Math.random() * 30) + 1,
      isActive: true,
      createdAt: subDays(today, 90).toISOString()
    });
  });
  
  // Generate fitness data
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i);
    if (Math.random() > 0.2) { // 80% chance of workout
      fitnessData.push({
        id: `fitness-${i}`,
        date: format(date, 'yyyy-MM-dd'),
        type: ['Running', 'Gym', 'Yoga', 'Swimming', 'Cycling'][Math.floor(Math.random() * 5)],
        duration: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
        calories: Math.floor(Math.random() * 400) + 200, // 200-600 calories
        notes: 'Great workout session',
        createdAt: new Date(date).toISOString()
      });
    }
  }
  
  return { tasks, habits, fitnessData };
};

// FreedomOS Sample Data
export const generateFreedomOSSampleData = () => {
  const today = new Date();
  const netWorthData = [];
  const budgetData = [];
  const emergencyFund = [];
  const investments = [];
  const loans = [];
  
  // Generate net worth tracking for 12 months
  let baseNetWorth = 500000; // Starting net worth
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(today, i);
    const growth = (Math.random() * 0.02 + 0.005) * baseNetWorth; // 0.5-2.5% monthly growth
    baseNetWorth += growth;
    
    netWorthData.push({
      id: `networth-${i}`,
      month: format(date, 'yyyy-MM'),
      assets: Math.floor(baseNetWorth * (0.7 + Math.random() * 0.2)), // 70-90% of net worth
      liabilities: Math.floor(baseNetWorth * (0.1 + Math.random() * 0.15)), // 10-25% of net worth
      netWorth: Math.floor(baseNetWorth),
      createdAt: new Date(date).toISOString()
    });
  }
  
  // Generate budget categories
  const budgetCategories = [
    { name: 'Housing', allocated: 25000, spent: 24800 },
    { name: 'Food & Dining', allocated: 12000, spent: 11200 },
    { name: 'Transportation', allocated: 8000, spent: 7500 },
    { name: 'Entertainment', allocated: 5000, spent: 4200 },
    { name: 'Healthcare', allocated: 4000, spent: 3100 },
    { name: 'Shopping', allocated: 6000, spent: 6800 },
    { name: 'Savings', allocated: 15000, spent: 15000 },
    { name: 'Investments', allocated: 20000, spent: 20000 }
  ];
  
  budgetCategories.forEach((budget, index) => {
    budgetData.push({
      id: `budget-${index}`,
      category: budget.name,
      allocated: budget.allocated,
      spent: budget.spent,
      month: format(today, 'yyyy-MM'),
      createdAt: new Date().toISOString()
    });
  });
  
  // Generate emergency fund tracking
  let fundAmount = 50000;
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i);
    fundAmount += Math.floor(Math.random() * 5000) + 2000; // Add 2000-7000 monthly
    
    emergencyFund.push({
      id: `emergency-${i}`,
      month: format(date, 'yyyy-MM'),
      amount: fundAmount,
      target: 150000,
      createdAt: new Date(date).toISOString()
    });
  }
  
  // Generate investment portfolio
  const investmentTypes = [
    { type: 'Mutual Funds', amount: 125000, returns: 12.5 },
    { type: 'Stocks', amount: 80000, returns: 15.2 },
    { type: 'Fixed Deposits', amount: 60000, returns: 6.8 },
    { type: 'PPF', amount: 45000, returns: 7.1 },
    { type: 'ELSS', amount: 35000, returns: 14.8 },
    { type: 'Gold', amount: 25000, returns: 8.9 }
  ];
  
  investmentTypes.forEach((investment, index) => {
    investments.push({
      id: `investment-${index}`,
      ...investment,
      purchaseDate: subMonths(today, Math.floor(Math.random() * 24) + 6).toISOString(),
      createdAt: subMonths(today, Math.floor(Math.random() * 12)).toISOString()
    });
  });
  
  // Generate loan data (matching LoanCrusher expected structure)
  const loanTypes = [
    { 
      name: 'Home Loan - HDFC',
      loanName: 'Home Loan - HDFC', 
      type: 'home', 
      principal: 1500000, 
      outstandingAmount: 1200000, 
      emi: 18500, 
      interestRate: 8.5,
      tenure: 240,
      nextDueDate: '2024-02-15'
    },
    { 
      name: 'Car Loan - SBI',
      loanName: 'Car Loan - SBI', 
      type: 'car', 
      principal: 400000, 
      outstandingAmount: 150000, 
      emi: 12000, 
      interestRate: 9.2,
      tenure: 84,
      nextDueDate: '2024-02-10'
    },
    { 
      name: 'Personal Loan - ICICI',
      loanName: 'Personal Loan - ICICI', 
      type: 'personal', 
      principal: 200000, 
      outstandingAmount: 75000, 
      emi: 8500, 
      interestRate: 12.8,
      tenure: 48,
      nextDueDate: '2024-02-05'
    }
  ];
  
  loanTypes.forEach((loan, index) => {
    loans.push({
      id: index + 1,
      ...loan,
      startDate: subMonths(today, Math.floor(Math.random() * 36) + 12).toISOString(),
      createdAt: subMonths(today, Math.floor(Math.random() * 24)).toISOString()
    });
  });
  
  return {
    netWorthData,
    budgetData,
    emergencyFund,
    investments,
    loans
  };
};

// Main function to load all sample data
export const loadAllSampleData = () => {
  try {
    // Mark that sample data has been loaded
    localStorage.setItem(SAMPLE_DATA_KEY, 'true');
    
    // Load Money Manager data
    const moneyManagerData = generateMoneyManagerSampleData();
    localStorage.setItem('money_manager_expenses', JSON.stringify(moneyManagerData.expenses));
    localStorage.setItem('money_manager_budgets', JSON.stringify(moneyManagerData.budgets));
    
    // Load MyDiary data
    const diaryData = generateDiarySampleData();
    localStorage.setItem('diary_daily_entries', JSON.stringify(diaryData.dailyEntries));
    localStorage.setItem('diary_weekly_entries', JSON.stringify(diaryData.weeklyEntries));
    localStorage.setItem('diary_monthly_entries', JSON.stringify(diaryData.monthlyEntries));
    localStorage.setItem('diary_wellness_data', JSON.stringify(diaryData.wellnessData));
    localStorage.setItem('diary_habits', JSON.stringify(diaryData.habits));
    localStorage.setItem('diary_habit_completions', JSON.stringify(diaryData.habitCompletions));
    
    // Load CoreOS data
    const coreosData = generateCoreOSSampleData();
    localStorage.setItem('coreos_tasks', JSON.stringify(coreosData.tasks));
    localStorage.setItem('coreos_habits', JSON.stringify(coreosData.habits || []));
    localStorage.setItem('coreos_fitness', JSON.stringify(coreosData.fitnessData));
    
    // Load FreedomOS data
    const freedomosData = generateFreedomOSSampleData();
    localStorage.setItem('freedomos_networth', JSON.stringify(freedomosData.netWorthData));
    localStorage.setItem('freedomos_budget', JSON.stringify(freedomosData.budgetData));
    localStorage.setItem('freedomos_emergency', JSON.stringify(freedomosData.emergencyFund));
    localStorage.setItem('freedomos_investments', JSON.stringify(freedomosData.investments));
    localStorage.setItem('freedomos_loans', JSON.stringify(freedomosData.loans));
    
    return true;
  } catch (error) {
    console.error('Error loading sample data:', error);
    return false;
  }
};

// Function to clear all sample data
export const clearAllSampleData = () => {
  try {
    // Remove sample data flag
    localStorage.removeItem(SAMPLE_DATA_KEY);
    
    // Clear Money Manager data
    localStorage.removeItem('money_manager_expenses');
    localStorage.removeItem('money_manager_budgets');
    
    // Clear MyDiary data
    localStorage.removeItem('diary_daily_entries');
    localStorage.removeItem('diary_weekly_entries');
    localStorage.removeItem('diary_monthly_entries');
    localStorage.removeItem('diary_wellness_data');
    localStorage.removeItem('diary_habits');
    localStorage.removeItem('diary_habit_completions');
    
    // Clear CoreOS data
    localStorage.removeItem('coreos_tasks');
    localStorage.removeItem('coreos_habits');
    localStorage.removeItem('coreos_fitness');
    
    // Clear FreedomOS data
    localStorage.removeItem('freedomos_networth');
    localStorage.removeItem('freedomos_budget');
    localStorage.removeItem('freedomos_emergency');
    localStorage.removeItem('freedomos_investments');
    localStorage.removeItem('freedomos_loans');
    
    return true;
  } catch (error) {
    console.error('Error clearing sample data:', error);
    return false;
  }
};

// Check if sample data is loaded
export const isSampleDataLoaded = () => {
  return localStorage.getItem(SAMPLE_DATA_KEY) === 'true';
};