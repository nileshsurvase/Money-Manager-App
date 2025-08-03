import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Trophy,
  Flame,
  Calendar,
  BarChart3,
  Zap,
  Flag,
  Edit,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  getGoals, 
  getGoalsAnalytics,
  updateGoal,
  deleteGoal,
  GOAL_STATUS,
  PRIORITY_LEVELS,
  GOAL_TYPES
} from '../../utils/goalsStorage';

const GoalOS = () => {
  const [goals, setGoals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    try {
      const goalsData = getGoals();
      const analyticsData = getGoalsAnalytics();
      
      setGoals(goalsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentGoals = () => {
    return goals
      .filter(goal => goal.status !== GOAL_STATUS.ARCHIVED)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    return goals
      .filter(goal => 
        goal.status !== GOAL_STATUS.COMPLETED && 
        goal.status !== GOAL_STATUS.ARCHIVED &&
        new Date(goal.targetDate) > now
      )
      .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
      .slice(0, 3);
  };

  const getOverdueGoals = () => {
    const now = new Date();
    return goals.filter(goal => 
      goal.status !== GOAL_STATUS.COMPLETED && 
      goal.status !== GOAL_STATUS.ARCHIVED &&
      new Date(goal.targetDate) < now
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case PRIORITY_LEVELS.CRITICAL: return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case PRIORITY_LEVELS.HIGH: return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case PRIORITY_LEVELS.MEDIUM: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case PRIORITY_LEVELS.LOW: return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case GOAL_TYPES.SHORT_TERM: return 'from-green-500 to-emerald-500';
      case GOAL_TYPES.MID_TERM: return 'from-blue-500 to-indigo-500';
      case GOAL_TYPES.LONG_TERM: return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      const success = deleteGoal(goalId);
      if (success) {
        loadDashboardData();
      }
    }
  };

  const handleStatusChange = async (goalId, newStatus) => {
    const success = updateGoal(goalId, { 
      status: newStatus,
      completedAt: newStatus === GOAL_STATUS.COMPLETED ? new Date().toISOString() : null
    });
    if (success) {
      loadDashboardData();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case GOAL_STATUS.COMPLETED: return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case GOAL_STATUS.IN_PROGRESS: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case GOAL_STATUS.PAUSED: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case GOAL_STATUS.NOT_STARTED: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const recentGoals = getRecentGoals();
  const upcomingDeadlines = getUpcomingDeadlines();
  const overdueGoals = getOverdueGoals();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card variant="glass" className="relative">
          <div className="space-y-2">
            <h1 className="text-gradient flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 animate-pulse" />
              GoalOS
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Track your progress and achieve your dreams
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Upcoming Deadlines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Upcoming Deadlines
                </h3>
              </div>
              <Button variant="primary" size="sm" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Goal</span>
              </Button>
            </div>
            
            <div className="space-y-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{goal.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {goal.progress}%
                      </div>
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-orange-500 h-1.5 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No upcoming deadlines
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Goals with Enhanced Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Goals
                </h3>
              </div>
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {goals.length > 0 ? (
                goals.slice(0, 3).map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    {/* Status indicator bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      goal.status === GOAL_STATUS.COMPLETED ? 'bg-green-500' :
                      goal.status === GOAL_STATUS.IN_PROGRESS ? 'bg-blue-500' :
                      goal.status === GOAL_STATUS.PAUSED ? 'bg-yellow-500' :
                      'bg-gray-300'
                    }`} />
                    
                    <div className="p-4 sm:p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getTypeColor(goal.type)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors line-clamp-1">
                              {goal.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(goal.priority)}`}>
                                {goal.priority}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(goal.status)}`}>
                                {goal.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick actions menu */}
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="ghost" className="p-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                      
                      {/* Progress Section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              goal.progress === 100 ? 'bg-green-500' :
                              goal.progress >= 75 ? 'bg-blue-500' :
                              goal.progress >= 50 ? 'bg-yellow-500' :
                              'bg-orange-500'
                            }`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Due Date</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Flag className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Type</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                              {goal.type.replace('-', ' ')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {goal.tags && goal.tags.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1.5">
                            {goal.tags.slice(0, 4).map((tag, tagIndex) => (
                              <span key={tagIndex} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium border border-blue-200 dark:border-blue-800">
                                #{tag}
                              </span>
                            ))}
                            {goal.tags.length > 4 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 px-2.5 py-1">
                                +{goal.tags.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {goal.status === GOAL_STATUS.NOT_STARTED && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleStatusChange(goal.id, GOAL_STATUS.IN_PROGRESS)}
                            className="flex items-center space-x-2 flex-1 sm:flex-none"
                          >
                            <Play className="h-4 w-4" />
                            <span>Start Goal</span>
                          </Button>
                        )}
                        
                        {goal.status === GOAL_STATUS.IN_PROGRESS && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleStatusChange(goal.id, GOAL_STATUS.COMPLETED)}
                              className="flex items-center space-x-2 flex-1 sm:flex-none"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Complete</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleStatusChange(goal.id, GOAL_STATUS.PAUSED)}
                              className="flex items-center space-x-2 flex-1 sm:flex-none"
                            >
                              <Pause className="h-4 w-4" />
                              <span>Pause</span>
                            </Button>
                          </>
                        )}
                        
                        {goal.status === GOAL_STATUS.PAUSED && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleStatusChange(goal.id, GOAL_STATUS.IN_PROGRESS)}
                            className="flex items-center space-x-2 flex-1 sm:flex-none"
                          >
                            <Play className="h-4 w-4" />
                            <span>Resume</span>
                          </Button>
                        )}
                        
                        {goal.status === GOAL_STATUS.COMPLETED && (
                          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Completed!</span>
                          </div>
                        )}
                        
                        <Button size="sm" variant="secondary" className="w-full">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No goals yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first goal to get started on your journey!
                  </p>
                  <Button variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed Goals */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {analytics?.completed || 0}/{analytics?.total || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed Goals</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analytics?.total > 0 ? ((analytics?.completed || 0) / analytics?.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {analytics?.total > 0 ? Math.round(((analytics?.completed || 0) / analytics?.total) * 100) : 0}% Complete
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Total Goals */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {analytics?.total || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Goals</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: '100%' }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">All Time</span>
            </div>
          </Card>
        </motion.div>

        {/* In Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {analytics?.inProgress || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analytics?.total > 0 ? ((analytics?.inProgress || 0) / analytics?.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">Active Goals</span>
            </div>
          </Card>
        </motion.div>

        {/* Average Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(analytics?.averageProgress || 0)}%
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(analytics?.averageProgress || 0)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">Overall Progress</span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Alerts Section */}
      {overdueGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Overdue Goals ({overdueGoals.length})
                </h2>
              </div>
              <div className="space-y-2">
                {overdueGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{goal.title}</h3>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Due: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Button size="sm" variant="primary">Update</Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

    </div>
  );
};

export default GoalOS; 