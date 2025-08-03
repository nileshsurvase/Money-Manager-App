import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Link as LinkIcon, 
  TrendingUp, 
  CheckCircle2, 
  Calendar,
  Zap,
  Star,
  ArrowRight,
  Clock,
  Trophy,
  Activity,
  Brain,
  Heart,
  Flame,
  Edit3,
  Trash2
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import { DashboardSkeleton } from '../../components/SkeletonLoader';
import { 
  getTodayTasks, 
  getTodayHabits,
  linkTaskToGoal,
  linkHabitToGoal,
  getGoalProgress
} from '../../utils/coreosStorage';
import { getGoals } from '../../utils/goalsStorage';

const GoalIntegration = () => {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [linkType, setLinkType] = useState('task'); // task or habit

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [goalsData, tasksData, habitsData] = await Promise.all([
        getGoals(),
        getTodayTasks(),
        getTodayHabits()
      ]);

      setGoals(goalsData || []);
      setTasks(tasksData || []);
      setHabits(habitsData || []);
    } catch (error) {
      console.error('Error loading goal integration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkToGoal = (item, type) => {
    setSelectedItem(item);
    setLinkType(type);
    setShowLinkModal(true);
  };

  const confirmLink = () => {
    if (!selectedItem || !selectedGoal) return;

    if (linkType === 'task') {
      linkTaskToGoal(selectedItem.id, selectedGoal);
    } else {
      linkHabitToGoal(selectedItem.id, selectedGoal);
    }

    setShowLinkModal(false);
    setSelectedItem(null);
    setSelectedGoal('');
    loadData(); // Refresh data
  };

  const goalProgress = useMemo(() => {
    return goals.map(goal => {
      const linkedTasks = tasks.filter(task => task.linkedGoal === goal.id);
      const linkedHabits = habits.filter(habit => habit.linkedGoal === goal.id);
      const completedTasks = linkedTasks.filter(task => task.completed).length;
      const completedHabits = linkedHabits.filter(habit => habit.completed).length;
      
      const totalLinked = linkedTasks.length + linkedHabits.length;
      const totalCompleted = completedTasks + completedHabits;
      const progressFromActivities = totalLinked > 0 ? (totalCompleted / totalLinked) * 100 : 0;

      return {
        ...goal,
        linkedTasks: linkedTasks.length,
        linkedHabits: linkedHabits.length,
        completedTasks,
        completedHabits,
        progressFromActivities: Math.round(progressFromActivities),
        totalContributions: totalCompleted
      };
    });
  }, [goals, tasks, habits]);

  const unlinkedTasks = tasks.filter(task => !task.linkedGoal);
  const unlinkedHabits = habits.filter(habit => !habit.linkedGoal);

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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Goal Integration Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Connect your daily activities to your long-term goals
        </p>
      </motion.div>

      {/* Goal Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Goal Progress from Daily Activities
          </h2>
          
          <div className="space-y-4">
            {goalProgress.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Target className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{goal.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {goal.linkedTasks} tasks • {goal.linkedHabits} habits linked
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {goal.progress}%
                    </div>
                    <div className="text-xs text-gray-500">Goal Progress</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.completedTasks} tasks done today
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.completedHabits} habits completed
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    +{goal.progressFromActivities}% from activities
                  </div>
                </div>
              </motion.div>
            ))}
            
            {goalProgress.length === 0 && (
              <div className="text-center py-8">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No goals yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create some goals to see how your daily activities contribute to them.
                </p>
                <Button variant="primary">Create Your First Goal</Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Unlinked Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unlinked Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Unlinked Tasks
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <LinkIcon className="h-4 w-4" />
                <span>{unlinkedTasks.length} to link</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {unlinkedTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className={`h-5 w-5 ${task.completed ? 'text-green-500' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{task.category}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLinkToGoal(task, 'task')}
                    className="flex items-center space-x-1"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>Link</span>
                  </Button>
                </motion.div>
              ))}
              
              {unlinkedTasks.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">All tasks are linked to goals!</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Unlinked Habits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Unlinked Habits
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Flame className="h-4 w-4" />
                <span>{unlinkedHabits.length} to link</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {unlinkedHabits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Flame className={`h-5 w-5 ${habit.completed ? 'text-orange-500' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {habit.streak} day streak
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLinkToGoal(habit, 'habit')}
                    className="flex items-center space-x-1"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>Link</span>
                  </Button>
                </motion.div>
              ))}
              
              {unlinkedHabits.length === 0 && (
                <div className="text-center py-6">
                  <Flame className="h-12 w-12 text-orange-500 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">All habits are linked to goals!</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Link Modal */}
      <AnimatePresence>
        {showLinkModal && (
          <Modal
            isOpen={showLinkModal}
            onClose={() => setShowLinkModal(false)}
            title={`Link ${linkType} to Goal`}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected {linkType}:
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedItem?.title || selectedItem?.name}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose Goal:
                </label>
                <Select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="w-full"
                >
                  <option value="">Select a goal...</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title} ({goal.progress}% complete)
                    </option>
                  ))}
                </Select>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowLinkModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmLink}
                  disabled={!selectedGoal}
                >
                  Link to Goal
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoalIntegration; 