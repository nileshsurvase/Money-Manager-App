import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Heart, 
  Target, 
  Calendar,
  TrendingUp,
  Activity,
  Zap,
  CheckCircle2,
  Timer,
  Flame,
  Trophy
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { DashboardSkeleton } from '../../components/SkeletonLoader';
import { 
  getTodayTasks, 
  getTodayHabits, 
  getActiveStreak,
  getTodayFitness,
  getTodayMentalHealth 
} from '../../utils/coreosStorage';
import { generateSmartRecommendations } from '../../utils/smartRecommendations';

const CoreOSDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    tasks: [],
    habits: [],
    fitness: null,
    mentalHealth: null,
    streaks: {},
    recommendations: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [tasks, habits, fitness, mentalHealth, recommendations] = await Promise.all([
        getTodayTasks(),
        getTodayHabits(),
        getTodayFitness(),
        getTodayMentalHealth(),
        generateSmartRecommendations()
      ]);

      const streaks = {
        tasks: getActiveStreak('tasks'),
        habits: getActiveStreak('habits'),
        fitness: getActiveStreak('fitness'),
        mental: getActiveStreak('mental')
      };

      setDashboardData({
        tasks,
        habits,
        fitness,
        mentalHealth,
        streaks,
        recommendations: recommendations.slice(0, 3) // Show top 3 on dashboard
      });
    } catch (error) {
      console.error('Error loading CoreOS dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const completedTasks = dashboardData.tasks.filter(task => task.completed).length;
    const completedHabits = dashboardData.habits.filter(habit => habit.completed).length;
    const taskCompletionRate = dashboardData.tasks.length > 0 
      ? Math.round((completedTasks / dashboardData.tasks.length) * 100) 
      : 0;
    const habitCompletionRate = dashboardData.habits.length > 0
      ? Math.round((completedHabits / dashboardData.habits.length) * 100)
      : 0;

    return {
      completedTasks,
      totalTasks: dashboardData.tasks.length,
      completedHabits,
      totalHabits: dashboardData.habits.length,
      taskCompletionRate,
      habitCompletionRate,
      fitnessScore: dashboardData.fitness?.dailyScore || 0,
      mentalScore: dashboardData.mentalHealth?.dailyScore || 0
    };
  }, [dashboardData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          CoreOS Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your unified life operating system
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.completedTasks}/{stats.totalTasks}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Today</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.taskCompletionRate}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">{stats.taskCompletionRate}% Complete</span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Flame className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.completedHabits}/{stats.totalHabits}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Habits Today</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.habitCompletionRate}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">{stats.habitCompletionRate}% Complete</span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.fitnessScore}%
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fitness Score</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.fitnessScore}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">Daily Goal</span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.mentalScore}%
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Mental Health</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.mentalScore}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">Wellness Score</span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Module Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Daily Tasks</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.completedTasks} of {stats.totalTasks} completed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  🔥{dashboardData.streaks.tasks}
                </div>
                <p className="text-xs text-gray-500">day streak</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => window.location.hash = '/tasks'}
            >
              <Timer className="h-4 w-4 mr-2" />
              Manage Tasks
            </Button>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Fitness</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dashboardData.fitness?.workoutsToday || 0} workouts today
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  💪{dashboardData.streaks.fitness}
                </div>
                <p className="text-xs text-gray-500">day streak</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => window.location.hash = '/fitness'}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Track Fitness
            </Button>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Mental Reset</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dashboardData.mentalHealth?.mood || 'Not checked'} mood today
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  🧠{dashboardData.streaks.mental}
                </div>
                <p className="text-xs text-gray-500">day streak</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => window.location.hash = '/mental-reset'}
            >
              <Zap className="h-4 w-4 mr-2" />
              Mental Check-in
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Today's Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Today's Focus</h3>
            <Button variant="ghost" size="small">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Priority Tasks</h4>
              <div className="space-y-2">
                {dashboardData.tasks.slice(0, 3).map((task, index) => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
                {dashboardData.tasks.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No tasks for today</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Key Habits</h4>
              <div className="space-y-2">
                {dashboardData.habits.slice(0, 3).map((habit, index) => (
                  <div key={habit.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${habit.completed ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className={`text-sm ${habit.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                      {habit.name}
                    </span>
                    <span className="ml-auto text-xs text-gray-500">
                      🔥{habit.streak}
                    </span>
                  </div>
                ))}
                {dashboardData.habits.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No habits tracked</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="primary"
              className="flex flex-col items-center space-y-2 p-4 h-auto"
              onClick={() => window.location.href = '/tasks'}
            >
              <CheckCircle2 className="h-6 w-6" />
              <span className="text-sm">Add Task</span>
            </Button>
            
            <Button
              variant="secondary"
              className="flex flex-col items-center space-y-2 p-4 h-auto"
              onClick={() => window.location.href = '/fitness'}
            >
              <Activity className="h-6 w-6" />
              <span className="text-sm">Log Workout</span>
            </Button>
            
            <Button
              variant="secondary"
              className="flex flex-col items-center space-y-2 p-4 h-auto"
              onClick={() => window.location.href = '/mental'}
            >
              <Heart className="h-6 w-6" />
              <span className="text-sm">Mental Check</span>
            </Button>
            
            <Button
              variant="secondary"
              className="flex flex-col items-center space-y-2 p-4 h-auto"
              onClick={() => window.location.href = '/analytics'}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">View Analytics</span>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Achievement Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Today's Achievements
            </h2>
          </div>
          
          <div className="space-y-3">
            {stats.completedTasks > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Completed {stats.completedTasks} task{stats.completedTasks > 1 ? 's' : ''} today! 
                </span>
              </div>
            )}
            
            {stats.completedHabits > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Maintained {stats.completedHabits} habit{stats.completedHabits > 1 ? 's' : ''} today!
                </span>
              </div>
            )}
            
            {stats.fitnessScore > 50 && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Activity className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Great fitness score of {stats.fitnessScore}%!
                </span>
              </div>
            )}
            
            {stats.mentalScore > 70 && (
              <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Heart className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Excellent mental wellness score!
                </span>
              </div>
            )}
            
            {stats.completedTasks === 0 && stats.completedHabits === 0 && stats.fitnessScore === 0 && stats.mentalScore === 0 && (
              <div className="text-center py-6">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  Start your day by completing some tasks or habits!
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Smart Recommendations */}
      {dashboardData.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                AI Recommendations
              </h2>
            </div>
            
            <div className="space-y-3">
              {dashboardData.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === 'high' 
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
                      : rec.priority === 'medium'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{rec.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {rec.description}
                      </p>
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-2">
                        💡 {rec.action}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.priority === 'high' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' 
                        : rec.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                </motion.div>
              ))}
              
              <div className="text-center pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.href = '/analytics'}
                  className="text-purple-600 hover:text-purple-700"
                >
                  View All Insights →
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default CoreOSDashboard; 