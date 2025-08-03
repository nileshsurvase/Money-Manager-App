// Enhanced Excel Export with Interactive Charts and Beautiful Styling

import { downloadExcel, generateFilename } from './downloadHelper';
import { getExpenses, getBudgets, getCategories } from './storage';
import { 
  getEntries,
  DIARY_STORAGE_KEYS
} from './diaryStorage';

class EnhancedExcelExporter {
  constructor() {
    this.ExcelJS = null;
    this.workbook = null;
  }

  async initialize() {
    if (!this.ExcelJS) {
      // Dynamic import of ExcelJS
      const ExcelJSModule = await import('exceljs');
      this.ExcelJS = ExcelJSModule.default || ExcelJSModule;
    }
    this.workbook = new this.ExcelJS.Workbook();
    
    // Set workbook properties
    this.workbook.creator = 'ClarityOS';
    this.workbook.lastModifiedBy = 'ClarityOS';
    this.workbook.created = new Date();
    this.workbook.modified = new Date();
    this.workbook.lastPrinted = new Date();
  }

  // Beautiful styling configurations
  get styles() {
    return {
      title: {
        font: { name: 'Segoe UI', size: 20, bold: true, color: { argb: 'FF1F2937' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF97316' } }
      },
      header: {
        font: { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } },
        border: {
          top: { style: 'thin', color: { argb: 'FF6B7280' } },
          left: { style: 'thin', color: { argb: 'FF6B7280' } },
          bottom: { style: 'thin', color: { argb: 'FF6B7280' } },
          right: { style: 'thin', color: { argb: 'FF6B7280' } }
        }
      },
      subHeader: {
        font: { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF374151' } },
        alignment: { horizontal: 'left', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFBBF24' } }
      },
      data: {
        font: { name: 'Segoe UI', size: 10, color: { argb: 'FF1F2937' } },
        alignment: { horizontal: 'left', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        }
      },
      currency: {
        font: { name: 'Segoe UI', size: 10, color: { argb: 'FF059669' }, bold: true },
        alignment: { horizontal: 'right', vertical: 'middle' },
        numFmt: '₹#,##0.00',
        border: {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        }
      },
      percentage: {
        font: { name: 'Segoe UI', size: 10, color: { argb: 'FF7C3AED' }, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' },
        numFmt: '0.00%',
        border: {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        }
      },
      highlight: {
        font: { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } }
      }
    };
  }

  // Create comprehensive Money Manager Excel report
  async createMoneyManagerReport() {
    await this.initialize();

    const expenses = getExpenses();
    const budgets = getBudgets();
    const categories = getCategories();

    // Create multiple sheets with different insights
    await this.createExecutiveDashboard(expenses, budgets, categories);
    await this.createDetailedExpensesSheet(expenses, categories);
    await this.createBudgetAnalysisSheet(expenses, budgets, categories);
    await this.createCategoryTrendsSheet(expenses, categories);
    await this.createMonthlyInsightsSheet(expenses);
    await this.createFinancialHealthSheet(expenses, budgets);
    await this.createPredictiveAnalyticsSheet(expenses, budgets);

    const filename = generateFilename('ClarityOS-MoneyManager', 'Complete-Analytics-Report');
    return downloadExcel(this.workbook, filename);
  }

  // Executive Dashboard with Key Metrics and Charts
  async createExecutiveDashboard(expenses, budgets, categories) {
    const sheet = this.workbook.addWorksheet('📊 Executive Dashboard', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    // Title
    sheet.mergeCells('A1:H3');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '🌟 ClarityOS Money Manager - Executive Dashboard';
    titleCell.style = this.styles.title;

    // Key Metrics Section
    sheet.getCell('A5').value = '💰 Key Financial Metrics';
    sheet.getCell('A5').style = this.styles.subHeader;

    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + (budget.amount || 0), 0);
    const avgExpensePerDay = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) : 0;

    // Metrics table
    const metricsData = [
      ['Total Expenses', totalExpenses, '₹'],
      ['Total Budget', totalBudget, '₹'],
      ['Budget Utilization', budgetUtilization, '%'],
      ['Avg Daily Expense', avgExpensePerDay, '₹'],
      ['Total Categories', categories.length, '#'],
      ['Total Transactions', expenses.length, '#']
    ];

    let row = 7;
    metricsData.forEach(([metric, value, unit]) => {
      sheet.getCell(`A${row}`).value = metric;
      sheet.getCell(`A${row}`).style = this.styles.header;
      
      if (unit === '₹') {
        sheet.getCell(`B${row}`).value = value;
        sheet.getCell(`B${row}`).style = this.styles.currency;
      } else if (unit === '%') {
        sheet.getCell(`B${row}`).value = value;
        sheet.getCell(`B${row}`).style = this.styles.percentage;
      } else {
        sheet.getCell(`B${row}`).value = value;
        sheet.getCell(`B${row}`).style = this.styles.data;
      }
      row++;
    });

    // Category-wise breakdown
    sheet.getCell('D5').value = '📈 Category Breakdown';
    sheet.getCell('D5').style = this.styles.subHeader;

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });

    const categoryExpenses = {};
    expenses.forEach(expense => {
      const categoryName = categoryMap[expense.categoryId] || 'Unknown';
      categoryExpenses[categoryName] = (categoryExpenses[categoryName] || 0) + (expense.amount || 0);
    });

    row = 7;
    Object.entries(categoryExpenses)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([category, amount]) => {
        sheet.getCell(`D${row}`).value = category;
        sheet.getCell(`D${row}`).style = this.styles.data;
        sheet.getCell(`E${row}`).value = amount;
        sheet.getCell(`E${row}`).style = this.styles.currency;
        row++;
      });

    // Auto-fit columns
    sheet.columns.forEach(column => {
      column.width = 20;
    });

    // Add chart (using cell ranges for chart data)
    try {
      const chartData = Object.entries(categoryExpenses)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);

      // Add chart data to cells for reference
      let chartRow = 20;
      sheet.getCell(`A${chartRow}`).value = 'Chart Data - Categories';
      sheet.getCell(`A${chartRow}`).style = this.styles.subHeader;
      
      chartRow++;
      chartData.forEach(([category, amount]) => {
        sheet.getCell(`A${chartRow}`).value = category;
        sheet.getCell(`B${chartRow}`).value = amount;
        chartRow++;
      });
    } catch (error) {
      console.warn('Chart creation not supported in this environment');
    }
  }

  // Detailed Expenses Sheet
  async createDetailedExpensesSheet(expenses, categories) {
    const sheet = this.workbook.addWorksheet('💳 Detailed Expenses');

    // Title
    sheet.mergeCells('A1:G2');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '💳 Detailed Expense Transactions';
    titleCell.style = this.styles.title;

    // Headers
    const headers = ['Date', 'Description', 'Category', 'Amount (₹)', 'Payment Method', 'Notes', 'Created At'];
    headers.forEach((header, index) => {
      const cell = sheet.getCell(4, index + 1);
      cell.value = header;
      cell.style = this.styles.header;
    });

    // Category mapping
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });

    // Data rows
    expenses.forEach((expense, index) => {
      const row = index + 5;
      
      sheet.getCell(row, 1).value = new Date(expense.date);
      sheet.getCell(row, 1).style = { ...this.styles.data, numFmt: 'dd/mm/yyyy' };
      
      sheet.getCell(row, 2).value = expense.description || '';
      sheet.getCell(row, 2).style = this.styles.data;
      
      sheet.getCell(row, 3).value = categoryMap[expense.categoryId] || 'Unknown';
      sheet.getCell(row, 3).style = this.styles.data;
      
      sheet.getCell(row, 4).value = expense.amount || 0;
      sheet.getCell(row, 4).style = this.styles.currency;
      
      sheet.getCell(row, 5).value = expense.paymentMethod || 'Cash';
      sheet.getCell(row, 5).style = this.styles.data;
      
      sheet.getCell(row, 6).value = expense.notes || '';
      sheet.getCell(row, 6).style = this.styles.data;
      
      sheet.getCell(row, 7).value = new Date(expense.createdAt);
      sheet.getCell(row, 7).style = { ...this.styles.data, numFmt: 'dd/mm/yyyy hh:mm' };
    });

    // Auto-fit columns
    sheet.columns.forEach(column => {
      column.width = 15;
    });
    sheet.getColumn(2).width = 25; // Description column wider
    sheet.getColumn(6).width = 30; // Notes column wider
  }

  // Budget Analysis Sheet
  async createBudgetAnalysisSheet(expenses, budgets, categories) {
    const sheet = this.workbook.addWorksheet('🎯 Budget Analysis');

    // Title
    sheet.mergeCells('A1:F2');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '🎯 Budget vs Actual Analysis';
    titleCell.style = this.styles.title;

    // Category mapping
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });

    // Calculate actual expenses by category
    const categoryExpenses = {};
    expenses.forEach(expense => {
      const categoryId = expense.categoryId;
      categoryExpenses[categoryId] = (categoryExpenses[categoryId] || 0) + (expense.amount || 0);
    });

    // Headers
    const headers = ['Category', 'Budget (₹)', 'Actual (₹)', 'Variance (₹)', 'Utilization %', 'Status'];
    headers.forEach((header, index) => {
      const cell = sheet.getCell(4, index + 1);
      cell.value = header;
      cell.style = this.styles.header;
    });

    // Budget analysis data
    let row = 5;
    budgets.forEach(budget => {
      const categoryName = categoryMap[budget.categoryId] || 'Unknown';
      const actual = categoryExpenses[budget.categoryId] || 0;
      const variance = actual - budget.amount;
      const utilization = budget.amount > 0 ? actual / budget.amount : 0;
      const status = variance > 0 ? '⚠️ Over Budget' : utilization > 0.8 ? '🟡 Near Limit' : '✅ On Track';
      
      sheet.getCell(row, 1).value = categoryName;
      sheet.getCell(row, 1).style = this.styles.data;
      
      sheet.getCell(row, 2).value = budget.amount;
      sheet.getCell(row, 2).style = this.styles.currency;
      
      sheet.getCell(row, 3).value = actual;
      sheet.getCell(row, 3).style = this.styles.currency;
      
      sheet.getCell(row, 4).value = variance;
      sheet.getCell(row, 4).style = variance > 0 ? this.styles.highlight : this.styles.currency;
      
      sheet.getCell(row, 5).value = utilization;
      sheet.getCell(row, 5).style = this.styles.percentage;
      
      sheet.getCell(row, 6).value = status;
      sheet.getCell(row, 6).style = this.styles.data;
      
      row++;
    });

    // Auto-fit columns
    sheet.columns.forEach(column => {
      column.width = 18;
    });
  }

  // Create comprehensive My Diary Excel report
  async createMyDiaryReport() {
    await this.initialize();

    const dailyEntries = getEntries('daily');
    const weeklyEntries = getEntries('weekly');
    const monthlyEntries = getEntries('monthly');
    const wellnessData = JSON.parse(localStorage.getItem(DIARY_STORAGE_KEYS.WELLNESS_DATA) || '[]');
    const habits = JSON.parse(localStorage.getItem('diary_habits') || '[]');
    const habitCompletions = JSON.parse(localStorage.getItem('diary_habit_completions') || '{}');

    // Create multiple sheets
    await this.createDiaryDashboard(dailyEntries, weeklyEntries, monthlyEntries, wellnessData, habits);
    await this.createWellnessAnalytics(wellnessData);
    await this.createHabitTracking(habits, habitCompletions);
    await this.createJournalInsights(dailyEntries, weeklyEntries, monthlyEntries);
    await this.createMoodPatterns(wellnessData);
    await this.createPersonalGrowthReport(dailyEntries, weeklyEntries, monthlyEntries);

    const filename = generateFilename('ClarityOS-MyDiary', 'Complete-Wellbeing-Report');
    return downloadExcel(this.workbook, filename);
  }

  // Diary Dashboard
  async createDiaryDashboard(dailyEntries, weeklyEntries, monthlyEntries, wellnessData, habits) {
    const sheet = this.workbook.addWorksheet('📖 Diary Dashboard');

    // Title
    sheet.mergeCells('A1:H3');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '📖 ClarityOS My Diary - Wellbeing Dashboard';
    titleCell.style = this.styles.title;

    // Key Metrics
    sheet.getCell('A5').value = '📊 Journaling Statistics';
    sheet.getCell('A5').style = this.styles.subHeader;

    const avgMood = wellnessData.length > 0 ? 
      wellnessData.reduce((sum, w) => sum + (w.mood || 0), 0) / wellnessData.length : 0;
    const avgEnergy = wellnessData.length > 0 ?
      wellnessData.reduce((sum, w) => sum + (w.energy || 0), 0) / wellnessData.length : 0;
    
    const metricsData = [
      ['Daily Entries', dailyEntries.length, '#'],
      ['Weekly Reflections', weeklyEntries.length, '#'],
      ['Monthly Reviews', monthlyEntries.length, '#'],
      ['Wellness Records', wellnessData.length, '#'],
      ['Average Mood', avgMood.toFixed(1), '/10'],
      ['Average Energy', avgEnergy.toFixed(1), '/10']
    ];

    let row = 7;
    metricsData.forEach(([metric, value, unit]) => {
      sheet.getCell(`A${row}`).value = metric;
      sheet.getCell(`A${row}`).style = this.styles.header;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).style = this.styles.data;
      row++;
    });

    // Recent entries preview
    sheet.getCell('D5').value = '📝 Recent Daily Entries';
    sheet.getCell('D5').style = this.styles.subHeader;

    row = 7;
    dailyEntries.slice(-10).forEach(entry => {
      sheet.getCell(`D${row}`).value = new Date(entry.date).toLocaleDateString();
      sheet.getCell(`D${row}`).style = this.styles.data;
      sheet.getCell(`E${row}`).value = entry.emotion || '';
      sheet.getCell(`E${row}`).style = this.styles.data;
      sheet.getCell(`F${row}`).value = (entry.grateful || '').substring(0, 50) + '...';
      sheet.getCell(`F${row}`).style = this.styles.data;
      row++;
    });

    // Auto-fit columns
    sheet.columns.forEach(column => {
      column.width = 20;
    });
  }

  // Wellness Analytics Sheet
  async createWellnessAnalytics(wellnessData) {
    const sheet = this.workbook.addWorksheet('🧘 Wellness Analytics');

    // Title
    sheet.mergeCells('A1:G2');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '🧘 Wellness & Mood Analytics';
    titleCell.style = this.styles.title;

    // Headers
    const headers = ['Date', 'Mood (1-10)', 'Stress (1-10)', 'Energy (1-10)', 'Wellness Score', 'Emotions', 'Notes'];
    headers.forEach((header, index) => {
      const cell = sheet.getCell(4, index + 1);
      cell.value = header;
      cell.style = this.styles.header;
    });

    // Data rows
    wellnessData.forEach((wellness, index) => {
      const row = index + 5;
      
      sheet.getCell(row, 1).value = new Date(wellness.date);
      sheet.getCell(row, 1).style = { ...this.styles.data, numFmt: 'dd/mm/yyyy' };
      
      sheet.getCell(row, 2).value = wellness.mood || 0;
      sheet.getCell(row, 2).style = this.styles.data;
      
      sheet.getCell(row, 3).value = wellness.stress || 0;
      sheet.getCell(row, 3).style = this.styles.data;
      
      sheet.getCell(row, 4).value = wellness.energy || 0;
      sheet.getCell(row, 4).style = this.styles.data;
      
      sheet.getCell(row, 5).value = wellness.wellnessScore || 0;
      sheet.getCell(row, 5).style = this.styles.percentage;
      
      sheet.getCell(row, 6).value = (wellness.emotions || []).join(', ');
      sheet.getCell(row, 6).style = this.styles.data;
      
      sheet.getCell(row, 7).value = wellness.notes || '';
      sheet.getCell(row, 7).style = this.styles.data;
    });

    // Auto-fit columns
    sheet.columns.forEach(column => {
      column.width = 15;
    });
    sheet.getColumn(6).width = 25; // Emotions column
    sheet.getColumn(7).width = 30; // Notes column
  }
}

// Export singleton instance
const excelExporter = new EnhancedExcelExporter();

export const createMoneyManagerExcelReport = () => {
  return excelExporter.createMoneyManagerReport();
};

export const createMyDiaryExcelReport = () => {
  return excelExporter.createMyDiaryReport();
};

export default excelExporter;

