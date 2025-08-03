import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Heart, 
  Flame, 
  PieChart, 
  Calendar,
  BookOpen,
  Target,
  Clock,
  Activity,
  Award,
  Lightbulb,
  TrendingDown,
  Map
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Card from '../../components/Card';
import { 
  calculateStreak, 
  getEmotionAnalytics, 
  getWordFrequency,
  getEntries,
  getMoodActivityCorrelations,
  getMoodTimePatterns,
  getWritingInsights,
  getGoalProgress,
  getPersonalGrowthInsights
} from '../../utils/diaryStorage';

const DiaryAnalytics = () => {
  const [streakData, setStreakData] = useState({
    daily: { current: 0, longest: 0 },
    weekly: { current: 0, longest: 0 },
    monthly: { current: 0, longest: 0 }
  });
  const [emotionData, setEmotionData] = useState([]);
  const [wordData, setWordData] = useState([]);
  const [entryStats, setEntryStats] = useState({
    total: 0,
    thisMonth: 0,
    avgPerWeek: 0
  });
  const [moodCorrelations, setMoodCorrelations] = useState([]);
  const [timePatterns, setTimePatterns] = useState(null);
  const [writingInsights, setWritingInsights] = useState(null);
  const [goalProgress, setGoalProgress] = useState(null);
  const [growthInsights, setGrowthInsights] = useState([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    // Load existing data
    setStreakData({
      daily: calculateStreak('daily'),
      weekly: calculateStreak('weekly'),
      monthly: calculateStreak('monthly')
    });

    const emotions = getEmotionAnalytics();
    setEmotionData(emotions.slice(0, 5));

    const words = getWordFrequency();
    setWordData(words.slice(0, 10));

    // Load new advanced analytics
    setMoodCorrelations(getMoodActivityCorrelations().slice(0, 8));
    setTimePatterns(getMoodTimePatterns());
    setWritingInsights(getWritingInsights());
    setGoalProgress(getGoalProgress());
    setGrowthInsights(getPersonalGrowthInsights());

    // Calculate entry statistics
    const allEntries = [
      ...getEntries('daily'),
      ...getEntries('weekly'),
      ...getEntries('monthly')
    ];
    
    const thisMonth = new Date();
    const thisMonthEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt || entry.date);
      return entryDate.getMonth() === thisMonth.getMonth() && 
             entryDate.getFullYear() === thisMonth.getFullYear();
    });

    setEntryStats({
      total: allEntries.length,
      thisMonth: thisMonthEntries.length,
      avgPerWeek: Math.round(allEntries.length / Math.max(1, Math.ceil(allEntries.length / 7)))
    });
  };

  const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'];

  const streakChartData = [
    { name: 'Daily', current: streakData.daily.current, longest: streakData.daily.longest },
    { name: 'Weekly', current: streakData.weekly.current, longest: streakData.weekly.longest },
    { name: 'Monthly', current: streakData.monthly.current, longest: streakData.monthly.longest }
  ];

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
          <div className="space-y-2">
            <h1 className="text-gradient flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 animate-pulse" />
              Diary Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Deep insights into your journaling journey and personal growth
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Personal Growth Insights */}
      {growthInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-emerald-500 animate-pulse" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Personal Growth Insights
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {growthInsights.map((insight, index) => (
                  <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{insight.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {insight.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {insight.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="stat">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Entries
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {entryStats.total}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-emerald-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="stat">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Current Streak
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.max(streakData.daily.current, streakData.weekly.current, streakData.monthly.current)}
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </motion.div>

        {writingInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="stat">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Words
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {writingInsights.totalWords.toLocaleString()}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
          </motion.div>
        )}

        {goalProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card variant="stat">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Monthly Goal
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round((goalProgress.daily.percentage + goalProgress.weekly.percentage + goalProgress.monthly.percentage) / 3)}%
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood-Activity Correlations */}
        {moodCorrelations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    What Makes You Happy?
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {moodCorrelations.slice(0, 6).map((correlation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {correlation.activity}
                        </span>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-3 h-3 rounded-full ${
                            correlation.impact === 'positive' ? 'bg-green-500' : 
                            correlation.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {correlation.frequency} times
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          correlation.impact === 'positive' ? 'text-green-600' : 
                          correlation.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {correlation.averageMood.toFixed(1)}/5
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Time Patterns */}
        {timePatterns && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Your Best Days
                  </h3>
                </div>
                
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <BarChart data={timePatterns.weeklyAverage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="averageMood" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Writing Insights */}
        {writingInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Writing Statistics
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {writingInsights.averageWordsPerEntry}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Avg Words/Entry
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {writingInsights.uniqueWritingDays}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Writing Days
                    </div>
                  </div>
                  {writingInsights.longestEntry.words > 0 && (
                    <div className="col-span-2 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Longest Entry: {writingInsights.longestEntry.words} words
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(writingInsights.longestEntry.date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Goal Progress */}
        {goalProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Monthly Goals
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {[
                    { label: 'Daily Entries', data: goalProgress.daily, color: 'emerald' },
                    { label: 'Weekly Entries', data: goalProgress.weekly, color: 'blue' },
                    { label: 'Monthly Entries', data: goalProgress.monthly, color: 'purple' }
                  ].map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{goal.label}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {goal.data.current}/{goal.data.goal} ({goal.data.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-${goal.color}-500`}
                          style={{ width: `${Math.min(goal.data.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Original Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streak Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Journaling Streaks
                </h3>
              </div>
              
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={streakChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="current" fill="#10b981" name="Current Streak" />
                    <Bar dataKey="longest" fill="#059669" name="Longest Streak" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Emotion Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-pink-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Emotion Distribution
                </h3>
              </div>
              
              {emotionData.length > 0 ? (
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <RechartsPieChart>
                      <Pie
                        data={emotionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ emotion }) => emotion}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {emotionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [value, props.payload.emotion]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Start journaling to see emotion insights
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Word Frequency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Most Used Words
              </h3>
            </div>
            
            {wordData.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={wordData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="word" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  Write more entries to see word frequency analysis
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Insights & Recommendations
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  🎯 Current Focus
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Your daily journaling streak is {streakData.daily.current} days. 
                  {streakData.daily.current === 0 
                    ? " Start your journey today!" 
                    : streakData.daily.current < 7 
                    ? " Keep building this habit!" 
                    : " Amazing consistency!"}
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  📈 Growth Opportunity
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {entryStats.thisMonth < 5 
                    ? "Try to write more entries this month to gain deeper insights."
                    : entryStats.thisMonth < 15
                    ? "Great progress! Consider adding weekly reflections."
                    : "Exceptional dedication to self-reflection!"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default DiaryAnalytics; 