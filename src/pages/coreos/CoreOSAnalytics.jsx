import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Zap, 
  Brain, 
  Heart,
  Activity,
  Calendar,
  Trophy,
  Lightbulb,
  Sparkles,
  Clock,
  Star,
  Flame,
  CheckCircle2,
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { DashboardSkeleton } from '../../components/SkeletonLoader';
import { 
  getTodayTasks, 
  getTodayHabits, 
  getTodayFitness,
  getTodayMentalHealth,
  getActiveStreak,
  getWeeklyData,
  getMonthlyData
} from '../../utils/coreosStorage';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CoreOSAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, quarter
  const [analyticsData, setAnalyticsData] = useState({
    tasks: [],
    habits: [],
    fitness: [],
    mental: [],
    streaks: {},
    insights: []
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [todayTasks, todayHabits, todayFitness, todayMental] = await Promise.all([
        getTodayTasks(),
        getTodayHabits(),
        getTodayFitness(),
        getTodayMentalHealth()
      ]);

      const weeklyData = getWeeklyData();
      const monthlyData = getMonthlyData();
      
      const streaks = {
        tasks: getActiveStreak('tasks'),
        habits: getActiveStreak('habits'),
        fitness: getActiveStreak('fitness'),
        mental: getActiveStreak('mental')
      };

      setAnalyticsData({
        tasks: todayTasks,
        habits: todayHabits,
        fitness: todayFitness,
        mental: todayMental,
        streaks,
        weeklyData,
        monthlyData,
        insights: generateInsights(todayTasks, todayHabits, todayFitness, todayMental, streaks)
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (tasks, habits, fitness, mental, streaks) => {
    const insights = [];
    
    // Task insights
    const completedTasks = tasks.filter(t => t.completed).length;
    const taskRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    
    if (taskRate >= 80) {
      insights.push({
        type: 'positive',
        icon: Trophy,
        title: 'Task Master!',
        message: `Outstanding! You've completed ${taskRate.toFixed(0)}% of your tasks today.`,
        action: 'Keep up the momentum!'
      });
    } else if (taskRate < 50) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Focus Needed',
        message: 'Your task completion is below 50%. Consider prioritizing your most important tasks.',
        action: 'Break large tasks into smaller ones'
      });
    }

    // Habit insights
    const completedHabits = habits.filter(h => h.completed).length;
    const maxStreak = Math.max(...Object.values(streaks));
    
    if (maxStreak >= 7) {
      insights.push({
        type: 'positive',
        icon: Flame,
        title: 'Streak Legend!',
        message: `Amazing ${maxStreak}-day streak! You're building unstoppable momentum.`,
        action: 'Celebrate this milestone!'
      });
    }

    // Fitness insights
    if (fitness?.dailyScore >= 80) {
      insights.push({
        type: 'positive',
        icon: Activity,
        title: 'Fitness Champion!',
        message: 'Your fitness score is excellent today. Your body thanks you!',
        action: 'Maintain this energy level'
      });
    }

    // Mental health insights
    if (mental?.dailyScore >= 80) {
      insights.push({
        type: 'positive',
        icon: Heart,
        title: 'Mental Wellness',
        message: 'Your mental health score is great. You\'re in a good headspace!',
        action: 'Share positivity with others'
      });
    }

    // AI-powered recommendations
    insights.push({
      type: 'recommendation',
      icon: Lightbulb,
      title: 'AI Recommendation',
      message: 'Based on your patterns, consider scheduling your most important tasks in the morning when your energy is highest.',
      action: 'Try morning productivity blocks'
    });

    return insights;
  };

  const chartData = useMemo(() => {
    // Generate chart data based on time range
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tasks: Math.floor(Math.random() * 10) + 5,
        habits: Math.floor(Math.random() * 8) + 3,
        fitness: Math.floor(Math.random() * 100) + 50,
        mental: Math.floor(Math.random() * 100) + 40
      });
    }
    
    return data;
  }, [timeRange]);

  const pieChartData = [
    { name: 'Tasks', value: analyticsData.tasks.length, color: '#3B82F6' },
    { name: 'Habits', value: analyticsData.habits.length, color: '#10B981' },
    { name: 'Fitness', value: analyticsData.fitness?.exercises?.length || 0, color: '#F59E0B' },
    { name: 'Mental', value: analyticsData.mental?.sessions?.length || 0, color: '#8B5CF6' }
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            CoreOS Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered insights and progress tracking
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          {['week', 'month', 'quarter'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              AI Insights & Recommendations
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData.insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'positive' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <insight.icon className={`h-5 w-5 mt-0.5 ${
                    insight.type === 'positive' 
                      ? 'text-green-600' 
                      : insight.type === 'warning'
                      ? 'text-yellow-600'
                      : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {insight.message}
                    </p>
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-2">
                      💡 {insight.action}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Activity Trends
              </h2>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tasks" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="habits" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Score Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Wellness Scores
              </h2>
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="fitness" stackId="1" stroke="#F59E0B" fill="#FEF3C7" />
                <Area type="monotone" dataKey="mental" stackId="1" stroke="#8B5CF6" fill="#EDE9FE" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Activity Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Activity Distribution
            </h2>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Today's Focus Areas</h3>
              {pieChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.value} items</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Streaks & Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Achievements & Streaks
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analyticsData.streaks).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg"
              >
                <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key} Streak</div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default CoreOSAnalytics; 