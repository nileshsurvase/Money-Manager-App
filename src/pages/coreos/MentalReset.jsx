import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Heart, 
  Zap, 
  Wind, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw,
  Smile,
  Frown,
  Meh,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Target,
  CheckCircle2
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import { DashboardSkeleton } from '../../components/SkeletonLoader';
import { 
  getTodayMentalHealth, 
  addMentalCheckIn, 
  addMeditationSession,
  getActiveStreak 
} from '../../utils/coreosStorage';

const MentalReset = () => {
  const [loading, setLoading] = useState(true);
  const [mentalData, setMentalData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, checkin, meditation, insights
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showMeditationModal, setShowMeditationModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedMeditationType, setSelectedMeditationType] = useState('meditation');

  // Check-in form state
  const [checkInForm, setCheckInForm] = useState({
    mood: 5,
    stress: 5,
    energy: 5,
    notes: '',
    emotions: [],
    stressors: [],
    gratitude: []
  });

  // Meditation form state
  const [meditationForm, setMeditationForm] = useState({
    type: 'meditation',
    duration: 10,
    technique: '',
    effectiveness: 5,
    notes: ''
  });

  // Preset meditation options
  const meditationTypes = [
    { id: 'meditation', name: 'Meditation', icon: '🧘', description: 'Mindfulness meditation' },
    { id: 'breathwork', name: 'Breathwork', icon: '💨', description: 'Breathing exercises' },
    { id: 'mindfulness', name: 'Mindfulness', icon: '🌸', description: 'Present moment awareness' },
    { id: 'body-scan', name: 'Body Scan', icon: '🫀', description: 'Progressive relaxation' }
  ];

  const emotionTags = [
    { id: 'happy', name: 'Happy', emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'calm', name: 'Calm', emoji: '😌', color: 'bg-blue-100 text-blue-800' },
    { id: 'anxious', name: 'Anxious', emoji: '😰', color: 'bg-orange-100 text-orange-800' },
    { id: 'sad', name: 'Sad', emoji: '😢', color: 'bg-gray-100 text-gray-800' },
    { id: 'angry', name: 'Angry', emoji: '😠', color: 'bg-red-100 text-red-800' },
    { id: 'excited', name: 'Excited', emoji: '🤩', color: 'bg-purple-100 text-purple-800' },
    { id: 'tired', name: 'Tired', emoji: '😴', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'grateful', name: 'Grateful', emoji: '🙏', color: 'bg-green-100 text-green-800' }
  ];

  useEffect(() => {
    loadMentalData();
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const loadMentalData = async () => {
    setLoading(true);
    try {
      const data = await getTodayMentalHealth();
      const mentalStreak = getActiveStreak('mental');
      setMentalData(data);
      setStreak(mentalStreak);
    } catch (error) {
      console.error('Error loading mental health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!mentalData) return {};

    const meditationProgress = mentalData.goals.dailyMeditation > 0 
      ? (mentalData.totalMeditationTime / mentalData.goals.dailyMeditation) * 100 
      : 0;

    return {
      hasCheckedIn: !!mentalData.checkIn,
      mood: mentalData.mood || 'Not checked',
      dailyScore: mentalData.dailyScore,
      totalMeditationTime: mentalData.totalMeditationTime,
      meditationSessions: mentalData.meditations.length,
      meditationProgress: Math.min(100, meditationProgress)
    };
  }, [mentalData]);

  const handleCheckIn = async () => {
    const newCheckIn = await addMentalCheckIn(
      checkInForm.mood,
      checkInForm.stress,
      checkInForm.energy,
      checkInForm.notes
    );

    if (newCheckIn) {
      await loadMentalData();
      setCheckInForm({
        mood: 5,
        stress: 5,
        energy: 5,
        notes: '',
        emotions: [],
        stressors: [],
        gratitude: []
      });
      setShowCheckInModal(false);
    }
  };

  const handleMeditationComplete = async () => {
    if (timerSeconds === 0) return;

    const duration = Math.round(timerSeconds / 60);
    const newSession = await addMeditationSession(
      meditationForm.type,
      duration,
      meditationForm.notes
    );

    if (newSession) {
      await loadMentalData();
      setTimerSeconds(0);
      setIsTimerRunning(false);
      setShowMeditationModal(false);
    }
  };

  const startTimer = () => {
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMoodIcon = (moodScore) => {
    if (moodScore >= 8) return { icon: '😊', color: 'text-green-600', label: 'Excellent' };
    if (moodScore >= 6) return { icon: '🙂', color: 'text-blue-600', label: 'Good' };
    if (moodScore >= 4) return { icon: '😐', color: 'text-yellow-600', label: 'Okay' };
    if (moodScore >= 2) return { icon: '🙁', color: 'text-orange-600', label: 'Poor' };
    return { icon: '😢', color: 'text-red-600', label: 'Very Poor' };
  };

  const getStressColor = (stressLevel) => {
    if (stressLevel <= 3) return 'text-green-600';
    if (stressLevel <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEnergyColor = (energyLevel) => {
    if (energyLevel >= 7) return 'text-green-600';
    if (energyLevel >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const toggleEmotion = (emotionId) => {
    setCheckInForm(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotionId)
        ? prev.emotions.filter(id => id !== emotionId)
        : [...prev.emotions, emotionId]
    }));
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
            Mental Reset
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your mental wellness and practice mindfulness
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setShowMeditationModal(true)}>
            <Wind className="h-4 w-4 mr-2" />
            Meditate
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowCheckInModal(true)}
            disabled={stats.hasCheckedIn}
          >
            <Heart className="h-4 w-4 mr-2" />
            {stats.hasCheckedIn ? 'Checked In' : 'Check In'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.dailyScore}%
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Wellness Score</p>
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-purple-600">{streak}</span>
            <span className="text-xs text-gray-500">day streak</span>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl mb-1">
            {mentalData?.checkIn ? getMoodIcon(mentalData.checkIn.mood).icon : '❓'}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {stats.mood}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Today's Mood</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Wind className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalMeditationTime}m
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Meditation Today</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.meditationProgress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {Math.round(stats.meditationProgress)}% of goal
          </span>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.meditationSessions}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sessions Today</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <Button
          variant={activeTab === 'overview' ? 'primary' : 'ghost'}
          size="small"
          onClick={() => setActiveTab('overview')}
        >
          <Brain className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'checkin' ? 'primary' : 'ghost'}
          size="small"
          onClick={() => setActiveTab('checkin')}
        >
          <Heart className="h-4 w-4 mr-2" />
          Check-in
        </Button>
        <Button
          variant={activeTab === 'meditation' ? 'primary' : 'ghost'}
          size="small"
          onClick={() => setActiveTab('meditation')}
        >
          <Wind className="h-4 w-4 mr-2" />
          Meditation
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Wellness */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Today's Wellness
            </h3>
            {mentalData?.checkIn ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mood</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMoodIcon(mentalData.checkIn.mood).icon}</span>
                    <span className={`font-semibold ${getMoodIcon(mentalData.checkIn.mood).color}`}>
                      {getMoodIcon(mentalData.checkIn.mood).label}
                    </span>
                    <span className="text-sm text-gray-500">({mentalData.checkIn.mood}/10)</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stress Level</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          mentalData.checkIn.stress <= 3 ? 'bg-green-600' :
                          mentalData.checkIn.stress <= 6 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${(mentalData.checkIn.stress / 10) * 100}%` }}
                      />
                    </div>
                    <span className={`font-semibold ${getStressColor(mentalData.checkIn.stress)}`}>
                      {mentalData.checkIn.stress}/10
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Energy Level</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          mentalData.checkIn.energy >= 7 ? 'bg-green-600' :
                          mentalData.checkIn.energy >= 4 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${(mentalData.checkIn.energy / 10) * 100}%` }}
                      />
                    </div>
                    <span className={`font-semibold ${getEnergyColor(mentalData.checkIn.energy)}`}>
                      {mentalData.checkIn.energy}/10
                    </span>
                  </div>
                </div>

                {mentalData.checkIn.notes && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      "{mentalData.checkIn.notes}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't checked in today yet
                </p>
                <Button onClick={() => setShowCheckInModal(true)}>
                  <Heart className="h-4 w-4 mr-2" />
                  Check In Now
                </Button>
              </div>
            )}
          </Card>

          {/* Quick Meditation Timer */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Meditation
            </h3>
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-purple-600 mb-4">
                {formatTime(timerSeconds)}
              </div>
              
              <div className="flex justify-center gap-2 mb-4">
                {!isTimerRunning ? (
                  <Button onClick={startTimer} variant="primary">
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} variant="secondary">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                <Button onClick={resetTimer} variant="ghost">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              {timerSeconds > 0 && (
                <Button onClick={handleMeditationComplete} variant="success">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Session
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Check-in Tab */}
      {activeTab === 'checkin' && (
        <div className="max-w-2xl mx-auto">
          {mentalData?.checkIn ? (
            <Card>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">
                  {getMoodIcon(mentalData.checkIn.mood).icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  You've already checked in today!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your mood: {getMoodIcon(mentalData.checkIn.mood).label}
                </p>
                <p className="text-sm text-gray-500">
                  Come back tomorrow for your next check-in
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  How are you feeling today?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Take a moment to check in with yourself
                </p>
              </div>
              <Button 
                onClick={() => setShowCheckInModal(true)}
                className="w-full"
                size="large"
              >
                <Heart className="h-5 w-5 mr-2" />
                Start Mental Health Check-in
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Meditation Tab */}
      {activeTab === 'meditation' && (
        <div className="space-y-6">
          {/* Meditation Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {meditationTypes.map((type) => (
              <Card key={type.id} className="text-center cursor-pointer hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">{type.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {type.description}
                </p>
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={() => {
                    setSelectedMeditationType(type.id);
                    setShowMeditationModal(true);
                  }}
                >
                  Start
                </Button>
              </Card>
            ))}
          </div>

          {/* Today's Sessions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Today's Sessions
            </h3>
            {mentalData?.meditations.length > 0 ? (
              <div className="space-y-3">
                {mentalData.meditations.map((session, index) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {meditationTypes.find(t => t.id === session.type)?.icon || '🧘'}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {session.type}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.duration} minutes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {new Date(session.date).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wind className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No meditation sessions today
                </p>
                <Button onClick={() => setShowMeditationModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Your First Session
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Mental Health Check-in Modal */}
      <Modal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title="Mental Health Check-in"
        size="large"
      >
        <div className="space-y-6">
          {/* Mood Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How is your mood today? ({checkInForm.mood}/10)
            </label>
            <div className="flex items-center gap-4">
              <span className="text-2xl">😢</span>
              <input
                type="range"
                min="1"
                max="10"
                value={checkInForm.mood}
                onChange={(e) => setCheckInForm(prev => ({ ...prev, mood: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-2xl">😊</span>
            </div>
            <div className="text-center mt-2">
              <span className="text-3xl">{getMoodIcon(checkInForm.mood).icon}</span>
              <p className={`text-sm font-medium ${getMoodIcon(checkInForm.mood).color}`}>
                {getMoodIcon(checkInForm.mood).label}
              </p>
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What's your stress level? ({checkInForm.stress}/10)
            </label>
            <div className="flex items-center gap-4">
              <span className="text-2xl">😌</span>
              <input
                type="range"
                min="1"
                max="10"
                value={checkInForm.stress}
                onChange={(e) => setCheckInForm(prev => ({ ...prev, stress: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-2xl">😰</span>
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How's your energy level? ({checkInForm.energy}/10)
            </label>
            <div className="flex items-center gap-4">
              <span className="text-2xl">😴</span>
              <input
                type="range"
                min="1"
                max="10"
                value={checkInForm.energy}
                onChange={(e) => setCheckInForm(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-2xl">⚡</span>
            </div>
          </div>

          {/* Emotions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What emotions are you feeling? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {emotionTags.map((emotion) => (
                <button
                  key={emotion.id}
                  type="button"
                  onClick={() => toggleEmotion(emotion.id)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                    checkInForm.emotions.includes(emotion.id)
                      ? `${emotion.color} border-current`
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-1">{emotion.emoji}</span>
                  {emotion.name}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What's on your mind? (Optional)
            </label>
            <textarea
              value={checkInForm.notes}
              onChange={(e) => setCheckInForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Share any thoughts, concerns, or what's making you feel this way..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
              rows="3"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCheckInModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckIn}>
              Complete Check-in
            </Button>
          </div>
        </div>
      </Modal>

      {/* Meditation Modal */}
      <Modal
        isOpen={showMeditationModal}
        onClose={() => setShowMeditationModal(false)}
        title="Start Meditation Session"
        size="medium"
      >
        <div className="space-y-4">
          <Select
            label="Meditation Type"
            value={meditationForm.type}
            onChange={(e) => setMeditationForm(prev => ({ ...prev, type: e.target.value }))}
          >
            {meditationTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.name}
              </option>
            ))}
          </Select>

          <Input
            label="Duration (minutes)"
            type="number"
            value={meditationForm.duration}
            onChange={(e) => setMeditationForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
            min="1"
            max="120"
          />

          <Input
            label="Technique (Optional)"
            value={meditationForm.technique}
            onChange={(e) => setMeditationForm(prev => ({ ...prev, technique: e.target.value }))}
            placeholder="e.g., 4-7-8 breathing, body scan"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowMeditationModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowMeditationModal(false);
              setTimerSeconds(0);
              setIsTimerRunning(true);
            }}>
              Start Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MentalReset; 