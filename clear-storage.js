// Script to clear all localStorage data
// Run this in browser console at http://localhost:5178
if (typeof localStorage === 'undefined') {
  console.log('This script must be run in a browser console, not Node.js');
  console.log('Open http://localhost:5178 and paste this script in browser dev tools console');
  process.exit(1);
}

const keysToRemove = [
  'diary_daily_entries',
  'diary_weekly_entries', 
  'diary_monthly_entries',
  'diary_wellness_data',
  'diary_habits',
  'diary_habit_completions',
  'sample_data_loaded',
  'money_manager_expenses',
  'money_manager_budgets',
  'coreos_tasks',
  'coreos_habits',
  'coreos_fitness',
  'freedomos_networth',
  'freedomos_budget',
  'freedomos_emergency',
  'freedomos_investments',
  'freedomos_loans'
];

console.log('Clearing all application data...');
keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`Removed: ${key}`);
});

console.log('All data cleared. Please refresh the page.');