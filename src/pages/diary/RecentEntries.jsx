import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  PenTool,
  ArrowLeft,
  Filter,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { getEntries } from '../../utils/diaryStorage';

const RecentEntries = () => {
  const [allEntries, setAllEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadAllEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [allEntries, searchTerm, filterType]);

  const loadAllEntries = () => {
    const dailyEntries = getEntries('daily').map(e => ({ ...e, type: 'daily' }));
    const weeklyEntries = getEntries('weekly').map(e => ({ ...e, type: 'weekly' }));
    const monthlyEntries = getEntries('monthly').map(e => ({ ...e, type: 'monthly' }));
    
    const combined = [...dailyEntries, ...weeklyEntries, ...monthlyEntries];
    
    // Sort by creation date (newer to older)
    const sorted = combined.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    
    setAllEntries(sorted);
  };

  const filterEntries = () => {
    let filtered = allEntries;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.emotion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEntries(filtered);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'daily': return PenTool;
      case 'weekly': return BookOpen;
      case 'monthly': return Calendar;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'daily': return 'from-emerald-500 to-green-500';
      case 'weekly': return 'from-green-500 to-teal-500';
      case 'monthly': return 'from-teal-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeRoute = (type) => {
    switch (type) {
      case 'daily': return '/diary/daily';
      case 'weekly': return '/diary/weekly';
      case 'monthly': return '/diary/monthly';
      default: return '/diary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card variant="glass" className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-gradient flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 animate-pulse" />
                All Journal Entries
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Your complete journaling history
              </p>
            </div>
            <Link to="/diary">
              <Button variant="secondary" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Filter & Search
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Types</option>
                <option value="daily">Daily Journal</option>
                <option value="weekly">Weekly Journal</option>
                <option value="monthly">Monthly Journal</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredEntries.length} of {allEntries.length} entries
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Entries List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="space-y-4">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry, index) => {
                const Icon = getTypeIcon(entry.type);
                
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={getTypeRoute(entry.type)}>
                      <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-700">
                        <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(entry.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg font-medium text-gray-900 dark:text-gray-100 capitalize">
                                {entry.type} Journal
                              </span>
                              {entry.emotion && (
                                <span className="text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                                  {entry.emotion}
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(entry.createdAt || entry.date), 'MMM dd, yyyy • HH:mm')}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                            {entry.content || 'No content available'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No entries found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start journaling to see your entries here!'
                  }
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RecentEntries; 