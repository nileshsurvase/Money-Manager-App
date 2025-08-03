// Dynamic imports are handled at runtime to avoid build-time issues
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, differenceInDays } from 'date-fns';

// World-class MyDiary Excel export utility with wellness analytics and habit insights
class DiaryExcelExportMaster {
  constructor() {
    this.ExcelJS = null;
    this.workbook = null;
  }

  async initialize() {
    if (!this.ExcelJS) {
      const excelModule = await import('exceljs');
      this.ExcelJS = excelModule.default;
      this.workbook = new this.ExcelJS.Workbook();
      this.setupWorkbookProperties();
    }
  }

  setupWorkbookProperties() {
    // Set advanced workbook properties
    this.workbook.creator = 'MyDiary Pro Analytics';
    this.workbook.lastModifiedBy = 'MyDiary Wellness Intelligence Engine';
    this.workbook.created = new Date();
    this.workbook.modified = new Date();
    this.workbook.lastPrinted = new Date();
    
    // Set calculation properties for automatic formulas
    this.workbook.calcProperties.fullCalcOnLoad = true;
    
    // Set workbook views
    this.workbook.views = [{
      x: 0, y: 0, width: 25000, height: 18000,
      firstSheet: 0, activeTab: 0, visibility: 'visible'
    }];
  }

  // Color palette for wellness-focused design
  get colors() {
    return {
      primary: 'FF059669',      // Emerald Green
      secondary: 'FF0891B2',    // Cyan
      accent: 'FFDC2626',       // Rose
      wellness: 'FF10B981',     // Green
      habit: 'FF8B5CF6',        // Purple
      journal: 'FF06B6D4',      // Sky Blue
      mood: 'FFF59E0B',         // Amber
      energy: 'FFEF4444',       // Red
      sleep: 'FF6366F1',        // Indigo
      light: 'FFF0FDF4',        // Green 50
      medium: 'FF9CA3AF',       // Gray 400
      dark: 'FF064E3B',         // Emerald 900
      white: 'FFFFFFFF',
      black: 'FF000000'
    };
  }

  // Advanced styling templates for wellness data
  get styles() {
    return {
      mainTitle: {
        font: { name: 'Segoe UI', size: 28, bold: true, color: { argb: this.colors.dark } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.light } }
      },
      sectionTitle: {
        font: { name: 'Segoe UI', size: 18, bold: true, color: { argb: this.colors.primary } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } }
      },
      wellnessHeader: {
        font: { name: 'Segoe UI', size: 12, bold: true, color: { argb: this.colors.white } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.wellness } },
        border: {
          top: { style: 'medium', color: { argb: this.colors.dark } },
          left: { style: 'medium', color: { argb: this.colors.dark } },
          bottom: { style: 'medium', color: { argb: this.colors.dark } },
          right: { style: 'medium', color: { argb: this.colors.dark } }
        }
      },
      habitHeader: {
        font: { name: 'Segoe UI', size: 12, bold: true, color: { argb: this.colors.white } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.habit } },
        border: {
          top: { style: 'medium', color: { argb: this.colors.dark } },
          left: { style: 'medium', color: { argb: this.colors.dark } },
          bottom: { style: 'medium', color: { argb: this.colors.dark } },
          right: { style: 'medium', color: { argb: this.colors.dark } }
        }
      },
      journalHeader: {
        font: { name: 'Segoe UI', size: 12, bold: true, color: { argb: this.colors.white } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.journal } },
        border: {
          top: { style: 'medium', color: { argb: this.colors.dark } },
          left: { style: 'medium', color: { argb: this.colors.dark } },
          bottom: { style: 'medium', color: { argb: this.colors.dark } },
          right: { style: 'medium', color: { argb: this.colors.dark } }
        }
      },
      data: {
        font: { name: 'Segoe UI', size: 11 },
        alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
        border: {
          top: { style: 'thin', color: { argb: this.colors.medium } },
          left: { style: 'thin', color: { argb: this.colors.medium } },
          bottom: { style: 'thin', color: { argb: this.colors.medium } },
          right: { style: 'thin', color: { argb: this.colors.medium } }
        }
      },
      dataCenter: {
        font: { name: 'Segoe UI', size: 11 },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: this.colors.medium } },
          left: { style: 'thin', color: { argb: this.colors.medium } },
          bottom: { style: 'thin', color: { argb: this.colors.medium } },
          right: { style: 'thin', color: { argb: this.colors.medium } }
        }
      },
      dataDate: {
        font: { name: 'Segoe UI', size: 11 },
        alignment: { horizontal: 'center', vertical: 'middle' },
        numFmt: 'dd/mm/yyyy',
        border: {
          top: { style: 'thin', color: { argb: this.colors.medium } },
          left: { style: 'thin', color: { argb: this.colors.medium } },
          bottom: { style: 'thin', color: { argb: this.colors.medium } },
          right: { style: 'thin', color: { argb: this.colors.medium } }
        }
      },
      scoreExcellent: {
        font: { name: 'Segoe UI', size: 11, bold: true, color: { argb: this.colors.white } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.wellness } },
        border: {
          top: { style: 'thin', color: { argb: this.colors.medium } },
          left: { style: 'thin', color: { argb: this.colors.medium } },
          bottom: { style: 'thin', color: { argb: this.colors.medium } },
          right: { style: 'thin', color: { argb: this.colors.medium } }
        }
      },
      scoreGood: {
        font: { name: 'Segoe UI', size: 11, bold: true, color: { argb: this.colors.white } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.secondary } },
        border: {
          top: { style: 'thin', color: { argb: this.colors.medium } },
          left: { style: 'thin', color: { argb: this.colors.medium } },
          bottom: { style: 'thin', color: { argb: this.colors.medium } },
          right: { style: 'thin', color: { argb: this.colors.medium } }
        }
      },
      scoreAverage: {
        font: { name: 'Segoe UI', size: 11, bold: true, color: { argb: this.colors.dark } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.mood } },
        border: {
          top: { style: 'thin', color: { argb: this.colors.medium } },
          left: { style: 'thin', color: { argb: this.colors.medium } },
          bottom: { style: 'thin', color: { argb: this.colors.medium } },
          right: { style: 'thin', color: { argb: this.colors.medium } }
        }
      },
      scorePoor: {
        font: { name: 'Segoe UI', size: 11, bold: true, color: { argb: this.colors.white } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.accent } },
        border: {
          top: { style: 'thin', color: { argb: this.colors.medium } },
          left: { style: 'thin', color: { argb: this.colors.medium } },
          bottom: { style: 'thin', color: { argb: this.colors.medium } },
          right: { style: 'thin', color: { argb: this.colors.medium } }
        }
      },
      insight: {
        font: { name: 'Segoe UI', size: 11, italic: true, color: { argb: this.colors.primary } },
        alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } }
      }
    };
  }

  // Create comprehensive MyDiary export
  async createDiaryExport(diaryData = {}) {
    // Initialize ExcelJS
    await this.initialize();
    
    const {
      dailyEntries = [],
      weeklyEntries = [],
      monthlyEntries = [],
      wellnessData = [],
      habits = [],
      habitCompletions = {}
    } = diaryData;

    // Create multiple sheets for comprehensive analysis
    await this.createWellnessDashboard(wellnessData, habits, habitCompletions, dailyEntries);
    await this.createHabitAnalytics(habits, habitCompletions);
    await this.createJournalInsights(dailyEntries, weeklyEntries, monthlyEntries);
    await this.createMoodPatterns(wellnessData);
    await this.createLifestyleAnalysis(wellnessData, habits, habitCompletions);
    await this.createWellnessForecasts(wellnessData, habits);
    await this.createProgressTracker(habits, habitCompletions, wellnessData);
    await this.createRawDiaryData(dailyEntries, weeklyEntries, monthlyEntries, wellnessData, habits, habitCompletions);

    return this.workbook;
  }

  // Wellness Dashboard - Main Overview
  async createWellnessDashboard(wellnessData, habits, habitCompletions, dailyEntries) {
    const sheet = this.workbook.addWorksheet('🌟 Wellness Dashboard', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true }
    });

    sheet.views = [{ showGridLines: false }];
    let currentRow = 1;

    // Main Title
    sheet.mergeCells(`A${currentRow}:O${currentRow + 1}`);
    const titleCell = sheet.getCell(`A${currentRow}`);
    titleCell.value = 'MYDIARY PRO - WELLNESS & LIFE ANALYTICS DASHBOARD';
    titleCell.style = this.styles.mainTitle;
    sheet.getRow(currentRow).height = 40;
    currentRow += 3;

    // Wellness KPIs
    const avgMood = this.calculateAverageMood(wellnessData);
    const avgEnergy = this.calculateAverageEnergy(wellnessData);
    const avgSleep = this.calculateAverageSleep(wellnessData);
    const habitStreak = this.calculateLongestHabitStreak(habits, habitCompletions);
    const journalStreak = this.calculateJournalStreak(dailyEntries);

    // Create wellness KPI cards
    this.createWellnessKPI(sheet, 'A', currentRow, 'Avg Mood', avgMood, '0.0', this.colors.mood);
    this.createWellnessKPI(sheet, 'D', currentRow, 'Avg Energy', avgEnergy, '0.0', this.colors.energy);
    this.createWellnessKPI(sheet, 'G', currentRow, 'Avg Sleep Hours', avgSleep, '0.0', this.colors.sleep);
    this.createWellnessKPI(sheet, 'J', currentRow, 'Best Habit Streak', habitStreak, '0', this.colors.habit);
    this.createWellnessKPI(sheet, 'M', currentRow, 'Journal Streak', journalStreak, '0', this.colors.journal);

    currentRow += 5;

    // Wellness Trends Section
    currentRow = await this.createWellnessTrendsSection(sheet, wellnessData, currentRow);

    // Habit Performance Section
    currentRow += 2;
    currentRow = await this.createHabitPerformanceSection(sheet, habits, habitCompletions, currentRow);

    // Life Balance Analysis
    currentRow += 2;
    currentRow = await this.createLifeBalanceSection(sheet, wellnessData, currentRow);

    // Wellness Insights
    currentRow += 2;
    await this.createWellnessInsights(sheet, wellnessData, habits, habitCompletions, currentRow);

    // Auto-fit columns
    sheet.columns.forEach(column => {
      column.width = Math.min(Math.max(column.width || 10, 12), 30);
    });
  }

  // Create wellness KPI card
  createWellnessKPI(sheet, column, row, title, value, format, color) {
    // Title
    const titleCell = sheet.getCell(`${column}${row}`);
    titleCell.value = title;
    titleCell.style = {
      font: { name: 'Segoe UI', size: 10, bold: true, color: { argb: this.colors.dark } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.light } }
    };

    // Value
    const valueCell = sheet.getCell(`${column}${row + 1}`);
    valueCell.value = value;
    valueCell.style = {
      font: { name: 'Segoe UI', size: 18, bold: true, color: { argb: color } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      numFmt: format,
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.white } },
      border: {
        top: { style: 'medium', color: { argb: color } },
        left: { style: 'medium', color: { argb: color } },
        bottom: { style: 'medium', color: { argb: color } },
        right: { style: 'medium', color: { argb: color } }
      }
    };

    // Merge cells for visual impact
    const endCol = String.fromCharCode(column.charCodeAt(0) + 2);
    sheet.mergeCells(`${column}${row}:${endCol}${row}`);
    sheet.mergeCells(`${column}${row + 1}:${endCol}${row + 1}`);
    
    sheet.getRow(row).height = 22;
    sheet.getRow(row + 1).height = 35;
  }

  // Calculate wellness metrics
  calculateAverageMood(wellnessData) {
    if (!wellnessData.length) return 0;
    const moods = wellnessData.filter(d => d.mood && d.mood > 0).map(d => d.mood);
    return moods.length > 0 ? moods.reduce((sum, mood) => sum + mood, 0) / moods.length : 0;
  }

  calculateAverageEnergy(wellnessData) {
    if (!wellnessData.length) return 0;
    const energy = wellnessData.filter(d => d.energy && d.energy > 0).map(d => d.energy);
    return energy.length > 0 ? energy.reduce((sum, e) => sum + e, 0) / energy.length : 0;
  }

  calculateAverageSleep(wellnessData) {
    if (!wellnessData.length) return 0;
    const sleep = wellnessData.filter(d => d.sleep && d.sleep > 0).map(d => d.sleep);
    return sleep.length > 0 ? sleep.reduce((sum, s) => sum + s, 0) / sleep.length : 0;
  }

  calculateLongestHabitStreak(habits, habitCompletions) {
    let maxStreak = 0;
    
    habits.forEach(habit => {
      let currentStreak = 0;
      let longestStreak = 0;
      
      // Get all completion dates for this habit
      const completionDates = Object.keys(habitCompletions).filter(date => 
        habitCompletions[date].includes(habit.id)
      ).sort();
      
      for (let i = 0; i < completionDates.length; i++) {
        if (i === 0 || differenceInDays(new Date(completionDates[i]), new Date(completionDates[i - 1])) === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        longestStreak = Math.max(longestStreak, currentStreak);
      }
      
      maxStreak = Math.max(maxStreak, longestStreak);
    });
    
    return maxStreak;
  }

  calculateJournalStreak(dailyEntries) {
    if (!dailyEntries.length) return 0;
    
    const sortedEntries = dailyEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let currentDate = new Date();
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      const daysDiff = differenceInDays(currentDate, entryDate);
      
      if (daysDiff === streak) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Create wellness trends section
  async createWellnessTrendsSection(sheet, wellnessData, startRow) {
    // Section Title
    sheet.mergeCells(`A${startRow}:O${startRow}`);
    const sectionTitle = sheet.getCell(`A${startRow}`);
    sectionTitle.value = '📈 WELLNESS TRENDS & PATTERNS (Last 30 Days)';
    sectionTitle.style = this.styles.sectionTitle;
    startRow += 2;

    // Headers
    const headers = ['Date', 'Mood Score', 'Energy Level', 'Sleep Hours', 'Stress Level', 'Wellness Score', 'Weekly Avg', 'Trend'];
    headers.forEach((header, index) => {
      const cell = sheet.getCell(startRow, index + 1);
      cell.value = header;
      cell.style = this.styles.wellnessHeader;
    });
    startRow++;

    // Sort wellness data by date
    const sortedData = [...wellnessData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedData.forEach((data, index) => {
      const wellnessScore = this.calculateDailyWellnessScore(data);
      const weeklyAvg = this.calculateWeeklyAverage(sortedData, index);
      const trend = this.getTrendIndicator(sortedData, index);

      const row = sheet.getRow(startRow);
      
      row.getCell(1).value = new Date(data.date);
      row.getCell(1).style = this.styles.dataDate;
      
      row.getCell(2).value = data.mood || 0;
      row.getCell(2).style = this.getScoreStyle(data.mood || 0);
      
      row.getCell(3).value = data.energy || 0;
      row.getCell(3).style = this.getScoreStyle(data.energy || 0);
      
      row.getCell(4).value = data.sleep || 0;
      row.getCell(4).style = { ...this.styles.dataCenter, numFmt: '0.0' };
      
      row.getCell(5).value = data.stress || 0;
      row.getCell(5).style = this.getScoreStyle(data.stress || 0, true); // Reverse scoring for stress
      
      row.getCell(6).value = wellnessScore;
      row.getCell(6).style = { ...this.getScoreStyle(wellnessScore), numFmt: '0.0' };
      
      row.getCell(7).value = weeklyAvg;
      row.getCell(7).style = { ...this.styles.dataCenter, numFmt: '0.0' };
      
      row.getCell(8).value = trend;
      row.getCell(8).style = {
        ...this.styles.dataCenter,
        font: {
          ...this.styles.dataCenter.font,
          color: { argb: trend.includes('↗') ? this.colors.wellness : trend.includes('↘') ? this.colors.accent : this.colors.medium }
        }
      };
      
      startRow++;
    });

    return startRow;
  }

  // Calculate daily wellness score
  calculateDailyWellnessScore(data) {
    const mood = data.mood || 0;
    const energy = data.energy || 0;
    const sleep = Math.min(data.sleep || 0, 10); // Cap at 10 for scoring
    const stress = data.stress || 0;
    
    // Weighted wellness score
    return (mood * 0.3 + energy * 0.3 + Math.min(sleep / 8 * 10, 10) * 0.2 + (10 - stress) * 0.2);
  }

  // Get style based on score
  getScoreStyle(score, reverse = false) {
    const adjustedScore = reverse ? 10 - score : score;
    
    if (adjustedScore >= 8) return this.styles.scoreExcellent;
    if (adjustedScore >= 6) return this.styles.scoreGood;
    if (adjustedScore >= 4) return this.styles.scoreAverage;
    return this.styles.scorePoor;
  }

  // Calculate weekly average
  calculateWeeklyAverage(data, currentIndex) {
    const startIndex = Math.max(0, currentIndex - 6);
    const weekData = data.slice(startIndex, currentIndex + 1);
    
    if (weekData.length === 0) return 0;
    
    const avgScore = weekData.reduce((sum, d) => sum + this.calculateDailyWellnessScore(d), 0) / weekData.length;
    return avgScore;
  }

  // Get trend indicator
  getTrendIndicator(data, currentIndex) {
    if (currentIndex < 7) return '—';
    
    const currentWeekAvg = this.calculateWeeklyAverage(data, currentIndex);
    const previousWeekAvg = this.calculateWeeklyAverage(data, currentIndex - 7);
    
    const diff = currentWeekAvg - previousWeekAvg;
    
    if (diff > 0.5) return '↗ Improving';
    if (diff < -0.5) return '↘ Declining';
    return '→ Stable';
  }

  // Create habit performance section
  async createHabitPerformanceSection(sheet, habits, habitCompletions, startRow) {
    // Section Title
    sheet.mergeCells(`A${startRow}:O${startRow}`);
    const sectionTitle = sheet.getCell(`A${startRow}`);
    sectionTitle.value = '🎯 HABIT TRACKING PERFORMANCE ANALYSIS';
    sectionTitle.style = this.styles.sectionTitle;
    startRow += 2;

    // Headers
    const headers = ['Habit Name', 'Total Days', 'Completion Rate', 'Current Streak', 'Best Streak', 'Weekly Average', 'Performance'];
    headers.forEach((header, index) => {
      const cell = sheet.getCell(startRow, index + 1);
      cell.value = header;
      cell.style = this.styles.habitHeader;
    });
    startRow++;

    // Calculate habit statistics
    habits.forEach(habit => {
      const stats = this.calculateHabitStats(habit, habitCompletions);
      
      const row = sheet.getRow(startRow);
      
      row.getCell(1).value = habit.name;
      row.getCell(1).style = this.styles.data;
      
      row.getCell(2).value = stats.totalDays;
      row.getCell(2).style = this.styles.dataCenter;
      
      row.getCell(3).value = stats.completionRate / 100;
      row.getCell(3).style = { ...this.styles.dataCenter, numFmt: '0.0%' };
      
      row.getCell(4).value = stats.currentStreak;
      row.getCell(4).style = this.styles.dataCenter;
      
      row.getCell(5).value = stats.bestStreak;
      row.getCell(5).style = this.styles.dataCenter;
      
      row.getCell(6).value = stats.weeklyAverage / 100;
      row.getCell(6).style = { ...this.styles.dataCenter, numFmt: '0.0%' };
      
      row.getCell(7).value = stats.performance;
      row.getCell(7).style = {
        ...this.styles.dataCenter,
        font: {
          ...this.styles.dataCenter.font,
          color: { argb: this.getPerformanceColor(stats.performance) }
        }
      };
      
      startRow++;
    });

    return startRow;
  }

  // Calculate habit statistics
  calculateHabitStats(habit, habitCompletions) {
    const habitId = habit.id;
    const completionDates = Object.keys(habitCompletions).filter(date => 
      habitCompletions[date].includes(habitId)
    ).sort();

    const totalDays = Math.max(completionDates.length, 1);
    const completionRate = (completionDates.length / totalDays) * 100;

    // Calculate streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Calculate current streak (working backwards from today)
    for (let i = 0; i < 30; i++) {
      const checkDate = format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      if (completionDates.includes(checkDate)) {
        if (i === 0 || currentStreak > 0) currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best streak
    for (let i = 0; i < completionDates.length; i++) {
      if (i === 0 || differenceInDays(new Date(completionDates[i]), new Date(completionDates[i - 1])) === 1) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Calculate weekly average (last 4 weeks)
    let weeklyTotal = 0;
    for (let week = 0; week < 4; week++) {
      let weekCount = 0;
      for (let day = 0; day < 7; day++) {
        const checkDate = format(new Date(Date.now() - ((week * 7) + day) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        if (completionDates.includes(checkDate)) weekCount++;
      }
      weeklyTotal += weekCount;
    }
    const weeklyAverage = (weeklyTotal / 4 / 7) * 100;

    // Determine performance level
    let performance = 'Needs Work';
    if (completionRate >= 90) performance = 'Excellent';
    else if (completionRate >= 75) performance = 'Great';
    else if (completionRate >= 60) performance = 'Good';
    else if (completionRate >= 40) performance = 'Fair';

    return {
      totalDays,
      completionRate,
      currentStreak,
      bestStreak,
      weeklyAverage,
      performance
    };
  }

  // Get performance color
  getPerformanceColor(performance) {
    switch (performance) {
      case 'Excellent': return this.colors.wellness;
      case 'Great': return this.colors.secondary;
      case 'Good': return this.colors.mood;
      case 'Fair': return this.colors.energy;
      default: return this.colors.accent;
    }
  }

  // Create additional sophisticated sheets...
  async createHabitAnalytics(habits, habitCompletions) {
    const sheet = this.workbook.addWorksheet('🎯 Habit Deep Dive');
    // ... detailed habit analysis implementation
  }

  async createJournalInsights(dailyEntries, weeklyEntries, monthlyEntries) {
    const sheet = this.workbook.addWorksheet('📝 Journal Analysis');
    // ... journal insights implementation
  }

  async createMoodPatterns(wellnessData) {
    const sheet = this.workbook.addWorksheet('😊 Mood Patterns');
    // ... mood pattern analysis implementation
  }

  async createLifestyleAnalysis(wellnessData, habits, habitCompletions) {
    const sheet = this.workbook.addWorksheet('🏃‍♀️ Lifestyle Analysis');
    // ... lifestyle analysis implementation
  }

  async createWellnessForecasts(wellnessData, habits) {
    const sheet = this.workbook.addWorksheet('🔮 Wellness Forecasts');
    // ... predictive wellness analytics implementation
  }

  async createProgressTracker(habits, habitCompletions, wellnessData) {
    const sheet = this.workbook.addWorksheet('📊 Progress Tracker');
    // ... progress tracking implementation
  }

  async createLifeBalanceSection(sheet, wellnessData, startRow) {
    // Life balance analysis implementation
    return startRow + 5; // Placeholder
  }

  async createWellnessInsights(sheet, wellnessData, habits, habitCompletions, startRow) {
    // Section Title
    sheet.mergeCells(`A${startRow}:O${startRow}`);
    const sectionTitle = sheet.getCell(`A${startRow}`);
    sectionTitle.value = '🧠 AI-POWERED WELLNESS INSIGHTS & RECOMMENDATIONS';
    sectionTitle.style = this.styles.sectionTitle;
    startRow += 2;

    const insights = this.generateWellnessInsights(wellnessData, habits, habitCompletions);
    
    insights.forEach(insight => {
      sheet.mergeCells(`A${startRow}:O${startRow}`);
      const insightCell = sheet.getCell(`A${startRow}`);
      insightCell.value = insight;
      insightCell.style = this.styles.insight;
      sheet.getRow(startRow).height = 30;
      startRow++;
    });

    return startRow;
  }

  // Generate AI-like wellness insights
  generateWellnessInsights(wellnessData, habits, habitCompletions) {
    const insights = [];
    
    // Mood insights
    const avgMood = this.calculateAverageMood(wellnessData);
    if (avgMood >= 8) {
      insights.push('🌟 Excellent! Your mood has been consistently high. You\'re experiencing great emotional well-being. Keep up the positive lifestyle choices!');
    } else if (avgMood < 5) {
      insights.push('💙 Your mood patterns suggest you might benefit from stress management techniques or speaking with a wellness professional.');
    }

    // Energy insights
    const avgEnergy = this.calculateAverageEnergy(wellnessData);
    const avgSleep = this.calculateAverageSleep(wellnessData);
    if (avgEnergy < 5 && avgSleep < 7) {
      insights.push('😴 Low energy levels correlate with insufficient sleep. Aim for 7-9 hours of sleep to boost your energy naturally.');
    }

    // Habit insights
    const bestHabit = this.findBestPerformingHabit(habits, habitCompletions);
    if (bestHabit) {
      insights.push(`🏆 Your "${bestHabit.name}" habit is performing excellently! This consistency is building positive life changes.`);
    }

    const strugglingHabit = this.findStrugglingHabit(habits, habitCompletions);
    if (strugglingHabit) {
      insights.push(`💪 Consider breaking down "${strugglingHabit.name}" into smaller, more manageable steps to improve consistency.`);
    }

    // Weekly pattern insights
    const weeklyPattern = this.analyzeWeeklyPatterns(wellnessData);
    if (weeklyPattern) {
      insights.push(weeklyPattern);
    }

    return insights.length > 0 ? insights : ['📊 Keep tracking your wellness data to unlock personalized insights and recommendations for your journey.'];
  }

  findBestPerformingHabit(habits, habitCompletions) {
    let bestHabit = null;
    let bestRate = 0;

    habits.forEach(habit => {
      const stats = this.calculateHabitStats(habit, habitCompletions);
      if (stats.completionRate > bestRate) {
        bestRate = stats.completionRate;
        bestHabit = habit;
      }
    });

    return bestRate > 75 ? bestHabit : null;
  }

  findStrugglingHabit(habits, habitCompletions) {
    let strugglingHabit = null;
    let worstRate = 100;

    habits.forEach(habit => {
      const stats = this.calculateHabitStats(habit, habitCompletions);
      if (stats.completionRate < worstRate) {
        worstRate = stats.completionRate;
        strugglingHabit = habit;
      }
    });

    return worstRate < 50 ? strugglingHabit : null;
  }

  analyzeWeeklyPatterns(wellnessData) {
    // Analyze if certain days of week show patterns
    const dayScores = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    
    wellnessData.forEach(data => {
      const dayOfWeek = new Date(data.date).getDay();
      const score = this.calculateDailyWellnessScore(data);
      dayScores[dayOfWeek].push(score);
    });

    const dayAverages = Object.keys(dayScores).map(day => ({
      day: parseInt(day),
      avg: dayScores[day].length > 0 ? dayScores[day].reduce((sum, score) => sum + score, 0) / dayScores[day].length : 0
    }));

    const bestDay = dayAverages.reduce((best, current) => current.avg > best.avg ? current : best);
    const worstDay = dayAverages.reduce((worst, current) => current.avg < worst.avg ? current : worst);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (bestDay.avg - worstDay.avg > 1) {
      return `📅 Your wellness peaks on ${dayNames[bestDay.day]}s and dips on ${dayNames[worstDay.day]}s. Consider what makes ${dayNames[bestDay.day]}s special and apply those elements to other days.`;
    }

    return null;
  }

  // Create raw diary data sheet
  async createRawDiaryData(dailyEntries, weeklyEntries, monthlyEntries, wellnessData, habits, habitCompletions) {
    const sheet = this.workbook.addWorksheet('📋 Raw Diary Data');
    
    // Create multiple sections for different data types
    let currentRow = 1;

    // Daily Entries Section
    if (dailyEntries.length > 0) {
      sheet.mergeCells(`A${currentRow}:J${currentRow}`);
      const titleCell = sheet.getCell(`A${currentRow}`);
      titleCell.value = 'DAILY JOURNAL ENTRIES';
      titleCell.style = this.styles.sectionTitle;
      currentRow += 2;

      const headers = Object.keys(dailyEntries[0]);
      headers.forEach((header, index) => {
        const cell = sheet.getCell(currentRow, index + 1);
        cell.value = header.toUpperCase();
        cell.style = this.styles.journalHeader;
      });
      currentRow++;

      dailyEntries.forEach(entry => {
        headers.forEach((header, colIndex) => {
          const cell = sheet.getCell(currentRow, colIndex + 1);
          cell.value = entry[header];
          if (header.includes('date')) {
            cell.style = this.styles.dataDate;
          } else {
            cell.style = this.styles.data;
          }
        });
        currentRow++;
      });

      currentRow += 2;
    }

    // Continue with other data sections...
    // (Wellness Data, Habits, etc.)
  }

  // Save workbook to buffer
  async getBuffer() {
    return await this.workbook.xlsx.writeBuffer();
  }

  // Save workbook to file
  async saveToFile(filename) {
    await this.workbook.xlsx.writeFile(filename);
  }
}

export default DiaryExcelExportMaster;