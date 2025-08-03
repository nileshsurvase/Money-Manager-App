import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Save, 
  Trophy,
  Lightbulb,
  TrendingUp,
  Heart,
  Target,
  ArrowRight,
  CheckCircle,
  Star,
  BarChart3,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
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

const MonthlyJournal = () => {
  const [entry, setEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [previousEntries, setPreviousEntries] = useState([]);
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    accomplishments: '',
    lessonsLearned: '',
    personalChanges: '',
    habitsEvolved: '',
    relationshipEvolution: '',
    nextMonthGoals: '',
    proudestMoments: '',
    focusAreas: '',
    additionalInsights: ''
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  useEffect(() => {
    loadEntryForDate();
    loadPreviousEntries();
  }, [currentDate]);

  const loadEntryForDate = () => {
    const monthEntry = getEntryForDate('monthly', currentDate);
    if (monthEntry) {
      setEntry(monthEntry);
      setFormData({
        accomplishments: monthEntry.accomplishments || '',
        lessonsLearned: monthEntry.lessonsLearned || '',
        personalChanges: monthEntry.personalChanges || '',
        habitsEvolved: monthEntry.habitsEvolved || '',
        relationshipEvolution: monthEntry.relationshipEvolution || '',
        nextMonthGoals: monthEntry.nextMonthGoals || '',
        proudestMoments: monthEntry.proudestMoments || '',
        focusAreas: monthEntry.focusAreas || '',
        additionalInsights: monthEntry.additionalInsights || ''
      });
      setIsEditing(false);
    } else {
      setEntry(null);
      setFormData({
        accomplishments: '',
        lessonsLearned: '',
        personalChanges: '',
        habitsEvolved: '',
        relationshipEvolution: '',
        nextMonthGoals: '',
        proudestMoments: '',
        focusAreas: '',
        additionalInsights: ''
      });
      setIsEditing(true);
    }
  };

  const loadPreviousEntries = () => {
    const prevEntries = getPreviousEntries('monthly', currentDate, 10);
    setPreviousEntries(prevEntries);
  };

  const handleDateNavigation = (direction) => {
    const newDate = getNavigationDate(currentDate, 'monthly', direction);
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
        const updatedEntry = updateEntry(entry.id, 'monthly', entryData);
        setEntry(updatedEntry);
      } else {
        const newEntry = createEntry('monthly', entryData);
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
      deleteEntry(targetEntry.id, 'monthly');
      
      // If deleting current entry, reset form and state
      if (!entryToDelete || entryToDelete.id === entry?.id) {
        setEntry(null);
        setIsEditing(true);
        // Reset form
        setFormData({
          accomplishments: '',
          lessonsLearned: '',
          personalChanges: '',
          habitsEvolved: '',
          relationshipEvolution: '',
          nextMonthGoals: '',
          proudestMoments: '',
          focusAreas: '',
          additionalInsights: ''
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
Monthly Reflection - ${format(monthStart, 'MMMM yyyy')}

🏆 Biggest Accomplishments: ${data.accomplishments}

📚 Lessons Learned: ${data.lessonsLearned}

🔄 Personal Changes: ${data.personalChanges}

🎯 Habits Evolution: ${data.habitsEvolved}

❤️ Relationship Evolution: ${data.relationshipEvolution}

🚀 Next Month Goals: ${data.nextMonthGoals}

⭐ Proudest Moments: ${data.proudestMoments}

🎯 Focus Areas for Improvement: ${data.focusAreas}

💭 Additional Insights: ${data.additionalInsights}
    `.trim();
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormComplete = () => {
    return formData.accomplishments && formData.lessonsLearned && formData.personalChanges;
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

  const isCurrentMonth = () => {
    const today = new Date();
    const currentMonthStart = startOfMonth(today);
    return monthStart.toDateString() === currentMonthStart.toDateString();
  };

  const isFutureMonth = () => {
    const today = new Date();
    const currentMonthStart = startOfMonth(today);
    return monthStart > currentMonthStart;
  };

  return (
    <div className="space-y-6">
      {/* Date Navigation Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card variant="glass" className="relative">
          <div className="flex items-center justify-between">
            {/* Previous Month Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDateNavigation('prev')}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Current Month */}
            <div className="text-center">
              <h1 className="text-gradient flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                <Calendar className="h-6 w-6 text-teal-500" />
                Monthly Journal
              </h1>
              <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 mt-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {format(monthStart, 'MMMM yyyy')}
                </span>
                {isCurrentMonth() && (
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                    This Month
                  </span>
                )}
              </div>
            </div>

            {/* Next Month Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDateNavigation('next')}
              className="flex items-center space-x-2"
              disabled={isFutureMonth()}
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
                  <Calendar className="h-4 w-4 mr-2" />
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
          {/* Accomplishments & Lessons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Biggest Accomplishments
                    </h3>
                  </div>
                  <textarea
                    value={formData.accomplishments}
                    onChange={(e) => handleFormChange('accomplishments', e.target.value)}
                    placeholder="What were your most significant achievements this month?"
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
                    <Lightbulb className="h-5 w-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Lessons Learned
                    </h3>
                  </div>
                  <textarea
                    value={formData.lessonsLearned}
                    onChange={(e) => handleFormChange('lessonsLearned', e.target.value)}
                    placeholder="What important lessons did you learn this month?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Changes & Habits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Personal Changes
                    </h3>
                  </div>
                  <textarea
                    value={formData.personalChanges}
                    onChange={(e) => handleFormChange('personalChanges', e.target.value)}
                    placeholder="How have you changed or evolved as a person this month?"
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
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Habits Evolution
                    </h3>
                  </div>
                  <textarea
                    value={formData.habitsEvolved}
                    onChange={(e) => handleFormChange('habitsEvolved', e.target.value)}
                    placeholder="What habits did you develop, improve, or break this month?"
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
                    <Heart className="h-5 w-5 text-pink-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Relationship Evolution
                    </h3>
                  </div>
                  <textarea
                    value={formData.relationshipEvolution}
                    onChange={(e) => handleFormChange('relationshipEvolution', e.target.value)}
                    placeholder="How have your relationships evolved this month?"
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
                    <ArrowRight className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Next Month Goals
                    </h3>
                  </div>
                  <textarea
                    value={formData.nextMonthGoals}
                    onChange={(e) => handleFormChange('nextMonthGoals', e.target.value)}
                    placeholder="What goals are you setting for next month?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Pride & Focus */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Proudest Moments
                    </h3>
                  </div>
                  <textarea
                    value={formData.proudestMoments}
                    onChange={(e) => handleFormChange('proudestMoments', e.target.value)}
                    placeholder="What moments from this month made you feel most proud?"
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
                    <Target className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Focus Areas for Improvement
                    </h3>
                  </div>
                  <textarea
                    value={formData.focusAreas}
                    onChange={(e) => handleFormChange('focusAreas', e.target.value)}
                    placeholder="What areas do you want to focus on improving next month?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Additional Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Additional Insights
                  </h3>
                </div>
                <textarea
                  value={formData.additionalInsights}
                  onChange={(e) => handleFormChange('additionalInsights', e.target.value)}
                  placeholder="Any other insights, thoughts, or reflections from this month..."
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
                      Monthly reflection completed on {format(new Date(entry.createdAt), 'MMM dd, yyyy')}
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
                <Calendar className="h-5 w-5 text-purple-500" />
                <span>Previous Monthly Reflections</span>
              </h3>
              
              <div className="space-y-3">
                {previousEntries.map((entry) => {
                  const preview = getEntryPreview(entry);
                  const isExpanded = expandedEntries.has(entry.id);
                  const entryMonthStart = startOfMonth(new Date(entry.date));
                  
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
                              <div className="text-lg">📅</div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {format(entryMonthStart, 'MMMM yyyy')}
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
                Delete Monthly Entry
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this monthly journal entry for {entryToDelete ? format(startOfMonth(new Date(entryToDelete.date)), 'MMMM yyyy') : format(monthStart, 'MMMM yyyy')}? This action cannot be undone.
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

export default MonthlyJournal; 