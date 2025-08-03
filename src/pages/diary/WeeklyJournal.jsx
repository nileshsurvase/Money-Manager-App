import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Save, 
  Calendar, 
  TrendingUp,
  Heart,
  Target,
  Users,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash
} from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  createEntry, 
  updateEntry, 
  deleteEntry,
  getEntryForDate,
  getNavigationDate,
  getPreviousEntries,
  getEntryPreview
} from '../../utils/diaryStorage';

const WeeklyJournal = () => {
  const [entry, setEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [previousEntries, setPreviousEntries] = useState([]);
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    biggestWin: '',
    biggestChallenge: '',
    personalGrowth: '',
    behaviorPatterns: '',
    relationships: '',
    goalsProgress: '',
    nextWeekDifferently: '',
    lookingForward: '',
    additionalReflections: ''
  });

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  useEffect(() => {
    loadEntryForDate();
    loadPreviousEntries();
  }, [currentDate]);

  const loadEntryForDate = () => {
    const weekEntry = getEntryForDate('weekly', currentDate);
    if (weekEntry) {
      setEntry(weekEntry);
      setFormData({
        biggestWin: weekEntry.biggestWin || '',
        biggestChallenge: weekEntry.biggestChallenge || '',
        personalGrowth: weekEntry.personalGrowth || '',
        behaviorPatterns: weekEntry.behaviorPatterns || '',
        relationships: weekEntry.relationships || '',
        goalsProgress: weekEntry.goalsProgress || '',
        nextWeekDifferently: weekEntry.nextWeekDifferently || '',
        lookingForward: weekEntry.lookingForward || '',
        additionalReflections: weekEntry.additionalReflections || ''
      });
      setIsEditing(false);
    } else {
      setEntry(null);
      setFormData({
        biggestWin: '',
        biggestChallenge: '',
        personalGrowth: '',
        behaviorPatterns: '',
        relationships: '',
        goalsProgress: '',
        nextWeekDifferently: '',
        lookingForward: '',
        additionalReflections: ''
      });
      setIsEditing(true);
    }
  };

  const loadPreviousEntries = () => {
    const prevEntries = getPreviousEntries('weekly', currentDate, 10);
    setPreviousEntries(prevEntries);
  };

  const handleDateNavigation = (direction) => {
    const newDate = getNavigationDate(currentDate, 'weekly', direction);
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
        const updatedEntry = updateEntry(entry.id, 'weekly', entryData);
        setEntry(updatedEntry);
      } else {
        const newEntry = createEntry('weekly', entryData);
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
      deleteEntry(targetEntry.id, 'weekly');
      
      // If deleting current entry, reset form and state
      if (!entryToDelete || entryToDelete.id === entry?.id) {
        setEntry(null);
        setIsEditing(true);
        // Reset form
        setFormData({
          biggestWin: '',
          biggestChallenge: '',
          personalGrowth: '',
          behaviorPatterns: '',
          relationships: '',
          goalsProgress: '',
          nextWeekDifferently: '',
          lookingForward: '',
          additionalReflections: ''
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
Weekly Reflection - ${format(weekStart, 'MMM dd')} to ${format(weekEnd, 'MMM dd, yyyy')}

🏆 Biggest Win: ${data.biggestWin}

💪 Biggest Challenge: ${data.biggestChallenge}

🌱 Personal Growth: ${data.personalGrowth}

🔄 Behavior Patterns: ${data.behaviorPatterns}

❤️ Relationships: ${data.relationships}

🎯 Goals Progress: ${data.goalsProgress}

🔄 Next Week Differently: ${data.nextWeekDifferently}

🌟 Looking Forward: ${data.lookingForward}

💭 Additional Reflections: ${data.additionalReflections}
    `.trim();
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormComplete = () => {
    return formData.biggestWin && formData.biggestChallenge && formData.personalGrowth;
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

  const isCurrentWeek = () => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today);
    return weekStart.toDateString() === currentWeekStart.toDateString();
  };

  const isFutureWeek = () => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today);
    return weekStart > currentWeekStart;
  };

  return (
    <div className="space-y-6">
      {/* Date Navigation Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card variant="glass" className="relative">
          <div className="flex items-center justify-between">
            {/* Previous Week Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDateNavigation('prev')}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Current Week */}
            <div className="text-center">
              <h1 className="text-gradient flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 bg-clip-text text-transparent">
                <BookOpen className="h-6 w-6 text-green-500" />
                Weekly Journal
              </h1>
              <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 mt-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                </span>
                {isCurrentWeek() && (
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                    This Week
                  </span>
                )}
              </div>
            </div>

            {/* Next Week Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDateNavigation('next')}
              className="flex items-center space-x-2"
              disabled={isFutureWeek()}
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
                  <BookOpen className="h-4 w-4 mr-2" />
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
          {/* Top Row - Win & Challenge */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Biggest Win This Week
                    </h3>
                  </div>
                  <textarea
                    value={formData.biggestWin}
                    onChange={(e) => handleFormChange('biggestWin', e.target.value)}
                    placeholder="What accomplishment or positive experience stood out this week?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Biggest Challenge This Week
                    </h3>
                  </div>
                  <textarea
                    value={formData.biggestChallenge}
                    onChange={(e) => handleFormChange('biggestChallenge', e.target.value)}
                    placeholder="What was the most difficult or demanding situation you faced?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Personal Growth & Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Personal Growth
                    </h3>
                  </div>
                  <textarea
                    value={formData.personalGrowth}
                    onChange={(e) => handleFormChange('personalGrowth', e.target.value)}
                    placeholder="How did you grow or learn about yourself this week?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Behavior Patterns
                    </h3>
                  </div>
                  <textarea
                    value={formData.behaviorPatterns}
                    onChange={(e) => handleFormChange('behaviorPatterns', e.target.value)}
                    placeholder="What patterns did you notice in your thoughts, emotions, or actions?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Relationships & Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Relationships
                    </h3>
                  </div>
                  <textarea
                    value={formData.relationships}
                    onChange={(e) => handleFormChange('relationships', e.target.value)}
                    placeholder="How were your relationships this week? Any meaningful connections or challenges?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Goals Progress
                    </h3>
                  </div>
                  <textarea
                    value={formData.goalsProgress}
                    onChange={(e) => handleFormChange('goalsProgress', e.target.value)}
                    placeholder="What progress did you make on your goals this week?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Future Planning */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Next Week Differently
                    </h3>
                  </div>
                  <textarea
                    value={formData.nextWeekDifferently}
                    onChange={(e) => handleFormChange('nextWeekDifferently', e.target.value)}
                    placeholder="What would you do differently if you could repeat this week?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>

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
                      Looking Forward
                    </h3>
                  </div>
                  <textarea
                    value={formData.lookingForward}
                    onChange={(e) => handleFormChange('lookingForward', e.target.value)}
                    placeholder="What are you most excited about or looking forward to next week?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Additional Reflections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-teal-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Additional Reflections
                  </h3>
                </div>
                <textarea
                  value={formData.additionalReflections}
                  onChange={(e) => handleFormChange('additionalReflections', e.target.value)}
                  placeholder="Any other thoughts, insights, or reflections from this week..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                  rows={5}
                />
              </div>
            </Card>
          </motion.div>

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
                      Weekly reflection completed on {format(new Date(entry.createdAt), 'MMM dd, yyyy')}
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
                <Calendar className="h-5 w-5 text-green-500" />
                <span>Previous Weekly Reflections</span>
              </h3>
              
              <div className="space-y-3">
                {previousEntries.map((entry) => {
                  const preview = getEntryPreview(entry);
                  const isExpanded = expandedEntries.has(entry.id);
                  const entryWeekStart = startOfWeek(new Date(entry.date));
                  const entryWeekEnd = endOfWeek(new Date(entry.date));
                  
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
                              <div className="text-lg">📓</div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  Week of {format(entryWeekStart, 'MMM dd')} - {format(entryWeekEnd, 'MMM dd, yyyy')}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {preview.preview}
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
                Delete Weekly Entry
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this weekly journal entry for the week of {entryToDelete ? format(startOfWeek(new Date(entryToDelete.date)), 'MMM dd') + ' - ' + format(endOfWeek(new Date(entryToDelete.date)), 'MMM dd, yyyy') : format(weekStart, 'MMM dd') + ' - ' + format(weekEnd, 'MMM dd, yyyy')}? This action cannot be undone.
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
    </div>
  );
};

export default WeeklyJournal; 