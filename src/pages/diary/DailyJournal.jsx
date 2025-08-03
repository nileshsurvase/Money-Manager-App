import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  Save, 
  Calendar, 
  Heart,
  Lightbulb,
  Target,
  TrendingUp,
  TrendingDown,
  Star,
  AlertCircle,
  CheckCircle,
  Plus,
  Smile,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  Activity,
  Trash
} from 'lucide-react';
import { format } from 'date-fns';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  createEntry, 
  updateEntry, 
  deleteEntry,
  getEntryForDate, 
  EMOTIONS,
  WRITING_PROMPTS,
  getNavigationDate,
  getPreviousEntries,
  getEntryPreview,
  // Wellness tracking imports
  addWellnessCheckIn,
  getTodayWellness,
  getWellnessForDate,
  WELLNESS_EMOTIONS,
  getMoodIcon
} from '../../utils/diaryStorage';

const DailyJournal = () => {
  const [entry, setEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [previousEntries, setPreviousEntries] = useState([]);
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  
  // Wellness tracking state
  const [wellnessData, setWellnessData] = useState({
    mood: 5,
    stress: 5,
    energy: 5,
    emotions: [],
    notes: ''
  });
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [wellnessForm, setWellnessForm] = useState({
    mood: 5,
    stress: 5,
    energy: 5,
    emotions: [],
    notes: ''
  });
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    emotion: '',
    emotionNote: '',
    grateful: '',
    proud: '',
    favoritemoment: '',
    mistake: '',
    improvement: '',
    moreOf: '',
    lessOf: '',
    affirmation: '',
    additionalThoughts: ''
  });

  useEffect(() => {
    loadEntryForDate();
    loadPreviousEntries();
    loadWellnessForDate();
  }, [currentDate]);

  const loadWellnessForDate = () => {
    const wellness = getWellnessForDate(currentDate);
    setWellnessData(wellness);
    if (wellness) {
      setWellnessForm({
        mood: wellness.mood,
        stress: wellness.stress,
        energy: wellness.energy,
        emotions: wellness.emotions || [],
        notes: wellness.notes || ''
      });
    } else {
      setWellnessForm({
        mood: 5,
        stress: 5,
        energy: 5,
        emotions: [],
        notes: ''
      });
    }
  };

  const handleWellnessSubmit = async () => {
    const result = await addWellnessCheckIn(
      wellnessForm.mood,
      wellnessForm.stress,
      wellnessForm.energy,
      wellnessForm.emotions,
      wellnessForm.notes
    );
    
    if (result) {
      setWellnessData(result);
      setShowWellnessModal(false);
    }
  };

  const toggleEmotion = (emotionId) => {
    setWellnessForm(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotionId)
        ? prev.emotions.filter(e => e !== emotionId)
        : [...prev.emotions, emotionId]
    }));
  };

  const loadEntryForDate = () => {
    const dateEntry = getEntryForDate('daily', currentDate);
    if (dateEntry) {
      setEntry(dateEntry);
      setFormData({
        emotion: dateEntry.emotion || '',
        emotionNote: dateEntry.emotionNote || '',
        grateful: dateEntry.grateful || '',
        proud: dateEntry.proud || '',
        favoritemoment: dateEntry.favoritemoment || '',
        mistake: dateEntry.mistake || '',
        improvement: dateEntry.improvement || '',
        moreOf: dateEntry.moreOf || '',
        lessOf: dateEntry.lessOf || '',
        affirmation: dateEntry.affirmation || '',
        additionalThoughts: dateEntry.additionalThoughts || ''
      });
      setIsEditing(false);
    } else {
      setEntry(null);
      setFormData({
        emotion: '',
        emotionNote: '',
        grateful: '',
        proud: '',
        favoritemoment: '',
        mistake: '',
        improvement: '',
        moreOf: '',
        lessOf: '',
        affirmation: '',
        additionalThoughts: ''
      });
      setIsEditing(true);
    }
  };

  const loadPreviousEntries = () => {
    const prevEntries = getPreviousEntries('daily', currentDate, 10);
    setPreviousEntries(prevEntries);
  };

  const handleDateNavigation = (direction) => {
    const newDate = getNavigationDate(currentDate, 'daily', direction);
    setCurrentDate(newDate);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const entryData = {
        ...formData,
        content: generateContentFromForm(formData),
        date: currentDate.toISOString()
      };

      if (entry) {
        // Update existing entry
        const updatedEntry = updateEntry(entry.id, 'daily', entryData);
        setEntry(updatedEntry);
      } else {
        // Create new entry
        const newEntry = createEntry('daily', entryData);
        setEntry(newEntry);
      }
      
      setIsEditing(false);
      loadPreviousEntries(); // Refresh previous entries
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const targetEntry = entryToDelete || entry;
    if (!targetEntry) return;
    
    setSaving(true);
    try {
      deleteEntry(targetEntry.id, 'daily');
      
      // If deleting current entry, reset form and state
      if (!entryToDelete || entryToDelete.id === entry?.id) {
        setEntry(null);
        setIsEditing(true);
        // Reset form
        setFormData({
          emotion: '',
          emotionNote: '',
          grateful: '',
          proud: '',
          favoritemoment: '',
          mistake: '',
          improvement: '',
          moreOf: '',
          lessOf: '',
          affirmation: '',
          additionalThoughts: ''
        });
      }
      
      setShowDeleteConfirm(false);
      setEntryToDelete(null);
      loadPreviousEntries(); // Refresh previous entries
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const generateContentFromForm = (data) => {
    return `
Daily Reflection for ${format(currentDate, 'MMMM dd, yyyy')}

🎭 How I Felt: ${data.emotion} - ${data.emotionNote}

🙏 Grateful For: ${data.grateful}

🏆 Proud Of: ${data.proud}

⭐ Favorite Moment: ${data.favoritemoment}

🤔 Mistake & Learning: ${data.mistake} → ${data.improvement}

📈 More Of: ${data.moreOf}
📉 Less Of: ${data.lessOf}

💪 Affirmation: ${data.affirmation}

💭 Additional Thoughts: ${data.additionalThoughts}
    `.trim();
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSelectedEmotion = () => {
    return EMOTIONS.find(e => e.name === formData.emotion);
  };

  const isFormComplete = () => {
    return formData.emotion && formData.grateful && formData.proud && formData.favoritemoment;
  };

  const toggleEntryExpansion = (entryId) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const isFuture = () => {
    const today = new Date();
    return currentDate > today;
  };

  return (
    <>
    <div className="space-y-6">
      {/* Date Navigation Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card variant="glass" className="relative">
          <div className="flex items-center justify-between">
            {/* Previous Date Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDateNavigation('prev')}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Current Date */}
            <div className="text-center">
              <h1 className="text-gradient flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                <PenTool className="h-6 w-6 text-emerald-500" />
                Daily Journal
              </h1>
              <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 mt-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {format(currentDate, 'EEEE, MMMM dd, yyyy')}
                </span>
                {isToday() && (
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                    Today
                  </span>
                )}
              </div>
            </div>

            {/* Next Date Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDateNavigation('next')}
              className="flex items-center space-x-2"
              disabled={isFuture()}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-3 mt-4">
            {!isEditing && entry && (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  <PenTool className="h-4 w-4 mr-2" />
                  Edit Entry
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => {
                    setEntryToDelete(entry);
                    setShowDeleteConfirm(true);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Entry
                </Button>
              </>
            )}
          </div>
        </Card>
      </motion.div>

      {isEditing ? (
        /* Editing Mode */
        <div className="space-y-6">
          {/* Emotion Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    How did you feel today?
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {EMOTIONS.map((emotion) => (
                    <motion.button
                      key={emotion.name}
                      onClick={() => handleFormChange('emotion', emotion.name)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.emotion === emotion.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-2xl mb-2">{emotion.emoji}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {emotion.name}
                      </div>
                    </motion.button>
                  ))}
                </div>
                
                {formData.emotion && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tell me more about your {formData.emotion.toLowerCase()} feelings...
                    </label>
                    <textarea
                      value={formData.emotionNote}
                      onChange={(e) => handleFormChange('emotionNote', e.target.value)}
                      placeholder={`What made you feel ${formData.emotion.toLowerCase()} today?`}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Wellness Check-in Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Daily Wellness Check-in
                    </h3>
                  </div>
                  {wellnessData && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>

                {wellnessData ? (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl mb-1">{getMoodIcon(wellnessData.mood).icon}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Mood</div>
                        <div className="font-semibold">{wellnessData.mood}/10</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">😰</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Stress</div>
                        <div className="font-semibold">{wellnessData.stress}/10</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Energy</div>
                        <div className="font-semibold">{wellnessData.energy}/10</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center mb-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {wellnessData.wellnessScore}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Wellness Score</div>
                      </div>
                    </div>

                    {wellnessData?.emotions?.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Today's emotions:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {wellnessData?.emotions?.map(emotionId => {
                            const emotion = WELLNESS_EMOTIONS.find(e => e.id === emotionId);
                            return emotion ? (
                              <span key={emotionId} className={`px-2 py-1 rounded-full text-xs font-medium ${emotion.color}`}>
                                {emotion.emoji} {emotion.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {wellnessData.notes && (
                      <div className="text-sm text-gray-700 dark:text-gray-300 italic">
                        "{wellnessData.notes}"
                      </div>
                    )}
                    
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setShowWellnessModal(true)}
                      className="w-full mt-3"
                    >
                      Update Check-in
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      How are you feeling today?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Take a moment to check in with your wellness
                    </p>
                    <Button 
                      variant="primary" 
                      onClick={() => setShowWellnessModal(true)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Start Wellness Check-in
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Writing Prompts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gratitude */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      What are you grateful for today?
                    </h3>
                  </div>
                  <textarea
                    value={formData.grateful}
                    onChange={(e) => handleFormChange('grateful', e.target.value)}
                    placeholder="List 3 things you're grateful for today, big or small..."
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>

            {/* Pride */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      What made you proud today?
                    </h3>
                  </div>
                  <textarea
                    value={formData.proud}
                    onChange={(e) => handleFormChange('proud', e.target.value)}
                    placeholder="What accomplishment, no matter how small, made you feel proud?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>

            {/* Favorite Moment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Smile className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Favorite moment of the day?
                    </h3>
                  </div>
                  <textarea
                    value={formData.favoritemoment}
                    onChange={(e) => handleFormChange('favoritemoment', e.target.value)}
                    placeholder="What moment today brought you the most joy or satisfaction?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>

            {/* Learning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      What did you learn today?
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <textarea
                      value={formData.mistake}
                      onChange={(e) => handleFormChange('mistake', e.target.value)}
                      placeholder="Any mistake or challenge you faced today?"
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                      rows={2}
                    />
                    <textarea
                      value={formData.improvement}
                      onChange={(e) => handleFormChange('improvement', e.target.value)}
                      placeholder="How will you improve or handle it differently next time?"
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* More/Less */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      More of this
                    </h3>
                  </div>
                  <textarea
                    value={formData.moreOf}
                    onChange={(e) => handleFormChange('moreOf', e.target.value)}
                    placeholder="What do you want more of in your life?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={3}
                  />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Less of this
                    </h3>
                  </div>
                  <textarea
                    value={formData.lessOf}
                    onChange={(e) => handleFormChange('lessOf', e.target.value)}
                    placeholder="What do you want less of in your life?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={3}
                  />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Affirmation & Additional Thoughts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Daily Affirmation
                    </h3>
                  </div>
                  <textarea
                    value={formData.affirmation}
                    onChange={(e) => handleFormChange('affirmation', e.target.value)}
                    placeholder="Write a positive affirmation for yourself..."
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={3}
                  />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <PenTool className="h-5 w-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Additional Thoughts
                    </h3>
                  </div>
                  <textarea
                    value={formData.additionalThoughts}
                    onChange={(e) => handleFormChange('additionalThoughts', e.target.value)}
                    placeholder="Any other thoughts, feelings, or reflections..."
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Save Button at Bottom */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="flex justify-center pt-6"
            >
              <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={saving || !isFormComplete()}
                className="px-8 py-3 text-lg"
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Saving...' : 'Save Entry'}
              </Button>
            </motion.div>
          )}
        </div>
      ) : (
        /* View Mode */
        entry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="space-y-6">
                {/* Mood Display */}
                {entry.emotion && (
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="text-3xl">
                      {EMOTIONS.find(e => e.name === entry.emotion)?.emoji || '😊'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Feeling {entry.emotion}
                      </div>
                      {entry.emotionNote && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.emotionNote}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Entry Content */}
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100 leading-relaxed">
                    {entry.content}
                  </pre>
                </div>

                {/* Completion Status */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Entry completed on {format(new Date(entry.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  {entry.updatedAt !== entry.createdAt && (
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      Last updated: {format(new Date(entry.updatedAt), 'MMM dd, HH:mm')}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )
      )}

      {/* Previous Entries Section */}
      {previousEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Previous Journal Entries</span>
              </h3>
              
              <div className="space-y-3">
                {previousEntries.map((entry) => {
                  const preview = getEntryPreview(entry);
                  const isExpanded = expandedEntries.has(entry.id);
                  
                  return (
                    <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-lg group">
                      {/* Collapsed Preview */}
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleEntryExpansion(entry.id)}
                          className="flex-1 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-lg">
                                {EMOTIONS.find(e => e.name === preview.mood)?.emoji || '📝'}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {preview.day}, {preview.date}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Mood: {preview.mood} • {preview.preview}
                                </div>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEntryToDelete(entry);
                            setShowDeleteConfirm(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 mr-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600"
                          title="Delete entry"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-gray-200 dark:border-gray-700"
                          >
                            <div className="p-4 prose dark:prose-invert prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100 leading-relaxed">
                                {entry.content}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
    
    {/* Wellness Check-in Modal */}
    {showWellnessModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Daily Wellness Check-in
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWellnessModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              {/* Mood Scale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  How is your mood today? ({wellnessForm.mood}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessForm.mood}
                  onChange={(e) => setWellnessForm({...wellnessForm, mood: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Stress Scale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  How is your stress level? ({wellnessForm.stress}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessForm.stress}
                  onChange={(e) => setWellnessForm({...wellnessForm, stress: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>

              {/* Energy Scale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  How is your energy level? ({wellnessForm.energy}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessForm.energy}
                  onChange={(e) => setWellnessForm({...wellnessForm, energy: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>

              {/* Emotions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  How are you feeling? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WELLNESS_EMOTIONS.map((emotion) => (
                    <button
                      key={emotion.id}
                      onClick={() => toggleEmotion(emotion.id)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        wellnessForm.emotions.includes(emotion.id)
                          ? `${emotion.color} border-current`
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <span className="mr-2">{emotion.emoji}</span>
                      {emotion.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Any additional notes? (Optional)
                </label>
                <textarea
                  value={wellnessForm.notes}
                  onChange={(e) => setWellnessForm({...wellnessForm, notes: e.target.value})}
                  placeholder="How are you feeling today? Any thoughts or reflections..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowWellnessModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleWellnessSubmit}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Check-in
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    )}

    {/* Delete Confirmation Dialog */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Delete Daily Entry
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this daily journal entry for {entryToDelete ? format(new Date(entryToDelete.date), 'MMMM dd, yyyy') : format(currentDate, 'MMMM dd, yyyy')}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEntryToDelete(null);
                }}
                className="flex-1"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Entry
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </>
  );
};

export default DailyJournal; 