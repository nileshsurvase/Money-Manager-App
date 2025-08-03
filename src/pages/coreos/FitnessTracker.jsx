import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Dumbbell, 
  Apple, 
  Scale, 
  Heart, 
  Plus, 
  TrendingUp,
  Calendar,
  Timer,
  Zap,
  Target,
  Award,
  BarChart3,
  Clock
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import { DashboardSkeleton } from '../../components/SkeletonLoader';
import { 
  getTodayFitness, 
  addWorkout, 
  addMeal,
  getActiveStreak 
} from '../../utils/coreosStorage';

const FitnessTracker = () => {
  const [loading, setLoading] = useState(true);
  const [fitnessData, setFitnessData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, workouts, nutrition, metrics
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [streak, setStreak] = useState(0);

  // Workout form state
  const [workoutForm, setWorkoutForm] = useState({
    type: 'strength',
    duration: 60,
    exercises: [{ name: '', sets: 3, reps: 12, weight: 0, notes: '' }],
    mood: 'good',
    difficulty: 'medium',
    location: 'gym'
  });

  // Meal form state
  const [mealForm, setMealForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    mealType: 'other'
  });

  useEffect(() => {
    loadFitnessData();
  }, []);

  const loadFitnessData = async () => {
    setLoading(true);
    try {
      const data = await getTodayFitness();
      const fitnessStreak = getActiveStreak('fitness');
      setFitnessData(data);
      setStreak(fitnessStreak);
    } catch (error) {
      console.error('Error loading fitness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!fitnessData) return {};

    const calorieProgress = fitnessData.goals.dailyCalories > 0 
      ? (fitnessData.totalCalories / fitnessData.goals.dailyCalories) * 100 
      : 0;
    
    const proteinProgress = fitnessData.goals.dailyProtein > 0 
      ? (fitnessData.totalProtein / fitnessData.goals.dailyProtein) * 100 
      : 0;

    return {
      workoutsToday: fitnessData.workoutsToday,
      totalCalories: Math.round(fitnessData.totalCalories),
      totalProtein: Math.round(fitnessData.totalProtein),
      dailyScore: fitnessData.dailyScore,
      calorieProgress: Math.min(100, calorieProgress),
      proteinProgress: Math.min(100, proteinProgress),
      mealsLogged: fitnessData.meals.length
    };
  }, [fitnessData]);

  const handleAddWorkout = async () => {
    const validExercises = workoutForm.exercises.filter(ex => ex.name.trim());
    if (validExercises.length === 0) return;

    const newWorkout = await addWorkout(
      workoutForm.type,
      validExercises,
      parseInt(workoutForm.duration)
    );

    if (newWorkout) {
      await loadFitnessData();
      setWorkoutForm({
        type: 'strength',
        duration: 60,
        exercises: [{ name: '', sets: 3, reps: 12, weight: 0, notes: '' }],
        mood: 'good',
        difficulty: 'medium',
        location: 'gym'
      });
      setShowWorkoutModal(false);
    }
  };

  const handleAddMeal = async () => {
    if (!mealForm.name.trim() || !mealForm.calories) return;

    const newMeal = await addMeal(
      mealForm.name,
      parseFloat(mealForm.calories),
      parseFloat(mealForm.protein) || 0,
      parseFloat(mealForm.carbs) || 0,
      parseFloat(mealForm.fat) || 0
    );

    if (newMeal) {
      await loadFitnessData();
      setMealForm({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        mealType: 'other'
      });
      setShowMealModal(false);
    }
  };

  const addExercise = () => {
    setWorkoutForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: 3, reps: 12, weight: 0, notes: '' }]
    }));
  };

  const updateExercise = (index, field, value) => {
    setWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const removeExercise = (index) => {
    if (workoutForm.exercises.length > 1) {
      setWorkoutForm(prev => ({
        ...prev,
        exercises: prev.exercises.filter((_, i) => i !== index)
      }));
    }
  };

  const getWorkoutIcon = (type) => {
    switch (type) {
      case 'strength': return '💪';
      case 'cardio': return '🏃';
      case 'flexibility': return '🧘';
      case 'sports': return '⚽';
      default: return '🏋️';
    }
  };

  const getMealTypeIcon = (type) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Fitness Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track workouts, nutrition, and body metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setShowMealModal(true)}>
            <Apple className="h-4 w-4 mr-2" />
            Log Meal
          </Button>
          <Button variant="primary" onClick={() => setShowWorkoutModal(true)}>
            <Dumbbell className="h-4 w-4 mr-2" />
            Log Workout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Dumbbell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.workoutsToday}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Workouts Today</p>
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-orange-600">{streak}</span>
            <span className="text-xs text-gray-500">day streak</span>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Apple className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalCalories}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Calories Today</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.calorieProgress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {Math.round(stats.calorieProgress)}% of goal
          </span>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalProtein}g
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Protein Today</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.proteinProgress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {Math.round(stats.proteinProgress)}% of goal
          </span>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.dailyScore}%
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Daily Score</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.dailyScore}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <Button
          variant={activeTab === 'overview' ? 'primary' : 'ghost'}
          size="small"
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'workouts' ? 'primary' : 'ghost'}
          size="small"
          onClick={() => setActiveTab('workouts')}
        >
          <Dumbbell className="h-4 w-4 mr-2" />
          Workouts ({stats.workoutsToday})
        </Button>
        <Button
          variant={activeTab === 'nutrition' ? 'primary' : 'ghost'}
          size="small"
          onClick={() => setActiveTab('nutrition')}
        >
          <Apple className="h-4 w-4 mr-2" />
          Nutrition ({stats.mealsLogged})
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Goals */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Today's Goals
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Calories ({stats.totalCalories}/{fitnessData?.goals.dailyCalories})
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(stats.calorieProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stats.calorieProgress}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Protein ({stats.totalProtein}g/{fitnessData?.goals.dailyProtein}g)
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(stats.proteinProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stats.proteinProgress}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Weekly Workouts ({stats.workoutsToday}/{fitnessData?.goals.weeklyWorkouts})
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round((stats.workoutsToday / fitnessData?.goals.weeklyWorkouts) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (stats.workoutsToday / fitnessData?.goals.weeklyWorkouts) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                className="h-20 flex-col"
                onClick={() => setShowWorkoutModal(true)}
              >
                <Dumbbell className="h-6 w-6 mb-2" />
                <span className="text-sm">Log Workout</span>
              </Button>
              <Button 
                variant="secondary" 
                className="h-20 flex-col"
                onClick={() => setShowMealModal(true)}
              >
                <Apple className="h-6 w-6 mb-2" />
                <span className="text-sm">Log Meal</span>
              </Button>
              <Button variant="secondary" className="h-20 flex-col">
                <Scale className="h-6 w-6 mb-2" />
                <span className="text-sm">Body Weight</span>
              </Button>
              <Button variant="secondary" className="h-20 flex-col">
                <Heart className="h-6 w-6 mb-2" />
                <span className="text-sm">Heart Rate</span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Workouts Tab */}
      {activeTab === 'workouts' && (
        <div className="space-y-4">
          <AnimatePresence>
            {fitnessData?.workouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getWorkoutIcon(workout.type)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                            {workout.type} Workout
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Timer className="h-4 w-4" />
                              <span>{workout.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="h-4 w-4" />
                              <span>{workout.exercises.length} exercises</span>
                            </div>
                            <span className="capitalize">{workout.mood}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {workout.exercises.map((exercise, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {exercise.name}
                              </span>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {exercise.sets} × {exercise.reps}
                                {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {fitnessData?.workouts.length === 0 && (
            <Card className="text-center py-12">
              <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No workouts logged today
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start your fitness journey by logging your first workout!
              </p>
              <Button onClick={() => setShowWorkoutModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Workout
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Nutrition Tab */}
      {activeTab === 'nutrition' && (
        <div className="space-y-4">
          <AnimatePresence>
            {fitnessData?.meals.map((meal, index) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getMealTypeIcon(meal.mealType)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {meal.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{meal.calories} cal</span>
                          <span>P: {meal.macros.protein}g</span>
                          <span>C: {meal.macros.carbs}g</span>
                          <span>F: {meal.macros.fat}g</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {new Date(meal.date).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {fitnessData?.meals.length === 0 && (
            <Card className="text-center py-12">
              <Apple className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No meals logged today
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Track your nutrition by logging your meals and macros!
              </p>
              <Button onClick={() => setShowMealModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Meal
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Add Workout Modal */}
      <Modal
        isOpen={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
        title="Log Workout"
        size="large"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Workout Type"
              value={workoutForm.type}
              onChange={(e) => setWorkoutForm(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="strength">Strength Training</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="sports">Sports</option>
            </Select>

            <Input
              label="Duration (minutes)"
              type="number"
              value={workoutForm.duration}
              onChange={(e) => setWorkoutForm(prev => ({ ...prev, duration: e.target.value }))}
              min="1"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Exercises
              </label>
              <Button variant="ghost" size="small" onClick={addExercise}>
                <Plus className="h-4 w-4 mr-1" />
                Add Exercise
              </Button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {workoutForm.exercises.map((exercise, index) => (
                <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="Exercise name"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Sets"
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                      <Input
                        placeholder="Reps"
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                      <Input
                        placeholder="Weight (kg)"
                        type="number"
                        value={exercise.weight}
                        onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                      />
                    </div>
                  </div>
                  {workoutForm.exercises.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="small" 
                      onClick={() => removeExercise(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Mood"
              value={workoutForm.mood}
              onChange={(e) => setWorkoutForm(prev => ({ ...prev, mood: e.target.value }))}
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="okay">Okay</option>
              <option value="poor">Poor</option>
            </Select>

            <Select
              label="Difficulty"
              value={workoutForm.difficulty}
              onChange={(e) => setWorkoutForm(prev => ({ ...prev, difficulty: e.target.value }))}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>

            <Input
              label="Location"
              value={workoutForm.location}
              onChange={(e) => setWorkoutForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., gym, home"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowWorkoutModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWorkout}>
              Log Workout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Meal Modal */}
      <Modal
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        title="Log Meal"
        size="medium"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Meal Name"
              value={mealForm.name}
              onChange={(e) => setMealForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="What did you eat?"
              required
            />

            <Select
              label="Meal Type"
              value={mealForm.mealType}
              onChange={(e) => setMealForm(prev => ({ ...prev, mealType: e.target.value }))}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <Input
            label="Calories"
            type="number"
            value={mealForm.calories}
            onChange={(e) => setMealForm(prev => ({ ...prev, calories: e.target.value }))}
            placeholder="Total calories"
            min="0"
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Protein (g)"
              type="number"
              value={mealForm.protein}
              onChange={(e) => setMealForm(prev => ({ ...prev, protein: e.target.value }))}
              placeholder="0"
              min="0"
              step="0.1"
            />

            <Input
              label="Carbs (g)"
              type="number"
              value={mealForm.carbs}
              onChange={(e) => setMealForm(prev => ({ ...prev, carbs: e.target.value }))}
              placeholder="0"
              min="0"
              step="0.1"
            />

            <Input
              label="Fat (g)"
              type="number"
              value={mealForm.fat}
              onChange={(e) => setMealForm(prev => ({ ...prev, fat: e.target.value }))}
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowMealModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMeal} disabled={!mealForm.name.trim() || !mealForm.calories}>
              Log Meal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FitnessTracker; 