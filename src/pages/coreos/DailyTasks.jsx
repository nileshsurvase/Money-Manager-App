import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Clock, 
  Target, 
  Flame, 
  CheckCircle2, 
  Circle, 
  Timer,
  Calendar,
  Filter,
  Zap,
  Star,
  MoreVertical,
  Edit3,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import { ExpenseListSkeleton } from '../../components/SkeletonLoader';
import { 
  getTodayTasks, 
  addTask, 
  completeTask,
  getTodayHabits,
  addHabit,
  completeHabit
} from '../../utils/coreosStorage';
import { useDebounce } from '../../hooks/usePerformance';

const DailyTasks = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // tasks, habits
  const [filter, setFilter] = useState('all'); // all, completed, pending
  const [currentTimer, setCurrentTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    timeBlock: '',
    priority: 'medium',
    category: 'general',
    estimatedDuration: 30
  });

  // Habit form state
  const [habitForm, setHabitForm] = useState({
    name: '',
    cue: '',
    routine: '',
    reward: '',
    frequency: 'daily',
    timeOfDay: 'morning',
    difficulty: 'medium'
  });

  const debouncedFilter = useDebounce(filter, 300);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let interval;
    if (currentTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentTimer]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [todayTasks, todayHabits] = await Promise.all([
        getTodayTasks(),
        getTodayHabits()
      ]);
      setTasks(todayTasks);
      setHabits(todayHabits);
    } catch (error) {
      console.error('Error loading tasks and habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (debouncedFilter === 'completed') return task.completed;
      if (debouncedFilter === 'pending') return !task.completed;
      return true;
    });
  }, [tasks, debouncedFilter]);

  const filteredHabits = useMemo(() => {
    return habits.filter(habit => {
      if (debouncedFilter === 'completed') return habit.completed;
      if (debouncedFilter === 'pending') return !habit.completed;
      return true;
    });
  }, [habits, debouncedFilter]);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const completedHabits = habits.filter(habit => habit.completed).length;
    
    return {
      tasks: {
        total: tasks.length,
        completed: completedTasks,
        pending: tasks.length - completedTasks,
        completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
      },
      habits: {
        total: habits.length,
        completed: completedHabits,
        pending: habits.length - completedHabits,
        completionRate: habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0
      }
    };
  }, [tasks, habits]);

  const handleAddTask = async () => {
    if (!taskForm.title.trim()) return;
    
    const newTask = await addTask(
      taskForm.title,
      taskForm.timeBlock,
      taskForm.priority,
      taskForm.category
    );
    
    if (newTask) {
      setTasks(prev => [...prev, newTask]);
      setTaskForm({
        title: '',
        timeBlock: '',
        priority: 'medium',
        category: 'general',
        estimatedDuration: 30
      });
      setShowTaskModal(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    const updatedTask = await completeTask(taskId);
    if (updatedTask) {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    }
  };

  const handleAddHabit = async () => {
    if (!habitForm.name.trim() || !habitForm.cue.trim() || !habitForm.routine.trim()) return;
    
    const newHabit = await addHabit(
      habitForm.name,
      habitForm.cue,
      habitForm.routine,
      habitForm.reward,
      habitForm.frequency
    );
    
    if (newHabit) {
      setHabits(prev => [...prev, { ...newHabit, completed: false }]);
      setHabitForm({
        name: '',
        cue: '',
        routine: '',
        reward: '',
        frequency: 'daily',
        timeOfDay: 'morning',
        difficulty: 'medium'
      });
      setShowHabitModal(false);
    }
  };

  const handleCompleteHabit = async (habitId) => {
    const updatedHabit = await completeHabit(habitId);
    if (updatedHabit) {
      setHabits(prev => prev.map(habit => 
        habit.id === habitId ? { ...updatedHabit, completed: true } : habit
      ));
    }
  };

  const startTimer = (taskId) => {
    setCurrentTimer(taskId);
    setTimerSeconds(0);
  };

  const stopTimer = () => {
    setCurrentTimer(null);
    setTimerSeconds(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return <ExpenseListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Daily Tasks + HabitOS
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your daily tasks and build powerful habits
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowTaskModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowHabitModal(true)}
          >
            <Flame className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.tasks.completed}/{stats.tasks.total}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Today</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.tasks.completionRate}%` }}
            />
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Flame className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.habits.completed}/{stats.habits.total}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Habits Today</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.habits.completionRate}%` }}
            />
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Timer className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentTimer ? formatTime(timerSeconds) : '00:00'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Timer</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Math.round((stats.tasks.completionRate + stats.habits.completionRate) / 2)}%
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Overall Score</p>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'tasks' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setActiveTab('tasks')}
          >
            <Target className="h-4 w-4 mr-2" />
            Tasks ({stats.tasks.total})
          </Button>
          <Button
            variant={activeTab === 'habits' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setActiveTab('habits')}
          >
            <Flame className="h-4 w-4 mr-2" />
            Habits ({stats.habits.total})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="min-w-[120px]"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </Select>
        </div>
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`${task.completed ? 'opacity-75' : ''}`}>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="flex-shrink-0"
                      disabled={task.completed}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400 hover:text-blue-600 transition-colors" />
                      )}
                    </button>

                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        {task.timeBlock && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{task.timeBlock}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          <span>{task.estimatedDuration}min</span>
                        </div>
                        {task.category && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!task.completed && (
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => currentTimer === task.id ? stopTimer() : startTimer(task.id)}
                        >
                          {currentTimer === task.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button variant="ghost" size="small">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {currentTimer === task.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Timer Active</span>
                        <span className="text-lg font-mono font-bold text-orange-600">
                          {formatTime(timerSeconds)}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTasks.length === 0 && (
            <Card className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filter === 'all' ? 'Start by adding your first task!' : `No ${filter} tasks for today.`}
              </p>
              {filter === 'all' && (
                <Button onClick={() => setShowTaskModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Task
                </Button>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Habits Tab */}
      {activeTab === 'habits' && (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredHabits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`${habit.completed ? 'opacity-75' : ''}`}>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleCompleteHabit(habit.id)}
                      className="flex-shrink-0"
                      disabled={habit.completed}
                    >
                      {habit.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400 hover:text-green-600 transition-colors" />
                      )}
                    </button>

                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold ${habit.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                          {habit.name}
                        </h3>
                        <span className="text-lg">🔥{habit.streak}</span>
                        <span className="text-xs">{getDifficultyIcon(habit.difficulty)}</span>
                      </div>
                      
                      {/* Cue-Routine-Reward Model */}
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">Cue:</span>
                          <span className="text-gray-600 dark:text-gray-400">{habit.cue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-600 font-medium">Routine:</span>
                          <span className="text-gray-600 dark:text-gray-400">{habit.routine}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-medium">Reward:</span>
                          <span className="text-gray-600 dark:text-gray-400">{habit.reward}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{habit.frequency}</span>
                        <span>{habit.timeOfDay}</span>
                        <span>Best: {habit.longestStreak} days</span>
                      </div>
                    </div>

                    <Button variant="ghost" size="small">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredHabits.length === 0 && (
            <Card className="text-center py-12">
              <Flame className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No habits found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filter === 'all' ? 'Build your first habit using the Cue-Routine-Reward model!' : `No ${filter} habits for today.`}
              </p>
              {filter === 'all' && (
                <Button onClick={() => setShowHabitModal(true)}>
                  <Flame className="h-4 w-4 mr-2" />
                  Create Your First Habit
                </Button>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Add New Task"
        size="medium"
      >
        <div className="space-y-4">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="What do you need to do?"
            required
          />

          <Input
            label="Time Block (Optional)"
            value={taskForm.timeBlock}
            onChange={(e) => setTaskForm(prev => ({ ...prev, timeBlock: e.target.value }))}
            placeholder="e.g., 9:00 AM - 10:00 AM"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>

            <Input
              label="Category"
              value={taskForm.category}
              onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., work, personal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={!taskForm.title.trim()}>
              Add Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Habit Modal */}
      <Modal
        isOpen={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        title="Create New Habit"
        size="large"
      >
        <div className="space-y-4">
          <Input
            label="Habit Name"
            value={habitForm.name}
            onChange={(e) => setHabitForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="What habit do you want to build?"
            required
          />

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Cue-Routine-Reward Model
            </h4>
            <div className="space-y-3">
              <Input
                label="Cue (Trigger)"
                value={habitForm.cue}
                onChange={(e) => setHabitForm(prev => ({ ...prev, cue: e.target.value }))}
                placeholder="What triggers this habit? (e.g., after I wake up)"
                required
              />
              
              <Input
                label="Routine (The Habit)"
                value={habitForm.routine}
                onChange={(e) => setHabitForm(prev => ({ ...prev, routine: e.target.value }))}
                placeholder="What exactly will you do? (e.g., drink a glass of water)"
                required
              />
              
              <Input
                label="Reward (Benefit)"
                value={habitForm.reward}
                onChange={(e) => setHabitForm(prev => ({ ...prev, reward: e.target.value }))}
                placeholder="What's your reward? (e.g., feel energized for the day)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Frequency"
              value={habitForm.frequency}
              onChange={(e) => setHabitForm(prev => ({ ...prev, frequency: e.target.value }))}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>

            <Select
              label="Time of Day"
              value={habitForm.timeOfDay}
              onChange={(e) => setHabitForm(prev => ({ ...prev, timeOfDay: e.target.value }))}
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="anytime">Anytime</option>
            </Select>
          </div>

          <Select
            label="Difficulty"
            value={habitForm.difficulty}
            onChange={(e) => setHabitForm(prev => ({ ...prev, difficulty: e.target.value }))}
          >
            <option value="easy">Easy 🟢</option>
            <option value="medium">Medium 🟡</option>
            <option value="hard">Hard 🔴</option>
          </Select>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowHabitModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddHabit} 
              disabled={!habitForm.name.trim() || !habitForm.cue.trim() || !habitForm.routine.trim()}
            >
              Create Habit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DailyTasks; 